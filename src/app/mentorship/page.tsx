import { MentorshipPortal } from '@/components/mentorship/MentorshipPortal';
import { Users, Shield } from 'lucide-react';

export const metadata = {
  title: 'Adopt-a-Learner Mentorship — UCAG',
  description: 'Connect high-school learners with UMP student mentors through subject-based matching.',
};

export default function MentorshipPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={22} className="text-navy-700" />
            <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Adopt-a-Learner Mentorship</h1>
          </div>
          <p className="text-sm text-navy-500 dark:text-navy-400 max-w-xl">
            UMP student mentors support Grade 12 learners by subject need. Mentors earn Impact XP, badges,
            and a downloadable recognition certificate. Each mentor may adopt up to 3 learners at once.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-ugreen-50 border border-ugreen-200 rounded-full px-3 py-1 text-xs font-semibold text-ugreen-700">
          <Shield size={11} />
          SafeChat · AI content guardrails active
        </div>
      </div>

      <MentorshipPortal />
    </div>
  );
}
