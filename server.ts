/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit for webcam snap baseline uploads
app.use(express.json({ limit: "15mb" }));

// Lazy initializer for GoogleGenAI to comply with API Key security guidelines
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
      throw new Error("GEMINI_API_KEY não está configurada em seu ambiente. Por favor, adicione seu segredo de desenvolvimento no painel correspondente.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// --------------------------------------------------------------------
// API ROUTES
// --------------------------------------------------------------------

/**
 * Endpoint to analyze user answers to initial diagnosticos and generate profile.
 */
app.post("/api/gemini/diagnose", async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers) {
      return res.status(400).json({ error: "Answers data is required." });
    }

    const ai = getGeminiClient();
    const prompt = `
      Age como um treinador profissional de comunicação e oratória avançada (coach executivo).
      Analise o questionário diagnóstico e gera um perfil personalizado de orador e plano de aprendizagem em Português.

      Respostas do diagnósticos:
      - Tem medo de falar em público? ${answers.temMedo}
      - Nível auto-avaliado de confiança (1 a 5): ${answers.confianca}/5
      - Tamanho de audiência máxima que se sente confortável: Até ${answers.temorAudiencia} pessoas
      - Já apresentou trabalhos ou discursos antes? ${answers.apresentouAntes}
      - Principal problema apontado pelo utilizador: ${answers.principalProblema}

      Calcula o nível adequado de recomendação do SpeakMaster AI de acordo com o seguinte criterio geral:
      - Tem medo frequente e nenhuma confiança -> "Iniciante"
      - Falou poucas vezes e tem medo moderador ou falta de técnica -> "Intermédio"
      - Tem já experiência mas quer dominar a cena e plateia -> "Avançado"
      - Palestrantes/Profissionais à procura de carisma extremo -> "Especialista"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Determina de forma realista, útil, encorajadora e profunda o plano de evolução do orador.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nivelRecomendado: {
              type: Type.STRING,
              description: "Must be exactly: 'Iniciante', 'Intermédio', 'Avançado', or 'Especialista'"
            },
            analiseGeral: {
              type: Type.STRING,
              description: "Análise psicológica e comunicacional rica, direta em Português (Portugal/Brasil)."
            },
            pontosFortes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Devem ser 3 pontos fortes realísticos tirados da sua base ou coragem"
            },
            pontosFracos: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Devem ser 3 pontos a trabalhar que justificam o seu medo primordial"
            },
            planoAcao: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4 módulos práticos diários focados estruturalmente na sua dificuldade principal"
            }
          },
          required: ["nivelRecomendado", "analiseGeral", "pontosFortes", "pontosFracos", "planoAcao"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Diagnosis API error:", err);
    res.status(500).json({ error: err.message || "Erro no processamento do diagnóstico de IA." });
  }
});

/**
 * Simulated/Live Audio speech transcript review & metrics evaluator.
 */
app.post("/api/gemini/evaluate-audio", async (req, res) => {
  try {
    const { transcript, durationSeconds, temaPraticado } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "Transcrição do áudio falhada." });
    }

    const ai = getGeminiClient();
    const wordCount = transcript.trim().split(/\s+/).length || 1;
    const minutes = durationSeconds ? durationSeconds / 60 : 0.5;
    const wordsPerMinute = Math.round(wordCount / minutes);

    const prompt = `
      És o SpeakMaster AI expert em voz e ritmo.
      Tens à tua frente a transcrição de um discurso treinado pelo utilizador sobre: "${temaPraticado}".
      Transcrição do discurso treinado: "${transcript}"

      Apresenta uma avaliação exaustiva em língua Portuguesa focando em dicção (vício de linguagem), preenchimentos verbais (como 'tipo', 'né', 'uhm', 'coiso'), estrutura, e velocidade medida de ${wordsPerMinute} palavras por minuto (WPM).
      Idealmente, a velocidade confortável e eloquente de conversação em público ronda as 120-150 WPM. Acima disso é pressa/ansiedade, abaixo pode faltar dinamismo.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Avalia com dados reais o discurso transcrito. Seja empático mas rigoroso com vícios de linguagem e ritmo.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pontuacaoGeral: { type: Type.INTEGER, description: "De 0 a 100" },
            clareza: { type: Type.INTEGER, description: "Eloquência de 0 a 100" },
            velocidade: { type: Type.INTEGER, description: "Conformidade ao ritmo ideal de 0 a 100" },
            pausas: { type: Type.INTEGER, description: "Uso estratégico do silêncio de 0 a 100" },
            confianca: { type: Type.INTEGER, description: "Autenticidade e poder verbal de 0 a 100" },
            feedbackPositivo: { type: Type.STRING, description: "Até 3 parágrafos curtos realçando o brilho" },
            pontosMelhoria: { type: Type.STRING, description: "Vícios detetados e conselhos de dicção práticos" },
            exercicioRecomendado: { type: Type.STRING, description: "Um trava-língua ou exercício de voz customizado" }
          },
          required: ["pontuacaoGeral", "clareza", "velocidade", "pausas", "confianca", "feedbackPositivo", "pontosMelhoria", "exercicioRecomendado"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Audio eval API error:", err);
    res.status(500).json({ error: err.message || "Erro ao avaliar o áudio do utilizador." });
  }
});

/**
 * Multimodal Visual Coach (Evaluate posture / confidence through Webcam Front Camera Snap)
 */
app.post("/api/gemini/evaluate-video", async (req, res) => {
  try {
    const { imageBase64, optionDescription, temaPraticado } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Fotografia/Snap da câmara em falta." });
    }

    const ai = getGeminiClient();
    const imagePart = {
      inlineData: {
        mimeType: "image/png",
        data: imageBase64.replace(/^data:image\/\w+;base64,/, "")
      }
    };

    const textPart = {
      text: `
        És um especialista de comunicação não-verbal e linguagem corporal da SpeakMaster AI.
        Analisa a linguagem visual fornecida nesta fotografia tirada pelo utilizador com a sua câmara frontal enquanto pratica.
        Tema ensaiado: "${temaPraticado || "Geral"}".
        Anotações de ambiente ou queixa: "${optionDescription || "Sem queixas específicas"}".

        Inspecciona:
        - Postura dos ombros (abertos vs. encolhidos)
        - Contacto visual com a lente/câmara (direto vs. desviado ou para baixo)
        - Uso das mãos (congelado, excessivo, tenso ou empático)
        - Expressão facial (sorriso, testa franzida, tensão maxilar, nervosismo)

        Dá um relatório amigável, instrutivo e transformador em Português.
      `
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: "Analisa a imagem e identifica as qualidades e erros comuns de expressão não-verbal de forma ultra profissional.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pontuacaoGeral: { type: Type.INTEGER, description: "Nível visual combinado de 0 a 100" },
            postura: { type: Type.INTEGER, description: "De 0 a 100" },
            contactoVisual: { type: Type.INTEGER, description: "De 0 a 100" },
            linguagemCorporal: { type: Type.INTEGER, description: "De 0 a 100" },
            feedbackPositivo: { type: Type.STRING, description: "Sinais ótimos detetados na fisionomia/olhar" },
            pontosMelhoria: { type: Type.STRING, description: "Erros de gesticulação ou rigidez a corrigir" },
            exercicioRecomendado: { type: Type.STRING, description: "Exemplo: 'Espelho 4x4', 'Relaxamento de ombros', recomendação de treino express" }
          },
          required: ["pontuacaoGeral", "postura", "contactoVisual", "linguagemCorporal", "feedbackPositivo", "pontosMelhoria", "exercicioRecomendado"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Video/Visual eval API error:", err);
    res.status(500).json({ error: err.message || "Erro ao processar as métricas visuais." });
  }
});

/**
 * Conversational Expert Speech Coach (interactive chat thread)
 */
app.post("/api/gemini/coach", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Mensagens mal-formatadas ou ausentes." });
    }

    const ai = getGeminiClient();

    const formattedContents = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: `
          És o SpeakMaster AI Virtual Coach, um mestre mentor de oratória amigável, enérgico e compreensivo.
          Fala em Língua Portuguesa. Ajuda o utilizador a combater o pânico escénico, a trepar na carreira, a gerir a respiração de forma científica e a preparar reuniões de alto impacto emocional.
          Faz perguntas de volta ocasionalmente para manter o ensaio ativo. Seja pragmático, ensina rotinas reais de postura, alongamento vocal e dicção.
        `
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Speech coach api error:", err);
    res.status(500).json({ error: err.message || "Problema de comunicação com o SpeakMaster Coach." });
  }
});

/**
 * Intelligent Speech Structure Generator
 */
app.post("/api/gemini/generate-speech", async (req, res) => {
  try {
    const { tema, publico, tempoMinutagem, areaTematica } = req.body;
    if (!tema || !publico) {
      return res.status(400).json({ error: "Tema e público são obrigatórios para elaborar o discurso." });
    }

    const ai = getGeminiClient();
    const prompt = `
      Cria um roteiro/discurso e plano de oratória profissional estruturado para apresentar.
      - Tema/Assunto: "${tema}"
      - Público Alvo: "${publico}"
      - Área/Indústria: "${areaTematica || "Geral"}"
      - Tempo de apresentação pretendido: ${tempoMinutagem} minutos

      Divide o discurso em Introdução chamativa, Desenvolvimento ordenado por ideias de força e Conclusão marcante. Adiciona ganchos de persuasão e frases marcantes em Português.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Cria guiões e discursos ricos e impactantes, sinalizando onde pausar e respirar entre colchetes.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            introducao: { type: Type.STRING, description: "Introdução com gancho inspirador" },
            desenvolvimento: { type: Type.STRING, description: "Explanação clara ideal para o tempo pretendido" },
            conclusao: { type: Type.STRING, description: "Mensagem de chamada de ação final poderosa" },
            frasesImpacto: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 slogans de retenção mental" },
            dicasOratoria: { type: Type.STRING, description: "Dicas de velocidade, entonação e gesticulação adequadas a este discurso de oratória." }
          },
          required: ["introducao", "desenvolvimento", "conclusao", "frasesImpacto", "dicasOratoria"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Speech generator API error:", err);
    res.status(500).json({ error: err.message || "Incapaz de gerar o discurso de momento." });
  }
});

/**
 * Surprise Audience Q&A Drill
 */
app.post("/api/gemini/qa-drill", async (req, res) => {
  try {
    const { tema, answer, currentQuestion } = req.body;
    const ai = getGeminiClient();

    if (currentQuestion && answer) {
      // User is submitting an answer to evaluate
      const prompt = `
        Tema do discurso do utilizador: "${tema}"
        Pergunta hostil/desafiante da plateia: "${currentQuestion}"
        Resposta do utilizador: "${answer}"

        Analise de forma amigável de 0 a 100 se o utilizador soube manter a compostura corporativa, repondeu com inteligência, foi firme de forma elegante e não tremeu perante o conflito. Devolve em Português.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Analisa a qualidade assertiva da resposta do utilizador e propõe melhores rotas de retórica.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "Nota de 0 a 100" },
              feedback: { type: Type.STRING, description: "Explica com diplomacia o que acertou e onde escorregou no conflito" },
              sugestaoReforco: { type: Type.STRING, description: "Como um orador profissional responderia na prática de forma magistral" }
            },
            required: ["score", "feedback", "sugestaoReforco"]
          }
        }
      });

      const parsedData = JSON.parse(response.text || "{}");
      return res.json({ evaluation: parsedData });
    } else {
      // Simply generate a fresh surprise target question
      const prompt = `
        Cria uma pergunta surpresa, difícil, incisiva, cética ou ligeiramente hostil sobre o tema do discurso correspondente: "${tema || "Tecnologia e Inovação"}".
        Esta pergunta representa um ouvinte cético no final de uma palestra.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Gera apenas a frase de pergunta surpresa de forma impactante do ponto de vista comunicacional.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pergunta: { type: Type.STRING, description: "A pergunta polémica ou de esclarecimento técnico complexo." }
            },
            required: ["pergunta"]
          }
        }
      });

      const parsedData = JSON.parse(response.text || "{}");
      return res.json({ question: parsedData.pergunta });
    }
  } catch (err: any) {
    console.error("Q&A drill API error:", err);
    res.status(500).json({ error: err.message || "Erro ao gerar as perguntas desafiantes de treino." });
  }
});

// --------------------------------------------------------------------
// MIDDLEWARES / VITE INTEGRATION
// --------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development server with HMR integrations dynamically loaded via Vite middlewares
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SpeakMaster AI Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
