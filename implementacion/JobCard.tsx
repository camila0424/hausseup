import type { JobCardData } from '../../types/agent';

interface JobCardProps {
  job: JobCardData;
  onInterested: () => void;
  onPass: () => void;
  onLearnMore: () => void;
}

// color de la barra según el score — igual que en el doc maestro
function getScoreColor(score: number): string {
  if (score >= 80) return '#2E7D5B'; // verde éxito
  if (score >= 50) return '#E8A33D'; // ámbar
  return '#C1502E';                   // terracota
}

// texto del requisito de papeles legible para el usuario
function paperworkLabel(req: JobCardData['paperworkRequired']): string {
  if (req === 'none') return 'Sin papeles, OK';
  if (req === 'in_process_ok') return 'En trámite, OK';
  return 'Documentación completa';
}

function JobCard({ job, onInterested, onPass, onLearnMore }: JobCardProps) {
  // regla dura del doc maestro: no renderizar si faltan datos de match
  if (!job.matchScore || !job.matchReason) return null;

  const scoreColor = getScoreColor(job.matchScore);

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
      {/* ── cabecera: empresa y título ── */}
      <div style={{ marginBottom: '12px' }}>
        {job.companyLogo && (
          <img
            src={job.companyLogo}
            alt={job.company}
            style={{ width: '36px', height: '36px', borderRadius: '8px', marginBottom: '8px', objectFit: 'cover' }}
          />
        )}
        <p style={{ fontSize: '12px', color: '#6B6B6B', margin: '0 0 2px' }}>
          {job.company}
        </p>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#1F2A44',
            margin: '0 0 4px',
          }}
        >
          {job.title}
        </h3>
        <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
          📍 {job.location}
          {job.distanceKm !== undefined && ` · ${job.distanceKm} km`}
        </p>
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
              width: `${job.matchScore}%`,
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
          {job.matchScore}
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
        {job.matchReason}
      </p>

      {/* ── detalles del empleo ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginBottom: '12px',
        }}
      >
        {job.salary && (
          <span style={badgeStyle}>💰 {job.salary}</span>
        )}
        {job.schedule && (
          <span style={badgeStyle}>🕐 {job.schedule}</span>
        )}
        {job.contractType && (
          <span style={badgeStyle}>📄 {job.contractType}</span>
        )}
        <span
          style={{
            ...badgeStyle,
            background: job.paperworkRequired === 'required' ? '#FEE2E2' : '#D1FAE5',
            color: job.paperworkRequired === 'required' ? '#991B1B' : '#065F46',
          }}
        >
          {paperworkLabel(job.paperworkRequired)}
        </span>
      </div>

      {/* ── descripción recortada ── */}
      <p
        style={{
          fontSize: '13px',
          color: '#4B4B4B',
          margin: '0 0 16px',
          lineHeight: '1.5',
          // limitar a 3 líneas con clip
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}
      >
        {job.description}
      </p>

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
          Me interesa
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
          No, gracias
        </button>
        <button
          onClick={onLearnMore}
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
          Cuéntame más
        </button>
      </div>
    </div>
  );
}

// estilo compartido para los badges de detalle
const badgeStyle: React.CSSProperties = {
  fontSize: '12px',
  padding: '3px 8px',
  background: '#F5F5F5',
  color: '#4B4B4B',
  borderRadius: '9999px',
};

export default JobCard;
