import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const BACKEND_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

interface FormLogin {
    correo: string;
    contrasena: string;
}

interface FormLoginErrors {
    correo?: string;
    contrasena?: string;
    general?: string;
}

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState<FormLogin>({ correo: "", contrasena: "" });
    const [errors, setErrors] = useState<FormLoginErrors>({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    };

    const validate = (): boolean => {
        const newErrors: FormLoginErrors = {};
        if (!form.correo.trim()) newErrors.correo = "El correo es obligatorio";
        if (!form.contrasena.trim()) newErrors.contrasena = "La contraseña es obligatoria";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await api.post<{
                token: string;
                usuario: { id: string; nombre: string; correo: string; rol: "worker" | "employer" };
            }>("/auth/login", form);

            login(response.token, response.usuario);

            navigate("/agente");
        } catch (error) {
            setErrors({ general: (error as Error).message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            id="login"
            className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-12"
            style={{ backgroundColor: "var(--bg-main)" }}
        >
            <div className="w-full max-w-md rounded-2xl p-8 shadow-sm border border-[#E8D9C4] bg-white">
                <div className="flex justify-center mb-6">
                    <img src="/logo.png" alt="Hausseup" className="h-12 w-auto" />
                </div>

                <h1 className="text-[#1F2A44] text-2xl font-bold text-center mb-1">
                    Bienvenido de vuelta
                </h1>
                <p className="text-[#6B7280] text-sm text-center mb-8">
                    Inicia sesión en tu cuenta Hausseup
                </p>

                {errors.general && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                        <p className="text-red-600 text-sm text-center">{errors.general}</p>
                    </div>
                )}

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

                    <a href={`${BACKEND_URL}/auth/facebook`}
                        className="flex items-center justify-center gap-3 w-full py-3 rounded-xl text-white font-semibold text-sm transition"
                        style={{ backgroundColor: "#1877F2" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#166FE5")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1877F2")}
                    >
                        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                        </svg>
                        Continuar con Facebook
                    </a>
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-[#E8D9C4]" />
                    <span className="text-[#6B7280] text-xs">o con tu correo</span>
                    <div className="flex-1 h-px bg-[#E8D9C4]" />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-[#1F2A44] font-medium">Correo electrónico</label>
                        <input
                            type="email"
                            name="correo"
                            value={form.correo}
                            onChange={handleChange}
                            placeholder="tu@correo.com"
                            className="w-full rounded-xl px-4 py-2.5 bg-white border border-[#E8D9C4] text-[#1F2A44] placeholder-[#9CA3AF] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-[#C1502E]"
                        />
                        {errors.correo && <p className="text-red-500 text-xs">{errors.correo}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-[#1F2A44] font-medium">Contraseña</label>
                        <input
                            type="password"
                            name="contrasena"
                            value={form.contrasena}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full rounded-xl px-4 py-2.5 bg-white border border-[#E8D9C4] text-[#1F2A44] placeholder-[#9CA3AF] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:border-[#C1502E]"
                        />
                        {errors.contrasena && <p className="text-red-500 text-xs">{errors.contrasena}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full py-3 rounded-xl font-semibold text-white text-sm bg-[#C1502E] hover:bg-[#A6401F] transition disabled:opacity-50"
                    >
                        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                    </button>
                </form>

                <p className="text-center text-[#6B7280] text-xs mt-6">
                    ¿No tienes cuenta?{" "}
                    <Link to="/registro" className="text-[#C1502E] hover:underline font-medium">
                        Regístrate gratis
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
