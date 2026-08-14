"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { getFirebaseDb } from "@/lib/firebase/firestoreClient";
import { formatAuthError } from "@/lib/auth/formatAuthError";
import type { MentorProfile } from "@/lib/firestore/types";

export default function MentorRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institutionId, setInstitutionId] = useState("ump");
  const [campus, setCampus] = useState("Mbombela Campus");
  const [faculty, setFaculty] = useState("Faculty of Agriculture & Natural Sciences");
  const [specialties, setSpecialties] = useState("BSc Agriculture, Physical Sciences");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.includes("@")) {
      setError("Please enter a valid institutional email address.");
      return;
    }

    setSubmitting(true);

    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      const mentorDoc: MentorProfile = {
        uid: userCred.user.uid,
        name,
        email,
        institutionId,
        campus,
        faculty,
        specialties: specialties.split(",").map((s) => s.trim()).filter(Boolean),
        bio,
        verificationStatus: "pending",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "mentorProfiles", userCred.user.uid), mentorDoc);
      router.push("/account/mentor");
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="main-content" className="flex min-h-[80vh] flex-1 flex-col items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-paper-raised p-6 sm:p-8 shadow-md">
        <div className="flex flex-col gap-2 text-center mb-6">
          <span className="mx-auto rounded-full bg-brand-coral/10 p-3 text-2xl">🤝</span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-brand-navy">
            Apply as a Peer Mentor
          </h1>
          <p className="text-xs text-ink-soft">
            Guide prospective South African learners entering your university campus. Mentors are verified by campus administrators.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-xl bg-mark-red-soft p-3 text-xs font-semibold text-mark-red border border-mark-red/30">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-xs font-bold text-ink">
              Full Name
              <input
                type="text"
                required
                placeholder="Sipho Ndlovu"
                className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-sm font-medium text-ink focus:border-brand-teal focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-bold text-ink">
              Institutional Email
              <input
                type="email"
                required
                placeholder="student@ump.ac.za"
                className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-sm font-medium text-ink focus:border-brand-teal focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs font-bold text-ink">
            Password
            <input
              type="password"
              required
              placeholder="••••••••"
              className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-sm font-medium text-ink focus:border-brand-teal focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-xs font-bold text-ink">
              University Institution
              <select
                className="min-h-11 rounded-xl border border-line bg-paper px-3 text-sm font-medium text-ink focus:border-brand-teal focus:outline-none"
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
              >
                <option value="ump">University of Mpumalanga (UMP)</option>
                <option value="up">University of Pretoria (UP)</option>
                <option value="wits">Wits University</option>
                <option value="uj">University of Johannesburg (UJ)</option>
                <option value="tut">Tshwane University of Technology (TUT)</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-bold text-ink">
              Campus Location
              <input
                type="text"
                required
                placeholder="Mbombela Campus"
                className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-sm font-medium text-ink focus:border-brand-teal focus:outline-none"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs font-bold text-ink">
            Faculty / Department
            <input
              type="text"
              required
              placeholder="Faculty of Agriculture & Natural Sciences"
              className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-sm font-medium text-ink focus:border-brand-teal focus:outline-none"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-ink">
            Areas of Expertise / Subjects (Comma Separated)
            <input
              type="text"
              required
              placeholder="BSc Agriculture, Physical Sciences, Time Management"
              className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-sm font-medium text-ink focus:border-brand-teal focus:outline-none"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-ink">
            Short Biography / Guidance Experience
            <textarea
              rows={3}
              placeholder="Share how you assist new matriculants transitioning to campus..."
              className="rounded-xl border border-line bg-paper p-3 text-sm font-medium text-ink focus:border-brand-teal focus:outline-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-12 w-full cursor-pointer rounded-xl bg-brand-coral px-4 py-2.5 text-sm font-bold text-white shadow hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? "Submitting Application..." : "Submit Mentor Application"}
          </button>
        </form>

        <div className="mt-6 border-t border-line/60 pt-4 text-center text-xs text-ink-soft">
          Already registered as a mentor?{" "}
          <Link href="/mentor/login" className="font-bold text-brand-teal hover:underline font-semibold">
            Sign In to Mentor Portal
          </Link>
        </div>
      </div>
    </main>
  );
}
