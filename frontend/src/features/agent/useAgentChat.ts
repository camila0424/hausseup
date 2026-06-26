import { useState, useCallback, useRef } from 'react';
import type { AgentCard, PendingAction } from '../../types/agent';

// un mensaje en el hilo conversacional puede ser texto o una tarjeta inline
export type ChatMessage =
  | { id: string; type: 'text'; role: 'user' | 'agent'; content: string }
  | { id: string; type: 'card'; card: AgentCard };

interface UseAgentChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  pendingAction: PendingAction | null;
  sendMessage: (text: string) => Promise<void>;
  confirmAction: (confirmed: boolean) => Promise<void>;
  inputValue: string;
  setInputValue: (v: string) => void;
}

export function useAgentChat(): UseAgentChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [inputValue, setInputValue] = useState('');

  // useRef para que las callbacks no tengan dependencias desactualizadas
  const pendingActionRef = useRef<PendingAction | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  // añade un mensaje al hilo
  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      messagesRef.current = next;
      return next;
    });
  }, []);

  // genera un ID único simple para cada mensaje
  const nextId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // envía un mensaje al backend y procesa la respuesta
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      // __init__, __silent__ y __jobid:UUID__ son señales silenciosas que no muestran burbuja raw
      const displayText = text.replace(/^__jobid:[^_]+__/, '').replace('__silent__', '').trim();

      if (text.trim() !== '__init__') {
        addMessage({
          id: nextId(),
          type: 'text',
          role: 'user',
          content: displayText || text.trim(),
        });
      }

      setIsLoading(true);
      setInputValue('');

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/agent/message`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              message: text.trim(), // __jobid:UUID__ se deja para que Claude lo lea
              history: messagesRef.current
                .filter((m): m is Extract<ChatMessage, { type: 'text' }> => m.type === 'text')
                .map((m) => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.content })),
            }),
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        // mostrar texto del agente solo si no viene acompañado de cards
        // (cuando hay cards, el contenido ya se representa en las tarjetas)
        if (data.message) {
          addMessage({
            id: nextId(),
            type: 'text',
            role: 'agent',
            content: data.message,
          });
        }

        // reemplazar tarjetas del mismo tipo para evitar acumulación
        if (data.cards && Array.isArray(data.cards) && data.cards.length > 0) {
          setMessages(prev => {
            const sinCardsViejas = prev.filter(m =>
              m.type !== 'card' || m.card.type !== data.cards[0].type
            );
            const nuevasCards = data.cards.map((card: AgentCard) => ({
              id: `card-${Date.now()}-${Math.random()}`,
              type: 'card' as const,
              card,
            }));
            const next = [...sinCardsViejas, ...nuevasCards];
            messagesRef.current = next;
            return next;
          });
        }

        // guardar la acción pendiente si existe
        if (data.pendingAction) {
          pendingActionRef.current = data.pendingAction;
          setPendingAction(data.pendingAction);
        }
      } catch (err) {
        console.error('[useAgentChat] Error al enviar mensaje:', err);
        addMessage({
          id: nextId(),
          type: 'text',
          role: 'agent',
          content:
            'Tuve un problema de conexión. ¿Puedes intentarlo de nuevo?',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, addMessage]
  );

  // confirma o cancela la acción pendiente actual
  const confirmAction = useCallback(async (confirmed: boolean) => {
    const action = pendingActionRef.current;
    if (!action) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/agent/confirm-action`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pendingActionId: action.id,
            confirmed,
          }),
        }
      );

      const data = await res.json();

      // mostrar la respuesta de la confirmación como mensaje del agente
      addMessage({
        id: `msg-${Date.now()}`,
        type: 'text',
        role: 'agent',
        content: data.message || (confirmed ? 'Hecho ✓' : 'De acuerdo, no hago nada.'),
      });
    } catch (err) {
      console.error('[useAgentChat] Error al confirmar acción:', err);
    } finally {
      // limpiar la acción pendiente independientemente del resultado
      pendingActionRef.current = null;
      setPendingAction(null);
    }
  }, [addMessage]);

  return {
    messages,
    isLoading,
    pendingAction,
    sendMessage,
    confirmAction,
    inputValue,
    setInputValue,
  };
}
