import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { Sparkles, Zap, Loader2 } from "lucide-react";
import { generateRoadmap } from "../data/roadmap";
import { useLang } from "../i18n/LanguageContext";
import { t } from "../i18n/translations";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { lang } = useLang();
  const tr = t[lang];

  const streamSteps = [
    tr.stream1,
    tr.stream2,
    tr.stream3,
    tr.stream4,
    tr.stream5,
  ];

  const handleGenerate = useCallback(async () => {
    if (!idea.trim() || loading) return;
    setLoading(true);

    for (let i = 0; i < streamSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 370));
      setStreamText(streamSteps[i]);
    }

    await new Promise((r) => setTimeout(r, 250));
    const roadmap = await generateRoadmap(idea.trim(), lang);
    navigate("/result", { state: { roadmap } });
  }, [idea, loading, navigate, lang]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-10 space-y-3 max-w-xl">
        <p
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "#6D28D9" }}
        >
          {tr.badge}
        </p>
        <h1
          className="text-4xl font-bold leading-tight"
          style={{ color: "#0F172A", letterSpacing: "-0.02em" }}
        >
          {tr.heroLine1}
          <br />
          <span style={{ color: "#6D28D9" }}>{tr.heroLine2}</span>
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{tr.heroSub}</p>
      </div>

      {/* Input card */}
      <div
        className="w-full max-w-2xl rounded-2xl p-6"
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(15,23,42,0.08)",
          boxShadow: "0 4px 24px rgba(109,40,217,0.06), 0 1px 4px rgba(15,23,42,0.06)",
        }}
      >
        <div className="relative mb-4">
          <div className="absolute left-4 top-4 pointer-events-none">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </div>
          <textarea
            ref={textareaRef}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tr.inputPlaceholder}
            rows={3}
            disabled={loading}
            className="w-full rounded-xl pl-10 pr-4 py-3.5 text-sm resize-none transition-all focus:outline-none"
            style={{
              fontFamily: "Inter, sans-serif",
              background: "#F5F7FA",
              border: "1px solid rgba(15,23,42,0.08)",
              color: "#0F172A",
              caretColor: "#6D28D9",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(109,40,217,0.45)";
              e.target.style.boxShadow = "0 0 0 3px rgba(109,40,217,0.08)";
              e.target.style.background = "#FFFFFF";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(15,23,42,0.08)";
              e.target.style.boxShadow = "none";
              e.target.style.background = "#F5F7FA";
            }}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!idea.trim() || loading}
          className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            background:
              !idea.trim() || loading
                ? "#EEF2F7"
                : "linear-gradient(135deg, #6D28D9, #4F46E5)",
            color: !idea.trim() || loading ? "#94A3B8" : "white",
            border: `1px solid ${!idea.trim() || loading ? "rgba(15,23,42,0.06)" : "transparent"
              }`,
            cursor: !idea.trim() || loading ? "not-allowed" : "pointer",
            boxShadow:
              idea.trim() && !loading ? "0 4px 14px rgba(109,40,217,0.3)" : "none",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {streamText || tr.generating}
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              {tr.generateBtn}
            </>
          )}
        </button>
      </div>

      {/* Example prompts */}
      {!loading && (
        <div className="mt-6 w-full max-w-2xl">
          <p
            className="text-xs text-center text-muted-foreground mb-3"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {tr.tryExample}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {tr.examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setIdea(ex)}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(15,23,42,0.1)",
                  color: "#475569",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "rgba(109,40,217,0.35)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#6D28D9";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "rgba(15,23,42,0.1)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#475569";
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
