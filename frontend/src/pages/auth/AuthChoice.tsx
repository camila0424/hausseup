import { useNavigate, Link } from "react-router-dom";

function AuthChoice() {
    const navigate = useNavigate();

    return (
        <div
            id="registro"
            className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-12"
            style={{ backgroundColor: "var(--bg-main)" }}
        >
            <div className="w-full max-w-md rounded-2xl p-8 shadow-sm border border-[#E8D9C4] bg-white">
                <div className="flex justify-center mb-6">
                    <img src="/logo.png" alt="Hausseup" className="h-12 w-auto" />
                </div>

                <h1 className="text-[#1F2A44] text-2xl font-bold text-center mb-1">
                    Únete a Hausseup
                </h1>
                <p className="text-[#6B7280] text-sm text-center mb-8">
                    ¿Qué estás buscando?
                </p>

                <div className="flex flex-col gap-3 mb-6">
                    <button
                        onClick={() => navigate("/registro/manual?tipo=worker")}
                        className="w-full p-5 rounded-xl border-2 border-[#E8D9C4] text-left hover:border-[#C1502E] hover:bg-[#C1502E]/5 transition-all duration-200"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">🔍</span>
                            <div>
                                <p className="text-[#1F2A44] font-semibold text-sm">Busco empleo</p>
                                <p className="text-[#6B7280] text-xs mt-0.5">Quiero trabajar y encontrar oportunidades</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate("/registro/manual?tipo=employer")}
                        className="w-full p-5 rounded-xl border-2 border-[#E8D9C4] text-left hover:border-[#C1502E] hover:bg-[#C1502E]/5 transition-all duration-200"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">📋</span>
                            <div>
                                <p className="text-[#1F2A44] font-semibold text-sm">Soy empresario / ofrezco empleo</p>
                                <p className="text-[#6B7280] text-xs mt-0.5">Quiero contratar o publicar ofertas</p>
                            </div>
                        </div>
                    </button>
                </div>

                <p className="text-center text-[#6B7280] text-xs mt-6">
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/login" className="text-[#C1502E] hover:underline font-medium">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default AuthChoice;
