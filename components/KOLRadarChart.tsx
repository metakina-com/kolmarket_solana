"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface KOLRadarChartProps {
  data: {
    subject: string;
    value: number;
    fullMark: number;
  }[];
  strokeColor?: string;
  fillColor?: string;
  gridColor?: string;
  tickColor?: string;
}

export function KOLRadarChart({ 
  data,
  strokeColor = "#28A745",
  fillColor = "#28A745",
  gridColor = "#E9ECEF",
  tickColor = "#6C757D"
}: KOLRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: tickColor, fontSize: 12 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={{ fill: tickColor, fontSize: 10 }}
        />
        <Radar
          name="KOL Stats"
          dataKey="value"
          stroke={strokeColor}
          fill={fillColor}
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
