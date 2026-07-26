import React, { Suspense, useEffect } from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router"
import { AuthProvider } from "./context/AuthContext.tsx"
import { AuthGuard } from "./components/AuthGuard"
import { TokenValidator } from "./components/TokkenValidator.tsx"
import { Layout } from "./components/Layout"

import { useAuth } from "./hooks/useAuth.ts"

const LandingPage = React.lazy(() => import("./pages/LandingPage"))
const PlanosPage = React.lazy(() => import("./pages/PlanosPage"))
const CamisasPage = React.lazy(() => import("./pages/CamisasPage"))
const LegalDocumentPage = React.lazy(() =>
  import("./pages/LegalDocumentPage").then(({ LegalDocumentPage }) => ({
    default: LegalDocumentPage,
  })),
)
const LegalAcceptancePage = React.lazy(() =>
  import("./pages/LegalAcceptancePage").then(({ LegalAcceptancePage }) => ({
    default: LegalAcceptancePage,
  })),
)
const PrivacySettingsPage = React.lazy(() =>
  import("./pages/PrivacySettingsPage").then(({ PrivacySettingsPage }) => ({
    default: PrivacySettingsPage,
  })),
)
const OnboardingHelpPage = React.lazy(() =>
  import("./pages/OnboardingHelpPage").then(({ OnboardingHelpPage }) => ({
    default: OnboardingHelpPage,
  })),
)
const LoginPage = React.lazy(() =>
  import("./pages/LoginPage").then(({ LoginPage }) => ({ default: LoginPage })),
)
const RegisterPage = React.lazy(() =>
  import("./pages/auth/RegisterPage").then(({ RegisterPage }) => ({
    default: RegisterPage,
  })),
)
const AdminDashboard = React.lazy(() =>
  import("./pages/auth/AdminDashboard").then(({ AdminDashboard }) => ({
    default: AdminDashboard,
  })),
)
const InviteCodesPage = React.lazy(() =>
  import("./pages/admin/InviteCodesPage").then(({ InviteCodesPage }) => ({
    default: InviteCodesPage,
  })),
)
const LeadLinksPage = React.lazy(() =>
  import("./pages/admin/LeadLinksPage").then(({ LeadLinksPage }) => ({
    default: LeadLinksPage,
  })),
)
const ProfessoresPage = React.lazy(() =>
  import("./pages/admin/ProfessoresPage").then(({ ProfessoresPage }) => ({
    default: ProfessoresPage,
  })),
)
const ProfessorForm = React.lazy(() =>
  import("./pages/admin/ProfessorForm").then(({ ProfessorForm }) => ({
    default: ProfessorForm,
  })),
)
const FinanceiroPage = React.lazy(() => import("./pages/admin/FinanceiroPage"))
const PrivacyRequestsPage = React.lazy(() =>
  import("./pages/admin/PrivacyRequestsPage").then(({ PrivacyRequestsPage }) => ({
    default: PrivacyRequestsPage,
  })),
)
const ProfessorHomeDashboardPage = React.lazy(() =>
  import("./pages/professor/ProfessorHomeDashboardPage").then(
    ({ ProfessorHomeDashboardPage }) => ({ default: ProfessorHomeDashboardPage }),
  ),
)
const ProfessorFinanceiroPage = React.lazy(() =>
  import("./pages/professor/ProfessorFinanceiroPage").then(
    ({ ProfessorFinanceiroPage }) => ({ default: ProfessorFinanceiroPage }),
  ),
)
const ProfessorAlunoContextPage = React.lazy(() =>
  import("./pages/professor/ProfessorAlunoContextPage").then(
    ({ ProfessorAlunoContextPage }) => ({ default: ProfessorAlunoContextPage }),
  ),
)
const PlanoTreinoEditorPage = React.lazy(() =>
  import("./pages/professor/PlanoTreinoEditorPage").then(
    ({ PlanoTreinoEditorPage }) => ({ default: PlanoTreinoEditorPage }),
  ),
)
const PlanoDietaEditorPage = React.lazy(() =>
  import("./pages/professor/PlanoDietaEditorPage").then(
    ({ PlanoDietaEditorPage }) => ({ default: PlanoDietaEditorPage }),
  ),
)
const AnswersList = React.lazy(() =>
  import("./pages/AnswerList").then(({ AnswersList }) => ({
    default: AnswersList,
  })),
)
const AnswerForm = React.lazy(() =>
  import("./pages/AnswerForm").then(({ AnswerForm }) => ({
    default: AnswerForm,
  })),
)
const EvolucaoPage = React.lazy(() =>
  import("./pages/EvolucaoPage").then(({ EvolucaoPage }) => ({
    default: EvolucaoPage,
  })),
)
const FotosArquivosPage = React.lazy(() =>
  import("./pages/FotosArquivosPage.tsx").then(({ FotosArquivosPage }) => ({
    default: FotosArquivosPage,
  })),
)
const MeuTreinoPage = React.lazy(() =>
  import("./pages/aluno/MeuTreinoPage").then(({ MeuTreinoPage }) => ({
    default: MeuTreinoPage,
  })),
)
const MinhaDietaPage = React.lazy(() =>
  import("./pages/aluno/MinhaDietaPage").then(({ MinhaDietaPage }) => ({
    default: MinhaDietaPage,
  })),
)
const AlunoDashboardPage = React.lazy(() =>
  import("./pages/aluno/AlunoDashboardPage").then(({ AlunoDashboardPage }) => ({
    default: AlunoDashboardPage,
  })),
)

const RouteLoading: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-black">
    <div
      aria-label="Carregando"
      className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white"
      role="status"
    />
  </div>
)


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
          navigate("/aluno/dashboard", { replace: true })
          break
        default:
          navigate("/login", { replace: true })
      }
    } else {
      navigate("/landing", { replace: true })
    }
  }, [user, navigate])

  return null
}

function AppRoutes() {
  return (
    <>
      {/* Verifica token periodicamente */}
      <TokenValidator />

      <Suspense fallback={<RouteLoading />}>
        <Routes>
        {/* Landing pública */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/planos" element={<PlanosPage />} />
        <Route path="/camisas" element={<CamisasPage />} />
        <Route
          path="/privacidade"
          element={<LegalDocumentPage documentType="PRIVACY_POLICY" />}
        />
        <Route
          path="/termos"
          element={<LegalDocumentPage documentType="TERMS_OF_USE" />}
        />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/legal/pendente"
          element={
            <AuthGuard>
              <LegalAcceptancePage />
            </AuthGuard>
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<RoleBasedRedirect />} />

        {/* ADMIN */}
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
                  <Route
                    path="alunos/:id/evolucao"
                    element={<EvolucaoPage />}
                  />
                  <Route
                    path="alunos/:id/fotos-arquivos"
                    element={<FotosArquivosPage />}
                  />
                  <Route
                    path="alunos/:id/treino"
                    element={<PlanoTreinoEditorPage />}
                  />
                  <Route
                    path="alunos/:id/dieta"
                    element={<PlanoDietaEditorPage />}
                  />
                  <Route path="invite-codes" element={<InviteCodesPage />} />
                  <Route path="lead-links" element={<LeadLinksPage />} />
                  <Route path="financeiro" element={<FinanceiroPage />} />
                  <Route path="lgpd" element={<PrivacyRequestsPage />} />
                  <Route path="privacidade" element={<PrivacySettingsPage />} />
                  <Route path="professores" element={<ProfessoresPage />} />
                  <Route path="professores/new" element={<ProfessorForm />} />
                  <Route
                    path="professores/:id/edit"
                    element={<ProfessorForm />}
                  />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Layout>
            </AuthGuard>
          }
        />

        {/* PROFESSOR */}
        <Route
          path="/professor/*"
          element={
            <AuthGuard allowedRoles={["PROFESSOR"]}>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<ProfessorHomeDashboardPage />} />
                  <Route path="alunos" element={<AnswersList />} />
                  <Route path="alunos/new" element={<AnswerForm />} />
                  <Route path="alunos/:id/*" element={<ProfessorAlunoContextPage />} />
                  <Route path="financeiro" element={<ProfessorFinanceiroPage />} />
                  <Route path="privacidade" element={<PrivacySettingsPage />} />
                  <Route path="ajuda" element={<OnboardingHelpPage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Layout>
            </AuthGuard>
          }
        />

        {/* ALUNO */}
        <Route
          path="/aluno/*"
          element={
            <AuthGuard allowedRoles={["ALUNO"]}>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<AlunoDashboardPage />} />
                  <Route path="perfil" element={<AnswerForm />} />
                  <Route path="treino" element={<MeuTreinoPage />} />
                  <Route path="dieta" element={<MinhaDietaPage />} />
                  <Route path="evolucao" element={<EvolucaoPage />} />
                  <Route
                    path="fotos-arquivos"
                    element={<FotosArquivosPage />}
                  />
                  <Route path="privacidade" element={<PrivacySettingsPage />} />
                  <Route path="ajuda" element={<OnboardingHelpPage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </Layout>
            </AuthGuard>
          }
        />

        {/* Unauthorized */}
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-black">
              <div className="text-center bg-zinc-950 border border-zinc-800 p-8 rounded-lg shadow-lg text-white">
                <h1 className="text-4xl font-bold text-red-600 mb-4">
                  ⛔ Acesso Negado
                </h1>
                <p className="text-gray-300 mb-6">
                  Você não tem permissão para acessar esta página.
                </p>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="bg-white text-black px-6 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Voltar ao Início
                </button>
              </div>
            </div>
          }
        />

        {/* Fallback geral */}
        <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </Suspense>
    </>
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
