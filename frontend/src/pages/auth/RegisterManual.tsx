import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { ciudadesEspana } from "../../data/locationData";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface FormState {
    nombre: string;
    telefono: string;
    correo: string;
    contrasena: string;
    provincia: string;
    ciudad: string;
    documento: string;
}

interface FormErrors {
    nombre?: string;
    telefono?: string;
    correo?: string;
    contrasena?: string;
    provincia?: string;
    ciudad?: string;
    documento?: string;
    general?: string;
}

const initialForm: FormState = {
    nombre: "",
    telefono: "",
    correo: "",
    contrasena: "",
    provincia: "",
    ciudad: "",
    documento: "",
};

function RegisterManual() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [params] = useSearchParams();
    const tipo = params.get("tipo") as "worker" | "employer" | null;
    const [form, setForm] = useState<FormState>(initialForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [privacyChecked, setPrivacyChecked] = useState(
        !!localStorage.getItem("hausseup_privacy_accepted")
    );

    useEffect(() => {
        if (tipo !== "worker" && tipo !== "employer") {
            navigate("/registro", { replace: true });
        }
    }, [tipo, navigate]);

    const ciudadesDisponibles =
        ciudadesEspana.find((p) => p.provincia === form.provincia)?.ciudades ?? [];

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "provincia" ? { ciudad: "" } : {}),
        }));
        setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
        if (!form.telefono.trim()) newErrors.telefono = "El teléfono es obligatorio";
        if (!form.correo.trim()) newErrors.correo = "El correo es obligatorio";
        if (!form.contrasena.trim()) newErrors.contrasena = "La contraseña es obligatoria";
        if (!form.provincia) newErrors.provincia = "Selecciona una provincia";
        if (!form.ciudad) newErrors.ciudad = "Selecciona una ciudad";
        if (!form.documento.trim()) newErrors.documento = "El documento es obligatorio";
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
            }>("/auth/registro", {
                nombre: form.nombre,
                correo: form.correo,
                contrasena: form.contrasena,
                telefono: form.telefono,
                provincia: form.provincia,
                ciudad: form.ciudad,
                documento: form.documento,
                tipoUsuario: tipo,
            });

            login(response.token, response.usuario);

            if (response.usuario.rol === "employer") {
                navigate("/dashboard-empleador");
            } else {
                navigate("/busco-empleo");
            }
        } catch (error) {
            setErrors({ general: (error as Error).message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            id="registro-manual"
            className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-12"
            style={{ backgroundColor: "var(--bg-main)" }}
        >
            <div
                className="w-full max-w-lg rounded-2xl p-8 shadow-2xl"
                style={{ backgroundColor: "var(--bg-card)" }}
            >
                <div className="flex justify-center mb-6">
                    <img src="/logo.png" alt="Hausseup" className="h-12 w-auto" />
                </div>

                <h1 className="text-[#1F2A44] text-2xl font-bold text-center mb-1">
                    Crea tu cuenta en Hausseup
                </h1>
                <p className="text-[#6B7280] text-sm text-center mb-8">
                    Completa tus datos para empezar
                </p>

                {errors.general && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
                        <p className="text-red-400 text-sm">{errors.general}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-[#1F2A44] font-medium">Nombre completo</label>
                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Tu nombre"
                            className="w-full rounded-xl px-4 py-2.5 bg-white border border-[#E8D9C4] text-[#1F2A44] placeholder-[#9CA3AF] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A33D]"
                        />
                        {errors.nombre && <p className="text-red-400 text-xs">{errors.nombre}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-[#1F2A44] font-medium">Teléfono</label>
                            <input
                                type="tel"
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                                placeholder="+34 600 000 000"
                                className="w-full rounded-xl px-4 py-2.5 bg-white border border-[#E8D9C4] text-[#1F2A44] placeholder-[#9CA3AF] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A33D]"
                            />
                            {errors.telefono && <p className="text-red-400 text-xs">{errors.telefono}</p>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-[#1F2A44] font-medium">Correo electrónico</label>
                            <input
                                type="email"
                                name="correo"
                                value={form.correo}
                                onChange={handleChange}
                                placeholder="tu@correo.com"
                                className="w-full rounded-xl px-4 py-2.5 bg-white border border-[#E8D9C4] text-[#1F2A44] placeholder-[#9CA3AF] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A33D]"
                            />
                            {errors.correo && <p className="text-red-400 text-xs">{errors.correo}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-[#1F2A44] font-medium">Contraseña</label>
                        <input
                            type="password"
                            name="contrasena"
                            value={form.contrasena}
                            onChange={handleChange}
                            placeholder="Mínimo 8 caracteres"
                            className="w-full rounded-xl px-4 py-2.5 bg-white border border-[#E8D9C4] text-[#1F2A44] placeholder-[#9CA3AF] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A33D]"
                        />
                        {errors.contrasena && <p className="text-red-400 text-xs">{errors.contrasena}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-[#1F2A44] font-medium">Provincia</label>
                            <select
                                name="provincia"
                                value={form.provincia}
                                onChange={handleChange}
                                className="w-full rounded-xl px-4 py-2.5 bg-white border border-[#E8D9C4] text-[#1F2A44] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A33D] appearance-none"
                            >
                                <option value="">Selecciona provincia</option>
                                {ciudadesEspana.map((p) => (
                                    <option key={p.provincia} value={p.provincia}>
                                        {p.provincia}
                                    </option>
                                ))}
                            </select>
                            {errors.provincia && <p className="text-red-400 text-xs">{errors.provincia}</p>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-[#1F2A44] font-medium">Ciudad</label>
                            <select
                                name="ciudad"
                                value={form.ciudad}
                                onChange={handleChange}
                                disabled={!form.provincia}
                                className="w-full rounded-xl px-4 py-2.5 bg-white border border-[#E8D9C4] text-[#1F2A44] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A33D] appearance-none disabled:opacity-40"
                            >
                                <option value="">Selecciona ciudad</option>
                                {ciudadesDisponibles.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            {errors.ciudad && <p className="text-red-400 text-xs">{errors.ciudad}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-[#1F2A44] font-medium">Documento de identidad</label>
                        <input
                            type="text"
                            name="documento"
                            value={form.documento}
                            onChange={handleChange}
                            placeholder="NIE, DNI o Pasaporte"
                            className="w-full rounded-xl px-4 py-2.5 bg-white border border-[#E8D9C4] text-[#1F2A44] placeholder-[#9CA3AF] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A33D]"
                        />
                        {errors.documento && <p className="text-red-400 text-xs">{errors.documento}</p>}
                    </div>

                    {/* Aceptación de política de privacidad */}
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={privacyChecked}
                            onChange={(e) => setPrivacyChecked(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-white/20 cursor-pointer accent-[#C1502E]"
                        />
                        <span className="text-xs text-[#1F2A44]/70 leading-relaxed">
                            He leído y acepto la{" "}
                            <a
                                href="/privacidad"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#C1502E] hover:underline font-medium"
                            >
                                Política de Privacidad
                            </a>
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading || !privacyChecked}
                        className="mt-2 w-full py-3 rounded-xl font-semibold text-white text-sm hover:brightness-110 transition disabled:opacity-50"
                        style={{ backgroundColor: "#C1502E" }}
                    >
                        {loading ? "Creando cuenta..." : "Continuar"}
                    </button>
                </form>

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

export default RegisterManual;
