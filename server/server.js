import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

function buildSystemPrompt(lang = "vi") {
    const langInstruction = lang === "vi" ? "Tiếng Việt" : "English";

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
   - Product/project: research → design/foundation → build → test → launch → grow (skip or merge steps if not relevant).
   - Learning a skill: fundamentals → structured practice → real application → refinement → mastery/maintenance.
   - Habit/personal goal: awareness/setup → small consistent actions → tracking/adjustment → consolidation.
   - Other categories (event, finance, health...): infer the most sensible sequence yourself.

4. SUBTASKS MUST BE CONCRETE AND ACTIONABLE, never vague.
   - Bad: "Practice regularly"
   - Good: "Practice 15 minutes/day on Keybr.com, target 40 WPM within 2 weeks"

5. Silently infer the idea's category first (tech product, content/media, AI/ML, personal skill, habit, event, business...), then tailor the number of phases, content, and tone accordingly.

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

function buildUserPrompt(idea) {
    return `Idea/goal: "${idea}"

Analyze the true nature of this idea and generate a roadmap with the most appropriate NUMBER OF PHASES (not necessarily a fixed amount), following the schema and rules above.`;
}

if (!process.env.FPT_API_KEY) {
    console.error("❌ Error: FPT_API_KEY environment variable is not set.");
    console.error("Please create a .env file with FPT_API_KEY=your_api_key");
    process.exit(1);
}

const client = new OpenAI({
    apiKey: process.env.FPT_API_KEY,
    baseURL: "https://mkp-api.fptcloud.com",
});

const PHASE_COLORS = [
    "#7C3AED", "#2563EB", "#0891B2", "#059669",
    "#D97706", "#DC2626", "#9333EA", "#0EA5E9",
];

function isValidLLMResponse(data) {
    return (
        data &&
        Array.isArray(data.phases) &&
        data.phases.length >= 2 &&
        data.phases.every(
            (p) =>
                typeof p.title === "string" &&
                typeof p.emoji === "string" &&
                Array.isArray(p.subtasks) &&
                p.subtasks.length > 0 &&
                p.subtasks.every((s) => typeof s === "string")
        )
    );
}

app.post("/api/roadmap", async (req, res) => {
    const { idea, lang = "vi" } = req.body;

    if (!idea || typeof idea !== "string" || !idea.trim()) {
        return res.status(400).json({ error: "Missing or invalid 'idea'" });
    }

    try {
        const completion = await client.chat.completions.create({
            model: "DeepSeek-V4-Flash",
            messages: [
                { role: "system", content: buildSystemPrompt(lang) },
                { role: "user", content: buildUserPrompt(idea) },
            ],
            temperature: 0.5,
            max_tokens: 2000,
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("Empty response from LLM");
        }

        const rawText = content
            .trim()
            .replace(/^```json\s*|^```\s*|```$/g, "");

        const parsed = JSON.parse(rawText);

        if (!isValidLLMResponse(parsed)) {
            throw new Error("Invalid roadmap shape from LLM");
        }

        const roadmap = {
            idea,
            phases: parsed.phases.map((phase, idx) => ({
                id: `p${idx + 1}`,
                emoji: phase.emoji || "📌",
                title: phase.title,
                color: PHASE_COLORS[idx % PHASE_COLORS.length],
                subtasks: phase.subtasks.map((title, i) => ({
                    id: `p${idx + 1}-${i + 1}`,
                    title,
                    completed: false,
                })),
            })),
        };

        res.json(roadmap);
    } catch (err) {
        console.error("generateRoadmap failed:", err.message);
        res.status(500).json({ error: "Failed to generate roadmap" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📍 API endpoint: http://localhost:${PORT}/api/roadmap`);
});