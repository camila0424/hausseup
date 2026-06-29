import Anthropic from '@anthropic-ai/sdk';

// tools que el Agente Compañero puede usar
// estas definiciones se pasan directamente a la API de Anthropic
export const COMPANION_TOOLS: Anthropic.Tool[] = [
  {
    name: 'buscar_empleos',
    description:
      'Busca empleos relevantes para el candidato basándose en su perfil, ciudad, sector y preferencias. Devuelve una lista de empleos rankeados por relevancia.',
    input_schema: {
      type: 'object' as const,
      properties: {
        city: {
          type: 'string',
          description: 'Ciudad donde busca empleo el candidato',
        },
        sector: {
          type: 'string',
          description:
            'Sector o tipo de trabajo (ej: hostelería, limpieza, construcción, cuidados)',
        },
        contractType: {
          type: 'string',
          description: 'Tipo de contrato preferido (indefinido, temporal, prácticas)',
        },
        limit: {
          type: 'number',
          description: 'Número máximo de resultados (por defecto 3)',
        },
      },
      required: [],
    },
  },
  {
    name: 'obtener_perfil',
    description: 'Obtiene el perfil actual del candidato desde la base de datos.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'actualizar_perfil',
    description:
      'Actualiza datos del perfil del candidato de forma silenciosa durante el onboarding. Llamar cada vez que el usuario proporcione información nueva sobre sí mismo.',
    input_schema: {
      type: 'object' as const,
      properties: {
        city: { type: 'string', description: 'Ciudad actual del candidato' },
        migrationStatus: {
          type: 'string',
          enum: ['documented', 'in_process', 'tourist', 'undocumented'],
          description: 'Situación migratoria del candidato',
        },
        sector: { type: 'string', description: 'Sector o área de experiencia laboral' },
        experienceSummary: {
          type: 'string',
          description: 'Resumen de experiencia profesional extraído de la conversación',
        },
        languages: {
          type: 'array',
          items: { type: 'string' },
          description: 'Idiomas que habla el candidato',
        },
        salaryExpectation: {
          type: 'string',
          description: 'Expectativa salarial (ej: "1200-1500 euros/mes")',
        },
        availability: {
          type: 'string',
          description: 'Disponibilidad horaria (ej: "tardes y fines de semana")',
        },
        extraInfo: {
          type: 'string',
          description: 'Información adicional que el candidato quiere que sepan los empleadores',
        },
      },
      required: [],
    },
  },
  {
    name: 'aplicar_a_empleo',
    description:
      'Envía la candidatura del usuario a un empleo específico. SOLO llamar después de confirmación explícita del usuario. Esta acción activa el flujo HITL de confirmación.',
    input_schema: {
      type: 'object' as const,
      properties: {
        jobId: {
          type: 'number',
          description: 'ID del empleo al que se quiere aplicar',
        },
        jobTitle: {
          type: 'string',
          description: 'Título del puesto (para mostrar en el modal de confirmación)',
        },
        companyName: {
          type: 'string',
          description: 'Nombre de la empresa (para mostrar en el modal de confirmación)',
        },
      },
      required: ['jobId', 'jobTitle', 'companyName'],
    },
  },
  {
    name: 'mis_candidaturas',
    description:
      'Obtiene la lista de candidaturas enviadas por el usuario y su estado actual.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'guardar_empleo',
    description:
      'Guarda un empleo en la lista de favoritos del usuario para consultarlo más tarde.',
    input_schema: {
      type: 'object' as const,
      properties: {
        jobId: {
          type: 'number',
          description: 'ID del empleo a guardar',
        },
      },
      required: ['jobId'],
    },
  },
  {
    name: 'guardar_profesion',
    description: 'Guarda una profesión del worker con su experiencia.',
    input_schema: {
      type: 'object' as const,
      properties: {
        professionName: { type: 'string' },
        yearsExperience: { type: 'number' },
        hasTitle: { type: 'boolean' },
        titleHomologated: { type: 'boolean' },
        description: { type: 'string' },
        isPrimary: { type: 'boolean', description: 'true si es la profesión principal del worker' },
      },
      required: ['professionName'],
    },
  },
  {
    name: 'guardar_idioma',
    description: 'Guarda un idioma que habla el worker con su nivel.',
    input_schema: {
      type: 'object' as const,
      properties: {
        language: { type: 'string' },
        level: { type: 'string', enum: ['básico', 'intermedio', 'avanzado', 'nativo'] },
      },
      required: ['language', 'level'],
    },
  },
  {
    name: 'guardar_certificacion',
    description: 'Guarda una certificación o carnet del worker (carnet de conducir, manipulador de alimentos, etc.).',
    input_schema: {
      type: 'object' as const,
      properties: {
        certificationName: { type: 'string' },
        details: { type: 'string' },
      },
      required: ['certificationName'],
    },
  },
  {
    name: 'guardar_disposicion_profesion',
    description: 'Guarda una profesión a la que el worker estaría dispuesto a entrar aunque no tenga experiencia.',
    input_schema: {
      type: 'object' as const,
      properties: {
        professionName: { type: 'string' },
      },
      required: ['professionName'],
    },
  },
  {
    name: 'guardar_disponibilidad',
    description: 'Guarda datos generales de disponibilidad y situación del worker. Puede recibir varios campos a la vez.',
    input_schema: {
      type: 'object' as const,
      properties: {
        schedule: { type: 'string', description: 'mañanas, tardes, noches, jornada completa, parcial, fines de semana, etc.' },
        startDate: { type: 'string', description: 'desde cuándo puede empezar' },
        acceptsRelocation: { type: 'boolean' },
        maxCommuteKm: { type: 'number' },
        migrationStatus: { type: 'string', enum: ['documentado', 'en_tramite', 'turista', 'sin_papeles'] },
        timeInSpain: { type: 'string' },
        shortIntro: { type: 'string', description: 'frase corta de presentación del worker' },
      },
    },
  },
  {
    name: 'log_audit_event',
    description:
      'Registra eventos de auditoría de forma silenciosa. Usar cuando se detecte una solicitud discriminatoria, el agente decline una acción por razones éticas, o se detecte comportamiento inusual.',
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
