import pool from '../../config/db';

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const VOYAGE_MODEL = process.env.VOYAGE_MODEL || 'voyage-3';
const VOYAGE_URL = 'https://api.voyageai.com/v1/embeddings';

// genera el vector embedding de un texto usando Voyage AI
// devuelve null si falla para no bloquear el flujo
export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!VOYAGE_API_KEY) {
    console.warn('[voyage] VOYAGE_API_KEY no configurada');
    return null;
  }
  if (!text || text.trim().length === 0) return null;

  try {
    const res = await fetch(VOYAGE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VOYAGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: [text.slice(0, 8000)],
        model: VOYAGE_MODEL,
      }),
    });
    if (!res.ok) {
      console.error('[voyage] error HTTP', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data.data?.[0]?.embedding ?? null;
  } catch (err) {
    console.error('[voyage] error generando embedding:', (err as Error).message);
    return null;
  }
}

// calcula similitud coseno entre dos vectores
// devuelve un número entre -1 y 1 (1 = idénticos, 0 = sin relación)
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// guarda o actualiza el embedding de una entidad (worker o job)
export async function upsertEmbedding(
  entityType: 'user_profile' | 'job',
  entityId: string,
  vector: number[]
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO embeddings (entity_type, entity_id, vector, model_version)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (entity_type, entity_id)
       DO UPDATE SET vector = $3, model_version = $4, updated_at = NOW()`,
      [entityType, entityId, JSON.stringify(vector), VOYAGE_MODEL]
    );
  } catch (err) {
    console.error('[voyage] error guardando embedding:', (err as Error).message);
  }
}

// recupera el embedding guardado de una entidad
export async function getEmbedding(
  entityType: 'user_profile' | 'job',
  entityId: string
): Promise<number[] | null> {
  try {
    const { rows } = await pool.query(
      `SELECT vector FROM embeddings WHERE entity_type = $1 AND entity_id = $2`,
      [entityType, entityId]
    );
    if (rows.length === 0) return null;
    return typeof rows[0].vector === 'string' ? JSON.parse(rows[0].vector) : rows[0].vector;
  } catch (err) {
    console.error('[voyage] error leyendo embedding:', (err as Error).message);
    return null;
  }
}

// construye el texto representativo de un worker para embeddings
export function buildWorkerText(profile: {
  name?: string;
  bio?: string;
  shortIntro?: string;
  city?: string;
  professions?: Array<{ name: string; description?: string; yearsExperience?: number }>;
  languages?: Array<{ language: string; level: string }>;
  openToProfessions?: string[];
  certifications?: Array<{ name: string }>;
}): string {
  const parts: string[] = [];
  if (profile.shortIntro) parts.push(profile.shortIntro);
  if (profile.bio) parts.push(profile.bio);
  if (profile.city) parts.push(`Vive en ${profile.city}`);
  if (profile.professions?.length) {
    const profs = profile.professions
      .map(p => `${p.name}${p.yearsExperience ? ` con ${p.yearsExperience} años de experiencia` : ''}${p.description ? `: ${p.description}` : ''}`)
      .join('. ');
    parts.push(`Profesiones: ${profs}`);
  }
  if (profile.openToProfessions?.length) {
    parts.push(`También abierto a: ${profile.openToProfessions.join(', ')}`);
  }
  if (profile.languages?.length) {
    parts.push(`Idiomas: ${profile.languages.map(l => `${l.language} (${l.level})`).join(', ')}`);
  }
  if (profile.certifications?.length) {
    parts.push(`Certificaciones: ${profile.certifications.map(c => c.name).join(', ')}`);
  }
  return parts.join('. ');
}

// construye el texto representativo de un job para embeddings
export function buildJobText(job: {
  title: string;
  description?: string;
  cityName?: string;
  contractType?: string;
  requiresNie?: boolean;
}): string {
  const parts: string[] = [];
  parts.push(job.title);
  if (job.description) parts.push(job.description);
  if (job.cityName) parts.push(`Ubicación: ${job.cityName}`);
  if (job.contractType) parts.push(`Contrato: ${job.contractType}`);
  if (job.requiresNie !== undefined) parts.push(job.requiresNie ? 'Requiere NIE' : 'No requiere NIE');
  return parts.join('. ');
}
