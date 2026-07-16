import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;

  // Initialize Gemini client with proper User-Agent header for telemetry
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for message analysis
  app.post("/api/filter-message", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Zpráva k analýze nesmí být prázdná." });
      }

      if (!apiKey) {
        return res.status(500).json({ error: "Chybí klíč k rozhraní Gemini API. Nastavte GEMINI_API_KEY v nastavení (Settings > Secrets)." });
      }

      const systemInstruction = `Jste specializovaný komunikační asistent pro vysoce konfliktní vztahy (např. s narcistickými, manipulativními osobami nebo při domácím násilí).
Vaším úkolem je analyzovat příchozí zprávu od odesílatele a poskytnout strukturovanou, nestrannou analýzu v češtině.

Musíte se řídit metodou Gray Rock (šedá skála) a zásadou J.A.D.E. (Justify, Argue, Defend, Explain):
- Uživatel by se NIKDY neměl ve své odpovědi obhajovat, přít/hádat se, bránit se nebo vysvětlovat své chování či rozhodnutí.
- Odpověď metodou Gray Rock musí být extrémně nudná, stručná, věcná a netečná, bez jakýchkoliv emocí.

Určete úroveň ohrožení (threatLevel):
- 'NÍZKÉ': Pokud jde o pasivně agresivní poznámky, rýpání, rýpavé dotazy nebo drobné urážky.
- 'STŘEDNÍ': Pokud obsahuje silnější nátlak, obvinění, manipulaci, citové vydírání nebo mírné nátlakové výhrůžky ohledně financí či dětí.
- 'VYSOKÉ': Pokud zpráva obsahuje závažné výhrůžky fyzickým násilím, sebepoškozováním odesílatele, zničením majetku, únosem dětí, trestním oznámením nebo žalobou. V tomto případě doporučte neodpovídat a nastavit safeToReply na false.

Ujistěte se, že výstup odpovídá požadovanému schématu JSON. Všechny odpovědi a texty musí být v češtině.`;

      const prompt = `Zde je zpráva k analýze:
"""
${message}
"""`;

      // Define schema using standard JSON-schema-like structures with the @google/genai SDK format
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              threatLevel: {
                type: "STRING",
                enum: ["NÍZKÉ", "STŘEDNÍ", "VYSOKÉ"],
                description: "Úroveň hrozby obsažená ve zprávě."
              },
              threatDetails: {
                type: "STRING",
                description: "Věcné shrnutí hrozeb nebo varovných signálů obsažených v textu."
              },
              manipulationTechniques: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "Seznam rozpoznaných manipulačních technik."
              },
              grayRockResponse: {
                type: "STRING",
                description: "Navržená odpověď metodou Gray Rock (šedá skála) v češtině. Musí být suchá, stručná a věcná. Pokud je 'safeToReply' false, uveďte '[Doporučeno neodpovídat]'."
              },
              advice: {
                type: "STRING",
                description: "Praktická a asertivní rada pro uživatele, jak se chovat a jaké kroky podniknout."
              },
              detectedEmotions: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "Hlavní emoce odesílatele detekované ve zprávě."
              },
              safeToReply: {
                type: "BOOLEAN",
                description: "Nastavte na false, pokud zpráva obsahuje závažné hrozby (násilí, sebepoškozování, apod.), jinak true."
              }
            },
            required: [
              "threatLevel",
              "threatDetails",
              "manipulationTechniques",
              "grayRockResponse",
              "advice",
              "detectedEmotions",
              "safeToReply"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Model nevrátil žádný text.");
      }

      const result = JSON.parse(responseText.trim());
      res.json(result);

    } catch (error: any) {
      console.error("Chyba při analýze zprávy:", error);
      res.status(500).json({
        error: error.message || "Nepodařilo se dokončit analýzu zprávy z důvodu vnitřní chyby serveru."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite middleware for development");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
