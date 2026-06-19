import { ReadinessRoadmap } from '@/components/roadmap/ReadinessRoadmap';
import { FileText } from 'lucide-react';

export const metadata = {
  title: 'My Readiness Roadmap — UCAG',
  description: 'Your personalised step-by-step checklist from current marks to a submitted UMP application.',
};

export default function RoadmapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={22} className="text-navy-700" />
            <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">My Readiness Roadmap</h1>
          </div>
          <p className="text-sm text-navy-500 dark:text-navy-400 max-w-xl">
            A personalised step-by-step checklist from your current results to a submitted UMP application.
            Track your progress and get AI guidance on what to prioritise.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-navy-50 border border-navy-200 rounded-full px-3 py-1 text-xs font-semibold text-navy-600">
          <FileText size={11} />
          Rule-based · AI-guided
        </div>
      </div>
      <ReadinessRoadmap />
    </div>
  );
}
