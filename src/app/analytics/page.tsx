import { SchoolDashboard } from '@/components/analytics/SchoolDashboard';
import { BarChart3, Database } from 'lucide-react';

export const metadata = {
  title: 'School Analytics — UCAG',
  description: 'Mpumalanga school performance data, application readiness, and outreach insights.',
};

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={22} className="text-navy-700" />
            <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">School Performance Analytics</h1>
          </div>
          <p className="text-sm text-navy-500 dark:text-navy-400 max-w-xl">
            Regional school APS trends, application-readiness rates, struggling subjects, and top career interests across Mpumalanga.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-navy-50 border border-navy-200 rounded-full px-3 py-1 text-xs font-semibold text-navy-600">
          <Database size={11} />
          MongoDB Atlas · live aggregation
        </div>
      </div>
      <SchoolDashboard />
    </div>
  );
}
