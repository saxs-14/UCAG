import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyIdToken } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const decoded = await verifyIdToken(token);
    const db = await getDb();
    const profile = await db.collection('mentors').findOne({ firebaseUid: decoded.uid });
    if (!profile) return NextResponse.json({ error: 'Mentor profile not found.' }, { status: 404 });
    return NextResponse.json({ profile });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
