function clpShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return "$" + Math.round(n / 1_000) + "k";
  return "$" + n;
}

interface BarEntry {
  m: string;
  in: number;
  out: number;
}

interface StackBarsProps {
  series: BarEntry[];
  height?: number;
}

export function StackBars({ series, height = 220 }: StackBarsProps) {
  if (series.length === 0) return null;

  const w = 640;
  const h = height;
  const pad = { l: 48, r: 12, t: 14, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(...series.flatMap((d) => [d.in, d.out])) * 1.1 || 1;
  const stepX = innerW / series.length;
  const barW = stepX * 0.36;
  const ticks = [0, max / 2, max];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height, display: "block" }} preserveAspectRatio="none">
      {ticks.map((t, i) => {
        const y = pad.t + (1 - t / max) * innerH;
        return (
          <g key={i}>
            <line
              x1={pad.l} x2={w - pad.r} y1={y} y2={y}
              stroke="var(--line)" strokeWidth="1" strokeDasharray="2 4"
            />
            <text
              x={pad.l - 8} y={y + 3}
              textAnchor="end"
              fill="var(--ink-3)"
              fontFamily="var(--mono)"
              fontSize="10"
            >
              {clpShort(t)}
            </text>
          </g>
        );
      })}
      {series.map((d, i) => {
        const x = pad.l + i * stepX + stepX / 2 - barW;
        const hIn = (d.in / max) * innerH;
        const hOut = (d.out / max) * innerH;
        return (
          <g key={i}>
            <rect
              x={x} y={pad.t + innerH - hIn}
              width={barW * 0.82} height={hIn}
              rx="2" fill="var(--s1)"
            />
            <rect
              x={x + barW * 0.92} y={pad.t + innerH - hOut}
              width={barW * 0.82} height={hOut}
              rx="2" fill="var(--s4)"
            />
            <text
              x={pad.l + i * stepX + stepX / 2}
              y={h - 8}
              textAnchor="middle"
              fill="var(--ink-3)"
              fontFamily="var(--mono)"
              fontSize="10"
            >
              {d.m}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
