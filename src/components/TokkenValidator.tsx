import { useEffect, useRef } from "react"
import { useAuth } from "../hooks/useAuth"
import { authApi } from "../services/api"
import { showToast } from "../utils/toast"

/**
 * Componente que verifica periodicamente se o token ainda é válido
 * Se o token expirou, faz logout automático e redireciona para login
 */
export const TokenValidator: React.FC = () => {
  const { isAuthenticated, logout } = useAuth()
  const checkingRef = useRef(false)
  const notifiedRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const checkToken = async () => {
      if (checkingRef.current) return
      checkingRef.current = true

      try {
        const isValid = await authApi.checkToken()

        if (!isValid && !notifiedRef.current) {
          notifiedRef.current = true
          showToast.warning("Sua sessão expirou. Faça login novamente.")
          logout()
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error)
        if (!notifiedRef.current) {
          notifiedRef.current = true
          showToast.warning("Sua sessão expirou. Faça login novamente.")
          logout()
        }
      } finally {
        checkingRef.current = false
      }
    }

    checkToken()

    const interval = setInterval(checkToken, 5 * 60 * 1000)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkToken()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isAuthenticated, logout])

  return null 
}
