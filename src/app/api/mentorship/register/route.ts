import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyIdToken } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const decoded = await verifyIdToken(token);
    const body = await req.json();
    const { role, ...profileData } = body as { role: 'mentor' | 'learner'; [k: string]: unknown };

    if (!role || !['mentor', 'learner'].includes(role)) {
      return NextResponse.json({ error: 'role must be "mentor" or "learner".' }, { status: 400 });
    }

    const db = await getDb();
    const collection = role === 'mentor' ? 'mentors' : 'learners';

    const existing = await db.collection(collection).findOne({ firebaseUid: decoded.uid });
    if (existing) {
      return NextResponse.json({ error: `A ${role} profile already exists for this account.` }, { status: 409 });
    }

    const now = new Date().toISOString();
    const doc = {
      firebaseUid: decoded.uid,
      email: decoded.email ?? '',
      ...profileData,
      createdAt: now,
      updatedAt: now,
      ...(role === 'mentor'
        ? { adoptedLearnersCount: 0, maxLearners: 3, impactScore: 0, badges: [] }
        : { isAdopted: false, adoptedBy: null }),
    };

    const { insertedId } = await db.collection(collection).insertOne(doc);
    return NextResponse.json({ _id: insertedId.toString(), ...doc }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    const status = msg.includes('MONGODB_URI') || msg.includes('Firebase Admin') ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
