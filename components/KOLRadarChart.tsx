"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface KOLRadarChartProps {
  data: {
    subject: string;
    value: number;
    fullMark: number;
  }[];
}

export function KOLRadarChart({ data }: KOLRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: "#94a3b8", fontSize: 12 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={{ fill: "#64748b", fontSize: 10 }}
        />
        <Radar
          name="KOL Stats"
          dataKey="value"
          stroke="#06b6d4"
          fill="#06b6d4"
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
