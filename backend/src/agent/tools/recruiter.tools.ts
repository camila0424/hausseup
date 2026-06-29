import Anthropic from '@anthropic-ai/sdk';

// tools que el Agente de Selección puede usar
// estas definiciones se pasan directamente a la API de Anthropic
export const RECRUITER_TOOLS: Anthropic.Tool[] = [
  {
    name: 'crear_oferta_empleo',
    description:
      'Crea una oferta de empleo estructurada a partir de lo que el empleador describió en lenguaje natural. Devuelve la oferta para confirmación antes de publicarla.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string',
          description: 'Título del puesto (ej: "Camarero/a de piso", "Auxiliar de limpieza")',
        },
        description: {
          type: 'string',
          description: 'Descripción completa del puesto extraída de la conversación',
        },
        location: {
          type: 'string',
          description: 'Ciudad o dirección donde se realizará el trabajo',
        },
        salary: {
          type: 'string',
          description: 'Salario ofrecido (ej: "1.200-1.400 €/mes", "10 €/hora")',
        },
        schedule: {
          type: 'string',
          description:
            'Horario de trabajo (ej: "Lunes a viernes 9h-17h", "Turnos rotativos")',
        },
        contractType: {
          type: 'string',
          enum: ['indefinido', 'temporal', 'por_obra', 'practicas', 'autonomo'],
          description: 'Tipo de contrato',
        },
        paperworkRequired: {
          type: 'string',
          enum: ['none', 'in_process_ok', 'required'],
          description:
            'Requisito de documentación: none=sin papeles ok, in_process_ok=en trámite ok, required=documentación completa obligatoria',
        },
        requirements: {
          type: 'string',
          description: 'Requisitos del puesto (experiencia, idiomas, etc.)',
        },
        cityId: {
          type: 'number',
          description: 'ID de la ciudad en la base de datos (obtenido de GET /api/cities)',
        },
      },
      required: ['title', 'description', 'location', 'paperworkRequired'],
    },
  },
  {
    name: 'recomendar_candidatos',
    description:
      'Rankea y devuelve los candidatos más relevantes para una oferta de empleo específica. Usa embeddings para matching semántico.',
    input_schema: {
      type: 'object' as const,
      properties: {
        jobId: {
          type: 'number',
          description: 'ID del empleo para el que se buscan candidatos',
        },
        limit: {
          type: 'number',
          description: 'Número de candidatos a devolver (por defecto 5, máx 10)',
        },
      },
      required: ['jobId'],
    },
  },
  {
    name: 'programar_entrevista',
    description:
      'Agenda una entrevista entre el empleador y un candidato. Crea el evento y notifica a ambas partes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        candidateId: {
          type: 'number',
          description: 'ID del candidato',
        },
        jobId: {
          type: 'number',
          description: 'ID del empleo',
        },
        dateTime: {
          type: 'string',
          description: 'Fecha y hora de la entrevista en formato ISO 8601',
        },
        format: {
          type: 'string',
          enum: ['presencial', 'videollamada', 'telefono'],
          description: 'Formato de la entrevista',
        },
        location: {
          type: 'string',
          description: 'Lugar o enlace de videollamada (si aplica)',
        },
      },
      required: ['candidateId', 'jobId', 'dateTime', 'format'],
    },
  },
  {
    name: 'listar_mis_ofertas',
    description: 'Lista todas las ofertas de empleo publicadas por el empleador actual.',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'paused', 'closed'],
          description: 'Filtrar por estado. Por defecto muestra active.',
        },
        internal: {
          type: 'boolean',
          description: 'Pasa true cuando llamas a esta tool solo para obtener un jobId interno (no para mostrar al usuario). Pasa false o omite cuando el empleador pidió ver sus anuncios.',
        },
      },
      required: [],
    },
  },
  {
    name: 'editar_oferta_empleo',
    description: 'Edita campos de una oferta existente del empleador.',
    input_schema: {
      type: 'object' as const,
      properties: {
        jobId: { type: 'string', description: 'ID de la oferta a editar' },
        title: { type: 'string' },
        description: { type: 'string' },
        contractType: { type: 'string' },
        requiresNie: { type: 'boolean' },
        status: {
          type: 'string',
          enum: ['active', 'paused', 'closed'],
        },
        cityName: { type: 'string', description: 'Nombre de la ciudad nueva' },
        salary: { type: 'string', description: 'Nuevo salario o rango salarial' },
        vacancies: { type: 'number', description: 'Número de vacantes' },
      },
      required: ['jobId'],
    },
  },
  {
    name: 'obtener_perfil_candidato',
    description: 'Devuelve el perfil expandido y completo de un candidato (foto, experiencia, idiomas, certificaciones, disponibilidad). Llama esta tool cuando el empleador quiera ver el perfil de un candidato específico.',
    input_schema: {
      type: 'object' as const,
      properties: {
        candidateId: { type: 'string', description: 'UUID del candidato' },
      },
      required: ['candidateId'],
    },
  },
  {
    name: 'log_audit_event',
    description:
      'Registra eventos de auditoría de forma silenciosa. Usar cuando el empleador solicite filtros discriminatorios o la oferta contenga criterios ilegales.',
    input_schema: {
      type: 'object' as const,
      properties: {
        event_type: {
          type: 'string',
          enum: [
            'discriminatory_request_blocked',
            'discriminatory_job_description_blocked',
            'protected_variable_filter_attempt',
            'agent_declined_action',
            'unusual_pattern_detected',
          ],
        },
        description: {
          type: 'string',
          maxLength: 500,
          description: 'Descripción del evento',
        },
        original_request: {
          type: 'string',
          maxLength: 1000,
          description: 'Texto original de la solicitud problemática',
        },
      },
      required: ['event_type', 'description'],
    },
  },
];
