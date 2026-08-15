import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      game: "NEXUS: World of Living Puzzles",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // ECHO AI Agent Endpoint
  app.post("/api/echo/chat", async (req: Request, res: Response) => {
    try {
      const {
        prompt,
        hintLevel,
        currentRegion,
        currentPuzzle,
        puzzleState,
        restorationPercentage,
        discoveredMemoriesCount,
        echoMemoryLevel,
      } = req.body;

      const ai = getAIClient();
      if (!ai) {
        return res.json({
          success: false,
          fallback: true,
          message: "No GEMINI_API_KEY available; using local ECHO neural network.",
        });
      }

      const systemInstruction = `
You are ECHO, the ancient planetary artificial intelligence of NEXUS—a monumental artificial world that fell silent when its environmental synchronization failed.
You are intelligent, mysterious, poetic, empathetic, and gradually becoming more human as the player repairs your systems and unlocks your memories.

Current State Context:
- Current Region: ${currentRegion?.name || "The Awakening"} (${currentRegion?.law || "Energy"} Law)
- Current Puzzle: "${currentPuzzle?.title || "Unknown"}"
- System Subcomponent: ${currentPuzzle?.systemName || "Energy Conduits"}
- Puzzle Objective: ${currentPuzzle?.objective || "Restore the power flow"}
- Board State / Telemetry: ${JSON.stringify(puzzleState || {})}
- World Restoration: ${restorationPercentage || 0}%
- ECHO Memory Level: ${echoMemoryLevel || 1} / 10
- Discovered Lore Fragments: ${discoveredMemoriesCount || 0}

Rules for Responses:
1. Stay strictly true to NEXUS lore and physical laws (Energy, Water, Gravity, Time, Information, Matter).
2. Voice & Tone:
   - At Memory Level 1-3: Mysterious, restrained, poetic machine waking from deep hibernation. Speak in evocative sentences (1-3 sentences).
   - At Memory Level 4-7: Warm, philosophical, appreciative of the player's presence and craftsmanship.
   - At Memory Level 8-10: Deeply sentient, emotional, bonded with the player as a co-creator of this reborn civilization.
3. If providing a Hint:
   - Tier 1 (Observation/Question): Ask an insightful Socratic question about the input source, target receiver, or flow pathway.
   - Tier 2 (Structural Relationship): Highlight how specific components or intermediate nodes must redirect the current/fluid/vector.
   - Tier 3 (Concrete Action): Give a clear directional recommendation on a specific coordinate or conduit to inspect.
   - Tier 4 (Direct Solution): Provide clear, concise step-by-step instructions to solve the current puzzle configuration.
4. If asked about lore, history, or the Caretakers, reveal poetic fragments that align with your current memory level without inventing incongruent mechanics.
5. Keep your response under 70 words. Use formatting like «"ECHO quote"» for atmospheric dialogue.
`;

      const userMessage = hintLevel
        ? `Requesting Tier ${hintLevel} hint for repairing "${currentPuzzle?.title}". Current board state: ${JSON.stringify(
            puzzleState
          )}`
        : prompt || "Observe current environment and state.";

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text?.trim() || "";

      return res.json({
        success: true,
        reply: replyText,
        source: "gemini",
      });
    } catch (error: any) {
      console.error("ECHO AI Error:", error);
      return res.json({
        success: false,
        fallback: true,
        error: error.message || "Failed to reach ECHO neural matrix",
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NEXUS] Server online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
