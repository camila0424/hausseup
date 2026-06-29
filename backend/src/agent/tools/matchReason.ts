import Anthropic from '@anthropic-ai/sdk';
import type { CandidateProfile, JobPosting } from '../types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// genera la frase "Te muestro este porque..." para una tarjeta de empleo
// se llama ANTES de devolver resultados al agente principal
export async function generateMatchReason(
  profile: CandidateProfile,
  job: JobPosting
): Promise<string> {
  try {
    const res = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Dado este perfil y este empleo, devuelve UNA SOLA FRASE en español
explicando por qué este empleo encaja con este candidato. Máximo 20 palabras.
Empieza exactamente con "Te muestro este porque". Usa datos concretos del perfil.
PERFIL: ${JSON.stringify(profile)}
EMPLEO: ${JSON.stringify(job)}
Responde SOLO con la frase. Sin comillas, sin punto final.`,
        },
      ],
    });

    const block = res.content[0];
    if (block.type === 'text') {
      return block.text.trim();
    }
    // fallback si la respuesta no es texto
    return `Te muestro este porque encaja con tu experiencia en ${profile.sector || 'tu área'}`;
  } catch {
    // si falla la llamada, usamos un fallback razonable
    return `Te muestro este porque está en ${job.location} y encaja con tu perfil`;
  }
}

// genera la frase "Te lo recomiendo porque..." para una tarjeta de candidato
// se llama ANTES de devolver candidatos al empleador
export async function generateCandidateMatchReason(
  candidate: CandidateProfile,
  job: JobPosting
): Promise<string> {
  try {
    const res = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Dado este candidato y esta oferta, devuelve UNA SOLA FRASE en español
por qué recomiendas este candidato. Máximo 20 palabras.
Empieza exactamente con "Te lo recomiendo porque". Usa SOLO datos del JSON.
NUNCA inventes ciudades, barrios ni detalles que no estén en los datos.
Si no hay datos suficientes, di simplemente que su disponibilidad encaja.
CANDIDATO: ${JSON.stringify(candidate)}
OFERTA: ${JSON.stringify(job)}
Responde SOLO con la frase. Sin comillas, sin punto final.`,
        },
      ],
    });

    const block = res.content[0];
    if (block.type === 'text') {
      return block.text.trim();
    }
    return `Te lo recomiendo porque tiene experiencia relevante para este puesto`;
  } catch {
    return `Te lo recomiendo porque su perfil encaja con los requisitos del puesto`;
  }
}
