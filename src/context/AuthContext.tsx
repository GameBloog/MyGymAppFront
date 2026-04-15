import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { AuthContext } from "./AuthContext"
import {
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_SESSION_REFRESHED_EVENT,
  authApi,
} from "../services/api"
import { showToast } from "../utils/toast"
import {
  type User,
  type LoginDTO,
  type RegisterDTO,
  type LoginResponse,
} from "../types"

interface AuthProviderProps {
  children: ReactNode
}

const clearStoredAuth = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const sessionExpiredNotifiedRef = useRef(false)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error)
        clearStoredAuth()
      }
    }

    setIsLoading(false)
  }, [])

  const clearAuthState = useCallback(() => {
    setToken(null)
    setUser(null)
    clearStoredAuth()
  }, [])

  useEffect(() => {
    const handleSessionRefreshed = (event: Event) => {
      const session = (event as CustomEvent<LoginResponse>).detail
      if (!session?.token || !session.user) return

      sessionExpiredNotifiedRef.current = false
      setToken(session.token)
      setUser(session.user)
    }

    const handleSessionExpired = () => {
      const hadSession =
        !!localStorage.getItem("token") || !!localStorage.getItem("user")

      clearAuthState()

      if (hadSession && !sessionExpiredNotifiedRef.current) {
        sessionExpiredNotifiedRef.current = true
        showToast.warning("Sua sessão expirou. Faça login novamente.")
      }
    }

    window.addEventListener(
      AUTH_SESSION_REFRESHED_EVENT,
      handleSessionRefreshed,
    )
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired)

    return () => {
      window.removeEventListener(
        AUTH_SESSION_REFRESHED_EVENT,
        handleSessionRefreshed,
      )
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleSessionExpired,
      )
    }
  }, [clearAuthState])

  const login = useCallback(async (data: LoginDTO) => {
    try {
      const response: LoginResponse = await authApi.login(data)
      sessionExpiredNotifiedRef.current = false
      setToken(response.token)
      setUser(response.user)
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
      showToast.success(`Bem-vindo(a), ${response.user.nome}!`)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Erro ao fazer login")
    }
  }, [])

  const register = useCallback(async (data: RegisterDTO) => {
    try {
      await authApi.register(data)
      showToast.success("Conta criada com sucesso!")
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Erro ao criar conta")
    }
  }, [])

  const logout = useCallback(() => {
    void authApi.logout().catch(() => {})
    sessionExpiredNotifiedRef.current = false
    clearAuthState()
    showToast.success("Logout realizado")
  }, [clearAuthState])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
    }),
    [isLoading, login, logout, register, token, updateUser, user],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
