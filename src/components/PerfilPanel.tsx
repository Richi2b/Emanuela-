/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User, Award, Shield, Flame, RotateCcw, ShieldCheck, HeartPulse, Sparkles, BookOpen } from "lucide-react";
import { UserDiagnostics, GamificationState, Badge } from "../types";

interface PerfilPanelProps {
  diagnostics: UserDiagnostics | null;
  gamification: GamificationState;
  onResetDiagnostics: () => void;
}

export function PerfilPanel({ diagnostics, gamification, onResetDiagnostics }: PerfilPanelProps) {
  return (
    <div id="perfil-center-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-white leading-relaxed">
      
      {/* User info card / Diagnostic Summary */}
      <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg border-purple-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Membro SpeakMaster AI</h3>
              <p className="text-xs text-slate-400 mt-0.5">Aluno Honorário • {gamification.sequenciaDias} Dias de Rotina</p>
            </div>
          </div>

          <div className="bg-slate-950/65 p-4 rounded-2xl border border-slate-950 text-xs space-y-2">
            <h4 className="font-bold text-purple-400 text-xs uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-4 h-4 text-purple-400" /> Perfil Fisiológico & Diagnóstico
            </h4>
            {diagnostics?.perfilGerado ? (
              <div className="space-y-2 leading-relaxed text-slate-300">
                <p>
                  <strong>Nível Recomendado:</strong>{" "}
                  <span className="bg-purple-900/30 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded font-black">
                    {diagnostics.perfilGerado.nivelRecomendado}
                  </span>
                </p>
                <p className="italic text-[11px] text-slate-400">
                  {diagnostics.perfilGerado.analiseGeral}
                </p>
                
                <div className="pt-2">
                  <span className="font-bold text-slate-200">Plano de Evolução Diário:</span>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-[11px] text-slate-400">
                    {diagnostics.perfilGerado.planoAcao.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">Por favor complete o questionário de diagnóstico para mapear os seus medos orais.</p>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => {
              if (window.confirm("Pretende realmente apagar o seu histórico de diagnóstico e recomeçar do zero?")) {
                onResetDiagnostics();
              }
            }}
            id="btn-re-diagnostico"
            className="w-full bg-slate-950/50 hover:bg-slate-850 text-xs border border-slate-800 text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:border-red-900/30"
          >
            <RotateCcw className="w-4 h-4 text-red-400" /> Reiniciar Diagnóstico de Medos
          </button>
        </div>
      </div>

      {/* Gamified Achievements medals box */}
      <div className="lg:col-span-7 bg-slate-900/30 border border-slate-800/40 rounded-3xl p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400 animate-pulse" /> Suas Medalhas de Orador
              </h3>
              <p className="text-xs text-slate-400">Conquistas desbloqueadas durante treinos de postura e voz</p>
            </div>
            <div className="bg-yellow-950/20 border border-yellow-800/30 px-3 py-1.5 rounded-full text-xs font-bold text-yellow-400 flex items-center gap-1 shadow">
              🚀 {gamification.pontos} XP Acumulado
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {gamification.badges.map((b) => (
              <div
                key={b.id}
                id={`badge-card-${b.id}`}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 relative ${
                  b.desbloqueado
                    ? "bg-purple-950/15 border-purple-500/20 shadow-md shadow-purple-600/5 rotate-0"
                    : "bg-slate-950/40 border-slate-900 opacity-45 grayscale scale-95"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner flex-shrink-0 ${
                    b.desbloqueado ? "bg-purple-600/20 text-purple-400" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {b.icone === "Trophy" ? "🏆" : b.icone === "Sparkles" ? "✨" : b.icone === "Flame" ? "🔥" : "🎓"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold truncate text-slate-100">{b.nome}</h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{b.descricao}</p>
                  {b.desbloqueado && (
                    <span className="text-[8px] bg-green-500/10 text-green-400 px-1.5 py-0.2 rounded-md font-bold inline-block mt-1">
                      Desbloqueado em {b.dataConquista || "Hoje"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950/60 p-4 border border-slate-900/60 rounded-2xl text-xs space-y-1.5 mt-4">
          <h5 className="font-bold text-purple-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" /> A importância do Treino Diário
          </h5>
          <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
            Cada ensaio de áudio ou simulação de ambiente rende de 100 a 200 pontos de experiência XP. Mantenha a sua sequência ativa para evoluir o seu nível de <strong>{diagnostics?.perfilGerado?.nivelRecomendado || "Iniciante"}</strong> para <strong>Especialista</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
