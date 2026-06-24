import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface Usuario {
    id: string;
    nombre: string;
    correo: string;
    rol: "worker" | "employer";
    role?: string;
}

interface AuthContextType {
    usuario: Usuario | null;
    token: string | null;
    login: (token: string, usuario: Usuario) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function normalizarUsuario(u: Usuario): Usuario {
    return {
        ...u,
        rol: (u.rol || (u as any).role || "worker") as "worker" | "employer",
    };
}

function getStoredAuth(): { token: string | null; usuario: Usuario | null } {
    const storedToken = localStorage.getItem("token");
    const storedUsuario = localStorage.getItem("usuario");
    if (storedToken && storedUsuario) {
        const parsed = JSON.parse(storedUsuario) as Usuario;
        if (!parsed.rol && !(parsed as any).role) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            return { token: null, usuario: null };
        }
        return { token: storedToken, usuario: normalizarUsuario(parsed) };
    }
    return { token: null, usuario: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const stored = getStoredAuth();
    const [usuario, setUsuario] = useState<Usuario | null>(stored.usuario);
    const [token, setToken] = useState<string | null>(stored.token);

    const login = (newToken: string, newUsuario: Usuario) => {
        const usuarioNormalizado = normalizarUsuario(newUsuario);
        localStorage.setItem("token", newToken);
        localStorage.setItem("usuario", JSON.stringify(usuarioNormalizado));
        setToken(newToken);
        setUsuario(usuarioNormalizado);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setToken(null);
        setUsuario(null);
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                token,
                login,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }
    return context;
}