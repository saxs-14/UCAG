import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyIdToken } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const decoded = await verifyIdToken(token);
    const { learnerUid } = await req.json();

    if (!learnerUid) return NextResponse.json({ error: 'learnerUid is required.' }, { status: 400 });

    const db = await getDb();

    const mentor = await db.collection('mentors').findOne({ firebaseUid: decoded.uid });
    if (!mentor) return NextResponse.json({ error: 'Mentor profile not found. Please complete your registration.' }, { status: 404 });

    if (mentor.adoptedLearnersCount >= mentor.maxLearners) {
      return NextResponse.json({ error: `You have reached your limit of ${mentor.maxLearners} learners.` }, { status: 409 });
    }

    const learner = await db.collection('learners').findOne({ firebaseUid: learnerUid });
    if (!learner) return NextResponse.json({ error: 'Learner not found.' }, { status: 404 });
    if (learner.isAdopted) return NextResponse.json({ error: 'This learner has already been adopted.' }, { status: 409 });

    await db.collection('learners').updateOne(
      { firebaseUid: learnerUid },
      { $set: { isAdopted: true, adoptedBy: decoded.uid, updatedAt: new Date().toISOString() } }
    );

    const newCount  = mentor.adoptedLearnersCount + 1;
    const newXP     = mentor.impactScore + 50;
    const badges    = [...(mentor.badges ?? [])];
    if (newXP >= 150 && !badges.includes('Elite Guardian')) badges.push('Elite Guardian');
    if (newCount >= 3 && !badges.includes('Community Champion')) badges.push('Community Champion');

    await db.collection('mentors').updateOne(
      { firebaseUid: decoded.uid },
      { $set: { adoptedLearnersCount: newCount, impactScore: newXP, badges, updatedAt: new Date().toISOString() } }
    );

    await db.collection('mentorship_matches').insertOne({
      learnerUid,
      mentorUid: decoded.uid,
      learnerName: learner.fullName,
      mentorName: mentor.fullName,
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, impactXpEarned: 50 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    if (msg.includes('MONGODB_URI') || msg.includes('Firebase Admin')) {
      return NextResponse.json({ error: msg }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
