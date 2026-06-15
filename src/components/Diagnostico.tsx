/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { BrainCircuit, Star, Users, Briefcase, ChevronRight, ChevronLeft, Loader2, Sparkles, HeartPulse, User } from "lucide-react";
import { UserDiagnostics, DifficultyLevel } from "../types";

interface DiagnosticoProps {
  onComplete: (data: UserDiagnostics) => void;
}

export function Diagnostico({ onComplete }: DiagnosticoProps) {
  const [step, setStep] = useState<number>(0);
  const [temMedo, setTemMedo] = useState<string>("");
  const [confianca, setConfianca] = useState<number>(3);
  const [temorAudiencia, setTemorAudiencia] = useState<number>(10);
  const [apresentouAntes, setApresentouAntes] = useState<string>("");
  const [principalProblema, setPrincipalProblema] = useState<string>("");
  const [areaIncentivo, setAreaIncentivo] = useState<string>("");
  const [customProblema, setCustomProblema] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(prev => prev + 1);
    } else {
      submitDiagnostic();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const submitDiagnostic = async () => {
    setLoading(true);
    setError(null);
    const finalProblem = principalProblema === "Outro" ? customProblema : principalProblema;

    const payloadAnswers = {
      temMedo: temMedo,
      confianca: confianca,
      temorAudiencia: temorAudiencia,
      apresentouAntes: apresentouAntes,
      principalProblema: `${finalProblem} (${areaIncentivo})`
    };

    try {
      const response = await fetch("/api/gemini/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payloadAnswers })
      });

      if (!response.ok) {
        throw new Error("Falha ao comunicar com o servidor da AI.");
      }

      const generatedProfile = await response.json();

      const finalDiagnostics: UserDiagnostics = {
        completed: true,
        temMedo,
        confianca,
        temorAudiencia,
        apresentouAntes,
        principalProblema: finalProblem,
        perfilGerado: {
          nivelRecomendado: generatedProfile.nivelRecomendado as DifficultyLevel,
          analiseGeral: generatedProfile.analiseGeral,
          pontosFortes: generatedProfile.pontosFortes || [],
          pontosFracos: generatedProfile.pontosFracos || [],
          planoAcao: generatedProfile.planoAcao || []
        }
      };

      onComplete(finalDiagnostics);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
        "Não foi possível obter um diagnóstico online. Iremos prosseguir com parâmetros locais recomendados."
      );
      // Fallback local safe simulation
      setTimeout(() => {
        const fallbackDiagnostics: UserDiagnostics = {
          completed: true,
          temMedo,
          confianca,
          temorAudiencia,
          apresentouAntes,
          principalProblema: finalProblem || "Tremer a falar",
          perfilGerado: {
            nivelRecomendado: confianca <= 2 ? DifficultyLevel.INICIANTE : DifficultyLevel.INTERMEDIO,
            analiseGeral: "Orador com necessidade de trabalhar o controlo de ansiedade física e focar na estruturação rápida antes de subir a palco.",
            pontosFortes: ["Vontade de melhorar", "Sensibilidade comunicativa", "Procura ativa por feedback"],
            pontosFracos: ["Sintomas de batimento cardíaco acelerado", "Ritmo acelerado devido a pressa", "Insegurança postural"],
            planoAcao: [
              "Fase 1: Técnicas de Respiração Diafragmática",
              "Fase 2: Estruturação em 3 Tópicos",
              "Fase 3: Prática frente ao espelho com câmara ativa",
              "Fase 4: Enfrentar pequenas audiências amigáveis"
            ]
          }
        };
        onComplete(fallbackDiagnostics);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 0) return temMedo !== "";
    if (step === 1) return confianca >= 1 && confianca <= 5;
    if (step === 2) return temorAudiencia > 0;
    if (step === 3) return apresentouAntes !== "";
    if (step === 4) return principalProblema !== "";
    if (step === 5) return areaIncentivo !== "";
    return true;
  };

  return (
    <div id="diagnostico-card" className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -z-10" />

      {loading ? (
        <div id="diagnostico-loading" className="flex flex-col items-center justify-center py-16 text-center space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="text-purple-500"
          >
            <Loader2 className="w-16 h-16 animate-pulse" />
          </motion.div>
          <div>
            <h2 id="diagnose-generating-title" className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" /> Analisando a sua Voz Interior...
            </h2>
            <p className="text-slate-400 mt-2 max-w-md mx-auto small text-sm">
              O SpeakMaster AI está a desenhar o seu perfil de orador personalizado. Isto demora apenas alguns segundos.
            </p>
          </div>
          <div className="text-xs text-purple-400 italic bg-purple-900/20 px-4 py-2 rounded-full border border-purple-500/20 animate-pulse">
            Consultando o Mentor Inteligente...
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span>SESSÃO DE DIAGNÓSTICO</span>
              <span>Passo {step + 1} de {totalSteps}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-200 p-4 rounded-xl text-sm mb-6 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Content */}
          <div className="min-h-[280px]">
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <BrainCircuit className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold">Tens medo de falar em público?</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  O pânico de palco afeta mais de 75% da população mundial. Saber onde estás ajuda-nos a libertar o teu potencial.
                </p>
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {[
                    { value: "sim", label: "Sim, sinto muita ansiedade e pavor físico." },
                    { value: "as_vezes", label: "Às vezes, dependendo do público ou da importância." },
                    { value: "raramente", label: "Raramente, sinto apenas nervosismo de arranque comum." },
                    { value: "nao", label: "Não, sinto-me calmo mas quero polir as minhas técnicas." }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      id={`opt-medo-${opt.value}`}
                      onClick={() => setTemMedo(opt.value)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        temMedo === opt.value
                          ? "bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/30 text-white"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <Star className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold">Como classificas a tua confiança atual?</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  De 1 (fujo de qualquer apresentação) a 5 (consigo falar sem me desorganizar).
                </p>
                <div className="flex justify-center gap-3 py-6">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      id={`opt-confianca-${num}`}
                      onClick={() => setConfianca(num)}
                      className={`w-14 h-14 rounded-full border flex flex-col items-center justify-center transition-all ${
                        confianca === num
                          ? "bg-gradient-to-tr from-purple-600 to-indigo-500 border-purple-400 ring-4 ring-purple-500/20"
                          : "bg-slate-850 border-slate-700 hover:border-slate-500 text-slate-300"
                      }`}
                    >
                      <Star className={`w-6 h-6 ${confianca >= num ? "fill-white" : ""}`} />
                      <span className="text-xs font-semibold mt-0.5">{num}</span>
                    </button>
                  ))}
                </div>
                <div className="text-center text-sm text-slate-400">
                  {confianca === 1 && "⚠️ Pânico elevado: Vamos focar em relaxamento corporal."}
                  {confianca === 2 && "⚠️ Alguma segurança: Iremos focar em técnicas de memorização."}
                  {confianca === 3 && "⚡ Nível Médio: Excelente ponto para avançar para gesticulação."}
                  {confianca === 4 && "🚀 Muito Bom: Vamos dominar recursos de improviso!"}
                  {confianca === 5 && "👑 Excelente: Foco em magnetismo, storytelling e liderança."}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold">Quantas pessoas consegues enfrentar no máximo?</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Seleciona a dimensão da plateia onde te sentes relativamente seguro(a).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                  {[
                    { value: 1, label: "Apenas 1 pessoa (Entrevista)", icon: "👤" },
                    { value: 5, label: "Pequena equipa (Até 5 pessoas)", icon: "👥" },
                    { value: 20, label: "Sala de aula/Reunião (Até 20)", icon: "🏢" },
                    { value: 100, label: "Auditório Grande (100+ pessoas)", icon: "🏟️" }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      id={`opt-audiencia-${opt.value}`}
                      onClick={() => setTemorAudiencia(opt.value)}
                      className={`text-left p-4 rounded-xl border flex items-center gap-3 transition-all ${
                        temorAudiencia === opt.value
                          ? "bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/30 text-white"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300"
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold">Já apresentaste discursos ou trabalhos antes?</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Diz-nos qual é o teu histórico de palco até hoje.
                </p>
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {[
                    { value: "nunca", label: "Não, evito sempre e nunca fiz nenhuma apresentação." },
                    { value: "pouco", label: "Muito pouco, apenas em raras obrigações académicas ou trabalho." },
                    { value: "frequentemente", label: "Com alguma frequência, mas sinto fortes dores de ansiedade e quero ser mais carismático." }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      id={`opt-experiencia-${opt.value}`}
                      onClick={() => setApresentouAntes(opt.value)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        apresentouAntes === opt.value
                          ? "bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/30 text-white"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <User className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold">Qual é o teu principal receio ou barreira?</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  O que costuma dar mais errado na hora H?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    "Ficar com a mente vazia ou gaguejar",
                    "Falar rápido demais e perder o fôlego",
                    "Tremer a voz, as mãos ou as pernas",
                    "Postura estática ou movimentos repetitivos",
                    "Falta de contacto visual com as pessoas",
                    "Não saber organizar bem os slides/conteúdo",
                    "Outro"
                  ].map((prob) => (
                    <button
                      key={prob}
                      id={`opt-problema-${prob.slice(0, 8)}`}
                      onClick={() => setPrincipalProblema(prob)}
                      className={`text-left p-3.5 rounded-xl border transition-all text-sm ${
                        principalProblema === prob
                          ? "bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/30 text-white"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300"
                      }`}
                    >
                      {prob}
                    </button>
                  ))}
                </div>

                {principalProblema === "Outro" && (
                  <input
                    type="text"
                    id="input-custom-problema"
                    value={customProblema}
                    onChange={(e) => setCustomProblema(e.target.value)}
                    placeholder="Descreva aqui o seu receio particular..."
                    className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                )}
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold">Qual o teu objetivo final ou área de foco?</h3>
                </div>
                <p className="text-slate-400 text-sm">
                  Onde queres aplicar os teus superpoderes de comunicação?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    { val: "TCC / Ambiente Académico", title: "Apresentações Académicas", desc: "Monografia ou exames orais" },
                    { val: "Reuniões / Apresentar ideias na empresa", title: "Liderança e Negócios", desc: "Vender ideias à diretoria" },
                    { val: "Entrevistas de Trabalho", title: "Entrevistas de Emprego", desc: "Transição profissional" },
                    { val: "Vendas e Negociação com Clientes", title: "Vendas e Relacionamentos", desc: "Negociar com grande impacto" },
                    { val: "Aulas e Formações", title: "Educação / Ensino", desc: "Falar de forma clara e cativar" },
                    { val: "Vencer a timidez no dia a dia", title: "Desenvolvimento Pessoal", desc: "Melhorar a auto-estima" }
                  ].map((obj) => (
                    <button
                      key={obj.val}
                      id={`opt-objetivo-${obj.title.slice(0, 8)}`}
                      onClick={() => setAreaIncentivo(obj.val)}
                      className={`text-left p-3.5 rounded-xl border flex flex-col transition-all ${
                        areaIncentivo === obj.val
                          ? "bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/30 text-white"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300"
                      }`}
                    >
                      <span className="font-semibold text-sm">{obj.title}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">{obj.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-800/80">
            <button
              id="btn-back-step"
              onClick={handleBack}
              disabled={step === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                step === 0
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-300 hover:bg-slate-850 hover:text-white"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <button
              id="btn-next-step"
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isStepValid()
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              {step === totalSteps - 1 ? (
                <>
                  Gerar Perfil <Sparkles className="w-4 h-4 ml-0.5" />
                </>
              ) : (
                <>
                  Seguinte <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
