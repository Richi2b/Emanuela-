/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Play, Square, Loader2, Sparkles, Volume2, Bookmark, Check, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import { EvaluationResult } from "../types";

interface AudioVoiceTrainerProps {
  onEvaluationCompleted: (result: EvaluationResult) => void;
  selectedTema?: string;
  onEarnPoints: (points: number) => void;
}

export function AudioVoiceTrainer({ onEvaluationCompleted, selectedTema = "Geral / Improviso", onEarnPoints }: AudioVoiceTrainerProps) {
  const [tema, setTema] = useState(selectedTema);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Fallback testing transcripts if they cannot speak
  const presetTranscripts = [
    "Olá a todos os presentes. Hoje quero falar sobre o enorme desafio que representa a oratória e a comunicação na era digital. Sentimos muitas vezes que o medo do julgamento paralisa a nossa voz, mas quando respiramos de forma consciente e compassada conseguimos expressar cada ideia com nitidez.",
    "Falar em público não é um dom de nascimento. É uma competência de treino físico, controlo cardíaco e autoverbalização positiva. Se repetirmos as palavras com clareza e fizermos as pausas adequadas, qualquer audiência irá compreender a proposta.",
    "Estimados colegas e diretores. Trago hoje uma perspetiva inovadora sobre a nossa próxima rota de expansão comercial. Analisando as métricas semanais, percebemos que o nosso principal gargalo está na gesticulação e na presença retórica perante novos investidores."
  ];

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    setTema(selectedTema);
  }, [selectedTema]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const startVoiceCapture = () => {
    setError(null);
    setTranscript("");
    setDuration(0);
    setEvaluation(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("O Reconhecimento de Voz nativo não é 100% suportado no seu navegador atual. Use o botão de simulação rápida abaixo ou escreva um rascunho de discurso para simular!");
      setIsRecording(true);
      // fallback timer simulation
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "pt-PT";

      recognition.onstart = () => {
        setIsRecording(true);
        timerRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition error", event);
        if (event.error === "not-allowed") {
          setError("Microfone bloqueado ou sem permissão. Pode usar a simulação rápida de texto ou permitir o microfone no topo do seu browser!");
        } else {
          setError(`Detetado erro no microfone: ${event.error}. Introduzimos fallback manual.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(prev => prev + " " + finalTranscript);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error(e);
      setError("Incapaz de ativar o serviço de microfone no ecrã atual.");
    }
  };

  const stopVoiceCapture = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // If they spoke nothing, put a preset transcript for interactive demo
    if (!transcript.trim()) {
      const randomPreset = presetTranscripts[Math.floor(Math.random() * presetTranscripts.length)];
      setTranscript(randomPreset);
    }
  };

  const selectQuickSimulation = (preset: string) => {
    setTranscript(preset);
    setDuration(35); // simulated duration in seconds
    setError(null);
  };

  const handleEvaluateTranscript = async () => {
    if (!transcript.trim()) {
      setError("Não há texto ou gravação de voz ativo para analisar.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/evaluate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          durationSeconds: duration > 0 ? duration : 30,
          temaPraticado: tema
        })
      });

      if (!response.ok) {
        throw new Error("Erro de processamento da API de Voz.");
      }

      const report = await response.json();
      setEvaluation(report);

      // Save evaluation to local list
      const finalResult: EvaluationResult = {
        id: "ev_" + Date.now(),
        tipo: "audio",
        data: new Date().toLocaleDateString("pt-PT"),
        temaPraticado: tema,
        pontuacaoGeral: report.pontuacaoGeral,
        detalhes: {
          clareza: report.clareza,
          velocidade: report.velocidade,
          pausas: report.pausas,
          confianca: report.confianca
        },
        transcricaoOuDescricao: transcript,
        analiseIA: {
          feedbackPositivo: report.feedbackPositivo,
          pontosMelhoria: report.pontosMelhoria,
          exercicioRecomendado: report.exercicioRecomendado
        }
      };

      onEvaluationCompleted(finalResult);
      // Reward points!
      onEarnPoints(150);
    } catch (err: any) {
      console.error(err);
      setError("Falha ao analisar a sua voz através de IA. Apresentamos um feedback de oratória simulado abaixo.");
      // Fallback local simulation results
      setTimeout(() => {
        const fallbackReport = {
          pontuacaoGeral: 78,
          clareza: 85,
          velocidade: 65,
          pausas: 70,
          confianca: 82,
          feedbackPositivo: "A sua clareza tonal é fantástica e a sua articulação vocálica é percetível. Demonstrou autoconfiança de discurso.",
          pontosMelhoria: "Falar ligeiramente mais devagar. Detetámos preenchimentos de respiração curtos. Mantenha as pausas mais sólidas.",
          exercicioRecomendado: "Pratique o trava-línguas do 'R' rápido 4 vezes seguidas."
        };
        setEvaluation(fallbackReport);

        const fallbackResult: EvaluationResult = {
          id: "ev_" + Date.now(),
          tipo: "audio",
          data: new Date().toLocaleDateString("pt-PT"),
          temaPraticado: tema,
          pontuacaoGeral: fallbackReport.pontuacaoGeral,
          detalhes: {
            clareza: fallbackReport.clareza,
            velocidade: fallbackReport.velocidade,
            pausas: fallbackReport.pausas,
            confianca: fallbackReport.confianca
          },
          transcricaoOuDescricao: transcript,
          analiseIA: {
            feedbackPositivo: fallbackReport.feedbackPositivo,
            pontosMelhoria: fallbackReport.feedbackPositivo,
            exercicioRecomendado: fallbackReport.exercicioRecomendado
          }
        };

        onEvaluationCompleted(fallbackResult);
        onEarnPoints(100);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  return (
    <div id="audio-voice-trainer" className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-white leading-relaxed">
      {/* Mic Capture Box */}
      <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-purple-400 animate-pulse" /> Treinar Ritmo e Dicção
            </h3>
            <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-medium border border-slate-700/50">
              {formatTimer(duration)}
            </span>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">Tema da Prática</label>
            <input
              type="text"
              id="audio-input-tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ex: Introdução da Minha Reunião..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div id="recording-stage" className="flex flex-col items-center justify-center bg-slate-950 border border-slate-900/80 p-8 rounded-2xl text-center relative overflow-hidden">
            {isRecording ? (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-500 transition-all shadow-lg text-white">
                    <Mic className="w-7 h-7" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-red-500 animate-pulse">Gravando som do microfone...</p>
                  <p className="text-[11px] text-slate-400">Comece a falar em voz alta sobre "{tema}"</p>
                </div>
                <button
                  id="btn-stop-voice"
                  onClick={stopVoiceCapture}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 mx-auto transition-all text-red-400"
                >
                  <Square className="w-3.5 h-3.5 fill-red-400" /> Parar Performance
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  id="btn-start-voice"
                  onClick={startVoiceCapture}
                  className="w-16 h-16 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center transition-all shadow-lg text-white"
                >
                  <Mic className="w-7 h-7" />
                </button>
                <div>
                  <p className="font-bold text-slate-100">Iniciar Captura de Voz</p>
                  <p className="text-[11px] text-slate-400">Usa os seus fones ou o microfone do portátil</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span>Transcrição no Ecrã (WPM / Velocidade baseada nisto):</span>
              {transcript && (
                <button
                  type="button"
                  onClick={() => setTranscript("")}
                  className="text-[10px] text-purple-400 hover:underline"
                >
                  Limpar rascunho
                </button>
              )}
            </div>
            <textarea
              id="audio-transcript-textarea"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Fale para transcrever em tempo real ou escreva o seu rascunho diretamente aqui para analisar..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs focus:outline-none focus:border-purple-500 min-h-[110px] text-slate-300 shadow-inner resize-none leading-relaxed"
            />
          </div>

          {error && (
            <div className="text-xs text-yellow-400 bg-yellow-950/20 border border-yellow-900/30 p-2.5 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-yellow-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Preset templates fallback */}
          <div className="space-y-2 pt-2">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Ou escolha um Rascunho Rápido para Testar Grátis:</p>
            <div className="grid grid-cols-1 gap-2">
              {presetTranscripts.map((p, index) => (
                <button
                  key={index}
                  type="button"
                  id={`btn-preset-trans-${index}`}
                  onClick={() => selectQuickSimulation(p)}
                  className="text-left text-[11px] bg-slate-950/50 hover:bg-slate-850 p-2 rounded-xl text-slate-300 truncate border border-slate-900 hover:border-slate-800 transition-colors"
                >
                  📝 {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleEvaluateTranscript}
          id="btn-evaluate-audio-coach"
          disabled={loading || !transcript.trim()}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:bg-slate-800 disabled:text-slate-500 shadow-lg shadow-purple-600/10"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" /> Processando Avaliação...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-yellow-300" /> Analisar Voz com Inteligência Artificial
            </>
          )}
        </button>
      </div>

      {/* IA Analysis Results Box */}
      <div className="lg:col-span-7 bg-slate-900/30 border border-slate-800/40 rounded-3xl p-6 flex flex-col justify-between">
        {evaluation ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <div>
                <h4 className="font-bold text-lg text-slate-100">Resultado do Coach Vocal</h4>
                <p className="text-xs text-slate-400">Análise realizada com sucesso • +150 XP arrecadado</p>
              </div>
              <div className="bg-purple-950/50 border border-purple-500/40 w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg shadow-purple-600/10">
                <span className="text-xl font-black text-purple-400 leading-none">{evaluation.pontuacaoGeral}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">SCORE</span>
              </div>
            </div>

            {/* Metrics sliders */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-900">
              {[
                { label: "Dicção/Clareza", value: evaluation.clareza || 80, color: "text-green-400", bg: "bg-green-500" },
                { label: "Ritmo (WPM)", value: evaluation.velocidade || 75, color: "text-blue-400", bg: "bg-blue-500" },
                { label: "Pausas Sólidas", value: evaluation.pausas || 70, color: "text-yellow-400", bg: "bg-yellow-500" },
                { label: "Autoconfiança", value: evaluation.confianca || 85, color: "text-purple-400", bg: "bg-purple-400" }
              ].map((m, idx) => (
                <div key={idx} className="text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">{m.label}</span>
                  <div className="text-lg font-bold text-white">{m.value}%</div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className={`${m.bg} h-full`} style={{ width: `${m.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-black uppercase text-green-400 tracking-wider flex items-center gap-1.5 mb-1">
                  🌟 Pontos Fortes Detetados
                </h5>
                <p className="text-xs text-slate-200 bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl whitespace-pre-line leading-relaxed">
                  {evaluation.feedbackPositivo}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-1.5 mb-1">
                  ⚠️ Oportunidades de Melhoria
                </h5>
                <p className="text-xs text-slate-200 bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl whitespace-pre-line leading-relaxed">
                  {evaluation.pontosMelhoria}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-1.5 mb-1">
                  🤸 Exercício Prático Recomendado
                </h5>
                <p className="text-xs font-semibold text-purple-100 bg-purple-950/10 border border-purple-500/20 p-3.5 rounded-xl italic">
                  {evaluation.exercicioRecomendado}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>O SpeakMaster reuniu os resultados no separador de <strong>Relatórios</strong> para ver a sua curva de evolução completa!</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-800/40 rounded-full flex items-center justify-center border border-slate-700/30 text-purple-400">
              <Mic className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold">Aguardando Performance Vocal</h4>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Inicie o microfone e treine por 15 segundos ou use um guião pronto. A nossa IA de Voz fornecerá gráficos e identificará tiques verbais irritantes na sua fala.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
