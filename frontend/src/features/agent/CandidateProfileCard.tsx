import { createPortal } from 'react-dom';

interface CandidateProfileCardProps {
  candidate: {
    id: string;
    name: string;
    photo?: string;
    city: string;
    shortIntro?: string;
    migrationStatus?: string;
    timeInSpain?: string;
    availability?: string;
    availabilityStartDate?: string;
    acceptsRelocation?: boolean;
    maxCommuteKm?: number;
    professions?: Array<{
      name: string;
      yearsExperience?: number;
      hasTitle?: boolean;
      titleHomologated?: boolean;
      description?: string;
    }>;
    openToProfessions?: string[];
    languages?: Array<{ language: string; level: string }>;
    certifications?: Array<{ name: string; details?: string }>;
  };
  onClose: () => void;
  onContact: () => void;
}

function CandidateProfileCard({ candidate, onClose, onContact }: CandidateProfileCardProps) {
  return createPortal(
    <div
      onClick={onClose}
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
          maxWidth: '560px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(31, 42, 68, 0.2)',
        }}
      >
        {/* foto grande + nombre + ciudad */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
          {candidate.photo ? (
            <img
              src={candidate.photo}
              alt={candidate.name}
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: '#1F2A44', color: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', fontWeight: '700',
            }}>
              {candidate.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1F2A44', margin: '0 0 4px' }}>
              {candidate.name}
            </h2>
            <p style={{ fontSize: '14px', color: '#6B6B6B', margin: 0 }}>
              {candidate.city}
              {candidate.timeInSpain && ` · ${candidate.timeInSpain} en España`}
            </p>
          </div>
        </div>

        {candidate.shortIntro && (
          <p style={{ fontSize: '15px', color: '#4B4B4B', fontStyle: 'italic', margin: '0 0 20px', lineHeight: '1.5' }}>
            "{candidate.shortIntro}"
          </p>
        )}

        {/* profesiones */}
        {candidate.professions && candidate.professions.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={sectionTitleStyle}>Experiencia profesional</h3>
            {candidate.professions.map((p, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', color: '#1F2A44' }}>
                  {p.name}
                  {p.yearsExperience !== undefined && ` · ${p.yearsExperience} años`}
                </p>
                {p.hasTitle && (
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#4B4B4B' }}>
                    Título: {p.titleHomologated ? 'homologado en España' : 'no homologado'}
                  </p>
                )}
                {p.description && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#4B4B4B', lineHeight: '1.5' }}>
                    {p.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* abierto a otras profesiones */}
        {candidate.openToProfessions && candidate.openToProfessions.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={sectionTitleStyle}>También dispuesto/a a trabajar en</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {candidate.openToProfessions.map((p, i) => (
                <span key={i} style={badgeStyle}>{p}</span>
              ))}
            </div>
          </div>
        )}

        {/* idiomas */}
        {candidate.languages && candidate.languages.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={sectionTitleStyle}>Idiomas</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {candidate.languages.map((l, i) => (
                <span key={i} style={badgeStyle}>{l.language} ({l.level})</span>
              ))}
            </div>
          </div>
        )}

        {/* certificaciones */}
        {candidate.certifications && candidate.certifications.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={sectionTitleStyle}>Certificaciones</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {candidate.certifications.map((c, i) => (
                <span key={i} style={badgeStyle}>
                  {c.name}{c.details ? ` · ${c.details}` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* disponibilidad */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={sectionTitleStyle}>Disponibilidad</h3>
          {candidate.availability && (
            <p style={infoLineStyle}>Horario: {candidate.availability}</p>
          )}
          {candidate.availabilityStartDate && (
            <p style={infoLineStyle}>Inicio: {candidate.availabilityStartDate}</p>
          )}
          {candidate.acceptsRelocation !== undefined && (
            <p style={infoLineStyle}>
              Desplazamiento: {candidate.acceptsRelocation
                ? `acepta hasta ${candidate.maxCommuteKm || '?'} km`
                : 'solo en su ciudad'}
            </p>
          )}
        </div>

        {/* botones */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px', background: 'transparent',
              color: '#1F2A44', border: '1px solid #D4D4D4',
              borderRadius: '9999px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
          <button
            onClick={onContact}
            style={{
              padding: '10px 24px', background: '#E8A33D',
              color: '#FFFFFF', border: 'none',
              borderRadius: '9999px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            Contactar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '14px', fontWeight: '700', color: '#1F2A44',
  margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px',
};

const infoLineStyle: React.CSSProperties = {
  fontSize: '13px', color: '#4B4B4B', margin: '0 0 4px',
};

const badgeStyle: React.CSSProperties = {
  fontSize: '12px', padding: '4px 10px',
  background: '#F5F5F5', color: '#4B4B4B', borderRadius: '9999px',
};

export default CandidateProfileCard;
