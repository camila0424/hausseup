import { useEffect, useRef, useState } from 'react';
import type { JobCardData, CandidateCardData } from '../../types/agent';
import { useAgentChat } from './useAgentChat';
import MessageBubble from './MessageBubble';
import JobCard from './JobCard';
import JobPostingCard from './JobPostingCard';
import CandidateCard from './CandidateCard';
import ActionConfirmModal from './ActionConfirmModal';
import AgentDrawer from './AgentDrawer';

// pantalla del empleador: /agente (cuando el rol es 'employer')
// misma estructura que CompanionFeed pero con header diferente y mensaje de bienvenida distinto
function RecruiterFeed() {
  const {
    messages,
    isLoading,
    pendingAction,
    sendMessage,
    confirmAction,
    inputValue,
    setInputValue,
  } = useAgentChat();

  const agentName = 'Pablo';
  const agentAvatar = '/img/pablo.jpeg';

  const [drawerOpen, setDrawerOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // el agente habla primero al montar
  useEffect(() => {
    sendMessage('__init__');
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        height: '100dvh',
        background: '#F7EEE0',
        fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
        position: 'relative',
      }}
    >
      {/* ── HEADER ── */}
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
        <button
          onClick={() => setDrawerOpen(true)}
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

        <span style={{ color: '#F7EEE0', fontWeight: '600', fontSize: '15px' }}>
          Chat con {agentName}, tu agente de contratación
        </span>

        <img
          src={agentAvatar}
          alt="Avatar de Pablo"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* ── THREAD ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          paddingBottom: '8px',
        }}
      >
        {messages.length === 0 && !isLoading && (
          <div
            style={{
              textAlign: 'center',
              color: '#6B6B6B',
              marginTop: '40px',
              fontSize: '14px',
            }}
          >
            <p>💼 Cuéntame qué perfil necesitas contratar</p>
          </div>
        )}

        {(() => {
          const elements: React.ReactNode[] = [];
          let i = 0;
          while (i < messages.length) {
            const msg = messages[i];
            // agrupar posting cards consecutivas en scroll horizontal
            if (
              msg.type === 'card' &&
              msg.card.type === 'job' &&
              (msg.card.data as any).applications_count !== undefined
            ) {
              const group: typeof messages = [];
              while (
                i < messages.length &&
                messages[i].type === 'card' &&
                (messages[i] as any).card?.type === 'job' &&
                (messages[i] as any).card?.data?.applications_count !== undefined
              ) {
                group.push(messages[i]);
                i++;
              }
              elements.push(
                <div
                  key={`group-${group[0].id}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '12px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    marginBottom: '8px',
                  }}
                >
                  {group.map((gMsg) => {
                    const jobData = (gMsg as any).card.data as any;
                    return (
                      <div key={gMsg.id} style={{ flexShrink: 0 }}>
                        <JobPostingCard
                          job={{
                            id: jobData.id,
                            title: jobData.title,
                            description: jobData.description,
                            city_name: jobData.city_name || jobData.location,
                            city_id: jobData.city_id,
                            contract_type: jobData.contractType || jobData.contract_type,
                            salary: jobData.salary,
                            paperwork: jobData.paperworkRequired,
                            requires_nie: jobData.requires_nie,
                            applications_count: jobData.applications_count,
                            created_at: jobData.created_at,
                          }}
                          onEdit={(jobId, jobTitle) =>
                            sendMessage(`__jobid:${jobId}__Quiero editar el anuncio "${jobTitle}"`)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              );
              continue;
            }

            // resto de mensajes: texto, candidatos, job cards normales
            if (msg.type === 'text') {
              // saltar mensajes de contexto interno (empiezan y terminan con corchetes)
              const isContextMessage = msg.content.startsWith('[') && msg.content.endsWith(']');
              if (!isContextMessage) {
                elements.push(
                  <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
                );
              }
            } else if (msg.type === 'card' && msg.card.type === 'job') {
              elements.push(
                <div key={msg.id} style={{ marginBottom: '8px' }}>
                  <JobCard
                    job={msg.card.data}
                    onInterested={() =>
                      sendMessage(`Confirmo la oferta de ${(msg.card.data as JobCardData).title}`)
                    }
                    onPass={() =>
                      sendMessage(`Quiero modificar la oferta de ${(msg.card.data as JobCardData).title}`)
                    }
                    onLearnMore={() =>
                      sendMessage(`Muéstrame los candidatos para ${(msg.card.data as JobCardData).title}`)
                    }
                  />
                </div>
              );
            } else if (msg.type === 'card' && msg.card.type === 'candidate') {
              elements.push(
                <div key={msg.id} style={{ marginBottom: '8px' }}>
                  <CandidateCard
                    candidate={msg.card.data}
                    onInterested={() => {
                      const c = msg.card.data as CandidateCardData;
                      sendMessage(`Quiero contactar a ${c.name} (id: ${(c as any).id})`);
                    }}
                    onPass={() => {
                      const c = msg.card.data as CandidateCardData;
                      sendMessage(`${c.name} (id: ${(c as any).id}) no encaja con lo que busco`);
                    }}
                    onViewFullProfile={() =>
                      sendMessage(`Ver perfil completo de ${(msg.card.data as CandidateCardData).name}`)
                    }
                  />
                </div>
              );
            }
            i++;
          }
          return elements;
        })()}

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

        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
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
          placeholder="Describe el perfil que buscas..."
          disabled={false}
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
          disabled={!inputValue.trim()}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: inputValue.trim() ? '#E8A33D' : '#D4D4D4',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputValue.trim() ? 'pointer' : 'default',
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

      {pendingAction && (
        <ActionConfirmModal
          action={pendingAction}
          onConfirm={() => confirmAction(true)}
          onCancel={() => confirmAction(false)}
        />
      )}

      <AgentDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onQuickMessage={sendMessage} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

export default RecruiterFeed;
