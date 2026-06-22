import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

function PrivacyPolicy() {
    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7EEE0", color: "#1F2A44" }}>
            <Header />

            <main className="flex-1 pt-24 pb-16">
                <div className="max-w-3xl mx-auto px-6">

                    {/* Encabezado */}
                    <h1 className="text-4xl font-bold mb-2" style={{ color: "#C1502E" }}>
                        Política de Privacidad
                    </h1>
                    <p className="text-sm mb-10" style={{ color: "#6B7280" }}>
                        Última actualización: 22 de junio de 2026
                    </p>

                    {/* Sección 1 */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: "#1F2A44" }}>
                            1. Quiénes somos
                        </h2>
                        <p className="text-sm leading-relaxed">
                            Hausseup ("nosotros", "nuestro") es una plataforma digital de empleo para personas migrantes en España,
                            operada por Hausseup (<a href="mailto:hausseup@gmail.com" className="underline hover:opacity-70 transition">hausseup@gmail.com</a>).
                            Puedes contactarnos en cualquier momento escribiendo a{" "}
                            <a href="mailto:hausseup@gmail.com" className="underline hover:opacity-70 transition">hausseup@gmail.com</a>.
                        </p>
                    </section>

                    {/* Sección 2 */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: "#1F2A44" }}>
                            2. Qué datos recogemos y por qué
                        </h2>

                        <h3 className="text-base font-semibold mb-2" style={{ color: "#1F2A44" }}>
                            2.1 Datos que nos proporcionas directamente
                        </h3>
                        <ul className="list-disc list-outside pl-5 space-y-1 text-sm leading-relaxed mb-4">
                            <li><strong>Nombre completo</strong> — para personalizar tu experiencia y mostrar tu perfil a empleadores.</li>
                            <li><strong>Dirección de correo electrónico</strong> — para identificarte, enviarte notificaciones y permitirte iniciar sesión.</li>
                            <li><strong>Número de teléfono (opcional)</strong> — para notificaciones por WhatsApp si decides activarlas.</li>
                            <li><strong>Ciudad de residencia</strong> — para mostrarte ofertas de empleo relevantes en tu zona.</li>
                            <li><strong>País de origen</strong> — para personalizar el contenido de la plataforma.</li>
                            <li><strong>Información de perfil profesional</strong> — experiencia, habilidades, sector de interés, disponibilidad.</li>
                        </ul>

                        <h3 className="text-base font-semibold mb-2" style={{ color: "#1F2A44" }}>
                            2.2 Datos que recogemos automáticamente al usar Google Sign-In
                        </h3>
                        <p className="text-sm leading-relaxed mb-2">
                            Cuando te registras o inicias sesión con tu cuenta de Google, recibimos de Google únicamente:
                        </p>
                        <ul className="list-disc list-outside pl-5 space-y-1 text-sm leading-relaxed mb-2">
                            <li>Tu nombre completo</li>
                            <li>Tu dirección de correo electrónico</li>
                            <li>Tu foto de perfil (URL pública)</li>
                            <li>Tu identificador único de Google (Google ID)</li>
                        </ul>
                        <p className="text-sm leading-relaxed">
                            No accedemos a tu contraseña de Google, tus contactos, tu calendario ni ningún otro dato de tu cuenta
                            de Google más allá de los indicados.
                        </p>

                        <h3 className="text-base font-semibold mt-4 mb-2" style={{ color: "#1F2A44" }}>
                            2.3 Datos técnicos
                        </h3>
                        <ul className="list-disc list-outside pl-5 space-y-1 text-sm leading-relaxed">
                            <li>Dirección IP y tipo de navegador (para seguridad y diagnóstico de errores).</li>
                            <li>Fecha y hora de acceso.</li>
                        </ul>
                    </section>

                    {/* Sección 3 */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: "#1F2A44" }}>
                            3. Base legal para el tratamiento (RGPD)
                        </h2>
                        <p className="text-sm leading-relaxed mb-2">
                            Tratamos tus datos bajo las siguientes bases legales:
                        </p>
                        <ul className="list-disc list-outside pl-5 space-y-1 text-sm leading-relaxed">
                            <li><strong>Ejecución de un contrato:</strong> para prestarte el servicio de Hausseup que has solicitado al registrarte.</li>
                            <li><strong>Consentimiento:</strong> para comunicaciones opcionales como notificaciones por WhatsApp.</li>
                            <li><strong>Interés legítimo:</strong> para seguridad de la plataforma y mejora del servicio.</li>
                        </ul>
                    </section>

                    {/* Sección 4 */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: "#1F2A44" }}>
                            4. Cómo usamos tus datos
                        </h2>
                        <p className="text-sm leading-relaxed mb-2">
                            Usamos tus datos exclusivamente para:
                        </p>
                        <ul className="list-disc list-outside pl-5 space-y-1 text-sm leading-relaxed mb-3">
                            <li>Crear y gestionar tu cuenta en Hausseup.</li>
                            <li>Mostrarte ofertas de empleo relevantes según tu perfil y ubicación.</li>
                            <li>Permitir a los empleadores encontrar candidatos adecuados.</li>
                            <li>Enviarte notificaciones sobre tu actividad en la plataforma (candidaturas, mensajes, ofertas nuevas).</li>
                            <li>Mejorar la plataforma y corregir errores técnicos.</li>
                            <li>Cumplir con obligaciones legales aplicables.</li>
                        </ul>
                        <p className="text-sm leading-relaxed font-medium">
                            Nunca vendemos tus datos a terceros ni los usamos para publicidad.
                        </p>
                    </section>

                    {/* Sección 5 */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: "#1F2A44" }}>
                            5. Con quién compartimos tus datos
                        </h2>
                        <ul className="list-disc list-outside pl-5 space-y-2 text-sm leading-relaxed">
                            <li>
                                <strong>Empleadores en la plataforma:</strong> solo ven los datos de tu perfil profesional que tú decides hacer
                                visibles (nombre, experiencia, habilidades, ciudad). Tu email y teléfono nunca se comparten automáticamente
                                con empleadores.
                            </li>
                            <li>
                                <strong>Proveedores de infraestructura técnica:</strong> utilizamos Neon (base de datos), Railway (servidor) y
                                Vercel (frontend), todos bajo acuerdos de procesamiento de datos compatibles con el RGPD y con servidores en Europa.
                            </li>
                            <li>
                                <strong>Google:</strong> usamos Google OAuth para el inicio de sesión. Consulta la política de privacidad de
                                Google en{" "}
                                <a
                                    href="https://policies.google.com/privacy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:opacity-70 transition"
                                >
                                    policies.google.com/privacy
                                </a>.
                            </li>
                            <li><strong>Autoridades competentes:</strong> si la ley nos lo exige.</li>
                        </ul>
                        <p className="text-sm leading-relaxed mt-3 font-medium">
                            No compartimos tus datos con ningún otro tercero.
                        </p>
                    </section>

                    {/* Sección 6 */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: "#1F2A44" }}>
                            6. Cuánto tiempo guardamos tus datos
                        </h2>
                        <p className="text-sm leading-relaxed">
                            Guardamos tus datos mientras tengas una cuenta activa en Hausseup. Tu perfil profesional se mantiene activo
                            para que empleadores puedan encontrarte mientras estés en búsqueda de empleo. Si eliminas tu cuenta,
                            borraremos todos tus datos personales en un plazo máximo de 30 días. Si tu cuenta lleva más de 24 meses sin
                            actividad, te contactaremos por email para confirmar si deseas mantenerla activa antes de tomar cualquier acción.
                        </p>
                    </section>

                    {/* Sección 7 */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: "#1F2A44" }}>
                            7. Tus derechos (RGPD)
                        </h2>
                        <p className="text-sm leading-relaxed mb-2">Tienes derecho a:</p>
                        <ul className="list-disc list-outside pl-5 space-y-1 text-sm leading-relaxed mb-3">
                            <li>Acceder a los datos que tenemos sobre ti.</li>
                            <li>Rectificar datos incorrectos o incompletos.</li>
                            <li>Eliminar tu cuenta y todos tus datos ("derecho al olvido").</li>
                            <li>Portabilidad: recibir tus datos en formato legible por máquina.</li>
                            <li>Oponerte al tratamiento de tus datos en determinadas circunstancias.</li>
                            <li>Retirar tu consentimiento en cualquier momento para los tratamientos basados en él.</li>
                        </ul>
                        <p className="text-sm leading-relaxed mb-2">
                            Para ejercer cualquiera de estos derechos, escríbenos a{" "}
                            <a href="mailto:hausseup@gmail.com" className="underline hover:opacity-70 transition">hausseup@gmail.com</a>{" "}
                            con el asunto "Derechos RGPD". Responderemos en un plazo máximo de 30 días.
                        </p>
                        <p className="text-sm leading-relaxed">
                            También tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) en{" "}
                            <a
                                href="https://aepd.es"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:opacity-70 transition"
                            >
                                aepd.es
                            </a>.
                        </p>
                    </section>

                    {/* Sección 8 */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: "#1F2A44" }}>
                            8. Seguridad
                        </h2>
                        <p className="text-sm leading-relaxed">
                            Aplicamos medidas técnicas y organizativas para proteger tus datos: conexiones cifradas (HTTPS/TLS),
                            almacenamiento cifrado de contraseñas (bcrypt), acceso restringido a la base de datos, y tokens de
                            autenticación con caducidad.
                        </p>
                    </section>

                    {/* Sección 9 */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: "#1F2A44" }}>
                            9. Cookies
                        </h2>
                        <p className="text-sm leading-relaxed">
                            Hausseup utiliza únicamente cookies técnicas esenciales para el funcionamiento del inicio de sesión y la
                            autenticación. No utilizamos cookies de seguimiento, analítica de terceros ni publicidad.
                        </p>
                    </section>

                    {/* Sección 10 */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: "#1F2A44" }}>
                            10. Menores de edad
                        </h2>
                        <p className="text-sm leading-relaxed">
                            Hausseup está dirigido a personas mayores de 16 años. No recogemos conscientemente datos de menores.
                            Si detectamos que un usuario es menor de 16 años, eliminaremos su cuenta.
                        </p>
                    </section>

                    {/* Sección 11 */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: "#1F2A44" }}>
                            11. Cambios en esta política
                        </h2>
                        <p className="text-sm leading-relaxed">
                            Si realizamos cambios relevantes, te lo notificaremos por email o mediante un aviso visible en la plataforma
                            antes de que entren en vigor.
                        </p>
                    </section>

                    {/* Sección 12 */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-3" style={{ color: "#1F2A44" }}>
                            12. Contacto
                        </h2>
                        <p className="text-sm leading-relaxed">Para cualquier consulta sobre privacidad:</p>
                        <address className="mt-2 text-sm leading-relaxed not-italic">
                            <strong>Hausseup</strong><br />
                            Email:{" "}
                            <a href="mailto:hausseup@gmail.com" className="underline hover:opacity-70 transition">
                                hausseup@gmail.com
                            </a><br />
                            Web: hausseup.com
                        </address>
                    </section>

                </div>
            </main>

            <Footer />
        </div>
    );
}

export default PrivacyPolicy;
