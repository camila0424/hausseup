import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface JobPostingCardProps {
  job: {
    id: string;
    title: string;
    description?: string;
    city_name?: string;
    city_id?: string | number;
    contract_type?: string;
    salary?: string;
    paperwork?: string;
    requires_nie?: boolean;
    applications_count: number;
    created_at: string;
  };
  onEdit: (jobId: string, jobTitle: string) => void;
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatContractType(raw?: string): string {
  const map: Record<string, string> = {
    full_time: 'Tiempo completo',
    part_time: 'Media jornada',
    temporary: 'Temporal',
    freelance: 'Autónomo / Freelance',
    internship: 'Prácticas',
  };
  return raw ? (map[raw] ?? raw) : 'Ver anuncio';
}

function JobPostingCard({ job, onEdit }: JobPostingCardProps) {
  const [cityName, setCityName] = useState(job.city_name || '');
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (job.city_id && !job.city_name) {
      fetch(`${import.meta.env.VITE_API_URL}/cities/${job.city_id}`)
        .then(r => r.json())
        .then(data => setCityName(data.name || String(job.city_id)))
        .catch(() => setCityName(String(job.city_id)));
    }
  }, [job.city_id]);

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(31,42,68,0.08)',
        padding: '20px',
        width: '260px',
        minWidth: '260px',
        maxWidth: '260px',
        boxSizing: 'border-box',
        marginBottom: '8px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <h3
        style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#1F2A44',
          margin: '0 0 14px',
          lineHeight: '1.3',
        }}
      >
        {job.title}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
        <p style={rowStyle}>
          <span style={labelStyle}>Ciudad:</span>{' '}
          <span style={valueStyle}>{cityName || 'Ver anuncio'}</span>
        </p>
        <p style={rowStyle}>
          <span style={labelStyle}>Contrato:</span>{' '}
          <span style={valueStyle}>{formatContractType(job.contract_type)}</span>
        </p>
        <p style={rowStyle}>
          <span style={labelStyle}>Salario:</span>{' '}
          <span style={valueStyle}>{job.salary || 'A negociar'}</span>
        </p>
        <p style={rowStyle}>
          <span style={labelStyle}>Documentación:</span>{' '}
          <span style={valueStyle}>
            {job.paperwork || (job.requires_nie ? 'NIE requerido' : 'Sin requisito de NIE')}
          </span>
        </p>
        <p style={rowStyle}>
          <span style={labelStyle}>Candidaturas:</span>{' '}
          <span style={valueStyle}>{job.applications_count}</span>
        </p>
        <p style={rowStyle}>
          <span style={labelStyle}>Publicada:</span>{' '}
          <span style={valueStyle}>{formatDate(job.created_at)}</span>
        </p>
      </div>

      {job.description && (
        <p style={{
          fontSize: '13px',
          color: '#4B4B4B',
          margin: '0 0 12px',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}>
          {job.description}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
        <button
          onClick={() => setShowFullDescription(true)}
          style={{
            padding: '7px 12px',
            background: 'transparent',
            color: '#C1502E',
            border: '1px solid #C1502E',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Ver más
        </button>
        <button
          onClick={() => onEdit(job.id, job.title)}
          style={{
            padding: '7px 16px',
            background: '#C1502E',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Editar
        </button>
      </div>

      {showFullDescription && createPortal(
        <div
          onClick={() => setShowFullDescription(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(31, 42, 68, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 10px 40px rgba(31, 42, 68, 0.2)',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2A44', margin: '0 0 16px' }}>
              {job.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <span style={{ fontWeight: '700', color: '#1F2A44' }}>Ciudad:</span>{' '}
                <span style={{ color: '#4B4B4B' }}>{cityName || 'Por confirmar'}</span>
              </p>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <span style={{ fontWeight: '700', color: '#1F2A44' }}>Salario:</span>{' '}
                <span style={{ color: '#4B4B4B' }}>{job.salary || 'A negociar'}</span>
              </p>
            </div>
            {job.description && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1F2A44', margin: '0 0 8px' }}>
                  Descripción
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#4B4B4B', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {job.description}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowFullDescription(false)}
                style={{
                  padding: '8px 20px',
                  background: '#1F2A44',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  lineHeight: '1.4',
};

const labelStyle: React.CSSProperties = {
  fontWeight: '700',
  color: '#1F2A44',
};

const valueStyle: React.CSSProperties = {
  color: '#4B4B4B',
};

export default JobPostingCard;
