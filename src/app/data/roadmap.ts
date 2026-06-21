import { t } from "../i18n/translations";
import type { Lang } from "../i18n/translations";

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
];

export function generateRoadmap(idea: string, lang: Lang = "vi"): RoadmapData {
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
