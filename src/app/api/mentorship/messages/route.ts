import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyIdToken } from '@/lib/firebase-admin';

const SAFE_PATTERNS = [/\b\d{9,}\b/, /@\w+/, /snapchat/i, /instagram/i, /facebook/i, /whatsapp/i, /telegram/i];

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const decoded = await verifyIdToken(token);
    const { searchParams } = new URL(req.url);
    const learnerUid = searchParams.get('learnerUid');
    if (!learnerUid) return NextResponse.json({ error: 'learnerUid required.' }, { status: 400 });

    const db = await getDb();
    const messages = await db.collection('messages')
      .find({
        $or: [
          { senderUid: decoded.uid, recipientUid: learnerUid },
          { senderUid: learnerUid, recipientUid: decoded.uid },
        ],
      })
      .sort({ timestamp: 1 })
      .toArray();

    return NextResponse.json({ messages });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: msg.includes('MONGODB_URI') || msg.includes('Firebase') ? 503 : 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const decoded = await verifyIdToken(token);
    const { learnerUid, text } = await req.json();

    if (!learnerUid || !text?.trim()) {
      return NextResponse.json({ error: 'learnerUid and text are required.' }, { status: 400 });
    }

    if (SAFE_PATTERNS.some(p => p.test(text))) {
      return NextResponse.json({ error: 'Message blocked by SafeChat: please keep conversations academic and avoid sharing contact details.' }, { status: 422 });
    }

    const db = await getDb();

    const mentor = await db.collection('mentors').findOne({ firebaseUid: decoded.uid });
    if (!mentor) return NextResponse.json({ error: 'Mentor profile not found.' }, { status: 404 });

    const message = {
      senderUid:    decoded.uid,
      senderName:   mentor.fullName,
      recipientUid: learnerUid,
      text:         text.trim(),
      timestamp:    Date.now(),
    };

    const { insertedId } = await db.collection('messages').insertOne(message);

    await db.collection('mentors').updateOne(
      { firebaseUid: decoded.uid },
      { $inc: { impactScore: 10 } }
    );

    return NextResponse.json({ message: { ...message, _id: insertedId } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: msg.includes('MONGODB_URI') || msg.includes('Firebase') ? 503 : 500 });
  }
}
