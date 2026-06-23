import { useNavigate, Link, useSearchParams } from "react-router-dom";

const BACKEND_URL = "http://localhost:3001/api";

function AuthChoice() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const tipo = params.get("tipo");

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
                    Red de oportunidades para latinos en España
                </p>

                <div className="flex flex-col gap-3 mb-6">

                    <a href={`${BACKEND_URL}/auth/google`}
                        className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-white text-gray-800 font-semibold text-sm border border-[#E8D9C4] hover:bg-[#EDE1CE] transition"
                    >
                        <img
                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                            alt="Google"
                            className="w-5 h-5"
                        />
                        Continuar con Google
                    </a>

                </div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-[#E8D9C4]" />
                    <span className="text-[#6B7280] text-xs">o regístrate manualmente</span>
                    <div className="flex-1 h-px bg-[#E8D9C4]" />
                </div>

                <button
                    onClick={() => navigate(tipo === "employer" ? "/registro/manual?tipo=employer" : "/registro/manual")}
                    className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-[#C1502E] hover:bg-[#A6401F] transition"
                >
                    Añadir mis datos manualmente
                </button>

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
