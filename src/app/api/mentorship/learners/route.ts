import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { SEED_LEARNERS } from '@/data/careers';

export async function GET(_req: NextRequest) {
  try {
    const db = await getDb();
    const coll = db.collection('learners');

    const count = await coll.countDocuments();
    if (count === 0) {
      const seeded = SEED_LEARNERS.map(l => ({
        ...l,
        firebaseUid: `seed-${Math.random().toString(36).slice(2,9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      await coll.insertMany(seeded);
    }

    const learners = await coll.find({}, { projection: { _id: 1, fullName: 1, email: 1, apsScore: 1, careerInterests: 1, isAdopted: 1, adoptedBy: 1, firebaseUid: 1, subjects: 1 } }).toArray();
    return NextResponse.json({ learners });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return NextResponse.json({ error: msg }, { status: msg.includes('MONGODB_URI') ? 503 : 500 });
  }
}
