import type { CandidateCardData } from '../../types/agent';

interface CandidateCardProps {
  candidate: CandidateCardData;
  onInterested: () => void;
  onPass: () => void;
  onViewFullProfile: () => void;
}

// color de la barra según el score
function getScoreColor(score: number): string {
  if (score >= 80) return '#2E7D5B'; // verde éxito
  if (score >= 50) return '#E8A33D'; // ámbar
  return '#C1502E';                   // terracota
}

// texto legible del estado migratorio
function migrationLabel(status: CandidateCardData['migrationStatus']): string {
  const labels: Record<string, string> = {
    documented: '✅ Documentado/a',
    in_process: '⏳ En trámite',
    tourist: '🔄 Turista',
    undocumented: 'Sin papeles',
    hidden: '📞 Consultar con el candidato',
  };
  return labels[status] || status;
}

function CandidateCard({ candidate, onInterested, onPass, onViewFullProfile }: CandidateCardProps) {
  // regla dura: no renderizar si faltan datos de match
  if (!candidate.matchScore || !candidate.matchReason) return null;

  const scoreColor = getScoreColor(candidate.matchScore);

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #D4D4D4',
        borderRadius: '20px',
        boxShadow: '0 1px 3px rgba(31,42,68,0.08), 0 4px 12px rgba(31,42,68,0.04)',
        padding: '16px',
        width: '100%',
        marginBottom: '8px',
      }}
    >
      {/* ── cabecera: foto y nombre ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        {candidate.photo ? (
          <img
            src={candidate.photo}
            alt={candidate.name}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          // avatar inicial si no hay foto
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#1F2A44',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '18px',
            }}
          >
            {candidate.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2A44', margin: '0 0 2px' }}>
            {candidate.name}
          </h3>
          <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
            📍 {candidate.city}
            {candidate.distanceKm !== undefined && ` · ${candidate.distanceKm} km`}
            {candidate.age && ` · ${candidate.age} años`}
          </p>
        </div>
      </div>

      {/* ── barra de match score ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div
          style={{
            flex: 1,
            height: '6px',
            background: '#D4D4D4',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${candidate.matchScore}%`,
              height: '100%',
              background: scoreColor,
              borderRadius: '9999px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <span
          style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1F2A44',
            minWidth: '2.5rem',
            textAlign: 'right',
          }}
        >
          {candidate.matchScore}
        </span>
      </div>

      {/* ── frase de match reason ── */}
      <p
        style={{
          fontSize: '13px',
          color: '#C1502E',
          fontStyle: 'italic',
          margin: '0 0 12px',
          lineHeight: '1.4',
        }}
      >
        {candidate.matchReason}
      </p>

      {/* ── resumen de experiencia ── */}
      <p
        style={{
          fontSize: '13px',
          color: '#4B4B4B',
          margin: '0 0 12px',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}
      >
        {candidate.experienceSummary}
      </p>

      {/* ── badges de detalles ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {candidate.languages.map((lang) => (
          <span key={lang} style={badgeStyle}>
            🌐 {lang}
          </span>
        ))}
        <span style={badgeStyle}>⏰ {candidate.availability}</span>
        <span
          style={{
            ...badgeStyle,
            // el estado migratorio se muestra más tenue si está oculto
            opacity: candidate.migrationStatus === 'hidden' ? 0.7 : 1,
          }}
        >
          {migrationLabel(candidate.migrationStatus)}
        </span>
      </div>

      {/* ── botones de acción ── */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={onInterested}
          style={{
            flex: 1,
            padding: '10px 0',
            background: '#E8A33D',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Contactar
        </button>
        <button
          onClick={onPass}
          style={{
            flex: 1,
            padding: '10px 0',
            background: '#F5F5F5',
            color: '#4B4B4B',
            border: 'none',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          No encaja
        </button>
        <button
          onClick={onViewFullProfile}
          style={{
            padding: '10px 0',
            background: 'transparent',
            color: '#C1502E',
            border: 'none',
            fontWeight: '500',
            fontSize: '13px',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Ver perfil
        </button>
      </div>
    </div>
  );
}

const badgeStyle: React.CSSProperties = {
  fontSize: '12px',
  padding: '3px 8px',
  background: '#F5F5F5',
  color: '#4B4B4B',
  borderRadius: '9999px',
};

export default CandidateCard;
