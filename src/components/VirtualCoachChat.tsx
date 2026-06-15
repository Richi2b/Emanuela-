/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Loader2, Sparkles, User, KeyRound, Bot, Heart, Flame } from "lucide-react";
import { ChatMessage } from "../types";

export function VirtualCoachChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Olá! Sou o seu Coach Virtual de Oratória. Estou aqui para o ajudar a acalmar os nervos, a estruturar as suas ideias ou a ensaiar qualquer discurso importante. Como se sente sobre a sua próxima apresentação pública?",
      timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  const preSets = [
    { title: "Medo de apresentar amanhã 😰", prompt: "Tenho uma apresentação muito importante amanhã e estou em pânico!" },
    { title: "Organizar roteiro rápido ✍️", prompt: "Como posso organizar as minhas ideias em 3 pontos rápidos de força?" },
    { title: "Falta-me o ar a discursar 🫁", prompt: "Fico sem forças e voz trémula a meio das frases. O que faço?" },
    { title: "Como ter postura firme? 🧍", prompt: "Tenho tendência a ficar estático ou a gesticular de mais com os dedos." }
  ];

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || userInput;
    if (!textToSend.trim()) return;

    if (!customPrompt) {
      setUserInput("");
    }

    setError(null);
    const userMsg: ChatMessage = {
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch("/api/gemini/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!response.ok) {
        throw new Error("Erro ao aceder ao SpeakMaster Mentor.");
      }

      const raw = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: raw.text || "Fale um bocado mais. Estou aqui para praticar consigo.",
          timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setError("Dificuldade de rede temporária.");

      const fallbacks = [
        "Compreendo perfeitamente o seu pânico. Vamos dar um passo atrás. Primeiro, feche os olhos por 5 segundos e faça uma expiração prolongada. Lembra-se que as pessoas na sala estão lá para o ouvir e querem de facto que corra bem!",
        "Excelente pergunta. Para estruturar de forma brilhante, divida tudo em: Gancho Inicial (um dado polémico ou história), Desenvolvimento (apenas dois pilares de sustentação com dados lógicos) e Chamada de Ação Final emocional.",
        "Para combater as palpitações de palco físicas, abaixe os ombros e empurre os seus pés bem firmes contra o solo. Isto dá sustentação gravítica ao corpo e avisa o cerebelo de que não está em perigo mortal físico."
      ];

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: fallbacks[Math.floor(Math.random() * fallbacks.length)] + "\n\n(Coach operando em modo offline devido a restrição de rede)",
          timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="virtual-coach-chat" className="bg-[#0F172A]/40 border border-slate-800 rounded-3xl p-6 relative flex flex-col h-[580px] justify-between text-white leading-relaxed">
      
      {/* Top information header */}
      <div className="flex justify-between items-center border-b border-slate-850 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600/20 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/20">
            <Bot className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">Virtual Coach Inteligente</h3>
            <span className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-ping" /> Mentor 24 Horas Ativo
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 px-3 py-1 rounded-full text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> Treino Diário Garantido
        </div>
      </div>

      {/* Messages area scrollable */}
      <div id="chat-messages-board" className="flex-1 overflow-y-auto py-4 space-y-4 pr-2 select-text">
        {messages.map((m, index) => (
          <div
            key={index}
            className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs border ${
                m.role === "user"
                  ? "bg-slate-800 border-slate-700 text-slate-100"
                  : "bg-purple-950/40 border-purple-900/30 text-purple-400"
              }`}
            >
              {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs max-w-[80%] whitespace-pre-line leading-relaxed shadow ${
                m.role === "user"
                  ? "bg-purple-600 text-white rounded-tr-none"
                  : "bg-slate-900/80 border border-slate-850 text-slate-200 rounded-tl-none"
              }`}
            >
              <p className="font-medium text-xs leading-relaxed">{m.text}</p>
              <span className="block text-[8px] text-slate-400 mt-1.5 text-right">{m.timestamp}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-400 font-medium">
            <Loader2 className="w-4 h-4 animate-spin" /> Coach está a pensar em recomendações de orçamentos e posturas...
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Preset Suggestions buttons */}
      {messages.length === 1 && (
        <div className="py-2 flex-shrink-0 space-y-2 border-t border-slate-850 pt-3">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Dúvidas Frequentes Rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {preSets.map((p) => (
              <button
                key={p.title}
                id={`btn-preset-chat-${p.title.slice(0, 4)}`}
                onClick={() => sendMessage(p.prompt)}
                className="text-[10px] bg-slate-950/60 border border-slate-850 hover:bg-slate-850 px-3 py-1.5 rounded-xl transition-all hover:border-slate-500 font-semibold text-slate-300"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form Input footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex items-center gap-2 pt-3 border-t border-slate-850 flex-shrink-0"
      >
        <input
          type="text"
          id="chat-user-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Diga ao Coach o que o preocupa ou escreva um trecho do seu discurso..."
          className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          id="btn-send-chat"
          disabled={loading || !userInput.trim()}
          className="w-10 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition-all disabled:bg-slate-850 disabled:text-slate-500 shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
