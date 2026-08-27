export interface DonutSlice {
  label: string;
  amount: number;
  color: string;
}

const SERIES_COLORS = ["var(--s1)", "var(--s2)", "var(--s3)", "var(--s4)", "var(--s5)", "var(--s6)", "var(--s7)"];

function clpShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return "$" + Math.round(n / 1_000) + "k";
  return "$" + n;
}

interface DonutChartProps {
  data: Array<{ label: string; amount: number; color?: string }>;
  size?: number;
  total?: number;
}

export function DonutChart({ data, size = 180, total }: DonutChartProps) {
  const sum = total ?? data.reduce((a, b) => a + b.amount, 0);
  if (sum <= 0 || data.length === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;
  const inner = r - 22;
  let offset = -Math.PI / 2;

  const arcs = data.map((d, idx) => {
    const color = d.color ?? SERIES_COLORS[idx % SERIES_COLORS.length];
    const angle = (d.amount / sum) * Math.PI * 2;
    const x1 = cx + r * Math.cos(offset);
    const y1 = cy + r * Math.sin(offset);
    const x2 = cx + r * Math.cos(offset + angle);
    const y2 = cy + r * Math.sin(offset + angle);
    const x3 = cx + inner * Math.cos(offset + angle);
    const y3 = cy + inner * Math.sin(offset + angle);
    const x4 = cx + inner * Math.cos(offset);
    const y4 = cy + inner * Math.sin(offset);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${inner},${inner} 0 ${large} 0 ${x4},${y4} Z`;
    offset += angle;
    return { path, color, label: d.label, amount: d.amount };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: "block" }}>
      {arcs.map((a, i) => (
        <path key={i} d={a.path} fill={a.color} stroke="var(--bg-1)" strokeWidth="1.5" />
      ))}
      <text
        x={cx} y={cy - 4}
        textAnchor="middle"
        fontSize="11"
        fill="var(--ink-3)"
        fontFamily="var(--mono)"
        letterSpacing="2"
      >
        TOTAL
      </text>
      <text
        x={cx} y={cy + 18}
        textAnchor="middle"
        fontSize="20"
        fill="var(--ink-0)"
        fontFamily="var(--serif)"
      >
        {clpShort(sum)}
      </text>
    </svg>
  );
}

export { SERIES_COLORS };
