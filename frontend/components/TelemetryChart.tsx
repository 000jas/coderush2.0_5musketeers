import React from 'react';
import type { SatelliteState } from '../lib/types';

interface TelemetryChartProps {
  title: string;
  data: SatelliteState[];
  metrics: {
    key: keyof SatelliteState;
    label: string;
    color: string;
  }[];
  minY: number;
  maxY: number;
  unit: string;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  title,
  data,
  metrics,
  minY,
  maxY,
  unit,
}) => {
  const width = 500;
  const height = 140;
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Maximum historical points to show (e.g. 30 seconds)
  const maxPoints = 30;
  
  // Fill array to maxPoints with initial values if history is short
  const paddedData = [...data];
  while (paddedData.length < maxPoints) {
    // Pad start with duplicate of first item or dummy structure
    if (paddedData.length > 0) {
      paddedData.unshift(paddedData[0]);
    } else {
      break;
    }
  }

  // Get coordinates for a given key
  const getPoints = (key: keyof SatelliteState) => {
    if (paddedData.length === 0) return [];
    return paddedData.map((d, index) => {
      const val = (d[key] as number) ?? 0;
      const x = paddingLeft + (index / (maxPoints - 1)) * chartWidth;
      
      // Prevent division by zero
      const range = maxY - minY || 1;
      const y = paddingTop + chartHeight - ((val - minY) / range) * chartHeight;
      return { x, y, value: val };
    });
  };

  return (
    <div className="border border-border/60 bg-card rounded-xl p-4 shadow-xs select-none">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{title}</span>
        
        {/* Dynamic Legend */}
        <div className="flex gap-2.5">
          {metrics.map((m) => {
            const latestVal = data.length > 0 ? (data[data.length - 1][m.key] as number) : 0;
            return (
              <div key={m.key} className="flex items-center gap-1.5 text-[10px] font-semibold">
                <span className="size-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-muted-foreground">{m.label}:</span>
                <span className="font-mono text-foreground">{latestVal} {unit}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative w-full h-[140px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Gradients definitions for Area overlays */}
          <defs>
            {metrics.map((m) => (
              <linearGradient key={`grad-${m.key}`} id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={m.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={m.color} stopOpacity={0.0} />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
            const y = paddingTop + ratio * chartHeight;
            const gridVal = Math.round(maxY - ratio * (maxY - minY));
            return (
              <g key={idx}>
                {/* Grid Line */}
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                  opacity={0.3}
                />
                {/* Axis Value text */}
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="var(--text-muted)"
                  fontSize="8"
                  fontFamily="var(--font-mono)"
                  opacity={0.7}
                >
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* Lines & Filled Areas */}
          {metrics.map((m) => {
            const points = getPoints(m.key);
            if (points.length === 0) return null;

            // Build SVG path string for the line
            const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

            // Build SVG path string for the filled gradient area
            const areaPath = `
              ${linePath} 
              L ${points[points.length - 1].x} ${paddingTop + chartHeight} 
              L ${points[0].x} ${paddingTop + chartHeight} 
              Z
            `;

            return (
              <g key={m.key}>
                {/* Gradient Area under curve */}
                <path d={areaPath} fill={`url(#grad-${m.key})`} />
                
                {/* Trend Stroke line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={m.color}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Pulse dot at the latest point */}
                {data.length > 0 && (
                  <g>
                    <circle
                      cx={points[points.length - 1].x}
                      cy={points[points.length - 1].y}
                      r="4"
                      fill={m.color}
                    />
                    <circle
                      cx={points[points.length - 1].x}
                      cy={points[points.length - 1].y}
                      r="8"
                      fill={m.color}
                      opacity="0.3"
                      className="animate-ping"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
