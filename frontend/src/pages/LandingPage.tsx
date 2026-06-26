import { Link } from 'react-router-dom';

const playfair = "'Playfair Display', serif";
const inter = "Inter, sans-serif";

const chatMessages = [
  { from: 'agent', text: '¡Hola! Soy María 👋 Tu agente de empleo personal. ¿Buscas trabajo en España?', time: '09:14' },
  { from: 'user',  text: 'Sí, llegué hace 3 meses desde Colombia 🇨🇴', time: '09:14' },
  { from: 'agent', text: 'Perfecto. ¿Tienes NIE o documento de trabajo vigente?', time: '09:14' },
  { from: 'user',  text: 'Sí, ya tengo el NIE ✅', time: '09:15' },
  { from: 'agent', text: 'Excelente ✅ ¿En qué sector tienes experiencia? (hostelería, construcción, cuidados...)', time: '09:15' },
  { from: 'user',  text: 'Hostelería, 5 años de experiencia 🍽️', time: '09:15' },
];

const mariaFeatures = [
  'Chat directo, sin CV ni formularios',
  'Entiende tu situación migratoria',
  'Te prepara para cada entrevista',
  'Disponible 24/7, responde al instante',
];

const pabloFeatures = [
  'Publica ofertas sin formularios',
  'Candidatos con documentación verificada',
  'Ranking por IA según tu perfil ideal',
  'Pipeline visual de candidatos',
];

const steps = [
  {
    num: 'PASO 01',
    emoji: '👋',
    title: 'Te registras',
    desc: 'Crea tu cuenta en 30 segundos. Sin CV, sin formularios largos. Solo tus datos básicos.',
    descColor: '#6B7280',
  },
  {
    num: 'PASO 02',
    emoji: '💬',
    title: 'Tu agente te habla',
    desc: 'María o Pablo te atienden en un chat y entienden exactamente qué necesitas en una conversación natural.',
    descColor: '#C1502E',
  },
  {
    num: 'PASO 03',
    emoji: '🎯',
    title: 'Match perfecto',
    desc: 'La IA conecta candidatos y empleadores con contexto migratorio real. En horas, no en semanas.',
    descColor: '#6B7280',
  },
];

const stats = [
  { num: '8M+',  label: 'Latinoamericanos en España' },
  { num: '850K', label: 'Nuevos permisos de trabajo en 2025' },
  { num: '50M+', label: 'Hispanohablantes en Europa' },
  { num: '€0',   label: 'Siempre gratis para candidatos' },
];

const avatars = [
  { initials: 'AR', bg: '#4A90D9' },
  { initials: 'MX', bg: '#2E7D5B' },
  { initials: 'CO', bg: '#C1502E' },
  { initials: 'VE', bg: '#E8A33D' },
];

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}

function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes eyebrowPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .pulse-dot {
          display: inline-block;
          width: 8px; height: 8px;
          background: #E8A33D;
          border-radius: 50%;
          margin-right: 8px;
          animation: eyebrowPulse 2s infinite;
          vertical-align: middle;
        }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '64px',
          backgroundColor: 'rgba(247,238,224,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(31,42,68,0.08)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontFamily: inter, fontWeight: 600, fontSize: '20px' }}>
            <span style={{ color: '#1F2A44' }}>hausse</span>
            <span style={{ color: '#C1502E' }}>up</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/login"
              style={{
                fontFamily: inter,
                fontSize: '14px',
                color: '#1F2A44',
                border: '1.5px solid #1F2A44',
                borderRadius: '9999px',
                padding: '8px 18px',
                backgroundColor: 'transparent',
                textDecoration: 'none',
              }}
            >
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              style={{
                fontFamily: inter,
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                backgroundColor: '#C1502E',
                borderRadius: '9999px',
                padding: '8px 20px',
                textDecoration: 'none',
              }}
            >
              Registrarme
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        style={{ backgroundColor: '#F7EEE0', minHeight: '100vh' }}
        className="flex items-center pt-24 pb-20 px-6"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Columna izquierda */}
          <div>
            {/* Eyebrow pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#1F2A44',
                borderRadius: '9999px',
                padding: '6px 14px',
                marginBottom: '32px',
              }}
            >
              <span className="pulse-dot" />
              <span
                style={{
                  fontFamily: inter,
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: '#E8A33D',
                  textTransform: 'uppercase',
                }}
              >
                RED DE EMPLEO PARA LATINOS EN ESPAÑA
              </span>
            </div>

            {/* H1 */}
            <h1
              style={{
                fontFamily: playfair,
                fontSize: 'clamp(40px, 5.5vw, 68px)',
                fontWeight: 700,
                color: '#1F2A44',
                lineHeight: 1.05,
                letterSpacing: '-1.5px',
                marginBottom: '24px',
              }}
            >
              Tu próxima<br />
              <em style={{ color: '#C1502E', fontStyle: 'italic' }}>oportunidad</em><br />
              en un solo chat.
            </h1>

            {/* Subtítulo */}
            <p
              style={{
                fontFamily: inter,
                color: '#6B7280',
                fontSize: '18px',
                lineHeight: 1.6,
                maxWidth: '440px',
                marginBottom: '32px',
              }}
            >
              Sin CV, sin formularios. Chatea con María o Pablo, nuestros agentes de IA que trabajan para ti las 24 horas.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
              <Link
                to="/registro?tipo=candidato"
                style={{
                  fontFamily: inter,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'white',
                  backgroundColor: '#C1502E',
                  borderRadius: '9999px',
                  padding: '14px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                }}
              >
                <WhatsAppIcon /> Busco empleo
              </Link>
              <Link
                to="/registro?tipo=empleador"
                style={{
                  fontFamily: inter,
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#1F2A44',
                  backgroundColor: 'transparent',
                  border: '1.5px solid #1F2A44',
                  borderRadius: '9999px',
                  padding: '14px 28px',
                  textDecoration: 'none',
                }}
              >
                Tengo una vacante
              </Link>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex' }}>
                {avatars.map((av, i) => (
                  <div
                    key={av.initials}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: av.bg,
                      border: '2px solid white',
                      marginLeft: i === 0 ? 0 : '-10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'white',
                      fontFamily: inter,
                      position: 'relative',
                      zIndex: avatars.length - i,
                    }}
                  >
                    {av.initials}
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: inter, fontSize: '14px', color: '#6B7280', margin: 0 }}>
                Miles de latinos ya están en la plataforma
              </p>
            </div>
          </div>

          {/* Columna derecha — Mockup teléfono (oculto en mobile) */}
          <div className="hidden md:flex justify-center">
            <div
              style={{
                maxWidth: '320px',
                width: '100%',
                borderRadius: '32px',
                overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(31,42,68,0.30), 0 8px 32px rgba(31,42,68,0.15)',
                border: '8px solid #1F2A44',
              }}
            >
              {/* Header del chat */}
              <div
                style={{
                  backgroundColor: '#0A1628',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#C1502E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: 'white',
                    fontFamily: inter,
                    fontSize: '16px',
                    flexShrink: 0,
                  }}
                >
                  M
                </div>
                <div>
                  <p style={{ fontFamily: inter, fontWeight: 700, color: 'white', fontSize: '14px', margin: 0 }}>
                    María — Agente Hausseup
                  </p>
                  <p style={{ fontFamily: inter, fontSize: '11px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                    Agente Hausseup · en línea
                  </p>
                </div>
              </div>

              {/* Área de mensajes */}
              <div
                style={{
                  backgroundColor: '#ECE5DD',
                  padding: '12px',
                  height: '480px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}
                  >
                    <div
                      style={{
                        backgroundColor: msg.from === 'user' ? '#DCF8C6' : 'white',
                        borderRadius: msg.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        padding: '8px 10px',
                        maxWidth: '80%',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                      }}
                    >
                      <p style={{ fontFamily: inter, fontSize: '12px', color: '#1F2A44', margin: 0, lineHeight: 1.4 }}>
                        {msg.text}
                      </p>
                      <p style={{ fontFamily: inter, fontSize: '10px', color: '#6B7280', margin: '4px 0 0', textAlign: 'right' }}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── AGENTES ──────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#1F2A44' }} className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p
            style={{
              fontFamily: inter,
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: '#E8A33D',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            LOS AGENTES
          </p>
          <h2
            style={{
              fontFamily: playfair,
              fontWeight: 700,
              fontSize: 'clamp(32px, 4vw, 52px)',
              color: 'white',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            Dos agentes. Un propósito.
          </h2>
          <p
            style={{
              fontFamily: inter,
              fontSize: '18px',
              color: 'rgba(255,255,255,0.70)',
              maxWidth: '600px',
              margin: '0 auto 56px',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            Cada parte del proceso tiene su propio agente de IA, entrenado para entender exactamente lo que necesitas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Tarjeta María */}
            <div style={{ backgroundColor: '#C1502E', borderRadius: '24px', padding: '40px' }}>
              <img
                src="/img/maria.jpeg"
                alt="María"
                style={{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid white', objectFit: 'cover', marginBottom: '16px', display: 'block' }}
              />
              <p style={{ fontFamily: inter, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.70)', textTransform: 'uppercase', marginBottom: '8px' }}>
                PARA CANDIDATOS
              </p>
              <h3 style={{ fontFamily: playfair, fontWeight: 700, fontSize: '48px', color: 'white', margin: '0 0 12px' }}>
                María
              </h3>
              <p style={{ fontFamily: inter, fontSize: '16px', color: 'rgba(255,255,255,0.80)', marginBottom: '24px', lineHeight: 1.5 }}>
                Tu guía personal en el mercado laboral español. Te ayuda a encontrar trabajo sin CV y en tu idioma.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {mariaFeatures.map(feat => (
                  <li key={feat} style={{ fontFamily: inter, fontSize: '15px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700 }}>✓</span> {feat}
                  </li>
                ))}
              </ul>
              <Link
                to="/registro?tipo=candidato"
                style={{
                  display: 'inline-block',
                  fontFamily: inter,
                  fontWeight: 600,
                  fontSize: '15px',
                  color: '#C1502E',
                  backgroundColor: 'white',
                  borderRadius: '9999px',
                  padding: '12px 24px',
                  textDecoration: 'none',
                }}
              >
                Hablar con María ▶
              </Link>
            </div>

            {/* Tarjeta Pablo */}
            <div style={{ backgroundColor: '#E8A33D', borderRadius: '24px', padding: '40px' }}>
              <img
                src="/img/pablo.jpeg"
                alt="Pablo"
                style={{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid white', objectFit: 'cover', marginBottom: '16px', display: 'block' }}
              />
              <p style={{ fontFamily: inter, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(31,42,68,0.70)', textTransform: 'uppercase', marginBottom: '8px' }}>
                PARA EMPLEADORES
              </p>
              <h3 style={{ fontFamily: playfair, fontWeight: 700, fontSize: '48px', color: '#1F2A44', margin: '0 0 12px' }}>
                Pablo
              </h3>
              <p style={{ fontFamily: inter, fontSize: '16px', color: 'rgba(31,42,68,0.80)', marginBottom: '24px', lineHeight: 1.5 }}>
                Tu asistente de selección. Publica vacantes en lenguaje natural y recibe candidatos listos para empezar.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pabloFeatures.map(feat => (
                  <li key={feat} style={{ fontFamily: inter, fontSize: '15px', color: '#1F2A44', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700 }}>✓</span> {feat}
                  </li>
                ))}
              </ul>
              <Link
                to="/registro?tipo=empleador"
                style={{
                  display: 'inline-block',
                  fontFamily: inter,
                  fontWeight: 600,
                  fontSize: '15px',
                  color: 'white',
                  backgroundColor: '#1F2A44',
                  borderRadius: '9999px',
                  padding: '12px 24px',
                  textDecoration: 'none',
                }}
              >
                Hablar con Pablo →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────── */}
      <section id="how" style={{ backgroundColor: '#F7EEE0' }} className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p style={{ fontFamily: inter, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: '#C1502E', textTransform: 'uppercase', marginBottom: '16px' }}>
            CÓMO FUNCIONA
          </p>
          <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(32px, 4vw, 52px)', color: '#1F2A44', marginBottom: '48px' }}>
            Tan simple como mandar un mensaje.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(step => (
              <div
                key={step.num}
                style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 2px 12px rgba(31,42,68,0.07)' }}
              >
                <p style={{ fontFamily: inter, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: '#C1502E', textTransform: 'uppercase', marginBottom: '12px' }}>
                  {step.num}
                </p>
                <p style={{ fontSize: '40px', margin: '0 0 12px' }}>{step.emoji}</p>
                <h3 style={{ fontFamily: inter, fontWeight: 700, fontSize: '20px', color: '#1F2A44', marginBottom: '8px' }}>
                  {step.title}
                </h3>
                <p style={{ fontFamily: inter, fontSize: '15px', color: step.descColor, lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NÚMEROS ──────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#F7EEE0' }} className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p
            style={{
              fontFamily: inter,
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: '#C1502E',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            EL MERCADO QUE NADIE ATENDÍA
          </p>
          <h2
            style={{
              fontFamily: playfair,
              fontWeight: 700,
              fontSize: 'clamp(28px, 3.5vw, 48px)',
              color: '#1F2A44',
              textAlign: 'center',
              marginBottom: '56px',
              lineHeight: 1.15,
            }}
          >
            Un mercado enorme.<br />Sin soluciones reales hasta hoy.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.num}
                style={{
                  textAlign: 'center',
                  padding: '24px 16px',
                  borderLeft: i > 0 ? '1px solid rgba(31,42,68,0.12)' : 'none',
                }}
              >
                <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(32px, 4vw, 52px)', color: '#1F2A44', margin: '0 0 8px' }}>
                  {stat.num}
                </p>
                <p style={{ fontFamily: inter, fontSize: '14px', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#1F2A44' }} className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            style={{
              fontFamily: playfair,
              fontWeight: 700,
              fontSize: 'clamp(32px, 4vw, 52px)',
              color: 'white',
              lineHeight: 1.15,
              marginBottom: '20px',
            }}
          >
            ¿Listo para tu próxima{' '}
            <em style={{ color: '#E8A33D', fontStyle: 'italic' }}>oportunidad?</em>
          </h2>
          <p style={{ fontFamily: inter, fontSize: '18px', color: 'rgba(255,255,255,0.70)', marginBottom: '32px' }}>
            Únete gratis. Tu agente está listo para ti ahora.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
            <Link
              to="/registro?tipo=candidato"
              style={{
                fontFamily: inter,
                fontSize: '16px',
                fontWeight: 600,
                color: 'white',
                backgroundColor: '#C1502E',
                borderRadius: '9999px',
                padding: '14px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
              }}
            >
              <WhatsAppIcon /> Busco empleo — Hablar con María
            </Link>
            <Link
              to="/registro?tipo=empleador"
              style={{
                fontFamily: inter,
                fontSize: '16px',
                color: 'white',
                backgroundColor: 'transparent',
                border: '1.5px solid rgba(255,255,255,0.4)',
                borderRadius: '9999px',
                padding: '14px 28px',
                textDecoration: 'none',
              }}
            >
              Tengo una vacante — Hablar con Pablo
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ backgroundColor: '#1F2A44', padding: '64px 6% 0' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16">

          {/* Brand */}
          <div>
            <p style={{ fontFamily: inter, fontWeight: 600, fontSize: '20px', margin: '0 0 12px' }}>
              <span style={{ color: 'white' }}>hausse</span>
              <span style={{ color: '#E8A33D' }}>up</span>
            </p>
            <p style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.60)', lineHeight: 1.6, margin: 0 }}>
              Red de empleo para latinos en España. Con dignidad.
            </p>
          </div>

          {/* Producto */}
          <div>
            <h3 style={{ fontFamily: inter, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', margin: '0 0 16px' }}>
              PRODUCTO
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Link to="/registro?tipo=candidato" style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.70)', textDecoration: 'none' }}>
                  Para candidatos
                </Link>
              </li>
              <li>
                <Link to="/registro?tipo=empleador" style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.70)', textDecoration: 'none' }}>
                  Para empleadores
                </Link>
              </li>
              <li>
                <a href="#how" style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.70)', textDecoration: 'none' }}>
                  Cómo funciona
                </a>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 style={{ fontFamily: inter, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', margin: '0 0 16px' }}>
              EMPRESA
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Link to="/about" style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.70)', textDecoration: 'none' }}>
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <a href="mailto:hola@hausseup.com" style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.70)', textDecoration: 'none' }}>
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Comunidad */}
          <div>
            <h3 style={{ fontFamily: inter, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', margin: '0 0 16px' }}>
              COMUNIDAD
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <a href="https://youtube.com/@gustavo.perignan" target="_blank" rel="noopener noreferrer" style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.70)', textDecoration: 'none' }}>
                  YouTube
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/company/hausseup" target="_blank" rel="noopener noreferrer" style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.70)', textDecoration: 'none' }}>
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.10)',
            padding: '24px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.40)', margin: 0 }}>
            © 2026 Hausseup. Todos los derechos reservados.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="/privacidad" style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.40)', textDecoration: 'none' }}>
              Política de privacidad
            </Link>
            <Link to="/terminos" style={{ fontFamily: inter, fontSize: '14px', color: 'rgba(255,255,255,0.40)', textDecoration: 'none' }}>
              Términos
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

export default LandingPage;
