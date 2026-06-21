import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { Brain, Target, ChevronDown, ChevronRight, Check } from "lucide-react";
import type { RoadmapData, Phase } from "../data/roadmap";
import { useLang } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";
import MindmapCanvas from "../components/MindmapCanvas";

// ── Phase accordion ───────────────────────────────────────────────────────────

function PhaseCard({
  phase, index, expanded, onToggle, onToggleSubtask, doneBadge, phaseLabel,
}: {
  phase: Phase;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onToggleSubtask: (subId: string) => void;
  doneBadge: string;
  phaseLabel: (n: number) => string;
}) {
  const done  = phase.subtasks.filter(s => s.completed).length;
  const total = phase.subtasks.length;
  const pct   = Math.round((done / total) * 100);
  const allDone = done === total && total > 0;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "#FFFFFF",
        border: `1px solid ${allDone ? "rgba(5,150,105,0.2)" : "rgba(15,23,42,0.07)"}`,
      }}
    >
      <button
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
        style={{ background: "transparent" }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(15,23,42,0.018)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        onClick={onToggle}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
          style={{ background: `${phase.color}12`, border: `1px solid ${phase.color}30` }}
        >
          {phase.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {phaseLabel(index + 1)}
            </span>
            {allDone && (
              <span
                className="text-xs px-1.5 py-0.5 rounded font-bold"
                style={{ fontFamily: "'JetBrains Mono', monospace", background: "rgba(5,150,105,0.1)", color: "#059669" }}
              >
                {doneBadge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground truncate">{phase.title}</span>
            <span className="text-xs shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace", color: phase.color }}>
              {done}/{total}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-16 h-1 rounded-full overflow-hidden hidden sm:block" style={{ background: "rgba(15,23,42,0.07)" }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: phase.color }} />
          </div>
          {expanded
            ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
            : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(15,23,42,0.05)" }}>
          {phase.subtasks.map((sub, idx) => (
            <div
              key={sub.id}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer"
              style={{ borderBottom: idx < phase.subtasks.length - 1 ? "1px solid rgba(15,23,42,0.04)" : "none" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(15,23,42,0.02)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              onClick={() => onToggleSubtask(sub.id)}
            >
              <button
                className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: sub.completed ? phase.color : "transparent",
                  border: `1.5px solid ${sub.completed ? phase.color : "rgba(15,23,42,0.15)"}`,
                }}
                onClick={e => { e.stopPropagation(); onToggleSubtask(sub.id); }}
              >
                {sub.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </button>
              <span className="text-xs text-muted-foreground w-5 shrink-0 select-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span
                className="text-sm transition-all"
                style={{ color: sub.completed ? "#94A3B8" : "#1E293B", textDecoration: sub.completed ? "line-through" : "none" }}
              >
                {sub.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Result page ───────────────────────────────────────────────────────────────

export default function Result() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { lang }  = useLang();
  const tr        = t[lang];

  const initialRoadmap = location.state?.roadmap as RoadmapData | undefined;
  const [roadmap,       setRoadmap]       = useState<RoadmapData | null>(initialRoadmap ?? null);
  const [activeTab,     setActiveTab]     = useState<"mindmap" | "roadmap">("mindmap");
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(initialRoadmap ? [initialRoadmap.phases[0].id] : [])
  );

  if (!roadmap) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">{tr.noRoadmap}</p>
          <button onClick={() => navigate("/")} className="text-sm px-4 py-2 rounded-lg text-white" style={{ background: "#6D28D9" }}>
            {tr.goHome}
          </button>
        </div>
      </div>
    );
  }

  const totalTasks     = roadmap.phases.reduce((acc, p) => acc + p.subtasks.length, 0);
  const completedTasks = roadmap.phases.reduce((acc, p) => acc + p.subtasks.filter(s => s.completed).length, 0);
  const progressPct    = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const togglePhase = (id: string) =>
    setExpandedPhases(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSubtask = useCallback((phaseId: string, subId: string) => {
    setRoadmap(prev => prev ? {
      ...prev,
      phases: prev.phases.map(p => p.id !== phaseId ? p : {
        ...p,
        subtasks: p.subtasks.map(s => s.id !== subId ? s : { ...s, completed: !s.completed }),
      }),
    } : prev);
  }, []);

  const addSubtask = useCallback((phaseId: string, title: string) => {
    setRoadmap(prev => prev ? {
      ...prev,
      phases: prev.phases.map(p => p.id !== phaseId ? p : {
        ...p,
        subtasks: [...p.subtasks, { id: `${phaseId}-${Date.now()}`, title, completed: false }],
      }),
    } : prev);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sub-header */}
      <div
        className="border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0"
        style={{ background: "rgba(245,247,250,0.85)", backdropFilter: "blur(8px)" }}
      >
        <p className="text-sm font-medium text-foreground truncate max-w-lg">
          <span className="text-muted-foreground text-xs mr-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {tr.ideaLabel}
          </span>
          {roadmap.idea}
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-24 h-1.5 rounded-full overflow-hidden hidden sm:block" style={{ background: "rgba(15,23,42,0.07)" }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #6D28D9, #0891B2)" }} />
          </div>
          <span className="text-sm font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#6D28D9" }}>
            {progressPct}%
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border px-4 sm:px-6 shrink-0">
        <div className="flex max-w-5xl mx-auto">
          {([
            { key: "mindmap", label: tr.tabMindmap, Icon: Brain },
            { key: "roadmap", label: tr.tabRoadmap,  Icon: Target },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="px-5 py-3 text-xs font-bold flex items-center gap-2 transition-all border-b-2"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                borderColor: activeTab === key ? "#6D28D9" : "transparent",
                color:       activeTab === key ? "#6D28D9" : "#94A3B8",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MINDMAP TAB ── */}
      {activeTab === "mindmap" && (
        <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>

          {/* Mindmap canvas */}
          <div className="flex-1 relative" style={{ minWidth: 0 }}>
            <div className="absolute inset-0">
              <MindmapCanvas
                data={roadmap}
                onToggleSubtask={toggleSubtask}
                onAddSubtask={addSubtask}
                addPlaceholder={tr.addPlaceholder}
                addBtnLabel={tr.addBtnLabel}
                hintText={tr.hintText}
              />
            </div>
          </div>

          {/* Progress sidebar */}
          <div
            className="w-72 shrink-0 overflow-y-auto p-4 flex flex-col gap-3"
            style={{ borderLeft: "1px solid rgba(15,23,42,0.07)", background: "#FAFBFC" }}
          >
            <p
              className="text-xs text-muted-foreground uppercase tracking-widest"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {tr.phasesOverview}
            </p>

            {roadmap.phases.map(phase => {
              const done  = phase.subtasks.filter(s => s.completed).length;
              const total = phase.subtasks.length;
              const pct   = Math.round((done / total) * 100);
              return (
                <div
                  key={phase.id}
                  className="rounded-lg p-3"
                  style={{ background: "#FFFFFF", border: "1px solid rgba(15,23,42,0.07)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{phase.emoji}</span>
                      <span className="text-xs font-medium text-foreground leading-snug">{phase.title}</span>
                    </div>
                    <span className="text-xs shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace", color: phase.color }}>
                      {done}/{total}
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(15,23,42,0.06)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: phase.color }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Overall */}
            <div
              className="rounded-lg p-4 mt-1"
              style={{ background: "#FFFFFF", border: "1px solid rgba(109,40,217,0.18)" }}
            >
              <div className="flex justify-between items-center mb-2">
                <span
                  className="text-xs text-muted-foreground uppercase tracking-widest"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {tr.overall}
                </span>
                <span
                  className="text-xl font-bold"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: "#6D28D9" }}
                >
                  {progressPct}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(15,23,42,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #6D28D9, #0891B2)" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {tr.tasksCompleted(completedTasks, totalTasks)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── ROADMAP TAB ── */}
      {activeTab === "roadmap" && (
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-5xl mx-auto space-y-3">
            {/* Progress banner */}
            <div className="rounded-xl p-4 mb-2" style={{ background: "#FFFFFF", border: "1px solid rgba(109,40,217,0.18)" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {tr.overallProgress}
                </span>
                <span className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#6D28D9" }}>
                  {progressPct}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "rgba(15,23,42,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #6D28D9, #0891B2)" }} />
              </div>
              <div className="flex flex-wrap gap-3">
                {roadmap.phases.map(p => {
                  const done = p.subtasks.filter(s => s.completed).length;
                  return (
                    <div key={p.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{p.emoji}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: p.color }}>{done}/{p.subtasks.length}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {roadmap.phases.map((phase, i) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                index={i}
                expanded={expandedPhases.has(phase.id)}
                onToggle={() => togglePhase(phase.id)}
                onToggleSubtask={subId => toggleSubtask(phase.id, subId)}
                doneBadge={tr.doneBadge}
                phaseLabel={tr.phaseLabel}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
