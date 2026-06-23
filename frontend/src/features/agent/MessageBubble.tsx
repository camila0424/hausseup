// burbuja de texto para el hilo conversacional
// agente: fondo crema, izquierda
// usuario: fondo azul marino, derecha

interface MessageBubbleProps {
  role: 'user' | 'agent';
  content: string;
}

function MessageBubble({ role, content }: MessageBubbleProps) {
  const isAgent = role === 'agent';

  return (
    <div
      className={`flex w-full ${isAgent ? 'justify-start' : 'justify-end'} mb-3`}
    >
      <div
        style={{
          maxWidth: '80%',
          padding: '12px 16px',
          borderRadius: isAgent
            ? '18px 18px 18px 4px' // esquina inferior izquierda pequeña para el agente
            : '18px 18px 4px 18px', // esquina inferior derecha pequeña para el usuario
          backgroundColor: isAgent ? '#F7EEE0' : '#1F2A44',
          color: isAgent ? '#1F2A44' : '#FFFFFF',
          fontSize: '15px',
          lineHeight: '1.5',
          // sombra suave como en el doc maestro
          boxShadow: '0 1px 3px rgba(31,42,68,0.08), 0 4px 12px rgba(31,42,68,0.04)',
        }}
      >
        {/* dividir por saltos de línea para respetar el formato */}
        {content.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}

export default MessageBubble;
