/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Diagnostico } from "./components/Diagnostico";
import { SpeechGeneratorPanel } from "./components/SpeechGeneratorPanel";
import { AudioVoiceTrainer } from "./components/AudioVoiceTrainer";
import { VideoMirrorTrainer } from "./components/VideoMirrorTrainer";
import { DailyExercisesPanel } from "./components/DailyExercisesPanel";
import { SurpriseQAPanel } from "./components/SurpriseQAPanel";
import { VirtualCoachChat } from "./components/VirtualCoachChat";
import { RelatoriosPanel } from "./components/RelatoriosPanel";
import { PerfilPanel } from "./components/PerfilPanel";

import {
  DifficultyLevel,
  UserDiagnostics,
  SpeechProject,
  EvaluationResult,
  Badge,
  GamificationState
} from "./types";

import {
  Sparkles,
  Award,
  Users,
  Mic,
  Video,
  BarChart3,
  User,
  Flame,
  PlusCircle,
  HelpCircle,
  MessageSquare,
  Wand2,
  ChevronRight,
  BookOpen
} from "lucide-react";

export default function App() {
  // ---- STATE DEFINITIONS ----
  const [selectedTab, setSelectedTab] = useState<string>("inicio");
  const [selectedSpeechTema, setSelectedSpeechTema] = useState<string>("Performance Geral");
  
  // Subtab selected inside components
  const [treinarSubTab, setTreinarSubTab] = useState<"coach" | "generator">("coach");
  const [simularSubTab, setSimularSubTab] = useState<"voice" | "video" | "qa">("voice");

  const [diagnostics, setDiagnostics] = useState<UserDiagnostics | null>(null);
  const [speechProjects, setSpeechProjects] = useState<SpeechProject[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [gamification, setGamification] = useState<GamificationState>({
    pontos: 0,
    nivel: 1,
    sequenciaDias: 12, // Preset start streak for bento theme look
    ultimaAtividade: "",
    badges: []
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // ---- INITIAL MEDALS SEEDING ----
  const defaultMedals: Badge[] = [
    { id: "b1", nome: "Primeiro Passo 🚀", descricao: "Diagnóstico inicial de oratória completo.", icone: "Trophy", desbloqueado: true, dataConquista: "12/06/2026" },
    { id: "b2", nome: "Derrubando Medos 🛡️", descricao: "Primeira simulação de postura com IA concluída.", icone: "Sparkles", desbloqueado: false },
    { id: "b3", nome: "Roteirista Veloz ✍️", descricao: "Guião estruturado construído via Mentor IA.", icone: "BookOpen", desbloqueado: false },
    { id: "b4", nome: "Chama Ativa 🔥", descricao: "Mantenha a sua sequência de treinos ativa.", icone: "Flame", desbloqueado: false }
  ];

  // ---- PERSISTENCE LOADER ----
  useEffect(() => {
    // Load local storage
    try {
      const savedDiag = localStorage.getItem("speakmaster_diag");
      const savedSpeeches = localStorage.getItem("speakmaster_speeches");
      const savedEvals = localStorage.getItem("speakmaster_evals");
      const savedGami = localStorage.getItem("speakmaster_gami");

      if (savedDiag) setDiagnostics(JSON.parse(savedDiag));
      if (savedSpeeches) setSpeechProjects(JSON.parse(savedSpeeches));
      if (savedEvals) setEvaluations(JSON.parse(savedEvals));

      if (savedGami) {
        setGamification(JSON.parse(savedGami));
      } else {
        setGamification({
          pontos: 150, // default diagnostic reward point
          nivel: 1,
          sequenciaDias: 12,
          ultimaAtividade: new Date().toISOString().split("T")[0],
          badges: defaultMedals
        });
      }
    } catch (e) {
      console.error("Local persistence load error", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // ---- PERSISTENCE SAVER ----
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem("speakmaster_diag", JSON.stringify(diagnostics));
  }, [diagnostics, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem("speakmaster_speeches", JSON.stringify(speechProjects));
  }, [speechProjects, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem("speakmaster_evals", JSON.stringify(evaluations));
  }, [evaluations, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem("speakmaster_gami", JSON.stringify(gamification));
  }, [gamification, isInitialized]);

  // ---- GAME ACTIONS ----
  const handleEarnPoints = (xpAmount: number) => {
    setGamification((curr) => {
      const nextPoints = curr.pontos + xpAmount;
      // Calculate levels
      const nextNivel = Math.floor(nextPoints / 500) + 1;

      // Unlock medals based on thresholds
      const nextBadges = curr.badges.map((b) => {
        if (b.id === "b2" && !b.desbloqueado && nextPoints >= 300) {
          return { ...b, desbloqueado: true, dataConquista: new Date().toLocaleDateString("pt-PT") };
        }
        if (b.id === "b3" && !b.desbloqueado && speechProjects.length > 0) {
          return { ...b, desbloqueado: true, dataConquista: new Date().toLocaleDateString("pt-PT") };
        }
        if (b.id === "b4" && !b.desbloqueado && nextPoints >= 600) {
          return { ...b, desbloqueado: true, dataConquista: new Date().toLocaleDateString("pt-PT") };
        }
        return b;
      });

      return {
        ...curr,
        pontos: nextPoints,
        nivel: nextNivel,
        badges: nextBadges
      };
    });
  };

  const handleDiagnosticComplete = (diagData: UserDiagnostics) => {
    setDiagnostics(diagData);
    setSelectedTab("inicio");
    handleEarnPoints(150); // reward onboarding
  };

  const handleSpeechGenerated = (project: SpeechProject) => {
    setSpeechProjects((prev) => [project, ...prev]);
    setSelectedSpeechTema(project.tema);
    handleEarnPoints(120); // reward speech guião
  };

  const handleEvaluationCompleted = (result: EvaluationResult) => {
    setEvaluations((prev) => [result, ...prev]);
  };

  const handleResetDiagnostics = () => {
    setDiagnostics(null);
    setSpeechProjects([]);
    setEvaluations([]);
    setGamification({
      pontos: 0,
      nivel: 1,
      sequenciaDias: 0,
      ultimaAtividade: "",
      badges: defaultMedals
    });
  };

  // Helper calculation for progress bar
  const xpInCurrentLevel = gamification.pontos % 500;
  const progressPercent = Math.min((xpInCurrentLevel / 500) * 100, 100);

  // ---- ONBOARDING INTERCEPT ----
  if (isInitialized && (!diagnostics || !diagnostics.completed)) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans flex flex-col justify-center items-center px-4 py-12 select-none">
        
        {/* Welcome branding banner */}
        <div className="text-center mb-8 space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-purple-950/40 border border-purple-500/20 px-3.5 py-1.5 rounded-full text-purple-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: "3s" }} /> Apresentamos o SpeakMaster AI
          </div>
          <h1 id="welcome-coach-header" className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Fale com confiança.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              Inspire pessoas.
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Elimine o medo de falar diante de audiências com o seu novo treinador pessoal de comunicação e retórica.
          </p>
        </div>

        {/* Diagnostics Form */}
        <Diagnostico onComplete={handleDiagnosticComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. TOP HEADER BRANDING RAIL */}
      <nav id="app-nav-bar" className="h-20 border-b border-slate-800/80 flex items-center justify-between px-6 md:px-10 bg-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#7C3AED] to-[#5B21B6] rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
            SpeakMaster <span className="text-[#7C3AED] font-extrabold text-sm uppercase bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-2 py-0.5 rounded-lg">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-full border border-slate-800 shadow-inner">
            <span className="text-orange-400 animate-bounce">🔥</span>
            <span className="text-xs md:text-sm font-extrabold text-slate-200">{gamification.sequenciaDias} Dias Seguidos</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border-2 border-[#7C3AED] overflow-hidden flex items-center justify-center font-bold shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </nav>

      {/* 2. DYNAMIC CONTENT GRID / BENTO SYSTEM DECK */}
      <main id="main-scaffold" className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {selectedTab === "inicio" && (
          <div className="space-y-6">
            
            {/* Row 1: Banner Card & Side Current Level Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Massive Bento Header Hero */}
              <div className="lg:col-span-8 bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-purple-600/10">
                <div className="relative z-10 max-w-lg mb-8">
                  <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-semibold uppercase text-purple-100 mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> Olá, comunicador de elite!
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black leading-tight text-white tracking-tight">
                    Fale com confiança.<br />Inspire pessoas.
                  </h1>
                  <p className="text-purple-100 text-sm md:text-base mt-2 opacity-90 leading-relaxed font-semibold">
                    Seu próximo guião de liderança começa hoje. Pratique de forma simulada e prepare as suas reuniões para anular a ansiedade mental.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 relative z-10">
                  <button
                    onClick={() => {
                      setSelectedTab("treinar");
                      setTreinarSubTab("generator");
                    }}
                    id="hero-btn-discurso"
                    className="bg-white text-[#7C3AED] px-6 py-3.5 rounded-2xl font-black text-xs md:text-sm shadow-xl shadow-black/15 hover:bg-slate-50 transition-all flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    <Wand2 className="w-4 h-4" /> Construir Roteiro IA
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTab("simulacoes");
                      setSimularSubTab("voice");
                    }}
                    id="hero-btn-praticar"
                    className="bg-[#ffffff20] backdrop-blur-md text-white border border-white/25 px-6 py-3.5 rounded-2xl font-black text-xs md:text-sm hover:bg-white/10 transition-all flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    <Mic className="w-4 h-4" /> Ensaiar Voz Grátis
                  </button>
                </div>

                <div className="absolute -right-14 -bottom-14 opacity-15 pointer-events-none select-none">
                  <svg className="w-80 h-80" fill="currentColor" viewBox="0 0 200 200">
                    <path d="M44.7,-76.4C58.2,-69.3,70,-58.5,78.3,-45.4C86.7,-32.3,91.6,-16.8,90.4,-1.7C89.3,13.4,82.1,28.1,72.6,41C63.2,53.8,51.6,64.8,38.1,72.1C24.7,79.4,9.4,83,-6.2,81.4C-21.8,79.8,-37.7,73,-51.2,63.1C-64.8,53.2,-76,40.1,-82.1,25C-88.2,9.9,-89.2,-7.3,-84.6,-23.4C-80,-39.5,-69.8,-54.4,-56.3,-61.5C-42.8,-68.6,-26,-67.9,-10.8,-74.3C4.4,-80.7,19.3,-94.1,34.2,-92.4C49.1,-90.7,64,-73.9,44.7,-76.4Z" transform="translate(100 100)" />
                  </svg>
                </div>
              </div>

              {/* Tier / Level Bento Card */}
              <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
                <div>
                  <h4 className="text-slate-400 uppercase text-[10px] font-black tracking-widest mb-1">Nível de Orador</h4>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl md:text-3xl font-black text-white">
                      {diagnostics?.perfilGerado?.nivelRecomendado || "Intermédio"}
                    </span>
                    <span className="text-[#7C3AED] text-xs font-bold mb-1">Passo {gamification.nivel}</span>
                  </div>
                </div>

                <div className="space-y-1.5 py-4">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>XP Acumulado</span>
                    <span>{gamification.pontos} / {gamification.nivel * 500} XP</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-550 h-full rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-400 italic">
                  Faltam apenas {500 - xpInCurrentLevel} XP para libertar medalhas e avançar de categoria!
                </p>
              </div>

            </div>

            {/* Row 2: Sub modules (Surprise scenarios, daily missions, stats) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
              
              {/* Stats bento cell */}
              <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
                <h4 className="text-slate-400 uppercase text-[10px] font-black tracking-widest mb-4">Últimas Estatísticas de Voz</h4>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900 text-center shadow-inner">
                    <p className="text-2xl font-black text-green-400">82%</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Confiança</p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900 text-center shadow-inner">
                    <p className="text-2xl font-black text-blue-400">128</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">WPM (Ritmo)</p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900 text-center shadow-inner">
                    <p className="text-2xl font-black text-purple-400">94%</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Dicção</p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900 text-center shadow-inner">
                    <p className="text-2xl font-black text-yellow-500">4.2</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Pausas/Min</p>
                  </div>
                </div>
              </div>

              {/* Daily Checklist Bento Cell */}
              <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-slate-100 font-bold text-sm tracking-tight">Treinos Rápidos do Dia</h4>
                  <span className="text-[#7C3AED] text-xs font-bold leading-none bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded-md">2 / 3 Feito</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-900">
                    <div className="w-6 h-6 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">✓</div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs">Exercício de Respiração</p>
                      <p className="text-[9px] text-slate-500">Completado por Sopro Quadrado</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-900">
                    <div className="w-6 h-6 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">✓</div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs">Leitura em Voz Alta (Trava-línguas)</p>
                      <p className="text-[9px] text-slate-500">Músculos e dicção aquecidos</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTab("simulacoes");
                      setSimularSubTab("qa");
                    }}
                    className="w-full flex items-center gap-3 bg-[#7C3AED]/10 p-2.5 rounded-2xl border border-[#7C3AED]/30 text-left transition-all hover:bg-[#7C3AED]/15 group"
                  >
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:scale-105 transition-all">3</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-purple-200">Simulador de Resposta Difícil</p>
                      <p className="text-[9px] text-purple-400 font-bold">Pendente +160 XP</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400 ml-auto" />
                  </button>
                </div>
              </div>

              {/* Instant Simulated Environments selection list */}
              <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
                <h4 className="text-slate-100 font-bold text-sm tracking-tight mb-4">Simulador de Palcos Virtuais</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { e: "🏫", label: "Sala de Aula", val: "Apresentar TCC Universitário" },
                    { e: "💼", label: "Entrevista", val: "Entrevista de Emprego Liderança" },
                    { e: "🎤", label: "Conferência", val: "Discurso Corporativo para Auditório" },
                    { e: "💻", label: "Pitch Online", val: "Apresentação Comprimida de Vendas" }
                  ].map((room) => (
                    <button
                      key={room.label}
                      id={`btn-room-direct-${room.label.slice(0, 4)}`}
                      onClick={() => {
                        setSelectedSpeechTema(room.val);
                        setSelectedTab("simulacoes");
                        setSimularSubTab("video");
                      }}
                      className="group relative h-20 bg-slate-950/80 border border-slate-900 hover:border-purple-500/30 rounded-2xl overflow-hidden transition-all text-center flex flex-col items-center justify-center p-2.5"
                    >
                      <span className="text-xl mb-0.5 group-hover:scale-110 transition-transform">{room.e}</span>
                      <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-purple-300 transition-colors">
                        {room.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Quick daily routine exercises panel */}
            <div className="bg-slate-900/30 border border-slate-800/40 rounded-3xl p-6">
              <h4 className="font-bold text-sm text-slate-300 mb-4 inline-flex items-center gap-1.5">
                🏋️ Rotina de Emergência Rápida (Aquecimento Prévio)
              </h4>
              <DailyExercisesPanel onEarnPoints={handleEarnPoints} />
            </div>

          </div>
        )}

        {/* 2. TAB: TREINAR (Coach / Speech Script generator) */}
        {selectedTab === "treinar" && (
          <div className="space-y-6">
            <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-850 w-max">
              <button
                id="tab-btn-treinar-coach"
                onClick={() => setTreinarSubTab("coach")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  treinarSubTab === "coach"
                    ? "bg-purple-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                💬 Coach Inteligente Rápido
              </button>
              <button
                id="tab-btn-treinar-generator"
                onClick={() => setTreinarSubTab("generator")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  treinarSubTab === "generator"
                    ? "bg-purple-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ✍️ Estruturador de Discursos IA
              </button>
            </div>

            {treinarSubTab === "coach" ? (
              <VirtualCoachChat />
            ) : (
              <SpeechGeneratorPanel
                onSpeechGenerated={handleSpeechGenerated}
                projects={speechProjects}
              />
            )}
          </div>
        )}

        {/* 3. TAB: SIMULAÇÕES (Audio recording / Mirror webcam / QA Surpresas) */}
        {selectedTab === "simulacoes" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-850 w-max">
              <button
                id="tab-btn-sim-voice"
                onClick={() => setSimularSubTab("voice")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  simularSubTab === "voice"
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                🎤 Avaliação de Voz (Rádio & Dicção)
              </button>
              <button
                id="tab-btn-sim-video"
                onClick={() => setSimularSubTab("video")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  simularSubTab === "video"
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                📹 Espelho e Linguagem Corporal (Fisiologia e Olhar)
              </button>
              <button
                id="tab-btn-sim-qa"
                onClick={() => setSimularSubTab("qa")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  simularSubTab === "qa"
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ❓ Hostilidade & Perguntas Inesperadas (Q&A)
              </button>
            </div>

            <div className="bg-slate-950/20 p-4 border border-slate-850 rounded-2xl flex items-center gap-2 text-xs font-semibold text-slate-300">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Tema de Ensaio Ativo: <u>({selectedSpeechTema})</u>. Pode escolher ou simular temas a qualquer momento.</span>
            </div>

            {simularSubTab === "voice" && (
              <AudioVoiceTrainer
                onEvaluationCompleted={handleEvaluationCompleted}
                onEarnPoints={handleEarnPoints}
                selectedTema={selectedSpeechTema}
              />
            )}

            {simularSubTab === "video" && (
              <VideoMirrorTrainer
                onEvaluationCompleted={handleEvaluationCompleted}
                onEarnPoints={handleEarnPoints}
                selectedTema={selectedSpeechTema}
              />
            )}

            {simularSubTab === "qa" && (
              <SurpriseQAPanel onEarnPoints={handleEarnPoints} />
            )}
          </div>
        )}

        {/* 4. TAB: RELATÓRIOS (Progress tracking curves) */}
        {selectedTab === "relatorios" && (
          <div className="space-y-6">
            <RelatoriosPanel
              evaluations={evaluations}
              diagnostics={diagnostics}
            />
          </div>
        )}

        {/* 5. TAB: PERFIL (Gamification awards center) */}
        {selectedTab === "perfil" && (
          <div className="space-y-6">
            <PerfilPanel
              diagnostics={diagnostics}
              gamification={gamification}
              onResetDiagnostics={handleResetDiagnostics}
            />
          </div>
        )}
      </main>

      {/* 3. COHESIVE NAVIGATION FOOTER BOARD */}
      <footer id="app-footer" className="h-20 bg-slate-900/85 border-t border-slate-800/80 flex justify-center items-center px-6 gap-10 md:gap-16 select-none sticky bottom-0 z-50 backdrop-blur-md">
        
        {/* Inicio btn */}
        <button
          id="nav-tab-btn-inicio"
          onClick={() => setSelectedTab("inicio")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            selectedTab === "inicio" ? "text-purple-400" : "text-slate-500 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Início</span>
        </button>

        {/* Treinar btn */}
        <button
          id="nav-tab-btn-treinar"
          onClick={() => setSelectedTab("treinar")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            selectedTab === "treinar" ? "text-purple-400" : "text-slate-500 hover:text-white"
          }`}
        >
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Treinar</span>
        </button>

        {/* Simular btn */}
        <button
          id="nav-tab-btn-simulacoes"
          onClick={() => setSelectedTab("simulacoes")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            selectedTab === "simulacoes" ? "text-purple-400" : "text-slate-500 hover:text-white"
          }`}
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Simular</span>
        </button>

        {/* Relatorios btn */}
        <button
          id="nav-tab-btn-relatorios"
          onClick={() => setSelectedTab("relatorios")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            selectedTab === "relatorios" ? "text-purple-400" : "text-slate-500 hover:text-white"
          }`}
        >
          <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Relatórios</span>
        </button>

        {/* Perfil btn */}
        <button
          id="nav-tab-btn-perfil"
          onClick={() => setSelectedTab("perfil")}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            selectedTab === "perfil" ? "text-purple-400" : "text-slate-500 hover:text-white"
          }`}
        >
          <User className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">Perfil</span>
        </button>

      </footer>
    </div>
  );
}
