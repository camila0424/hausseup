import { useEffect, useRef } from 'react';
import { useAgentChat } from './useAgentChat';
import MessageBubble from './MessageBubble';
import JobCard from './JobCard';
import CandidateCard from './CandidateCard';
import ActionConfirmModal from './ActionConfirmModal';

// pantalla principal del candidato: /agente
// estructura fija: header 60px + thread scrollable + input 80px
function CompanionFeed() {
  const {
    messages,
    isLoading,
    pendingAction,
    sendMessage,
    confirmAction,
    inputValue,
    setInputValue,
  } = useAgentChat();

  // referencia al final del hilo para hacer scroll automático
  const bottomRef = useRef<HTMLDivElement>(null);

  // hacer scroll al último mensaje cada vez que llega uno nuevo
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // enviar con Enter (sin Shift)
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh', // dvh para móvil con barra de navegación
        background: '#F7EEE0',
        fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
        position: 'relative',
      }}
    >
      {/* ── HEADER 60px fijo ── */}
      <div
        style={{
          height: '60px',
          background: '#1F2A44',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(31,42,68,0.15)',
        }}
      >
        {/* botón de menú (placeholder — conectar con drawer de candidaturas) */}
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#F7EEE0',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
          }}
          aria-label="Menú"
        >
          ☰
        </button>

        <span
          style={{
            color: '#F7EEE0',
            fontWeight: '600',
            fontSize: '15px',
          }}
        >
          tu agente Hausseup
        </span>

        {/* avatar placeholder del agente */}
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: '#C1502E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '14px',
          }}
        >
          H
        </div>
      </div>

      {/* ── THREAD SCROLLABLE ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          // espacio para que el input no tape el último mensaje
          paddingBottom: '8px',
        }}
      >
        {/* si no hay mensajes, mostrar estado vacío */}
        {messages.length === 0 && !isLoading && (
          <div
            style={{
              textAlign: 'center',
              color: '#6B6B6B',
              marginTop: '40px',
              fontSize: '14px',
            }}
          >
            <p>👋 Tu agente te está esperando</p>
          </div>
        )}

        {/* renderizar cada mensaje: texto o tarjeta */}
        {messages.map((msg) => {
          if (msg.type === 'text') {
            return (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
              />
            );
          }

          if (msg.type === 'card') {
            if (msg.card.type === 'job') {
              return (
                <div key={msg.id} style={{ marginBottom: '8px' }}>
                  <JobCard
                    job={msg.card.data}
                    onInterested={() =>
                      sendMessage(
                        `Me interesa el puesto de ${msg.card.data.title} en ${(msg.card.data as { company: string }).company}`
                      )
                    }
                    onPass={() =>
                      sendMessage(`No me interesa ${msg.card.data.title}`)
                    }
                    onLearnMore={() =>
                      sendMessage(`Cuéntame más sobre ${msg.card.data.title}`)
                    }
                  />
                </div>
              );
            }

            if (msg.card.type === 'candidate') {
              return (
                <div key={msg.id} style={{ marginBottom: '8px' }}>
                  <CandidateCard
                    candidate={msg.card.data}
                    onInterested={() =>
                      sendMessage(
                        `Quiero contactar a ${msg.card.data.name}`
                      )
                    }
                    onPass={() =>
                      sendMessage(`${msg.card.data.name} no encaja`)
                    }
                    onViewFullProfile={() =>
                      sendMessage(`Ver perfil completo de ${msg.card.data.name}`)
                    }
                  />
                </div>
              );
            }
          }

          return null;
        })}

        {/* indicador de que el agente está escribiendo */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
            <div
              style={{
                padding: '12px 16px',
                background: '#F7EEE0',
                borderRadius: '18px 18px 18px 4px',
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
              }}
            >
              {/* tres puntos pulsantes */}
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#C1502E',
                    opacity: 0.6,
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ancla para el scroll automático */}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT 80px fijo ── */}
      <div
        style={{
          height: '80px',
          background: '#FFFFFF',
          borderTop: '1px solid #D4D4D4',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe o dale al micro..."
          disabled={isLoading || !!pendingAction}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #D4D4D4',
            borderRadius: '9999px',
            fontSize: '15px',
            color: '#1F2A44',
            background: '#F7EEE0',
            outline: 'none',
          }}
        />
        <button
          onClick={() => sendMessage(inputValue)}
          disabled={!inputValue.trim() || isLoading || !!pendingAction}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: inputValue.trim() && !isLoading ? '#E8A33D' : '#D4D4D4',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputValue.trim() && !isLoading ? 'pointer' : 'default',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
          aria-label="Enviar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M22 2L11 13"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* ── MODAL HITL — aparece encima de todo cuando hay acción pendiente ── */}
      {pendingAction && (
        <ActionConfirmModal
          action={pendingAction}
          onConfirm={() => confirmAction(true)}
          onCancel={() => confirmAction(false)}
        />
      )}

      {/* estilos de animación de los puntos pulsantes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

export default CompanionFeed;
