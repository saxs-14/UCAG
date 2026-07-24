"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/**
 * Split out from StatChart.tsx specifically so Recharts is only ever
 * fetched via the dynamic import in StatChart.tsx -- a learner on
 * data-saver never downloads this chunk at all (Phase 8 brief: "deferred
 * charts" under low-data mode), they get StatChart's plain-table fallback
 * instead.
 */
export default function StatChartCanvas({ chartData }: { chartData: { name: string; value: number }[] }) {
  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
          <XAxis dataKey="name" stroke="var(--color-ink-faint)" />
          <YAxis stroke="var(--color-ink-faint)" />
          <Tooltip />
          <Bar dataKey="value" fill="var(--color-mark-green)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
