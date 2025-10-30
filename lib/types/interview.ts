/**
 * Types pour le système d'interviews FinanceBro
 */

export type InterviewRound = 'screening' | 'tech' | 'final' | 'case' | 'fit';
export type InterviewStatus = 'draft' | 'live' | 'completed';

export type FocusArea =
  | 'valuation'
  | 'accounting'
  | 'markets'
  | 'fit'
  | 'technical'
  | 'case-study'
  | 'behavioral';

export interface InterviewSession {
  id: string;
  user_id: string;
  title: string;
  position_round: InterviewRound;
  company: string;
  role: string;
  focus_areas: FocusArea[];
  cv_path: string | null;
  job_offer_path: string | null;
  status: InterviewStatus;
  duration_minutes: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionFeedback {
  question: string;
  summary: string;
  tips: string[];
  score: number; // 0-100
}

export interface InterviewFeedback {
  id: string;
  session_id: string;
  general: string | null;
  went_well: string[];
  to_improve: string[];
  per_question: QuestionFeedback[];
  score_overall: number | null; // 0-100
  created_at: string;
}

export interface SessionWithFeedback extends InterviewSession {
  feedback?: InterviewFeedback;
}
