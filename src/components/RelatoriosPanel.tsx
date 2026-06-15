/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BarChart3, TrendingUp, HelpCircle, Sparkles, Award, ShieldAlert, CheckCircle, Volume2, ShieldCheck } from "lucide-react";
import { EvaluationResult, UserDiagnostics } from "../types";

interface RelatoriosPanelProps {
  evaluations: EvaluationResult[];
  diagnostics: UserDiagnostics | null;
}

export function RelatoriosPanel({ evaluations, diagnostics }: RelatoriosPanelProps) {
  const defaultEvaluations: EvaluationResult[] = [
    {
      id: "ev_1",
      tipo: "audio",
      data: "01/06/2026",
      temaPraticado: "Abertura de Pitch",
      pontuacaoGeral: 65,
      detalhes: { clareza: 70, velocidade: 55, pausas: 50, confianca: 60 },
      transcricaoOuDescricao: "Simulação de teste inicial",
      analiseIA: { feedbackPositivo: "", pontosMelhoria: "", exercicioRecomendado: "" }
    },
    {
      id: "ev_2",
      tipo: "video",
      data: "05/06/2026",
      temaPraticado: "Reunião Comercial",
      pontuacaoGeral: 72,
      detalhes: { postura: 65, contactoVisual: 75, linguagemCorporal: 70 },
      transcricaoOuDescricao: "Prática com webcam",
      analiseIA: { feedbackPositivo: "", pontosMelhoria: "", exercicioRecomendado: "" }
    },
    {
      id: "ev_3",
      tipo: "audio",
      data: "10/06/2026",
      temaPraticado: "Discurso Académico",
      pontuacaoGeral: 82,
      detalhes: { clareza: 85, velocidade: 78, pausas: 80, confianca: 82 },
      transcricaoOuDescricao: "Melhor controlo do ritmo",
      analiseIA: { feedbackPositivo: "", pontosMelhoria: "", exercicioRecomendado: "" }
    }
  ];

  const activeEvals = evaluations.length > 0 ? evaluations : defaultEvaluations;

  // calculate averages
  const avgScore = Math.round(
    activeEvals.reduce((acc, curr) => acc + curr.pontuacaoGeral, 0) / activeEvals.length
  );

  const totalAudio = activeEvals.filter(e => e.tipo === "audio").length;
  const totalVideo = activeEvals.filter(e => e.tipo === "video").length;

  // Custom SVG Progression Curve
  const chartWidth = 500;
  const chartHeight = 120;
  const padding = 30;

  const pointsCount = activeEvals.length;
  const svgPoints = activeEvals
    .map((e, index) => {
      const x = padding + (index / (pointsCount - 1 || 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - (e.pontuacaoGeral / 100) * (chartHeight - padding * 2);
      return { x, y, score: e.pontuacaoGeral, date: e.data };
    });

  const polylinePath = svgPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div id="relatorios-dashboard-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-white leading-relaxed">
      
      {/* Visual Analytics Progression Curve Card */}
      <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" /> Curva de Qualidade de Oratória
              </h3>
              <p className="text-xs text-slate-400">Progresso histórico e pontuações consolidadas</p>
            </div>
            <span className="text-xs bg-purple-900/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full font-bold">
              Média Geral: {avgScore}%
            </span>
          </div>

          {/* SVG Progression Line */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-950 flex flex-col justify-between select-none">
            <div className="relative w-full h-[150px] flex items-center justify-center">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                {/* Grid Lines */}
                <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#1E293B" strokeDasharray="3,3" />
                <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#1E293B" strokeDasharray="3,3" />
                <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#334155" />

                {/* Line Path */}
                {pointsCount > 1 && (
                  <polyline
                    fill="none"
                    stroke="url(#purpleGradient)"
                    strokeWidth="3.5"
                    points={polylinePath}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_2px_8px_rgba(124,58,237,0.4)]"
                  />
                )}

                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>

                {/* Nodes Dots */}
                {svgPoints.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="6.5"
                      className="fill-slate-950 stroke-purple-500 stroke-2 cursor-pointer hover:r-8 transition-all"
                    />
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      className="fill-purple-400 font-extrabold text-[10px]"
                    >
                      {p.score}%
                    </text>
                    <text
                      x={p.x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      className="fill-slate-500 font-bold text-[8px]"
                    >
                      {p.date}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold px-3 pt-2">
              <span>ESTREIA</span>
              <span>RITMO DE EVOLUÇÃO: CONSOLIDADO</span>
              <span>HOJE</span>
            </div>
          </div>
        </div>

        {/* Breakdown counters */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-950/40 text-center">
            <h5 className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Sessões</h5>
            <p className="text-xl font-black text-white mt-1">{activeEvals.length}</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-950/40 text-center">
            <h5 className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Ensaios Voz</h5>
            <p className="text-xl font-black text-purple-400 mt-1">{totalAudio}</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-950/40 text-center">
            <h5 className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Ensaios Postura</h5>
            <p className="text-xl font-black text-blue-400 mt-1">{totalVideo}</p>
          </div>
        </div>
      </div>

      {/* Weaknesses and Strengths based on Diagnostics */}
      <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" /> Balanço de Performance
          </h3>
          <p className="text-xs text-slate-400">Trabalho personalizado traçado por inteligência artificial</p>

          <div className="space-y-3">
            {diagnostics?.perfilGerado ? (
              <>
                {/* Strengths */}
                <div className="space-y-1.5">
                  <h5 className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg px-2 py-0.5 font-bold uppercase tracking-wider inline-block">
                    Pontos Fortes
                  </h5>
                  <div className="space-y-1">
                    {diagnostics.perfilGerado.pontosFortes.map((f, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-200 leading-normal">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weaknesses */}
                <div className="space-y-1.5 pt-2">
                  <h5 className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-2 py-0.5 font-bold uppercase tracking-wider inline-block">
                    A Trabalhar / Medos
                  </h5>
                  <div className="space-y-1">
                    {diagnostics.perfilGerado.pontosFracos.map((w, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-200 leading-normal">
                        <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-slate-400 text-center py-6 text-xs italic">
                Aguardando conclusão do diagnóstico inicial para carregar dados fisiológicos.
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-950/40 text-xs mt-4">
          <p className="font-bold text-yellow-400 flex items-center gap-1 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Rotina Diária de Força:
          </p>
          <p className="text-[11px] text-slate-300 italic">
            Foque-se em técnicas de alongamento vocálico nos primeiros 3 minutos de gravação para resolver o tique de mente vazia.
          </p>
        </div>
      </div>
    </div>
  );
}
