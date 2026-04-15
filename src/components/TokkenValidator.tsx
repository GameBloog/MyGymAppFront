import { useEffect, useRef } from "react"
import { useAuth } from "../hooks/useAuth"
import { authApi } from "../services/api"

/**
 * Mantem a sessão aquecida sem tomar decisões destrutivas.
 * O interceptor central decide quando uma sessão realmente expirou.
 */
export const TokenValidator: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const checkingRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const checkToken = async () => {
      if (checkingRef.current) return
      checkingRef.current = true

      try {
        await authApi.me()
      } catch (error) {
        if (import.meta.env.DEV) {
          console.debug("Falha ao validar sessão no keep-alive:", error)
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
  }, [isAuthenticated])

  return null
}
