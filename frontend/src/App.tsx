import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/common/Layout";
import AuthLayout from "./components/common/AuthLayout";
import LandingPage from "./pages/LandingPage";
import AuthChoice from "./pages/auth/AuthChoice";
import RegisterManual from "./pages/auth/RegisterManual";
import LoginPage from "./pages/auth/LoginPage";
import UserIntent from "./pages/selection/UserIntent";
import WorkerSearch from "./pages/worker/WorkerSearch";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import CreateJob from "./pages/employer/CreateJob";
import AuthCallback from "./pages/auth/AuthCallback";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { useAuth } from "./context/AuthContext";
import "./styles/App.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Páginas públicas — con Header público y Footer */}
        <Route
          path="/"
          element={
            <Layout>
              <LandingPage />
            </Layout>
          }
        />
        <Route
          path="/registro"
          element={
            <Layout>
              <AuthChoice />
            </Layout>
          }
        />
        <Route
          path="/registro/manual"
          element={
            <Layout>
              <RegisterManual />
            </Layout>
          }
        />
        <Route
          path="/registro/tipo"
          element={
            <Layout>
              <UserIntent />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <LoginPage />
            </Layout>
          }
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/privacidad"
          element={<PrivacyPolicy />}
        />

        {/* Páginas autenticadas — con Header con cerrar sesión y Footer */}
        <Route
          path="/busco-empleo"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <WorkerSearch />
              </AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-empleador"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <EmployerDashboard />
              </AuthLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/publicar-empleo"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <CreateJob />
              </AuthLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;