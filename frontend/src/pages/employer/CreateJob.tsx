import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

type TipoContrato = "full_time" | "part_time" | "temporary" | "freelance" | "internship";

interface City {
    id: number;
    name: string;
    region: string;
}

interface FormAnuncio {
    titulo: string;
    sector: string;
    contrato: TipoContrato | "";
    provincia: string;
    cityId: number | "";
    descripcion: string;
    vacantes: number;
}

interface FormAnuncioErrors {
    titulo?: string;
    sector?: string;
    contrato?: string;
    provincia?: string;
    cityId?: string;
    descripcion?: string;
    general?: string;
}

const SECTORES = [
    "Hostelería y restauración", "Construcción y obras", "Limpieza y mantenimiento",
    "Cuidado de personas", "Logística y almacén", "Comercio y ventas",
    "Administración", "Tecnología e IT", "Agricultura", "Educación y formación",
    "Salud", "Seguridad", "Otros",
];

const CONTRATOS: { value: TipoContrato; label: string; descripcion: string }[] = [
    { value: "full_time", label: "Jornada completa", descripcion: "8 horas diarias" },
    { value: "part_time", label: "Media jornada", descripcion: "Aprox. 4 horas diarias" },
    { value: "temporary", label: "Temporal", descripcion: "Contrato de duración limitada" },
    { value: "freelance", label: "Por horas", descripcion: "Pago por hora trabajada" },
];

const initialForm: FormAnuncio = {
    titulo: "",
    sector: "",
    contrato: "",
    provincia: "",
    cityId: "",
    descripcion: "",
    vacantes: 1,
};

function CreateJob() {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const [form, setForm] = useState<FormAnuncio>(initialForm);
    const [errors, setErrors] = useState<FormAnuncioErrors>({});
    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState<City[]>([]);

    useEffect(() => {
        api.get<City[]>("/cities").then(setCities).catch(() => {});
    }, []);

    const regiones = [...new Set(cities.map((c) => c.region))].sort();
    const ciudadesDisponibles = cities.filter((c) => c.region === form.provincia);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "vacantes" ? Number(value)
                  : name === "cityId" ? (value === "" ? "" : Number(value))
                  : value,
            ...(name === "provincia" ? { cityId: "" } : {}),
        }));
        setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    };

    const handleContrato = (value: TipoContrato) => {
        setForm((prev) => ({ ...prev, contrato: value }));
        setErrors((prev) => ({ ...prev, contrato: "" }));
    };

    const validate = (): boolean => {
        const newErrors: FormAnuncioErrors = {};
        if (!form.titulo.trim()) newErrors.titulo = "El título es obligatorio";
        if (!form.sector) newErrors.sector = "Selecciona un sector";
        if (!form.contrato) newErrors.contrato = "Selecciona el tipo de contrato";
        if (!form.provincia) newErrors.provincia = "Selecciona una provincia";
        if (!form.cityId) newErrors.cityId = "Selecciona una ciudad";
        if (!form.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await api.post("/jobs", {
                titulo: form.titulo,
                descripcion: form.descripcion,
                contrato: form.contrato,
                cityId: form.cityId,
                sector: form.sector,
                vacantes: form.vacantes,
            });
            navigate("/dashboard-empleador");
        } catch (error) {
            setErrors({ general: (error as Error).message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-12 px-4" style={{ backgroundColor: "var(--bg-main)" }}>
            <div className="max-w-2xl mx-auto">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[#6B7280] dark:text-white/70 hover:text-white text-sm mb-6 transition"
                >
                    <span>←</span>
                    Volver al panel
                </button>

                <h1 className="text-[#1E1B4B] dark:text-white text-3xl font-bold mb-1">Publicar oferta</h1>
                <p className="text-[#6B7280] dark:text-white/70 text-base mb-8">
                    Completa los detalles para que los candidatos encuentren tu oferta
                </p>

                {!usuario && (
                    <div className="mb-6 px-5 py-4 rounded-xl border border-[#1D9E75]/40 bg-[#1D9E75]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-green-300 text-sm">
                            ¿Aún no tienes cuenta? Necesitarás una para publicar tu oferta.
                        </p>
                        <div className="flex gap-3 shrink-0">
                            <Link
                                to="/registro"
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1D9E75] hover:brightness-110 transition"
                            >
                                Crear cuenta
                            </Link>
                            <Link
                                to="/login"
                                className="px-4 py-2 rounded-lg text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition"
                            >
                                Iniciar sesión
                            </Link>
                        </div>
                    </div>
                )}

                {errors.general && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
                        <p className="text-red-400 text-sm">{errors.general}</p>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl p-8 flex flex-col gap-6"
                    style={{ backgroundColor: "var(--bg-card)" }}
                >
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-[#1E1B4B] dark:text-white font-medium">Título del puesto</label>
                        <input
                            type="text"
                            name="titulo"
                            value={form.titulo}
                            onChange={handleChange}
                            placeholder="Ej: Camarero/a de sala..."
                            className="w-full rounded-xl px-4 py-2.5 bg-white dark:bg-white/5 border border-white/10 text-[#1E1B4B] dark:text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                        />
                        {errors.titulo && <p className="text-red-400 text-xs">{errors.titulo}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-[#1E1B4B] dark:text-white font-medium">Sector</label>
                        <select
                            name="sector"
                            value={form.sector}
                            onChange={handleChange}
                            className="w-full rounded-xl px-4 py-2.5 bg-[#182320] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] appearance-none"
                        >
                            <option value="" className="bg-[#182320]">Selecciona un sector</option>
                            {SECTORES.map((s) => (
                                <option key={s} value={s} className="bg-[#182320]">{s}</option>
                            ))}
                        </select>
                        {errors.sector && <p className="text-red-400 text-xs">{errors.sector}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-[#1E1B4B] dark:text-white font-medium">Tipo de contrato</label>
                        <div className="grid grid-cols-2 gap-3">
                            {CONTRATOS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => handleContrato(c.value)}
                                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${form.contrato === c.value
                                            ? "border-[#1D9E75] bg-[#1D9E75]/10"
                                            : "border-white/10 hover:border-white/20"
                                        }`}
                                >
                                    <p className={`text-sm font-semibold ${form.contrato === c.value ? "text-[#1D9E75]" : "text-[#1E1B4B] dark:text-white"}`}>
                                        {c.label}
                                    </p>
                                    <p className="text-[#6B7280] dark:text-white/70 text-xs mt-0.5">{c.descripcion}</p>
                                </button>
                            ))}
                        </div>
                        {errors.contrato && <p className="text-red-400 text-xs">{errors.contrato}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-[#1E1B4B] dark:text-white font-medium">Provincia</label>
                            <select
                                name="provincia"
                                value={form.provincia}
                                onChange={handleChange}
                                className="w-full rounded-xl px-4 py-2.5 bg-[#182320] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] appearance-none"
                            >
                                <option value="" className="bg-[#182320]">Selecciona provincia</option>
                                {regiones.map((r) => (
                                    <option key={r} value={r} className="bg-[#182320]">{r}</option>
                                ))}
                            </select>
                            {errors.provincia && <p className="text-red-400 text-xs">{errors.provincia}</p>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-[#1E1B4B] dark:text-white font-medium">Ciudad</label>
                            <select
                                name="cityId"
                                value={String(form.cityId)}
                                onChange={handleChange}
                                disabled={!form.provincia}
                                className="w-full rounded-xl px-4 py-2.5 bg-[#182320] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] appearance-none disabled:opacity-40"
                            >
                                <option value="" className="bg-[#182320]">Selecciona ciudad</option>
                                {ciudadesDisponibles.map((c) => (
                                    <option key={c.id} value={String(c.id)} className="bg-[#182320]">{c.name}</option>
                                ))}
                            </select>
                            {errors.cityId && <p className="text-red-400 text-xs">{errors.cityId}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-[#1E1B4B] dark:text-white font-medium">Número de vacantes</label>
                        <input
                            type="number"
                            name="vacantes"
                            value={form.vacantes}
                            onChange={handleChange}
                            min={1}
                            max={99}
                            className="w-full rounded-xl px-4 py-2.5 bg-white dark:bg-white/5 border border-white/10 text-[#1E1B4B] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-[#1E1B4B] dark:text-white font-medium">Descripción del puesto</label>
                        <textarea
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Describe el puesto, requisitos, condiciones, horarios..."
                            className="w-full rounded-xl px-4 py-2.5 bg-white dark:bg-white/5 border border-white/10 text-[#1E1B4B] dark:text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75] resize-none"
                        />
                        {errors.descripcion && <p className="text-red-400 text-xs">{errors.descripcion}</p>}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-3 rounded-xl font-semibold text-[#6B7280] dark:text-white/70 text-sm border border-white/10 hover:border-white/20 hover:text-white transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl font-semibold text-white text-sm hover:brightness-110 transition disabled:opacity-50"
                            style={{ backgroundColor: "#2d7a4f" }}
                        >
                            {loading ? "Publicando..." : "Publicar oferta"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateJob;
