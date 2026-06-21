import { useState, useRef, useLayoutEffect, useEffect, useCallback, useMemo } from "react";
import type { RoadmapData } from "../data/roadmap";

interface PhaseLayout {
  x: number;
  y: number;
  a: number;
}

function computePhaseLayout(phases: RoadmapData["phases"]): PhaseLayout[] {
  const n = phases.length;
  if (n === 0) return [];

  const layout: PhaseLayout[] = new Array(n);
  layout[0] = { x: -PHASE_DIST, y: 0, a: Math.PI };

  const rightPhases = phases.slice(1);
  if (rightPhases.length === 0) return layout;

  const PADDING = 24;
  // ⬇️ +1 để tính luôn slot cho nút "+"
  const slotHeights = rightPhases.map(
    (p) => (p.subtasks.length + 1) * SUB_SPREAD + PADDING
  );
  const totalHeight = slotHeights.reduce((a, b) => a + b, 0);

  let cursor = -totalHeight / 2;
  rightPhases.forEach((_, idx) => {
    const h = slotHeights[idx];
    const centerY = cursor + h / 2;
    cursor += h;
    const a = Math.atan2(centerY, PHASE_DIST);
    layout[idx + 1] = { x: PHASE_DIST, y: centerY, a };
  });

  return layout;
}
// ── Layout constants ──────────────────────────────────────────────────────────
const PHASE_DIST = 340;
const SUB_ALONG = 230;
const SUB_SPREAD = 68; // tăng từ 68 → có thêm ~40px khoảng trống giữa các card

const CW = 200, CH = 72;   // center card
const PW = 168, PH = 72;   // phase card
const SW = 230, SH = 50;   // subtask card

function phasePos(i: number, n: number) {
  if (i === 0) {
    // Phase đầu tiên ở bên trái, nằm ngang
    return { x: -PHASE_DIST, y: 0, a: Math.PI };
  }

  const rightCount = n - 1;

  // Giới hạn góc xòe tối đa — càng nhiều phase thì xòe rộng hơn 1 chút,
  // nhưng KHÔNG bao giờ vượt quá ±55° để tránh đâm thẳng lên/xuống
  const maxSpreadDeg = Math.min(55, 20 + rightCount * 7);
  const maxSpread = (maxSpreadDeg * Math.PI) / 180;

  let a: number;
  if (rightCount === 1) {
    a = 0; // chỉ 1 phase bên phải → nằm ngang luôn, giống mũi giữa đinh ba
  } else {
    // Rải đều từ -maxSpread đến +maxSpread, mũi giữa luôn ở góc 0 (ngang)
    a = -maxSpread + ((i - 1) / (rightCount - 1)) * (2 * maxSpread);
  }

  return { x: Math.cos(a) * PHASE_DIST, y: Math.sin(a) * PHASE_DIST, a };
}

function subPos(px: number, py: number, _a: number, j: number, m: number) {
  const dir = px >= 0 ? 1 : -1;
  const baseX = px + dir * SUB_ALONG;

  const total = m + 1; // m subtask + 1 nút "+"
  const off = (j - (total - 1) / 2) * SUB_SPREAD;
  return { x: baseX, y: py + off };
}

function addBtnPos(px: number, py: number, _a: number, m: number) {
  const dir = px >= 0 ? 1 : -1;
  const baseX = px + dir * SUB_ALONG;

  const total = m + 1;
  const off = (m - (total - 1) / 2) * SUB_SPREAD; // nút "+" = item cuối cùng (index = m)
  return { x: baseX, y: py + off };
}

// ── Bezier connector ──────────────────────────────────────────────────────────
function Bezier({ x1, y1, x2, y2, color, w = 1.5 }: {
  x1: number; y1: number; x2: number; y2: number; color: string; w?: number;
}) {
  const mx = (x1 + x2) / 2;
  return (
    <path
      d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
      stroke={color} strokeWidth={w} fill="none"
      strokeOpacity="0.45" strokeLinecap="round"
    />
  );
}

// ── Tiny SVG check / close icons ──────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="9" height="9" viewBox="0 0 9 9">
    <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const XIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8">
    <path d="M1 1L7 7M7 1L1 7" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// ── Props ─────────────────────────────────────────────────────────────────────
export interface MindmapCanvasProps {
  data: RoadmapData;
  onToggleSubtask: (phaseId: string, subId: string) => void;
  onAddSubtask: (phaseId: string, title: string) => void;
  addPlaceholder: string;
  addBtnLabel: string;
  hintText: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MindmapCanvas({
  data, onToggleSubtask, onAddSubtask, addPlaceholder, addBtnLabel, hintText,
}: MindmapCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tf, setTf] = useState({ x: 0, y: 0, s: 0.85 });
  const tfRef = useRef(tf);
  const dragRef = useRef<{ ox: number; oy: number; tx: number; ty: number } | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const n = data.phases.length;

  const phaseLayout = useMemo(() => computePhaseLayout(data.phases), [data.phases]);
  // keep tfRef in sync
  useEffect(() => { tfRef.current = tf; }, [tf]);

  // Center on first valid size using ResizeObserver
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      if (!entries.length) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setTf({ x: width / 2, y: height / 2, s: Math.min(0.88, width / 940) });
        ro.disconnect();
      }
    });
    ro.observe(el);
    // Also try immediately in case it's already sized
    const { width, height } = el.getBoundingClientRect();
    if (width > 0 && height > 0) {
      setTf({ x: width / 2, y: height / 2, s: Math.min(0.88, width / 940) });
      ro.disconnect();
    }
    return () => ro.disconnect();
  }, []);

  // passive:false wheel listener
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY > 0 ? 0.9 : 1.11;
      setTf(prev => {
        const ns = Math.min(Math.max(prev.s * factor, 0.18), 3.5);
        const r = ns / prev.s;
        return { x: mx + (prev.x - mx) * r, y: my + (prev.y - my) * r, s: ns };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // focus new input
  useEffect(() => {
    if (addingTo) inputRef.current?.focus();
  }, [addingTo]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragRef.current = { ox: e.clientX, oy: e.clientY, tx: tf.x, ty: tf.y };
  }, [tf]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const drag = dragRef.current;

    if (!drag) return;

    const dx = e.clientX - drag.ox;
    const dy = e.clientY - drag.oy;

    setTf(prev => ({
      ...prev,
      x: drag.tx + dx,
      y: drag.ty + dy,
    }));
  }, []);

  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const commitAdd = (phaseId: string) => {
    if (draft.trim()) onAddSubtask(phaseId, draft.trim());
    setAddingTo(null);
    setDraft("");
  };

  const cancelAdd = () => { setAddingTo(null); setDraft(""); };

  const zoom = (factor: number) =>
    setTf(prev => ({ ...prev, s: Math.min(Math.max(prev.s * factor, 0.18), 3.5) }));

  const resetView = () => {
    if (!wrapRef.current) return;
    const { width, height } = wrapRef.current.getBoundingClientRect();
    setTf({ x: width / 2, y: height / 2, s: Math.min(0.88, width / 940) });
  };

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden select-none"
      style={{
        cursor: dragRef.current ? "grabbing" : "grab",
        background: "linear-gradient(145deg, #F5F7FA 0%, #EEF2FF 100%)",
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* ── Dot-grid background ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.4 }}
      >
        <defs>
          <pattern
            id="dots"
            x={(tf.x % (22 * tf.s))}
            y={(tf.y % (22 * tf.s))}
            width={22 * tf.s}
            height={22 * tf.s}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={0} cy={0} r={1} fill="#6D28D9" fillOpacity="0.35" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* ── Bezier lines ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <g transform={`translate(${tf.x},${tf.y}) scale(${tf.s})`}>
          {data.phases.map((phase, i) => {
            const { x: px, y: py, a } = phaseLayout[i];
            const m = phase.subtasks.length;
            const btnP = addBtnPos(px, py, a, m);
            return (
              <g key={phase.id}>
                <Bezier x1={0} y1={0} x2={px} y2={py} color={phase.color} w={2.5} />
                {phase.subtasks.map((sub, j) => {
                  const sp = subPos(px, py, a, j, m);
                  return <Bezier key={sub.id} x1={px} y1={py} x2={sp.x} y2={sp.y} color={phase.color} w={1.5} />;
                })}
                {addingTo === phase.id
                  ? <Bezier x1={px} y1={py} x2={btnP.x} y2={btnP.y} color={phase.color} w={1.5} />
                  : null}
              </g>
            );
          })}
        </g>
      </svg>

      {/* ── Card layer ── */}
      <div
        className="absolute"
        style={{
          left: 0, top: 0, width: 0, height: 0,
          transform: `translate(${tf.x}px,${tf.y}px) scale(${tf.s})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Center card */}
        <div
          style={{ position: "absolute", left: -CW / 2, top: -CH / 2, width: CW }}
          onMouseDown={stop}
        >
          <div style={{
            background: "#fff",
            border: "2.5px solid #7C3AED",
            borderRadius: "14px",
            padding: "12px 16px",
            textAlign: "center",
            boxShadow: "0 4px 24px rgba(109,40,217,0.16), 0 0 0 5px rgba(109,40,217,0.06)",
          }}>
            <div style={{
              fontSize: "9px", fontFamily: "'JetBrains Mono',monospace",
              color: "#7C3AED", fontWeight: 700, letterSpacing: "1.5px",
              textTransform: "uppercase", marginBottom: "6px",
            }}>
              ⬡ EduNode
            </div>
            <div style={{
              fontSize: "12px", color: "#0F172A", fontWeight: 700,
              lineHeight: 1.4, wordBreak: "break-word",
            }}>
              {data.idea}
            </div>
          </div>
        </div>

        {/* Phase + subtask cards */}
        {data.phases.map((phase, i) => {
          const { x: px, y: py, a } = phaseLayout[i];
          const m = phase.subtasks.length;
          const done = phase.subtasks.filter(s => s.completed).length;
          const btnP = addBtnPos(px, py, a, m);

          return (
            <div key={phase.id} style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0 }}>

              {/* Phase card */}
              <div
                style={{ position: "absolute", left: px - PW / 2, top: py - PH / 2, width: PW }}
                onMouseDown={stop}
              >
                <div style={{
                  background: "#fff",
                  border: `2px solid ${phase.color}`,
                  borderRadius: "12px",
                  padding: "10px 13px",
                  boxShadow: `0 3px 16px ${phase.color}22`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px" }}>
                    <span style={{ fontSize: "16px", lineHeight: 1 }}>{phase.emoji}</span>
                    <span style={{
                      fontSize: "11px", color: "#0F172A", fontWeight: 700,
                      lineHeight: 1.35, flex: 1, wordBreak: "break-word",
                    }}>
                      {phase.title}
                    </span>
                    <span style={{
                      fontSize: "8px", fontFamily: "'JetBrains Mono',monospace",
                      color: phase.color, fontWeight: 700, whiteSpace: "nowrap",
                    }}>
                      {done}/{m}
                    </span>
                  </div>
                  <div style={{ height: "3px", background: "rgba(15,23,42,0.07)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${m > 0 ? (done / m) * 100 : 0}%`,
                      background: phase.color,
                      borderRadius: "2px",
                      transition: "width 0.4s",
                    }} />
                  </div>
                </div>
              </div>

              {/* Subtask cards */}
              {phase.subtasks.map((sub, j) => {
                const sp = subPos(px, py, a, j, m);
                return (
                  <div
                    key={sub.id}
                    style={{ position: "absolute", left: sp.x - SW / 2, top: sp.y - SH / 2, width: SW }}
                    onMouseDown={stop}
                  >
                    <div
                      onClick={() => onToggleSubtask(phase.id, sub.id)}
                      style={{
                        background: sub.completed ? `${phase.color}0D` : "#fff",
                        border: `1.5px solid ${sub.completed ? phase.color : "rgba(15,23,42,0.1)"}`,
                        borderRadius: "9px",
                        padding: "7px 10px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        cursor: "pointer",
                        boxShadow: "0 1px 5px rgba(15,23,42,0.07)",
                        transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
                        minHeight: SH,
                      }}
                      onMouseEnter={e => {
                        const d = e.currentTarget as HTMLDivElement;
                        d.style.boxShadow = `0 3px 12px ${phase.color}30`;
                        d.style.borderColor = phase.color;
                      }}
                      onMouseLeave={e => {
                        const d = e.currentTarget as HTMLDivElement;
                        d.style.boxShadow = "0 1px 5px rgba(15,23,42,0.07)";
                        d.style.borderColor = sub.completed ? phase.color : "rgba(15,23,42,0.1)";
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{
                        width: 15, height: 15, borderRadius: "4px", flexShrink: 0, marginTop: 1,
                        background: sub.completed ? phase.color : "transparent",
                        border: `1.5px solid ${sub.completed ? phase.color : "rgba(15,23,42,0.18)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 0.15s, border-color 0.15s",
                      }}>
                        {sub.completed && <CheckIcon />}
                      </div>
                      {/* Title */}
                      <span style={{
                        fontSize: "10px",
                        color: sub.completed ? "#94A3B8" : "#1E293B",
                        lineHeight: 1.45,
                        textDecoration: sub.completed ? "line-through" : "none",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        wordBreak: "break-word",
                        transition: "color 0.15s",
                      }}>
                        {sub.title}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Add subtask — input or + button */}
              <div
                style={{ position: "absolute", left: btnP.x - SW / 2, top: btnP.y - 18, width: SW }}
                onMouseDown={stop}
              >
                {addingTo === phase.id ? (
                  <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                    <input
                      ref={inputRef}
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") commitAdd(phase.id);
                        if (e.key === "Escape") cancelAdd();
                      }}
                      placeholder={addPlaceholder}
                      style={{
                        flex: 1,
                        fontSize: "10px",
                        padding: "6px 9px",
                        borderRadius: "7px",
                        border: `1.5px solid ${phase.color}`,
                        outline: "none",
                        background: "#fff",
                        color: "#0F172A",
                        boxShadow: `0 0 0 3px ${phase.color}18`,
                      }}
                    />
                    <button
                      onClick={() => commitAdd(phase.id)}
                      style={{
                        width: 26, height: 26, background: phase.color, border: "none",
                        borderRadius: "6px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckIcon />
                    </button>
                    <button
                      onClick={cancelAdd}
                      style={{
                        width: 26, height: 26, background: "rgba(15,23,42,0.07)", border: "none",
                        borderRadius: "6px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <XIcon />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setAddingTo(phase.id)}
                    style={{
                      height: 30, borderRadius: "8px",
                      border: `1.5px dashed ${phase.color}70`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "5px",
                      cursor: "pointer",
                      background: "rgba(255,255,255,0.75)",
                      color: phase.color,
                      fontSize: "10px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={e => {
                      const d = e.currentTarget as HTMLDivElement;
                      d.style.background = `${phase.color}12`;
                      d.style.borderStyle = "solid";
                    }}
                    onMouseLeave={e => {
                      const d = e.currentTarget as HTMLDivElement;
                      d.style.background = "rgba(255,255,255,0.75)";
                      d.style.borderStyle = "dashed";
                    }}
                  >
                    <span style={{ fontSize: "14px", lineHeight: 1 }}>+</span>
                    <span>{addBtnLabel}</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* ── Zoom controls ── */}
      <div
        className="absolute bottom-4 right-4 flex flex-col gap-1.5"
        onMouseDown={stop}
      >
        {([
          { label: "+", title: "Zoom in", fn: () => zoom(1.22) },
          { label: "⌂", title: "Reset view", fn: resetView },
          { label: "−", title: "Zoom out", fn: () => zoom(0.82) },
        ] as const).map(({ label, title, fn }) => (
          <button
            key={label}
            title={title}
            onClick={fn}
            style={{
              width: 34, height: 34, background: "#fff",
              border: "1px solid rgba(15,23,42,0.1)",
              borderRadius: "9px",
              fontSize: label === "⌂" ? "14px" : "20px",
              fontWeight: 300,
              color: "#475569",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(15,23,42,0.09)",
              lineHeight: 1,
              transition: "box-shadow 0.15s, color 0.15s",
            }}
            onMouseEnter={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.boxShadow = "0 4px 14px rgba(109,40,217,0.2)";
              b.style.color = "#6D28D9";
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.boxShadow = "0 2px 8px rgba(15,23,42,0.09)";
              b.style.color = "#475569";
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Hint ── */}
      <div
        className="absolute bottom-4 left-4 text-xs text-muted-foreground pointer-events-none"
        style={{ fontFamily: "'JetBrains Mono',monospace", userSelect: "none", opacity: 0.6 }}
      >
        {hintText}
      </div>
    </div>
  );
}
