import { useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

function RegisterOptions() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const tipo = params.get("tipo");

    useEffect(() => {
        if (tipo !== "worker" && tipo !== "employer") {
            navigate("/registro", { replace: true });
        }
    }, [tipo, navigate]);

    if (tipo !== "worker" && tipo !== "employer") return null;

    const label = tipo === "worker" ? "Busco empleo" : "Soy empresario";

    return (
        <div
            id="registro-opciones"
            className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-12"
            style={{ backgroundColor: "var(--bg-main)" }}
        >
            <div className="w-full max-w-md rounded-2xl p-8 shadow-sm border border-[#E8D9C4] bg-white">
                <div className="flex justify-center mb-6">
                    <img src="/logo.png" alt="Hausseup" className="h-12 w-auto" />
                </div>

                <h1 className="text-[#1F2A44] text-2xl font-bold text-center mb-1">
                    Crea tu cuenta
                </h1>
                <p className="text-[#6B7280] text-sm text-center mb-8">
                    {label} — elige cómo registrarte
                </p>

                <div className="flex flex-col gap-3">
                    <a
                        href={`${BACKEND_URL}/auth/google?role=${tipo}`}
                        className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-white text-gray-800 font-semibold text-sm border border-[#E8D9C4] hover:bg-[#EDE1CE] transition"
                    >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        Continuar con Google
                    </a>

                    <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-[#E8D9C4]" />
                        <span className="text-[#6B7280] text-xs">o</span>
                        <div className="flex-1 h-px bg-[#E8D9C4]" />
                    </div>

                    <button
                        onClick={() => navigate(`/registro/manual?tipo=${tipo}`)}
                        className="w-full py-3 rounded-xl font-semibold text-white text-sm hover:brightness-110 transition"
                        style={{ backgroundColor: "#C1502E" }}
                    >
                        Registrarme con mis datos
                    </button>
                </div>

                <button
                    onClick={() => navigate("/registro")}
                    className="mt-6 w-full text-center text-[#6B7280] text-xs hover:text-[#C1502E] transition"
                >
                    ← Volver
                </button>

                <p className="text-center text-[#6B7280] text-xs mt-4">
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/login" className="text-[#C1502E] hover:underline font-medium">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterOptions;
