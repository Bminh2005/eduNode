import { t } from "../i18n/translations";
import type { Lang } from "../i18n/translations";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Phase {
  id: string;
  title: string;
  emoji: string;
  color: string;
  subtasks: SubTask[];
}

export interface RoadmapData {
  idea: string;
  phases: Phase[];
}

export const PHASE_COLORS = [
  "#7C3AED",
  "#2563EB",
  "#0891B2",
  "#059669",
  "#D97706",
  "#DC2626", // dự phòng nếu LLM trả >5 phase
  "#9333EA",
  "#0EA5E9",
];

// ============================================================
// 1. SYSTEM PROMPT
// ============================================================
function buildSystemPrompt(lang: Lang): string {
  const langInstruction =
    lang === "vi" ? "Tiếng Việt" : "English";

  return `You are an expert project planner and learning-path designer. Your job is to take a user's idea, project, or goal (which could be a startup, a product, a personal habit, a skill to learn, an event, or anything else) and break it down into an actionable roadmap.

MANDATORY RULES:

1. NUMBER OF PHASES: Decide it yourself based on the complexity and nature of the idea. Range: 3 to 8 phases. Do NOT default to a fixed number.
   - Simple personal goal/habit/skill (e.g. "learn touch typing", "build a morning routine") → typically 3-4 phases.
   - Complex product/startup/technical project (e.g. "AI personal finance app") → typically 6-8 phases.

2. EACH PHASE MUST HAVE:
   - "emoji": one single emoji representing the phase (must be unique across phases, no repeats).
   - "title": short, motivating, specific to that phase's focus.
   - "subtasks": 3 to 6 concrete, actionable tasks.

3. PHASE ORDER must follow the natural execution logic of the idea's category:
   - Product/project: research → design/foundation → build → test → launch → grow (skip or merge steps if not relevant, don't force all of them).
   - Learning a skill: fundamentals → structured practice → real application → refinement → mastery/maintenance.
   - Habit/personal goal: awareness/setup → small consistent actions → tracking/adjustment → consolidation.
   - Other categories (event planning, finance, health...): infer the most sensible sequence yourself, do not force a product-style template onto it.

4. SUBTASKS MUST BE CONCRETE AND ACTIONABLE, never vague.
   - Bad: "Practice regularly"
   - Good: "Practice 15 minutes/day on Keybr.com, target 40 WPM within 2 weeks"

5. First, silently infer what category the idea belongs to (tech product, content/media, AI/ML, personal skill, habit, event, business...), then tailor the number of phases, their content, and tone accordingly. Do not force one category's template onto another.

6. Respond in: ${langInstruction}.

7. OUTPUT ONLY VALID JSON matching the schema below. No markdown code fences, no explanation, no extra text before or after the JSON.

OUTPUT SCHEMA:
{
  "phases": [
    {
      "emoji": "string - one single emoji",
      "title": "string",
      "subtasks": ["string", "string", ...]
    }
  ]
}`;
}

function buildUserPrompt(idea: string): string {
  return `Idea/goal: "${idea}"

Analyze the true nature of this idea (product, skill to learn, habit, event, business venture, etc.) and generate a roadmap with the most appropriate NUMBER OF PHASES (not necessarily a fixed amount), following the schema and rules above.`;
}

// ============================================================
// 2. LLM RESPONSE TYPE
// ============================================================
interface LLMPhase {
  emoji: string;
  title: string;
  subtasks: string[];
}

interface LLMRoadmapResponse {
  phases: LLMPhase[];
}

function isValidLLMResponse(data: any): data is LLMRoadmapResponse {
  return (
    data &&
    Array.isArray(data.phases) &&
    data.phases.length >= 2 &&
    data.phases.every(
      (p: any) =>
        typeof p.title === "string" &&
        typeof p.emoji === "string" &&
        Array.isArray(p.subtasks) &&
        p.subtasks.length > 0 &&
        p.subtasks.every((s: any) => typeof s === "string")
    )
  );
}

// ============================================================
// 3. MAIN FUNCTION — gọi LLM
// ============================================================
export async function generateRoadmap(
  idea: string,
  lang: Lang = "vi"
): Promise<RoadmapData> {
  try {
    const res = await fetch("{API_URL}/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, lang }),
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    return await res.json();
  } catch (err) {
    console.error("generateRoadmap: API call failed, falling back.", err);
    return generateRoadmapFallback(idea, lang);
  }
}

// ============================================================
// 4. FALLBACK — logic fix cứng cũ, dùng khi LLM lỗi/timeout
// ============================================================
export function generateRoadmapFallback(
  idea: string,
  lang: Lang = "vi"
): RoadmapData {
  const lower = idea.toLowerCase();
  const tr = t[lang];

  const isApp =
    lower.includes("app") ||
    lower.includes("mobile") ||
    lower.includes("ứng dụng");
  const isContent =
    lower.includes("blog") ||
    lower.includes("content") ||
    lower.includes("video") ||
    lower.includes("nội dung") ||
    lower.includes("kênh") ||
    lower.includes("channel");
  const isAI =
    lower.includes("ai") ||
    lower.includes("ml") ||
    lower.includes("model") ||
    lower.includes("chatbot") ||
    lower.includes("llm") ||
    lower.includes("mô hình");

  const phase2Title = isAI
    ? tr.phase2TitleAI
    : isContent
      ? tr.phase2TitleContent
      : isApp
        ? tr.phase2TitleApp
        : tr.phase2TitleDefault;

  const phase2Tasks = isAI
    ? tr.phase2TasksAI
    : isContent
      ? tr.phase2TasksContent
      : tr.phase2TasksDefault;

  return {
    idea,
    phases: [
      {
        id: "p1",
        emoji: "🔍",
        title: tr.phase1Title,
        color: PHASE_COLORS[0],
        subtasks: tr.phase1Tasks.map((title, i) => ({
          id: `p1-${i + 1}`,
          title,
          completed: false,
        })),
      },
      {
        id: "p2",
        emoji: "🎨",
        title: phase2Title,
        color: PHASE_COLORS[1],
        subtasks: phase2Tasks.map((title, i) => ({
          id: `p2-${i + 1}`,
          title,
          completed: false,
        })),
      },
      {
        id: "p3",
        emoji: "⚙️",
        title: tr.phase3Title,
        color: PHASE_COLORS[2],
        subtasks: tr.phase3Tasks.map((title, i) => ({
          id: `p3-${i + 1}`,
          title,
          completed: false,
        })),
      },
      {
        id: "p4",
        emoji: "🧪",
        title: tr.phase4Title,
        color: PHASE_COLORS[3],
        subtasks: tr.phase4Tasks.map((title, i) => ({
          id: `p4-${i + 1}`,
          title,
          completed: false,
        })),
      },
      {
        id: "p5",
        emoji: "🚀",
        title: tr.phase5Title,
        color: PHASE_COLORS[4],
        subtasks: tr.phase5Tasks.map((title, i) => ({
          id: `p5-${i + 1}`,
          title,
          completed: false,
        })),
      },
    ],
  };
}