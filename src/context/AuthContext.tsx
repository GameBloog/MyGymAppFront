import React, { useState, useEffect, type ReactNode } from "react"
import { AuthContext } from "./AuthContext"
import { authApi } from "../services/api"
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (data: LoginDTO) => {
    try {
      const response: LoginResponse = await authApi.login(data)
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
  }

  const register = async (data: RegisterDTO) => {
    try {
      await authApi.register(data)
      showToast.success("Conta criada com sucesso!")
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Erro ao criar conta")
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    showToast.success("Logout realizado")
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
