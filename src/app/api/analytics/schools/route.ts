import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { SEED_SCHOOLS } from '@/data/careers';

export async function GET() {
  try {
    const db = await getDb();
    const col = db.collection('schools');

    let schools = await col.find({}).sort({ averageAps: -1 }).toArray();

    if (schools.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await col.insertMany(SEED_SCHOOLS.map(({ _id, ...s }) => s) as any[]);
      schools = await col.find({}).sort({ averageAps: -1 }).toArray();
    }

    return NextResponse.json({ schools });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: msg.includes('MONGODB_URI') ? 503 : 500 });
  }
}
