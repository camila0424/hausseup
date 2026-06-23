import type { PendingAction } from '../../types/agent';
import { ACTION_COPY } from '../../types/agent';

interface ActionConfirmModalProps {
  action: PendingAction;
  onConfirm: () => void;
  onCancel: () => void;
}

// reemplaza placeholders en el texto con datos del contexto de la acción
// ejemplo: "{companyName}" → "Mercadona"
function interpolate(template: string, context: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(context[key] || ''));
}

function ActionConfirmModal({ action, onConfirm, onCancel }: ActionConfirmModalProps) {
  const copy = ACTION_COPY[action.type];
  if (!copy) return null;

  const isDestructive = copy.destructive === true;

  return (
    // overlay oscuro detrás del modal
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(31, 42, 68, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px',
      }}
    >
      {/* tarjeta del modal — stopPropagation para que el click interno no cierre */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 60px rgba(31,42,68,0.2)',
        }}
      >
        {/* ── título ── */}
        <h2
          style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#1F2A44',
            margin: '0 0 12px',
          }}
        >
          {interpolate(copy.title, action.context)}
        </h2>

        {/* ── descripción ── */}
        <p
          style={{
            fontSize: '14px',
            color: '#4B4B4B',
            lineHeight: '1.5',
            margin: '0 0 24px',
          }}
        >
          {interpolate(copy.body, action.context)}
        </p>

        {/* ── botones: cancelar a la izquierda, confirmar a la derecha ── */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: '#F5F5F5',
              color: '#4B4B4B',
              border: 'none',
              borderRadius: '9999px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {copy.cancel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              // rojo/terracota para acciones destructivas, ámbar para el resto
              background: isDestructive ? '#C1502E' : '#E8A33D',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActionConfirmModal;
