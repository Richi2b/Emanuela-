/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum DifficultyLevel {
  INICIANTE = "Iniciante",
  INTERMEDIO = "Intermédio",
  AVANCADO = "Avançado",
  ESPECIALISTA = "Especialista"
}

export interface UserDiagnostics {
  completed: boolean;
  temMedo: string; // "sim" | "nao" | "as_vezes"
  confianca: number; // 1 to 5
  temorAudiencia: number; // number of people they feel comfortable with (e.g. 5, 20, 100, 1000)
  apresentouAntes: string; // "nunca" | "pouco" | "frequentemente"
  principalProblema: string;
  perfilGerado?: {
    nivelRecomendado: DifficultyLevel;
    analiseGeral: string;
    pontosFortes: string[];
    pontosFracos: string[];
    planoAcao: string[];
  };
}

export interface SpeechProject {
  id: string;
  tema: string;
  publico: string;
  tempoMinutagem: number;
  areaTematica?: string;
  dataCriacao: string;
  discursoGerado?: {
    introducao: string;
    desenvolvimento: string;
    conclusao: string;
    frasesImpacto: string[];
    dicasOratoria: string;
  };
}

export interface EvaluationResult {
  id: string;
  tipo: "audio" | "video";
  data: string;
  temaPraticado: string;
  pontuacaoGeral: number; // 0 a 100
  detalhes: {
    clareza?: number;
    velocidade?: number;
    pausas?: number;
    confianca?: number;
    postura?: number;
    linguagemCorporal?: number;
    contactoVisual?: number;
  };
  transcricaoOuDescricao: string;
  analiseIA: {
    feedbackPositivo: string;
    pontosMelhoria: string;
    exercicioRecomendado: string;
    planoVozOuPostura?: string;
  };
}

export interface Badge {
  id: string;
  nome: string;
  descricao: string;
  icone: string; // name of lucide-react icon
  desbloqueado: boolean;
  dataConquista?: string;
}

export interface GamificationState {
  pontos: number;
  nivel: number;
  sequenciaDias: number;
  ultimaAtividade: string; // YYYY-MM-DD
  badges: Badge[];
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface DailyExercise {
  id: string;
  titulo: string;
  categoria: "respiracao" | "diccao" | "confianca" | "storytelling" | "improvisacao";
  descricao: string;
  passos: string[];
  tempoEstimado: string; // e.g. "3 min"
}
