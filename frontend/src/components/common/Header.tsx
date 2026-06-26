import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const inter = "Inter, sans-serif";

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [menuOpen]);

    return (
        <header
            ref={headerRef}
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-[#E8D9C4] ${scrolled ? "shadow-sm" : ""}`}
            style={{ backgroundColor: "var(--bg-header)" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    <Link
                        to="/"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="hover:opacity-80 transition-opacity"
                        style={{ textDecoration: "none" }}
                    >
                        <span style={{ fontFamily: inter, fontWeight: 600, fontSize: "20px" }}>
                            <span style={{ color: "#1F2A44" }}>hausse</span>
                            <span style={{ color: "#C1502E" }}>up</span>
                        </span>
                    </Link>

                    {/* Desktop */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            to="/login"
                            style={{
                                fontFamily: inter,
                                fontSize: "14px",
                                color: "#1F2A44",
                                border: "1.5px solid #1F2A44",
                                borderRadius: "9999px",
                                padding: "8px 18px",
                                backgroundColor: "transparent",
                                textDecoration: "none",
                            }}
                        >
                            Iniciar sesión
                        </Link>
                        <Link
                            to="/registro"
                            style={{
                                fontFamily: inter,
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "white",
                                backgroundColor: "#C1502E",
                                borderRadius: "9999px",
                                padding: "8px 20px",
                                textDecoration: "none",
                            }}
                        >
                            Registrarme
                        </Link>
                    </div>

                    {/* Hamburguesa mobile */}
                    <button
                        className="md:hidden"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        aria-label="Abrir menú"
                        aria-expanded={menuOpen}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "22px",
                            cursor: "pointer",
                            color: "#1F2A44",
                            lineHeight: 1,
                            padding: "4px 8px",
                        }}
                    >
                        {menuOpen ? "✕" : "☰"}
                    </button>
                </div>
            </div>

            {/* Menú desplegable mobile */}
            {menuOpen && (
                <div
                    className="md:hidden"
                    style={{
                        position: "fixed",
                        top: "64px",
                        left: 0,
                        right: 0,
                        backgroundColor: "#F7EEE0",
                        boxShadow: "0 8px 24px rgba(31,42,68,0.15)",
                        zIndex: 99,
                        padding: "16px 24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                    }}
                >
                    <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        style={{
                            fontFamily: inter,
                            fontSize: "15px",
                            color: "#1F2A44",
                            border: "1.5px solid #1F2A44",
                            borderRadius: "9999px",
                            padding: "10px 16px",
                            textDecoration: "none",
                            textAlign: "center",
                        }}
                    >
                        Iniciar sesión
                    </Link>
                    <Link
                        to="/registro"
                        onClick={() => setMenuOpen(false)}
                        style={{
                            fontFamily: inter,
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "white",
                            backgroundColor: "#C1502E",
                            borderRadius: "9999px",
                            padding: "10px 16px",
                            textDecoration: "none",
                            textAlign: "center",
                        }}
                    >
                        Registrarme
                    </Link>
                </div>
            )}
        </header>
    );
}

export default Header;
