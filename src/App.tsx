import React, { useEffect } from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom"
import { AuthProvider } from "./context/AuthContext.tsx"
import { AuthGuard } from "./components/AuthGuard"
import { Layout } from "./components/Layout"

// Auth Pages
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/auth/RegisterPage"

// Admin Pages
import { AdminDashboard } from "./pages/auth/AdminDashboard"
import { InviteCodesPage } from "./pages/admin/InviteCodesPage"
import { ProfessoresPage } from "./pages/admin/ProfessoresPage"
import { ProfessorForm } from "./pages/admin/ProfessorForm"

// Professor Pages
import { ProfessorDashboard } from "./pages/professor/ProfessorDashboard"

// Shared Pages
import { AnswersList } from "./pages/AnswerList"
import { AnswerForm } from "./pages/AnswerForm"
import { EvolucaoPage } from "./pages/EvolucaoPage"
import { useAuth } from "./hooks/useAuth.ts"

const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "ADMIN":
          navigate("/admin/dashboard", { replace: true })
          break
        case "PROFESSOR":
          navigate("/professor/dashboard", { replace: true })
          break
        case "ALUNO":
          navigate("/aluno/perfil", { replace: true })
          break
        default:
          navigate("/login", { replace: true })
      }
    } else {
      navigate("/login", { replace: true })
    }
  }, [user, navigate])

  return null
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <AuthGuard allowedRoles={["ADMIN"]}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="alunos" element={<AnswersList />} />
                <Route path="alunos/new" element={<AnswerForm />} />
                <Route path="alunos/:id/edit" element={<AnswerForm />} />
                <Route path="alunos/:id/evolucao" element={<EvolucaoPage />} />
                <Route path="invite-codes" element={<InviteCodesPage />} />
                <Route path="professores" element={<ProfessoresPage />} />
                <Route path="professores/new" element={<ProfessorForm />} />
                <Route
                  path="professores/:id/edit"
                  element={<ProfessorForm />}
                />
              </Routes>
            </Layout>
          </AuthGuard>
        }
      />

      {/* Professor Routes */}
      <Route
        path="/professor/*"
        element={
          <AuthGuard allowedRoles={["PROFESSOR"]}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<ProfessorDashboard />} />
                <Route path="alunos" element={<AnswersList />} />
                <Route path="alunos/new" element={<AnswerForm />} />
                <Route path="alunos/:id/edit" element={<AnswerForm />} />
                <Route path="alunos/:id/evolucao" element={<EvolucaoPage />} />
              </Routes>
            </Layout>
          </AuthGuard>
        }
      />

      {/* Aluno Routes */}
      <Route
        path="/aluno/*"
        element={
          <AuthGuard allowedRoles={["ALUNO"]}>
            <Layout>
              <Routes>
                <Route path="perfil" element={<AnswerForm />} />
                <Route path="evolucao" element={<EvolucaoPage />} />
              </Routes>
            </Layout>
          </AuthGuard>
        }
      />

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center bg-white p-8 rounded-lg shadow-lg">
              <h1 className="text-4xl font-bold text-red-600 mb-4">
                ⛔ Acesso Negado
              </h1>
              <p className="text-gray-600 mb-6">
                Você não tem permissão para acessar esta página.
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
