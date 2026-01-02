// src/App.tsx - ATUALIZADO COM PÁGINA DE ERRO
import React, { useEffect } from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom"
import { AuthProvider } from "./context/AuthContext.tsx"
import { AuthGuard } from "./components/AuthGuard"
import { Layout } from "./components/Layout"
import { ErrorPage } from "./components/ErrorBoundary"

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

const ErrorPageWrapper: React.FC = () => {
  const [searchParams] = useSearchParams()
  const code = searchParams.get("code")
  const message = searchParams.get("message")
  const status = searchParams.get("status")

  return (
    <ErrorPage
      error={{
        code: code || undefined,
        message: message || undefined,
        status: status ? parseInt(status) : undefined,
      }}
    />
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/error" element={<ErrorPageWrapper />} />
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
                <Route path="alunos/:id" element={<AnswersList />} />
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
                <Route path="alunos/:id" element={<AnswersList />} />
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
          <ErrorPage
            error={{
              status: 403,
              code: "FORBIDDEN",
              message: "Você não tem permissão para acessar esta página.",
            }}
            showLogout={true}
          />
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
