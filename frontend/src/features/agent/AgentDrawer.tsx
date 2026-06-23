import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AgentDrawerProps {
  open: boolean;
  onClose: () => void;
  onQuickMessage: (text: string) => void;
}

function AgentDrawer({ open, onClose, onQuickMessage }: AgentDrawerProps) {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      {/* overlay oscuro */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 100,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* panel lateral */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '260px',
          height: '100vh',
          background: '#1F2A44',
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
          transform: open ? 'translateX(0)' : 'translateX(-260px)',
          transition: 'transform 0.25s ease',
        }}
      >
        {/* cabecera del drawer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            marginBottom: '32px',
          }}
        >
          <span
            style={{
              color: '#F7EEE0',
              fontWeight: '700',
              fontSize: '20px',
              fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
              letterSpacing: '-0.5px',
            }}
          >
            Hausseup
          </span>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#F7EEE0',
              fontSize: '20px',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px',
            }}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* opciones de navegación */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
          {usuario?.rol === 'worker' && (
            <DrawerItem
              label="Mis candidaturas"
              icon="📋"
              onClick={() => { onClose(); onQuickMessage('Muéstrame mis candidaturas'); }}
            />
          )}
          {usuario?.rol === 'employer' && (
            <DrawerItem
              label="Mis anuncios"
              icon="💼"
              onClick={() => { onClose(); onQuickMessage('Muéstrame mis anuncios'); }}
            />
          )}
          <DrawerItem label="Ajustes" icon="⚙️" onClick={() => { onClose(); navigate('/ajustes'); }} />
        </nav>

        {/* cerrar sesión al fondo */}
        <div style={{ padding: '0 12px', borderTop: '1px solid rgba(247,238,224,0.1)', paddingTop: '16px' }}>
          <DrawerItem label="Cerrar sesión" icon="🚪" onClick={handleLogout} danger />
        </div>
      </div>
    </>
  );
}

interface DrawerItemProps {
  label: string;
  icon: string;
  onClick: () => void;
  danger?: boolean;
}

function DrawerItem({ label, icon, onClick, danger }: DrawerItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'none',
        border: 'none',
        color: danger ? '#E8A33D' : '#F7EEE0',
        fontSize: '15px',
        fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
        fontWeight: '500',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(247,238,224,0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'none';
      }}
    >
      <span style={{ fontSize: '18px', lineHeight: 1 }}>{icon}</span>
      {label}
    </button>
  );
}

export default AgentDrawer;
