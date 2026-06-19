import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

const PROJECT_ID   = process.env.FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!PROJECT_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  console.warn(
    '[UCAG] Firebase Admin credentials not set. Auth-gated features will be unavailable until ' +
    'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are configured in .env.local.'
  );
}

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]!;

  if (!PROJECT_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error(
      'Firebase Admin is not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, ' +
      'and FIREBASE_PRIVATE_KEY in .env.local — see .env.example for instructions.'
    );
  }

  return initializeApp({ credential: cert({ projectId: PROJECT_ID, clientEmail: CLIENT_EMAIL, privateKey: PRIVATE_KEY }) });
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const app = getAdminApp();
  return getAuth(app).verifyIdToken(token);
}
