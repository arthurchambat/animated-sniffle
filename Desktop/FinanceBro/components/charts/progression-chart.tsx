"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const sampleData = [
  { month: "Jan", technique: 45, communication: 48 },
  { month: "Fév", technique: 52, communication: 55 },
  { month: "Mar", technique: 58, communication: 60 },
  { month: "Avr", technique: 65, communication: 69 },
  { month: "Mai", technique: 72, communication: 74 },
  { month: "Juin", technique: 78, communication: 81 }
];

export function ProgressionChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={sampleData} margin={{ top: 20, right: 16, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
          <YAxis stroke="rgba(255,255,255,0.6)" domain={[30, 90]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(8, 24, 39, 0.92)",
              borderRadius: "0.75rem",
              border: "1px solid rgba(148, 251, 207, 0.25)"
            }}
          />
          <Line
            type="monotone"
            dataKey="technique"
            stroke="#4ade80"
            strokeWidth={3}
            dot={{ strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="communication"
            stroke="#38bdf8"
            strokeWidth={3}
            dot={{ strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
