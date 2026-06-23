# INTEGRACION.md — Cómo conectar los agentes al proyecto real

## Archivos entregados

### Backend (copiar a `backend/src/agent/`)
```
agent/
  types.ts                    ← tipos compartidos
  agent.service.ts            ← loop de orquestación (el corazón)
  agent.controller.ts         ← controlador Express
  agent.routes.ts             ← rutas Express
  memory.repository.ts        ← lee/escribe historial y memoria compactada
  prompts/
    companion.prompt.ts       ← system prompt Compañero
    recruiter.prompt.ts       ← system prompt Selección
  tools/
    companion.tools.ts        ← definición de tools (para la API de Anthropic)
    recruiter.tools.ts        ← definición de tools (para la API de Anthropic)
    handlers.ts               ← ejecuta cada tool contra la BD
    matchReason.ts            ← genera frases de match con Claude
```

### Frontend (copiar a `frontend/src/features/agent/`)
```
features/agent/
  useAgentChat.ts             ← hook de estado del chat
  MessageBubble.tsx           ← burbuja de texto
  JobCard.tsx                 ← tarjeta de empleo inline
  CandidateCard.tsx           ← tarjeta de candidato inline
  ActionConfirmModal.tsx      ← modal HITL
  CompanionFeed.tsx           ← pantalla /agente (candidatos)
  RecruiterFeed.tsx           ← pantalla /agente (empleadores)

types/
  agent.ts                    ← tipos del agente para el frontend
```

---

## Pasos de integración (en este orden)

### 1. Variables de entorno

Añadir a `.env` del backend:
```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
```

Añadir a `.env` del frontend (si no está):
```
VITE_API_URL=https://hausseup-production.up.railway.app/api
```

### 2. Instalar dependencia en el backend

```bash
npm install @anthropic-ai/sdk uuid
npm install --save-dev @types/uuid
```

### 3. Ajustar la importación del pool de BD en `handlers.ts`

En `handlers.ts` línea 7:
```ts
// BUSCAR cómo se exporta el pool en el proyecto real
// puede ser:
import { pool } from '../../config/db';        // opción A
import db from '../../database';               // opción B
import { query } from '../../db';              // opción C
```
Abrir el archivo de base de datos real y usar el export correcto.

### 4. Ajustar la importación de AuthRequest en `agent.controller.ts`

```ts
// BUSCAR dónde está AuthRequest en el proyecto real
import type { AuthRequest } from '../middleware/auth.middleware';
```
Si AuthRequest tiene un nombre diferente, ajustarlo.
AuthRequest debe tener al menos: `userId: number` y `userRole: string`.

### 5. Registrar las rutas en el servidor Express principal

En `backend/src/app.ts` (o `server.ts`, el archivo principal):
```ts
import agentRoutes from './agent/agent.routes';

// añadir junto a las otras rutas
app.use('/api/agent', agentRoutes);
```

### 6. Añadir la ruta `/agente` en el frontend

En `App.tsx` (o donde estén las rutas de React Router):
```tsx
import CompanionFeed from './features/agent/CompanionFeed';
import RecruiterFeed from './features/agent/RecruiterFeed';

// dentro del Router, detectar el rol del usuario
// si es 'worker' → CompanionFeed, si es 'employer' → RecruiterFeed
<Route
  path="/agente"
  element={
    <ProtectedRoute>
      {user?.role === 'employer' ? <RecruiterFeed /> : <CompanionFeed />}
    </ProtectedRoute>
  }
/>
```

### 7. Verificar estructura de tablas en Neon

Antes de arrancar, confirmar que estas tablas existen con estas columnas mínimas:

```sql
-- conversations: necesita conversation_type
SELECT column_name FROM information_schema.columns
WHERE table_name = 'conversations';

-- messages: necesita role, content, conversation_id
SELECT column_name FROM information_schema.columns
WHERE table_name = 'messages';

-- agent_user_memory: debe existir
SELECT column_name FROM information_schema.columns
WHERE table_name = 'agent_user_memory';

-- jobs: necesita status, city_id, company_name, contract_type, paperwork_required
SELECT column_name FROM information_schema.columns
WHERE table_name = 'jobs';

-- users: necesita role, sector, migration_status, experience_summary
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users';
```

Si alguna tabla tiene nombres de columna diferentes (ej: `companyName` en lugar de `company_name`),
ajustar las queries en `handlers.ts`.

### 8. Ajustar queries en `handlers.ts` si los nombres de columna difieren

Las queries asumen snake_case PostgreSQL estándar.
Si el esquema real usa camelCase o nombres distintos, buscar y reemplazar en `handlers.ts`.

---

## Lo que NO necesita cambio

- Los system prompts en `companion.prompt.ts` y `recruiter.prompt.ts` — están listos
- Los tipos en `types.ts` y `frontend/src/types/agent.ts`
- Los componentes de UI (MessageBubble, JobCard, CandidateCard, ActionConfirmModal)
- El hook `useAgentChat.ts`
- El loop de orquestación en `agent.service.ts`

---

## Mensaje de commit sugerido

```
feat(agent): implementar sistema de dos agentes IA

- Agente Compañero (candidatos): onboarding conversacional, matching proactivo,
  candidaturas con confirmación HITL, 7 tools
- Agente de Selección (empleadores): oferta en lenguaje natural, ranking de
  candidatos, agendamiento, 4 tools
- Loop Messages API con tool_use, máx 5 iteraciones
- Memoria dos niveles: historial en conversations/messages + compacta en agent_user_memory
- HITL: Map en memoria con TTL de 10 min, confirmación vía /api/agent/confirm-action
- matchScore y matchReason generados antes de mostrar tarjetas (GAP 1)
- Auditoría EU AI Act: tabla ai_audit_log + tool log_audit_event
- Anti-discriminación en Agente de Selección
- Frontend: CompanionFeed, RecruiterFeed, JobCard, CandidateCard, ActionConfirmModal
```
