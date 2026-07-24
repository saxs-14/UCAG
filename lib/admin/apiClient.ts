import { getFirebaseAuth } from "@/lib/firebase/client";

/** Every write in the admin console goes through an /api/admin/* route
 * (see lib/admin/auth.ts requireAdmin) -- this attaches the signed-in
 * user's current Firebase ID token as a bearer credential, which is what
 * that route independently re-verifies server-side. */
export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Not signed in.");
  const token = await user.getIdToken();
  return fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export async function adminFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(path, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error ?? `Request failed (${res.status}).`);
  }
  return body as T;
}
