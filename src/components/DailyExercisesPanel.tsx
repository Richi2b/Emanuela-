/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { HeartPulse, Mic, Shuffle, Play, Pause, RotateCcw, Check, Sparkles, Trophy, BookOpen, VolumeX } from "lucide-react";

interface DailyExercisesPanelProps {
  onEarnPoints: (pt: number) => void;
}

export function DailyExercisesPanel({ onEarnPoints }: DailyExercisesPanelProps) {
  // Breathing state
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inspire" | "retain" | "expire" | "wait">("inspire");
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [completedBreaths, setCompletedBreaths] = useState(0);

  // Diccao state
  const [selectedTwisterIdx, setSelectedTwisterIdx] = useState(0);
  const [twisterCompleted, setTwisterCompleted] = useState<boolean[]>([false, false, false, false]);

  // Improviso state
  const [improvisoTopic, setImprovisoTopic] = useState("");
  const [improvisoTimer, setImprovisoTimer] = useState(60);
  const [improvisoActive, setImprovisoActive] = useState(false);

  const breathTimerRef = useRef<any>(null);
  const improTimerRef = useRef<any>(null);

  const twisters = [
    {
      title: "O Desinquivocador de Palavras",
      text: "O desinquivocador que as desinquivocar desinquivocador será, e quem o desinquivocador desinquivocasse, bom desinquivocador se revelaria.",
      level: "Avançado"
    },
    {
      title: "O Doce do Tempo",
      text: "O tempo perguntou ao tempo quanto tempo o tempo tem. O tempo respondeu ao tempo que o tempo tem tanto tempo quanto tempo o tempo tem.",
      level: "Iniciante"
    },
    {
      title: "O Pires de Pedro",
      text: "O peito de Pedro é preto de pires de prata. Quem disser que o peito de Pedro não é preto, tem o peito mais preto que o peito de Pedro.",
      level: "Intermédio"
    },
    {
      title: "Os Três Pratos de Trigo",
      text: "Três tristes tigres comeram três pratos de trigo no quintal. Um prato de trigo para cada triste tigre, tragicamente sagaz.",
      level: "Intermédio"
    }
  ];

  const improvisoPrompts = [
    "Tente explicar em 60 segundos por que as melancias deveriam reinar sobre as bananas.",
    "Imagine que é um astronauta prestes a pisar na Lua, mas esqueceu-se das chaves da nave.",
    "Venda este clip de papel usado como se fosse o gadget mais avançado de segurança de 2026.",
    "Convença o seu gato ou cão a aceitar a redução de ração diária por motivos financeiros de inflação.",
    "Discurse sobre como a invenção do pijama com suspensórios salvou a alta sociedade em 1920."
  ];

  // Breathing Loop
  useEffect(() => {
    if (breathingActive) {
      breathTimerRef.current = setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            // cycle phase
            setBreathPhase((curr) => {
              if (curr === "inspire") return "retain";
              if (curr === "retain") return "expire";
              if (curr === "expire") return "wait";
              // wait completed, iterate round!
              setCompletedBreaths(r => {
                const nextR = r + 1;
                if (nextR % 2 === 0) {
                  onEarnPoints(40);
                }
                return nextR;
              });
              return "inspire";
            });
            return 4; // Reset to 4 seconds for square breathing (4-4-4-4)
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    }

    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, [breathingActive]);

  // Improvisation loop
  useEffect(() => {
    if (improvisoActive) {
      improTimerRef.current = setInterval(() => {
        setImprovisoTimer((prev) => {
          if (prev <= 1) {
            setImprovisoActive(false);
            onEarnPoints(100);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (improTimerRef.current) clearInterval(improTimerRef.current);
    }

    return () => {
      if (improTimerRef.current) clearInterval(improTimerRef.current);
    };
  }, [improvisoActive]);

  const toggleBreathing = () => {
    setBreathingActive(!breathingActive);
    if (!breathingActive) {
      setBreathPhase("inspire");
      setBreathSeconds(4);
    }
  };

  const handleTwisterComplete = (idx: number) => {
    const nextArr = [...twisterCompleted];
    const prevVal = nextArr[idx];
    nextArr[idx] = !prevVal;
    setTwisterCompleted(nextArr);
    if (!prevVal) {
      onEarnPoints(50); // reward
    }
  };

  const gerarImproviso = () => {
    const random = improvisoPrompts[Math.floor(Math.random() * improvisoPrompts.length)];
    setImprovisoTopic(random);
    setImprovisoTimer(60);
    setImprovisoActive(true);
  };

  return (
    <div id="exercises-dashboard-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-white leading-relaxed">
      
      {/* Interactive square breathing card */}
      <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-purple-400" /> Respiração Sopro Quadrado
            </h3>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-purple-300 font-bold uppercase tracking-wider">
              Ciclo: 4s
            </span>
          </div>
          <p className="text-xs text-slate-400">
            A técnica de respiração utilizada pelos fuzileiros navais para diminuir os batimentos cardíacos instantaneamente antes de sob pressão.
          </p>

          {/* Visual Breathing Bubble Ring */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 border border-slate-950 rounded-2xl relative overflow-hidden">
            <div
              className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 ${
                breathPhase === "inspire" && breathingActive ? "scale-125 border-purple-500 bg-purple-500/10" : ""
              } ${
                breathPhase === "retain" && breathingActive ? "scale-110 border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/15" : ""
              } ${
                breathPhase === "expire" && breathingActive ? "scale-90 border-yellow-500 bg-yellow-500/5" : ""
              } ${
                breathPhase === "wait" && breathingActive ? "scale-75 border-slate-700 bg-slate-900" : "border-slate-800"
              }`}
            >
              <span className="text-2xl font-black">{breathSeconds}s</span>
              <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">
                {!breathingActive ? "PRONTO" : breathPhase}
              </span>
            </div>

            <div className="text-center mt-4">
              <p className="text-xs font-semibold">
                {!breathingActive && "Clique no play para iniciar a respiração!"}
                {breathPhase === "inspire" && breathingActive && "🌬️ Inspire profundamente pelo nariz..."}
                {breathPhase === "retain" && breathingActive && "✋ Retenha o ar nos pulmões..."}
                {breathPhase === "expire" && breathingActive && "💨 Expire lentamente pela boca..."}
                {breathPhase === "wait" && breathingActive && "⏳ Sustenha os pulmões vazios..."}
              </p>
              <p className="text-[10px] text-purple-400 mt-1 font-bold">
                Ciclos Concluídos: {completedBreaths} (+{completedBreaths * 20} XP salvos)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={toggleBreathing}
          id="btn-toggle-breaths"
          className={`w-full mt-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            breathingActive ? "bg-red-650 hover:bg-red-600 text-white" : "bg-purple-600 hover:bg-purple-500 text-white"
          }`}
        >
          {breathingActive ? "Parar Exercício" : "Começar Respiração 4-4-4-4"}
        </button>
      </div>

      {/* Tongue twisters speed diction cards */}
      <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Mic className="w-5 h-5 text-blue-400 animate-pulse" /> Dicção de Aço (Trava-Línguas)
          </h3>
          <p className="text-xs text-slate-400">
            Aquece os músculos faciais e a língua para eliminar barbalismos e melhorar a clareza verbal. Complete cada um deles.
          </p>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-950 space-y-3 min-h-[160px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                  {twisters[selectedTwisterIdx].level}
                </span>
                <span className="text-[10px] text-slate-500">
                  {selectedTwisterIdx + 1} de {twisters.length}
                </span>
              </div>
              <h4 className="font-bold text-xs text-purple-300">{twisters[selectedTwisterIdx].title}</h4>
              <p className="text-xs mt-2 italic leading-relaxed text-slate-200">
                "{twisters[selectedTwisterIdx].text}"
              </p>
            </div>

            <div className="flex gap-2">
              <button
                id="btn-confirm-twister"
                onClick={() => handleTwisterComplete(selectedTwisterIdx)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                  twisterCompleted[selectedTwisterIdx]
                    ? "bg-green-600/20 border border-green-500 text-green-400"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750"
                }`}
              >
                <Check className="w-3.5 h-3.5" /> {twisterCompleted[selectedTwisterIdx] ? "Concluído (+50 XP)" : "Marcar como Lido"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 mt-4">
          {twisters.map((_, i) => (
            <button
              key={i}
              id={`btn-select-twister-${i}`}
              onClick={() => setSelectedTwisterIdx(i)}
              className={`flex-1 h-7 rounded-lg text-xs font-bold transition-all ${
                selectedTwisterIdx === i
                  ? "bg-purple-600 text-white"
                  : twisterCompleted[i]
                  ? "bg-green-950/40 text-green-400 border border-green-900/30"
                  : "bg-slate-950/60 hover:bg-slate-850 text-slate-400"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Spontaneous improvisation agile coach card */}
      <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} /> Improvisação & Storytelling
            </h3>
            {improvisoActive && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-bold">
                {improvisoTimer}s
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Falar sem ler liberta a autoconfiança de palco. Pressione o botão para receber um tema inusitado e fale durante 1 minuto inteiro!
          </p>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-950 text-center flex flex-col justify-center min-h-[155px] relative overflow-hidden">
            {improvisoTopic ? (
              <div className="space-y-3">
                <span className="text-[9px] bg-yellow-950/50 text-yellow-400 border border-yellow-800/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Cenário de Improviso Ativo
                </span>
                <p className="text-xs font-semibold leading-relaxed text-slate-200">
                  {improvisoTopic}
                </p>
                {improvisoActive ? (
                  <p className="text-[10px] text-yellow-400 animate-pulse font-medium">🗣️ Fale sem parar até o temporizador terminar!</p>
                ) : (
                  <p className="text-[10px] text-green-400 font-bold">🎉 Tempo concluído! Parabéns. +100 XP adicionados!</p>
                )}
              </div>
            ) : (
              <div className="text-slate-400 space-y-1">
                <p className="text-xs font-semibold">Tópicos Incomuns Surpresa</p>
                <p className="text-[10px]">Cria agilidade para desviar o pânico de mente vazia.</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={gerarImproviso}
          id="btn-trigger-improviso"
          className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" /> Sugerir Tema Inusitado
        </button>
      </div>
    </div>
  );
}
