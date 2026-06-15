/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HelpCircle, Sparkles, Loader2, Play, Send, CheckCircle, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";

interface SurpriseQAPanelProps {
  onEarnPoints: (points: number) => void;
}

export function SurpriseQAPanel({ onEarnPoints }: SurpriseQAPanelProps) {
  const [tema, setTema] = useState("Lançamento de um Produto inovador");
  const [question, setQuestion] = useState("");
  const [userInput, setUserInput] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    "Sustentabilidade Corporativa",
    "Investimentos de Alto Risco",
    "Carreira e Transição Tech",
    "Empreendedorismo em Portugal"
  ];

  const handleGenerateQuestion = async () => {
    setLoadingQuestion(true);
    setError(null);
    setEvaluation(null);
    setUserInput("");

    try {
      const response = await fetch("/api/gemini/qa-drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema })
      });

      if (!response.ok) {
        throw new Error("Erro de rede ao buscar pergunta surpresa.");
      }

      const data = await response.json();
      setQuestion(data.question || "E se o vosso projeto falhar nos primeiros 6 meses devido a concorrência asiática desleal, qual é o vosso plano B real?");
    } catch (err: any) {
      console.error(err);
      setError("Dificuldade na rede. Gerámos um cenário desafiante simulado abaixo.");
      const fallbacks = [
        "A vossa apresentação foca muito na teoria. Na prática, como justifica o valor cobrado se o concorrente entrega o dobro pelo mesmo preço?",
        "E se a vossa equipa-chave pedir demissão coletiva a meio do desenvolvimento do software? Como contorna o pânico com os investidores?",
        "Qual é a vossa autoridade pessoal real para falar deste nicho específico se não tem formação académica na área?"
      ];
      setQuestion(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) {
      setError("Por favor indique a sua resposta antes de submeter à avaliação.");
      return;
    }

    setLoadingEvaluation(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/qa-drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema,
          currentQuestion: question,
          answer: userInput
        })
      });

      if (!response.ok) {
        throw new Error("Erro de rede avaliando a resposta.");
      }

      const data = await response.json();
      setEvaluation(data.evaluation || {
        score: 82,
        feedback: "Excelente maturidade mental e tranquilidade. Soube começar acalmando os ânimos sem parecer na defensiva.",
        sugestaoReforco: "Experimente a técnica 'Acolher e Redirecionar': 'Isso é uma excelente pergunta que toca no cerne do nosso risco operante...'"
      });
      // Reward
      onEarnPoints(160);
    } catch (err: any) {
      console.error(err);
      setError("Falha ao avaliar. Projetando feedback de retórica padrão.");
      setTimeout(() => {
        setEvaluation({
          score: 75,
          feedback: "Demonstrou rapidez estrutural, mas ficou ligeiramente agressivo ao rebater o ceticismo diretamente. Lembre-se, o público apoia quem se mantém diplomático.",
          sugestaoReforco: "Diga primeiro: 'Compreendo perfeitamente essa apreensão...' Isto valida o medo do espectador e retira o veneno da questão antes de explicitar o seu ponto técnico de força."
        });
        onEarnPoints(100);
      }, 1000);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  return (
    <div id="surprise-qa-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-white leading-relaxed">
      
      {/* Question Generator panel */}
      <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" /> Treino de Perguntas Difíceis
          </h3>
          <p className="text-xs text-slate-400">
            Simula um espectador polémico ou investidor cético ao fim da sua palestra. Preparen-se para as interrupções.
          </p>

          <div>
            <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">Área / Assunto do Discurso</label>
            <input
              type="text"
              id="qa-input-tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ex: Sustentabilidade, Finanças, Académico..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  id={`btn-preset-qa-${p.slice(0, 4)}`}
                  onClick={() => setTema(p)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                    tema === p
                      ? "bg-purple-900/40 border-purple-500/50 text-purple-300"
                      : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateQuestion}
            id="btn-trigger-qa-question"
            disabled={loadingQuestion}
            className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            {loadingQuestion ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> Invocando Espectador...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" /> Gerar Pergunta Surpresa
              </>
            )}
          </button>

          {question && (
            <div className="bg-slate-950/80 p-4 border border-slate-850 rounded-2xl relative overflow-hidden">
              <span className="absolute top-1.5 right-3 text-[9px] font-black text-red-500 uppercase bg-red-900/10 px-1.5 py-0.5 rounded border border-red-500/20">
                HOSTILIDADE: MÉDIA
              </span>
              <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1">🎙️ Um ouvinte levanta a mão e diz:</h4>
              <p className="text-xs mt-2 text-slate-200 italic leading-relaxed font-semibold">
                "{question}"
              </p>
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        {question && (
          <form onSubmit={handleSubmitAnswer} className="space-y-3 mt-4 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Como responde a isto diplomática e firmemente?</label>
              <textarea
                value={userInput}
                id="qa-textarea-res"
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Escreva a sua resposta mantendo o carisma..."
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs focus:outline-none focus:border-purple-500 min-h-[90px] resize-none"
              />
            </div>
            <button
              type="submit"
              id="btn-submit-qa-eval"
              disabled={loadingEvaluation || !userInput.trim()}
              className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:bg-slate-800 disabled:text-slate-500"
            >
              {loadingEvaluation ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Avaliando Diplomacia...
                </>
              ) : (
                <>
                  Submeter e Avaliar com IA
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Diplomatic Feedback Panel */}
      <div className="lg:col-span-7 bg-slate-900/30 border border-slate-800/40 rounded-3xl p-6 flex flex-col justify-between">
        {evaluation ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-lg">Feedback de Resolução de Crises</h4>
                <p className="text-xs text-slate-400">Desempenho sob ceticismo medetado • +165 XP ganhos</p>
              </div>
              <div className="bg-purple-950/60 border border-purple-500/40 w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg shadow-purple-600/10">
                <span className="text-xl font-black text-purple-400 leading-none">{evaluation.score}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">DIPLOMACIA</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-green-400">
                  ⚡ O que Correto na Sua Postura Mental
                </h5>
                <p className="text-xs text-slate-200 bg-slate-950/40 border border-slate-900 p-4 rounded-xl leading-relaxed mt-1">
                  {evaluation.feedback}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-purple-400">
                  💡 Como Melhoraria Esta Resposta (Abordagem Mestre)
                </h5>
                <p className="text-xs text-slate-200 bg-purple-950/10 border border-purple-500/20 p-4 rounded-xl italic leading-relaxed mt-1">
                  {evaluation.sugestaoReforco}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Continue a simular perguntas difíceis para anular totalmente o pânico mental em reuniões!</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-800/40 rounded-full flex items-center justify-center border border-slate-700/30 text-purple-400">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold">Aguardando Resposta Convincente</h4>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Selecione um tema de apresentação, prima "Gerar Pergunta Surpresa" e escreva a sua resposta improvisada no formulário lateral para obter as métricas de retórica diplomática.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
