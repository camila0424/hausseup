// estos tipos deben mantenerse sincronizados con backend/src/agent/types.ts

export type AgentType = 'companion' | 'recruiter';

export type CriticalAction =
  | 'apply_to_job'
  | 'send_employer_message'
  | 'accept_offer'
  | 'reject_candidate'
  | 'delete_account'
  | 'share_migration_status';

export interface PendingAction {
  id: string;
  type: CriticalAction;
  context: Record<string, unknown>;
  payload: Record<string, unknown>;
  expiresAt: string; // viene como string del JSON
}

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

export type AgentCard =
  | { type: 'job'; data: JobCardData }
  | { type: 'candidate'; data: CandidateCardData };

// textos del modal de confirmación por tipo de acción
export const ACTION_COPY: Record<
  CriticalAction,
  { title: string; body: string; confirm: string; cancel: string; destructive?: boolean }
> = {
  apply_to_job: {
    title: '¿Enviamos tu candidatura?',
    body: 'Tu perfil irá a {companyName} para {jobTitle}. Te avisamos cuando lo revisen.',
    confirm: 'Sí, enviar',
    cancel: 'Espera, no todavía',
  },
  send_employer_message: {
    title: 'Enviar mensaje a {candidateName}',
    body: 'Esto iniciará la conversación en nombre de tu empresa.',
    confirm: 'Enviar mensaje',
    cancel: 'Revisar antes',
  },
  accept_offer: {
    title: '¿Publicamos la oferta?',
    body: 'La oferta de {jobTitle} quedará visible para los candidatos.',
    confirm: 'Sí, publicar',
    cancel: 'Revisar antes',
  },
  reject_candidate: {
    title: '¿Descartar a {candidateName}?',
    body: 'No volverá a aparecer en esta oferta. Esta acción no se puede deshacer.',
    confirm: 'Sí, descartar',
    cancel: 'Cancelar',
    destructive: true,
  },
  delete_account: {
    title: 'Eliminar cuenta',
    body: 'Todos tus datos serán eliminados permanentemente.',
    confirm: 'Eliminar para siempre',
    cancel: 'No, quedarme',
    destructive: true,
  },
  share_migration_status: {
    title: 'Compartir tu situación migratoria',
    body: 'Esta empresa podrá ver si tienes documentación. Puedes revocar esto en ajustes.',
    confirm: 'Sí, compartir',
    cancel: 'Prefiero no',
  },
};
