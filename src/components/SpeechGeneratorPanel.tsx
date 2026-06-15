/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Loader2, Send, Wand2, RefreshCw, BookmarkCheck, Copy, Check } from "lucide-react";
import { SpeechProject } from "../types";

interface SpeechGeneratorPanelProps {
  onSpeechGenerated: (project: SpeechProject) => void;
  projects: SpeechProject[];
}

export function SpeechGeneratorPanel({ onSpeechGenerated, projects }: SpeechGeneratorPanelProps) {
  const [tema, setTema] = useState("");
  const [publico, setPublico] = useState("");
  const [tempoMinutagem, setTempoMinutagem] = useState(5);
  const [areaTematica, setAreaTematica] = useState("Vendas/Negócios");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [activeProject, setActiveProject] = useState<SpeechProject | null>(
    projects.length > 0 ? projects[0] : null
  );

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tema.trim() || !publico.trim()) {
      setError("Por favor indique o tema e o público-alvo.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, publico, tempoMinutagem, areaTematica })
      });

      if (!response.ok) {
        throw new Error("Erro de rede ao ligar ao SpeakMaster Speech Architect.");
      }

      const speechData = await response.json();

      const newProject: SpeechProject = {
        id: "p_" + Date.now(),
        tema,
        publico,
        tempoMinutagem,
        areaTematica,
        dataCriacao: new Date().toLocaleDateString("pt-PT"),
        discursoGerado: speechData
      };

      onSpeechGenerated(newProject);
      setActiveProject(newProject);
      // reset form
      setTema("");
      setPublico("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ups, falhou a geração do guião estruturado.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sugerirTema = () => {
    const temasRapidos = [
      { t: "O Futuro das Energias Renováveis", p: "Estudantes Universitários de Engenharia", a: "Tecnologia/Ciência" },
      { t: "Como Falar Bem Numa Entrevista de Emprego Tech", p: "Programadores à Procura de Primeiro Emprego", a: "Recursos Humanos" },
      { t: "A Importância da Inteligência Emocional na Liderança Moderna", p: "Donos de Startups e Gestores intermédios", a: "Liderança" },
      { t: "Storytelling: Como convencer clientes sem ser chato", p: "Vendedores de Retalho e Consultores", a: "Vendas/Negócios" }
    ];
    const item = temasRapidos[Math.floor(Math.random() * temasRapidos.length)];
    setTema(item.t);
    setPublico(item.p);
    setAreaTematica(item.a);
  };

  return (
    <div id="speech-generator-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-white leading-relaxed">
      {/* Form Grid Section */}
      <div id="form-speech-generator" className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" /> Gerar Guião de Oratória
            </h3>
            <button
              type="button"
              id="btn-sugestao-ideias"
              onClick={sugerirTema}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 bg-purple-900/10 border border-purple-500/20 px-2 py-1 rounded-lg"
            >
              <RefreshCw className="w-3 h-3" /> Ideia Rápida
            </button>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">Tema / Título do Discurso</label>
            <input
              type="text"
              id="speech-input-tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ex: Inteligência Artificial nos Escritórios portugueses"
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">Público Escutando (Audiência)</label>
            <input
              type="text"
              id="speech-input-publico"
              value={publico}
              onChange={(e) => setPublico(e.target.value)}
              placeholder="Ex: Investidores locais, Diretores e CEO"
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">Duração (Minutos)</label>
              <input
                type="number"
                id="speech-input-tempo"
                value={tempoMinutagem}
                onChange={(e) => setTempoMinutagem(Number(e.target.value))}
                min={2}
                max={30}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">Área Temática</label>
              <select
                id="speech-select-area"
                value={areaTematica}
                onChange={(e) => setAreaTematica(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors text-slate-300"
              >
                <option value="Vendas/Negócios">Vendas/Negócios</option>
                <option value="Académico/Investigação">Académico</option>
                <option value="Tecnologia/Inovação">Tecnologia</option>
                <option value="Pessoal/Brinde">Casamento / Festivo</option>
                <option value="Liderança/Empresa">Liderança / CEO</option>
              </select>
            </div>
          </div>

          {error && <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 p-2.5 rounded-lg">{error}</div>}

          <button
            type="submit"
            id="speech-submit-btn"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/10 disabled:bg-slate-800 disabled:text-slate-500"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" /> Estruturando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-yellow-300" /> Construir Roteiro por IA
              </>
            )}
          </button>
        </form>

        {/* Saved list */}
        {projects.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <h4 id="speech-historico-lbl" className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Seus Guiões Salvos</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  id={`btn-load-proj-${proj.id}`}
                  onClick={() => setActiveProject(proj)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start justify-between gap-1 ${
                    activeProject?.id === proj.id
                      ? "bg-purple-900/20 border-purple-500/50 text-white font-semibold"
                      : "bg-slate-950/50 border-slate-900 text-slate-300 hover:bg-slate-850"
                  }`}
                >
                  <div className="truncate flex-1">
                    <p className="truncate font-semibold text-xs text-slate-100">{proj.tema}</p>
                    <p className="text-[10px] text-slate-400 truncate">Par: {proj.publico}</p>
                  </div>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded flex-shrink-0">
                    {proj.tempoMinutagem} min
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guide Details Section */}
      <div id="guias-preview-pane" className="lg:col-span-8 bg-slate-900/30 border border-slate-800/40 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
        {activeProject?.discursoGerado ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
              <div>
                <span className="text-xs bg-purple-900/40 text-purple-300 px-2.5 py-1 rounded-full font-medium uppercase tracking-wider border border-purple-500/20">
                  {activeProject.areaTematica}
                </span>
                <h2 className="text-xl md:text-2xl font-bold mt-1 text-slate-100">{activeProject.tema}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Preparado para <strong>{activeProject.publico}</strong> • Meta sugerida: <strong>{activeProject.tempoMinutagem} minutos</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-copy-full-roteiro"
                  onClick={() =>
                    copyText(
                      `INTRODUÇÃO:\n${activeProject.discursoGerado?.introducao}\n\nDESENVOLVIMENTO:\n${activeProject.discursoGerado?.desenvolvimento}\n\nCONCLUSÃO:\n${activeProject.discursoGerado?.conclusao}`,
                      "full"
                    )
                  }
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-nowrap"
                >
                  {copiedId === "full" ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />} Copiar Tudo
                </button>
              </div>
            </div>

            {/* Generated block structure formatted */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1">
                  💡 Ganchos & Entrada (Introdução)
                </h4>
                <div className="mt-2 bg-slate-950/60 p-4 rounded-2xl text-sm border border-slate-900 text-slate-200 shadow-inner whitespace-pre-line leading-relaxed italic">
                  {activeProject.discursoGerado.introducao}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1">
                  📚 Argumentações de Força (Desenvolvimento)
                </h4>
                <div className="mt-2 bg-slate-950/60 p-4 rounded-2xl text-sm border border-slate-900 text-slate-200 shadow-inner whitespace-pre-line leading-relaxed">
                  {activeProject.discursoGerado.desenvolvimento}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-green-400 flex items-center gap-1">
                  🎯 Fraseologia & Apelo (Conclusão)
                </h4>
                <div className="mt-2 bg-slate-950/60 p-4 rounded-2xl text-sm border border-slate-900 text-slate-200 shadow-inner whitespace-pre-line leading-relaxed italic">
                  {activeProject.discursoGerado.conclusao}
                </div>
              </div>

              {/* Impact statements */}
              {activeProject.discursoGerado.frasesImpacto && activeProject.discursoGerado.frasesImpacto.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-yellow-400 mb-2">
                    🔥 Slogans / Frases de Retenção Mental
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeProject.discursoGerado.frasesImpacto.map((phrase, i) => (
                      <div
                        key={i}
                        className="bg-purple-950/15 border border-purple-500/20 p-3.5 rounded-xl relative text-xs flex flex-col justify-between"
                      >
                        <span className="text-purple-400 font-extrabold text-base absolute top-1 right-2 opacity-50">“</span>
                        <p className="text-slate-300 italic pr-4 font-semibold">{phrase}</p>
                        <button
                          id={`btn-copy-slogan-${i}`}
                          onClick={() => copyText(phrase, `phrase-${i}`)}
                          className="text-[10px] text-purple-400 hover:text-purple-300 self-end mt-2 flex items-center gap-0.5"
                        >
                          {copiedId === `phrase-${i}` ? "Copiado!" : <><Copy className="w-3 h-3" /> Copiar</>}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Oratória special dynamic cues */}
              {activeProject.discursoGerado.dicasOratoria && (
                <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 hover:from-indigo-900/30 hover:to-purple-900/30 border border-indigo-500/20 p-4 rounded-2xl">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-1">
                    🎤 Recomendações de Ritmo & Gesticulação
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    {activeProject.discursoGerado.dicasOratoria}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
              <span className="text-slate-400 flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-green-400" /> Use este guião no simulador de Voz para treinar a sua performance!
              </span>
            </div>
          </div>
        ) : (
          <div id="no-guias-placeholder" className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-800/40 rounded-full flex items-center justify-center border border-slate-700/30 text-purple-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold">Inicie um Novo Roteiro</h4>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Defina o tema e a sua plateia pretendida. A nossa IA criará parágrafos com ganchos persuasivos, sugestões de respiração e slogans magnéticos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
