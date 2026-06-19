import { BursaryExplorer } from '@/components/bursary/BursaryExplorer';
import { Award } from 'lucide-react';

export const metadata = {
  title: 'Bursary & Funding Finder — UCAG',
  description: 'Discover NSFAS, Funza Lushaka, Sasol, and Mpumalanga Provincial bursaries and scholarships for UMP applicants.',
};

export default function BursaryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award size={22} className="text-ugreen-600" />
            <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Bursary & Funding Finder</h1>
          </div>
          <p className="text-sm text-navy-500 dark:text-navy-400 max-w-xl">
            South African bursaries, scholarships, and government funding for qualifying UMP applicants.
            Filter by faculty, household income, or study type.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-ugreen-50 border border-ugreen-200 rounded-full px-3 py-1 text-xs font-semibold text-ugreen-700">
          <Award size={11} />
          6 funding sources · updated 2025
        </div>
      </div>
      <BursaryExplorer />
    </div>
  );
}
