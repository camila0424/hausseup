// tipos compartidos para el sistema de agentes de Hausseup

export type AgentType = 'companion' | 'recruiter';

export type CriticalAction =
  | 'apply_to_job'
  | 'send_employer_message'
  | 'accept_offer'
  | 'reject_candidate'
  | 'delete_account'
  | 'share_migration_status';

// lo que el agente devuelve al frontend
export interface AgentResponse {
  message: string;
  // si hay una acción que requiere confirmación del usuario
  pendingAction?: PendingAction;
  // tarjetas inline que el agente decide mostrar
  cards?: AgentCard[];
}

// una acción pendiente de confirmación (HITL)
export interface PendingAction {
  id: string;
  type: CriticalAction;
  // datos legibles para mostrar en el modal
  context: Record<string, unknown>;
  // datos técnicos para ejecutar la acción
  payload: Record<string, unknown>;
  expiresAt: Date;
}

// tarjeta que el agente puede insertar en el hilo conversacional
export type AgentCard =
  | { type: 'job'; data: JobCardData }
  | { type: 'candidate'; data: CandidateCardData };

// datos que necesita <JobCard />
export interface JobCardData {
  id: number;
  company: string;
  companyLogo?: string;
  title: string;
  location: string;
  distanceKm?: number;
  salary?: string;
  schedule?: string;
  contractType?: string;
  paperworkRequired: 'none' | 'in_process_ok' | 'required';
  description: string;
  matchScore: number;
  matchReason: string;
}

// datos que necesita <CandidateCard />
export interface CandidateCardData {
  id: number;
  name: string;
  photo?: string;
  age?: number;
  city: string;
  distanceKm?: number;
  experienceSummary: string;
  languages: string[];
  migrationStatus: 'documented' | 'in_process' | 'tourist' | 'undocumented' | 'hidden';
  availability: string;
  matchScore: number;
  matchReason: string;
}

// lo que entra al endpoint POST /api/agent/message
export interface AgentMessageRequest {
  message: string;
  conversationId?: number;
}

// lo que entra al endpoint POST /api/agent/confirm-action
export interface ConfirmActionRequest {
  pendingActionId: string;
  confirmed: boolean;
}

// perfil del candidato para embeddings y matching
export interface CandidateProfile {
  userId: number;
  name: string;
  city?: string;
  migrationStatus?: string;
  sector?: string;
  experienceSummary?: string;
  languages?: string[];
  salaryExpectation?: string;
  availability?: string;
  extraInfo?: string;
}

// oferta de empleo para matching
export interface JobPosting {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  schedule?: string;
  contractType?: string;
  paperworkRequired: string;
}
