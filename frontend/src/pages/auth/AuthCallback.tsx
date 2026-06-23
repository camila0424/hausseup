import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function AuthCallback() {
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const nombre = params.get("nombre") ?? "Usuario";
        const correo = params.get("correo") ?? "";
        const rol = params.get("rol") as "worker" | "employer" | null;
        console.log("rol recibido:", rol);

        const id = params.get("id") ?? "";

        if (token && rol && id) {
            try {
                login(token, { id, nombre, correo, rol });

                setTimeout(() => {
                    window.location.href = "/agente";
                }, 100);
            } catch {
                window.location.href = "/login?error=google";
            }
        } else {
            window.location.href = "/login?error=google";
        }
    }, []);

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center gap-4"
            style={{ backgroundColor: "var(--bg-main)" }}
        >
            <div className="w-10 h-10 rounded-full bg-[#C1502E] flex items-center justify-center animate-pulse">
                <span className="text-white font-bold font-serif text-base">H</span>
            </div>
            <p className="text-[#1F2A44] text-sm">Iniciando sesión con Google...</p>
        </div>
    );
}

export default AuthCallback;
