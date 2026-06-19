import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { SEED_MENTORS } from '@/data/careers';

export async function GET(_req: NextRequest) {
  try {
    const db = await getDb();
    const coll = db.collection('mentors');

    const count = await coll.countDocuments();
    if (count === 0) {
      const seeded = SEED_MENTORS.map(m => ({
        ...m,
        firebaseUid: `seed-${Math.random().toString(36).slice(2,9)}`,
        maxLearners: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      await coll.insertMany(seeded);
    }

    const mentors = await coll.find({}).toArray();
    return NextResponse.json({ mentors });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database error';
    return NextResponse.json({ error: msg }, { status: msg.includes('MONGODB_URI') ? 503 : 500 });
  }
}
