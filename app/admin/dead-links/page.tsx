"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/firestoreClient";
import { adminFetch } from "@/lib/admin/apiClient";
import type { LinkHealthCheckRecord } from "@/lib/firestore/types";

const QA_TEST_URL = "https://this-url-is-deliberately-broken.ucag-qa-test.invalid/";

// A plain-English likely cause and next step, not just a raw status code --
// the point of this page is to say what to actually do about a failure,
// not just flag that one happened.
function diagnose(check: LinkHealthCheckRecord): string {
  if (check.url === QA_TEST_URL) {
    return "This one is on purpose -- a fixed test link kept here to check that this report actually catches a failure. Nothing to fix.";
  }
  if (check.statusCode === 401 || check.statusCode === 403) {
    return "The site is blocking automated checks (common on university sites) -- this is very likely fine for a real visitor. Open the link yourself in a browser; if it loads, there's nothing to fix here.";
  }
  if (check.statusCode === 404) {
    return "The page no longer exists at this address. Find the institution's current link and update it in Institution Data.";
  }
  if (check.statusCode && check.statusCode >= 500) {
    return "The institution's own server is having trouble right now -- try again later.";
  }
  if (check.error?.toLowerCase().includes("abort") || check.error?.toLowerCase().includes("timeout")) {
    return "The site took too long to respond. Could be temporary -- try running the check again later.";
  }
  if (!check.statusCode) {
    return "This address didn't respond at all, which usually means it's outdated. Find the institution's current link and update it in Institution Data.";
  }
  return "Open the link yourself to check it, then update it in Institution Data if it's wrong.";
}

export default function DeadLinksPage() {
  const [checks, setChecks] = useState<LinkHealthCheckRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [runSummary, setRunSummary] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(getFirebaseDb(), "linkHealthChecks"),
      (snap) => {
        const rows = snap.docs.map((d) => d.data() as LinkHealthCheckRecord);
        rows.sort((a, b) => Number(a.alive) - Number(b.alive) || a.url.localeCompare(b.url));
        setChecks(rows);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  async function runNow() {
    setRunning(true);
    setError(null);
    setRunSummary(null);
    try {
      const res = await adminFetch("/api/admin/link-health/run", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status}).`);
      setRunSummary(
        `Checked ${body.checkedCount} links, ${body.deadCount} dead, ${body.firestoreWritesPerformed} saved.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }

  const deadCount = checks.filter((c) => !c.alive).length;

  return (
    <div className="flex w-full flex-col gap-5">
      <header className="rounded-2xl bg-brand-navy p-5 text-white sm:p-7"><h1 className="font-display text-2xl font-extrabold sm:text-3xl">Broken links</h1><p className="mt-2 text-sm leading-6 text-white/80">{deadCount} of {checks.length} links need a look.</p></header>
      <div>
        <button
          type="button"
          disabled={running}
          onClick={runNow}
          className="min-h-11 rounded-xl bg-mark-green px-4 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {running ? "Running..." : "Run now"}
        </button>
      </div>
      {error && (
        <p className="rounded-xl border border-mark-red bg-mark-red-soft p-3 text-sm text-mark-red">
          {error}
        </p>
      )}
      {runSummary && (
        <p className="rounded-xl border border-mark-green bg-mark-green-soft p-3 text-sm text-mark-green">
          {runSummary}
        </p>
      )}
      {loading && <p className="rounded-xl border border-line p-4 text-sm text-ink-soft">Loading...</p>}
      {!loading && checks.length === 0 && (
        <p className="rounded-xl border border-line p-4 text-sm text-ink-soft">
          No checks on record yet -- click &quot;Run now&quot; to run one.
        </p>
      )}
      <ul className="flex flex-col gap-2 text-sm">
        {checks.map((check) => (
          <li
            key={check.url}
            className={`flex flex-col gap-1.5 rounded-xl border border-line bg-paper-raised p-3 ${
              check.alive ? "" : "border-mark-red/40 bg-mark-red-soft"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span aria-hidden className={check.alive ? "text-mark-green" : "text-mark-red"}>
                {check.alive ? "✓" : "✗"}
              </span>
              <a
                href={check.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-teal hover:underline"
              >
                {check.url}
              </a>
              <span className="text-xs text-ink-faint">checked {check.checkedAt}</span>
            </div>
            {!check.alive && (
              <p className="text-xs leading-5 text-ink-soft">{diagnose(check)}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
