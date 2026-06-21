import { Outlet, useLocation, Link } from "react-router";
import { Brain } from "lucide-react";
import { useLang } from "./i18n/LanguageContext";
import { t } from "./i18n/translations";

export default function Root() {
  const location = useLocation();
  const { lang, toggle } = useLang();
  const tr = t[lang];
  const isResult = location.pathname === "/result";

  return (
    <div
      className="h-screen bg-background text-foreground flex flex-col overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <header className="border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
        <Link to="/" className="flex items-center gap-3 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-105"
            style={{
              background: "rgba(109,40,217,0.08)",
              border: "1px solid rgba(109,40,217,0.3)",
            }}
          >
            <Brain className="w-4 h-4" style={{ color: "#6D28D9" }} />
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold tracking-widest"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "#0F172A" }}
            >
              EduNode
            </span>
            <span
              className="text-xs text-muted-foreground hidden sm:block"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "#CBD5E1" }}
            >
              //
            </span>
            <span className="text-xs text-muted-foreground hidden sm:block">
              {tr.tagline}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all select-none"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: "rgba(109,40,217,0.06)",
              border: "1px solid rgba(109,40,217,0.2)",
              color: "#6D28D9",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(109,40,217,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(109,40,217,0.06)";
            }}
            title="Switch language"
          >
            <span style={{ opacity: lang === "vi" ? 1 : 0.45 }}>VI</span>
            <span style={{ color: "#CBD5E1" }}>/</span>
            <span style={{ opacity: lang === "en" ? 1 : 0.45 }}>EN</span>
          </button>

          {isResult && (
            <Link
              to="/"
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#6D28D9",
                border: "1px solid rgba(109,40,217,0.25)",
                background: "rgba(109,40,217,0.05)",
              }}
            >
              {tr.newIdea}
            </Link>
          )}
        </div>
      </header>

      <Outlet />
    </div>
  );
}
