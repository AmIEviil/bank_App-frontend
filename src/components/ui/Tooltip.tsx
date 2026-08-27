import { useState, useEffect, useRef, type ReactNode } from "react";

interface TipState {
  visible: boolean;
  x: number;
  y: number;
  content: ReactNode | null;
}

export function useTooltip() {
  const [state, setState] = useState<TipState>({ visible: false, x: 0, y: 0, content: null });

  return {
    state,
    show(content: ReactNode, e: React.MouseEvent) {
      setState({ visible: true, x: e.clientX, y: e.clientY, content });
    },
    move(e: React.MouseEvent) {
      setState((s) => s.visible ? { ...s, x: e.clientX, y: e.clientY } : s);
    },
    hide() {
      setState((s) => ({ ...s, visible: false }));
    },
  };
}

interface TipPortalProps {
  state: TipState;
}

export function TipPortal({ state }: TipPortalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!state.visible || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const pad = 14;
    let left = state.x + 16;
    let top = state.y + 16;
    if (left + r.width + pad > window.innerWidth) left = state.x - r.width - 16;
    if (top + r.height + pad > window.innerHeight) top = state.y - r.height - 16;
    if (left < pad) left = pad;
    if (top < pad) top = pad;
    setPos({ left, top });
  }, [state.x, state.y, state.visible, state.content]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        zIndex: 300,
        left: pos.left,
        top: pos.top,
        background: "var(--bg-1)",
        border: "1px solid var(--line-strong)",
        borderRadius: 12,
        padding: "12px 14px",
        minWidth: 220,
        maxWidth: 320,
        boxShadow: "0 24px 48px rgba(0,0,0,0.55)",
        fontFamily: "var(--sans)",
        color: "var(--ink-0)",
        pointerEvents: "none",
        opacity: state.visible ? 1 : 0,
        transform: state.visible ? "translateY(0)" : "translateY(4px)",
        transition: "opacity 120ms ease, transform 120ms ease",
        backdropFilter: "blur(20px)",
      }}
    >
      {state.content}
    </div>
  );
}

interface TipBodyRow {
  l: string;
  sub?: string;
  v: string | ReactNode;
  dot?: string;
  sign?: "pos" | "neg" | "none";
}

interface TipBodyProps {
  eyebrow?: string;
  title?: string;
  value?: string | ReactNode;
  valueClass?: string;
  rows?: TipBodyRow[];
  foot?: string | ReactNode;
  footRight?: string | ReactNode;
  accent?: boolean;
}

export function TipBody({ eyebrow, title, value, rows, foot, footRight, accent }: TipBodyProps) {
  return (
    <>
      {(eyebrow || title || value != null) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid var(--line)" }}>
          <div>
            {eyebrow && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 2 }}>
                {eyebrow}
              </div>
            )}
            {title && (
              <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-0)" }}>{title}</div>
            )}
          </div>
          {value != null && (
            <div style={{ fontFamily: "var(--serif)", fontSize: 18, letterSpacing: "-0.01em" }}>{value}</div>
          )}
        </div>
      )}
      {rows && rows.map((r, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "4px 0", fontSize: 12, color: "var(--ink-1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            {r.dot && <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: r.dot, flexShrink: 0 }} />}
            <div style={{ minWidth: 0, flex: 1 }}>
              <b style={{ fontWeight: 500, fontSize: 12, color: "var(--ink-0)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.l}</b>
              {r.sub && <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", display: "block", marginTop: 1 }}>{r.sub}</span>}
            </div>
          </div>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: r.sign === "neg" ? "var(--loss)" : r.sign === "pos" ? "var(--gain)" : "var(--ink-0)", whiteSpace: "nowrap" }}>
            {r.v}
          </span>
        </div>
      ))}
      {foot && (
        <div style={{ display: "flex", justifyContent: footRight ? "space-between" : "flex-start", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--line)", fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em" }}>
          <span>{foot}</span>
          {footRight && <span style={{ color: accent ? "var(--accent)" : undefined }}>{footRight}</span>}
        </div>
      )}
    </>
  );
}
