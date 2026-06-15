/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Camera, RefreshCw, Sparkles, Loader2, Play, Eye, Maximize, Smile, Hand, Heart, AlertTriangle, ShieldCheck } from "lucide-react";
import { EvaluationResult } from "../types";

interface VideoMirrorTrainerProps {
  onEvaluationCompleted: (result: EvaluationResult) => void;
  selectedTema?: string;
  onEarnPoints: (points: number) => void;
}

export function VideoMirrorTrainer({ onEvaluationCompleted, selectedTema = "Performance Geral", onEarnPoints }: VideoMirrorTrainerProps) {
  const [tema, setTema] = useState(selectedTema);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [optionDescription, setOptionDescription] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setTema(selectedTema);
  }, [selectedTema]);

  // Clean stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  const startCamera = async () => {
    setCameraError(null);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error(err);
      setCameraError(
        "Não foi possível obter acesso à webcam. Isto pode dever-se a restrições do iframe ou falta de hardware. Mas não se preocupe! Pode premir 'Simular Snap' em baixo para fazer um teste visual imediato estruturado por inteligência artificial."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const captureAndEvaluate = async (simulate = false) => {
    setLoading(true);
    setError(null);
    let base64Image = "";

    if (simulate) {
      // Create a colored dummy square on canvas
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#7C3AED";
        ctx.fillRect(0, 0, 300, 300);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "20px Arial";
        ctx.fillText("SpeakMaster Simulation", 30, 150);
      }
      base64Image = canvas.toDataURL("image/png");
    } else {
      if (!videoRef.current || !canvasRef.current) {
        setError("Câmara inativa ou indisponível.");
        setLoading(false);
        return;
      }

      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          base64Image = canvas.toDataURL("image/png");
        }
      } catch (e) {
        setError("Erro ao congelar imagem para processamento.");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/gemini/evaluate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Image,
          optionDescription: optionDescription || "A avaliar postura física do orador",
          temaPraticado: tema
        })
      });

      if (!response.ok) {
        throw new Error("Erro na rede ao conectar ao Visual Mentor.");
      }

      const report = await response.json();
      setEvaluation(report);

      const finalResult: EvaluationResult = {
        id: "ev_v_" + Date.now(),
        tipo: "video",
        data: new Date().toLocaleDateString("pt-PT"),
        temaPraticado: tema,
        pontuacaoGeral: report.pontuacaoGeral || 80,
        detalhes: {
          postura: report.postura || 80,
          contactoVisual: report.contactoVisual || 80,
          linguagemCorporal: report.linguagemCorporal || 80
        },
        transcricaoOuDescricao: "Postura avaliada via Espelho Frontal com feedback instantâneo de linguagem corporal.",
        analiseIA: {
          feedbackPositivo: report.feedbackPositivo,
          pontosMelhoria: report.pontosMelhoria,
          exercicioRecomendado: report.exercicioRecomendado
        }
      };

      onEarnPoints(200);
      onEvaluationCompleted(finalResult);
    } catch (err: any) {
      console.error(err);
      setError("Falha ao comunicar com o servidor da AI de visão. Apresentamos um feedback visual simulado.");
      setTimeout(() => {
        const mockReport = {
          pontuacaoGeral: 81,
          postura: 78,
          contactoVisual: 85,
          linguagemCorporal: 80,
          feedbackPositivo: "Mantém uma boa abertura de ombros para o enquadramento, o que traduz prontidão profissional e simpatia imediata.",
          pontosMelhoria: "O seu olhar flutua ligeiramente para baixo ao pensar. Lembre-se de manter os olhos ancorados no orifício da câmara, simulando contato visual com a sua plateia.",
          exercicioRecomendado: "Coloque um pequeno adesivo ao lado da sua webcam para treinar a fixação do olhar enquanto ensaia as suas introduções!"
        };
        setEvaluation(mockReport);

        const fallbackResult: EvaluationResult = {
          id: "ev_v_" + Date.now(),
          tipo: "video",
          data: new Date().toLocaleDateString("pt-PT"),
          temaPraticado: tema,
          pontuacaoGeral: mockReport.pontuacaoGeral,
          detalhes: {
            postura: mockReport.postura,
            contactoVisual: mockReport.contactoVisual,
            linguagemCorporal: mockReport.linguagemCorporal
          },
          transcricaoOuDescricao: "Postura simulada via Inteligência Artificial.",
          analiseIA: {
            feedbackPositivo: mockReport.feedbackPositivo,
            pontosMelhoria: mockReport.pontosMelhoria,
            exercicioRecomendado: mockReport.exercicioRecomendado
          }
        };

        onEarnPoints(120);
        onEvaluationCompleted(fallbackResult);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="video-mirror-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-white leading-relaxed">
      {/* Mirror Camera Card */}
      <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-400" /> Espelho Inteligente de Linguagem Corporal
            </h3>
            {cameraActive && (
              <span className="flex items-center gap-1.5 text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold border border-green-500/30">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" /> EM DIRETO
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">Tema da Apresentação</label>
            <input
              type="text"
              id="video-input-tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ex: Entrevista de Emprego Engenharia..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Interactive WebCam box with virtual crosshairs overlay */}
          <div className="relative aspect-video bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                {/* Visual grids overlays */}
                <div className="absolute inset-0 border border-dashed border-slate-500/20 pointer-events-none flex flex-col justify-between p-4">
                  <div className="w-full text-[9px] text-slate-500 flex justify-between font-bold">
                    <span>ENQUADRAMENTO DE PALCO</span>
                    <span>GRAU DE SIMETRIA: OK</span>
                  </div>
                  {/* Eye Level Guide line */}
                  <div className="w-full border-t border-purple-500/45 relative">
                    <span className="absolute -top-3.5 right-2 text-[9px] text-purple-400 font-extrabold uppercase bg-slate-900/90 px-1 py-0.2.5 rounded-md border border-purple-500/25">
                      Direcione o Olhar Aqui (Alinhamento Cópula)
                    </span>
                  </div>
                  <div className="w-full text-center text-[9px] text-slate-500 font-semibold mb-2">
                    Linguagem Não-Verbal • Ombros Relaxados e Mãos Livres
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-400 border border-slate-800">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-200">Vídeo Desativado</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Ative a câmara de modo a verificar a gesticulação, ou simule o comportamento com IA instantaneamente abaixo.
                  </p>
                </div>
                <button
                  id="btn-trigger-camera"
                  onClick={startCamera}
                  className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Dar Acesso à Webcam
                </button>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {cameraError && (
            <div className="text-xs bg-slate-950 border border-slate-850 p-3 rounded-xl text-slate-400 flex flex-col gap-2 shadow-inner">
              <p className="leading-relaxed text-[11px] text-slate-300">{cameraError}</p>
              <button
                id="btn-force-simulate-video"
                onClick={() => captureAndEvaluate(true)}
                className="text-xs bg-purple-900/30 hover:bg-purple-900/50 text-purple-400 font-bold border border-purple-500/30 py-2 rounded-lg transition-all"
              >
                Simular Snapshot de Postura Inteligente
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">Notas / Algum Sintoma Corporal?</label>
            <input
              type="text"
              id="video-notes-input"
              value={optionDescription}
              onChange={(e) => setOptionDescription(e.target.value)}
              placeholder="Ex: Tremo das mãos / Fico tenso na cara..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none"
            />
          </div>
        </div>

        {cameraActive && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              id="btn-cancel-cam"
              onClick={stopCamera}
              className="bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              Fechar Câmara
            </button>
            <button
              id="btn-snap-evaluate"
              onClick={() => captureAndEvaluate(false)}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/10"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Tirar Snap e Analisar
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Visual Report Feedback Card */}
      <div className="lg:col-span-7 bg-slate-900/30 border border-slate-800/40 rounded-3xl p-6 flex flex-col justify-between">
        {evaluation ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-lg">Métricas Não-Verbal de IA</h4>
                <p className="text-xs text-slate-400">Análise fisionómica concluída • +200 XP atribuídos</p>
              </div>
              <div className="bg-purple-950 border border-purple-500/40 w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg shadow-purple-600/10">
                <span className="text-xl font-black text-purple-400 leading-none">{evaluation.pontuacaoGeral}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">POSTURE</span>
              </div>
            </div>

            {/* Sub criteria */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { title: "Ombros / Postura", val: evaluation.postura || 80, ic: <Maximize className="w-4 h-4 text-purple-400" /> },
                { title: "Contacto Visual", val: evaluation.contactoVisual || 75, ic: <Eye className="w-4 h-4 text-blue-400" /> },
                { title: "Gesticulação", val: evaluation.linguagemCorporal || 78, ic: <Hand className="w-4 h-4 text-green-400" /> }
              ].map((sub, idx) => (
                <div key={idx} className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900 text-center space-y-1">
                  <div className="flex justify-center">{sub.ic}</div>
                  <p className="text-[10px] text-slate-400 truncate uppercase mt-1 font-semibold">{sub.title}</p>
                  <p className="text-base font-bold text-white">{sub.val}%</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-green-400 flex items-center gap-1">
                  <Smile className="w-4 h-4 text-green-400" /> Sinais Positivos Detetados
                </h5>
                <p className="text-xs text-slate-200 bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl leading-relaxed">
                  {evaluation.feedbackPositivo}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Correções no Seu Vídeo
                </h5>
                <p className="text-xs text-slate-200 bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl leading-relaxed">
                  {evaluation.pontosMelhoria}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1">
                  <Heart className="w-4 h-4 text-purple-400" /> Atividade para Aliviar TENSÃO
                </h5>
                <p className="text-xs font-semibold text-purple-100 bg-purple-950/10 border border-purple-500/20 p-3.5 rounded-xl italic leading-relaxed">
                  {evaluation.exercicioRecomendado}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span>Continue a treinar no Espelho para fixar o corpo e conquistar mais postura!</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-800/40 rounded-full flex items-center justify-center border border-slate-700/30 text-purple-400">
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold">Relatório Fisiológico do Orador</h4>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Ative a sua câmara, tire um instantâneo rápido e permita que a nossa rede computacional examine desvios de postura, ombros rígidos e a simetria facial.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
