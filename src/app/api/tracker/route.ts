import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';
import { getDb } from '@/lib/mongodb';
import type { ApplicationTracker, SavedCourse, ApplicationStep } from '@/types';

type TrackerDoc = Omit<ApplicationTracker, '_id'>;

const DEFAULT_STEPS: ApplicationStep[] = [
  { id: 'calc-aps',       label: 'Calculate your APS score',                   completed: false },
  { id: 'choose-course',  label: 'Identify your target course',                completed: false },
  { id: 'check-req',      label: 'Confirm subject requirements are met',        completed: false },
  { id: 'nsfas-reg',      label: 'Register on the NSFAS portal (myNSFAS)',     completed: false },
  { id: 'nsfas-docs',     label: 'Upload NSFAS supporting documents',           completed: false },
  { id: 'ump-account',    label: 'Create a UMP online applicant account',       completed: false },
  { id: 'ump-form',       label: 'Complete and submit the UMP application form', completed: false },
  { id: 'school-cert',    label: 'Send certified school records to UMP',        completed: false },
  { id: 'id-docs',        label: 'Upload certified ID / birth certificate',     completed: false },
  { id: 'track-outcome',  label: 'Check application outcome on the UMP portal', completed: false },
];

async function getUid(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return null;
  try {
    const decoded = await verifyIdToken(auth.slice(7));
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const db = await getDb();
  const doc = await db.collection<ApplicationTracker>('trackers').findOne({ firebaseUid: uid });

  if (!doc) {
    const fresh: TrackerDoc = {
      firebaseUid: uid,
      savedCourses: [],
      steps: DEFAULT_STEPS,
      updatedAt: new Date().toISOString(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection('trackers').insertOne(fresh as any);
    return NextResponse.json(fresh);
  }

  if (doc.steps.length < DEFAULT_STEPS.length) {
    const existingIds = new Set(doc.steps.map((s: ApplicationStep) => s.id));
    const merged = [
      ...doc.steps,
      ...DEFAULT_STEPS.filter(s => !existingIds.has(s.id)),
    ];
    await db.collection('trackers').updateOne(
      { firebaseUid: uid },
      { $set: { steps: merged, updatedAt: new Date().toISOString() } }
    );
    doc.steps = merged;
  }

  return NextResponse.json(doc);
}

export async function PATCH(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const body = await req.json() as {
    action: 'toggle-step' | 'save-course' | 'remove-course' | 'save-aps';
    stepId?: string;
    course?: SavedCourse;
    courseId?: string;
    apsSnapshot?: ApplicationTracker['apsSnapshot'];
  };

  const db = await getDb();
  const col = db.collection('trackers');

  let doc = await col.findOne({ firebaseUid: uid }) as ApplicationTracker | null;
  if (!doc) {
    const fresh: TrackerDoc = {
      firebaseUid: uid,
      savedCourses: [],
      steps: DEFAULT_STEPS,
      updatedAt: new Date().toISOString(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await col.insertOne(fresh as any);
    doc = fresh as ApplicationTracker;
  }

  const now = new Date().toISOString();

  if (body.action === 'toggle-step' && body.stepId) {
    const steps = doc.steps.map((s: ApplicationStep) =>
      s.id === body.stepId
        ? { ...s, completed: !s.completed, completedAt: !s.completed ? now : undefined }
        : s
    );
    await col.updateOne({ firebaseUid: uid }, { $set: { steps, updatedAt: now } });
    return NextResponse.json({ steps });
  }

  if (body.action === 'save-course' && body.course) {
    const already = doc.savedCourses.some((c: SavedCourse) => c.courseId === body.course!.courseId);
    if (already) return NextResponse.json({ savedCourses: doc.savedCourses });
    const savedCourses = [...doc.savedCourses, { ...body.course, savedAt: now }];
    await col.updateOne({ firebaseUid: uid }, { $set: { savedCourses, updatedAt: now } });
    return NextResponse.json({ savedCourses });
  }

  if (body.action === 'remove-course' && body.courseId) {
    const savedCourses = doc.savedCourses.filter((c: SavedCourse) => c.courseId !== body.courseId);
    await col.updateOne({ firebaseUid: uid }, { $set: { savedCourses, updatedAt: now } });
    return NextResponse.json({ savedCourses });
  }

  if (body.action === 'save-aps' && body.apsSnapshot) {
    await col.updateOne(
      { firebaseUid: uid },
      { $set: { apsSnapshot: { ...body.apsSnapshot, savedAt: now }, updatedAt: now } }
    );
    return NextResponse.json({ apsSnapshot: { ...body.apsSnapshot, savedAt: now } });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
