import { Play, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="bg-[#1F2A44] text-white">
            <div className="max-w-7xl mx-auto px-6 py-6 grid gap-10 md:grid-cols-2 lg:grid-cols-4">

                <div>
                    <h2 className="text-white font-medium tracking-tight text-xl">Hausseup</h2>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                        Red de oportunidades para latinos en España.
                        Conectamos talento, empresas y crecimiento profesional.
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
                        Navegación
                    </h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li>
                            <a href="#como-funciona" className="hover:text-[#E8A33D] transition">
                                Cómo funciona
                            </a>
                        </li>
                        <li>
                            <a href="#empleos" className="hover:text-[#E8A33D] transition">
                                Empleos
                            </a>
                        </li>
                        <li>
                            <a href="#contacto" className="hover:text-[#E8A33D] transition">
                                Contacto
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
                        Contacto
                    </h3>
                    <ul className="mt-4 space-y-3 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                        <li className="flex items-center gap-2">
                            <Mail size={16} />
                            hausseup@gmail.com
                        </li>
                        <li className="flex items-center gap-2">
                            <MapPin size={16} />
                            España
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
                        Comunidad
                    </h3>
                    <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                        Únete a nuestra comunidad y accede a contenido exclusivo para crecer profesionalmente.
                    </p>

                    <a href="#"
                        className="mt-4 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
                    >
                        <Play size={18} />
                        Ver en YouTube
                    </a>
                </div>
            </div>

            <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>
                <p>© {new Date().getFullYear()} Hausseup. Todos los derechos reservados.</p>
                <div className="flex gap-6">
                    <Link to="/privacidad" className="hover:text-white transition">Política de privacidad</Link>
                    <a href="#" className="hover:text-white transition">Términos</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
