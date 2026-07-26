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
          <Tooltip
            contentStyle={{
              background: "var(--color-paper-raised)",
              border: "1px solid var(--color-line)",
              borderRadius: 8,
            }}
          />
          <Bar
            dataKey="value"
            fill="var(--color-mark-green)"
            radius={[6, 6, 0, 0]}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
