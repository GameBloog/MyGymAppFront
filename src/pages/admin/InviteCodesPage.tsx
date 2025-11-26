import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Ticket, Plus, Copy, Check, ArrowLeft } from "lucide-react"
import { Card, Button, Badge } from "../../components/ui"
import { useInviteCodes, useCreateInviteCode } from "../../hooks/useInviteCodes"
import { CreateInviteCodeDTO } from "../../types"
import { showToast } from "../../utils/toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const InviteCodesPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: inviteCodes, isLoading } = useInviteCodes()
  const createInviteCode = useCreateInviteCode()

  const [showModal, setShowModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"PROFESSOR" | "ADMIN">(
    "PROFESSOR"
  )
  const [expiresInDays, setExpiresInDays] = useState<number>(30)
  const [hasExpiration, setHasExpiration] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCreateCode = async () => {
    console.log("🔧 Criando código...", {
      selectedRole,
      expiresInDays,
      hasExpiration,
    })

    try {
      const data: CreateInviteCodeDTO = {
        role: selectedRole,
      }

      if (hasExpiration) {
        data.expiresInDays = expiresInDays
      }

      const newCode = await createInviteCode.mutateAsync(data)
      console.log("✅ Código criado:", newCode)

      showToast.success(`Código ${newCode.code} criado com sucesso!`)
      setShowModal(false)

      handleCopyCode(newCode.code)
    } catch (error: any) {
      console.error("❌ Erro ao criar código:", error)
      showToast.error(error.message || "Erro ao criar código")
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    showToast.success("Código copiado para área de transferência!")
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleOpenModal = () => {
    console.log("🔧 Abrindo modal...")
    setShowModal(true)
    console.log("🔧 showModal agora é:", true)
  }

  const handleCloseModal = () => {
    console.log("🔧 Fechando modal...")
    setShowModal(false)
  }

  const getStatusBadge = (code: any) => {
    if (code.usedBy) {
      return <Badge variant="success">✅ Usado</Badge>
    }

    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return <Badge>⏰ Expirado</Badge>
    }

    return <Badge>🟢 Ativo</Badge>
  }

  const activeCodes = inviteCodes?.filter(
    (c) => !c.usedBy && (!c.expiresAt || new Date(c.expiresAt) > new Date())
  )
  const usedCodes = inviteCodes?.filter((c) => c.usedBy)

  console.log("🔧 Render InviteCodesPage:", { showModal, isLoading })

  if (isLoading) {
    return <div className="text-center py-12">Carregando códigos...</div>
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Códigos de Convite
            </h1>
            <p className="text-gray-600 mt-1">
              {activeCodes?.length || 0} ativos • {usedCodes?.length || 0}{" "}
              usados
            </p>
          </div>
        </div>

        <Button icon={Plus} onClick={handleOpenModal}>
          Gerar Novo Código
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Códigos Ativos</p>
              <p className="text-3xl font-bold text-green-600">
                {activeCodes?.length || 0}
              </p>
            </div>
            <Ticket className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Códigos Usados</p>
              <p className="text-3xl font-bold text-blue-600">
                {usedCodes?.length || 0}
              </p>
            </div>
            <Check className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Códigos</p>
              <p className="text-3xl font-bold text-gray-900">
                {inviteCodes?.length || 0}
              </p>
            </div>
            <Ticket className="h-8 w-8 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Lista de Códigos */}
      <div className="space-y-4">
        {inviteCodes && inviteCodes.length > 0 ? (
          inviteCodes.map((code) => (
            <Card key={code.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Ticket className="h-5 w-5 text-blue-600" />
                    <code className="text-lg font-mono font-bold text-gray-900">
                      {code.code}
                    </code>
                    {getStatusBadge(code)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Tipo</p>
                      <p className="font-medium text-gray-900">{code.role}</p>
                    </div>

                    <div>
                      <p className="text-gray-600">Criado em</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(code.createdAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>

                    {code.expiresAt && (
                      <div>
                        <p className="text-gray-600">Expira em</p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(code.expiresAt), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    )}

                    {code.usedBy && code.usedAt && (
                      <div>
                        <p className="text-gray-600">Usado em</p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(code.usedAt), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {!code.usedBy && (
                  <Button
                    variant="secondary"
                    icon={copiedCode === code.code ? Check : Copy}
                    onClick={() => handleCopyCode(code.code)}
                    className={copiedCode === code.code ? "bg-green-100" : ""}
                  >
                    {copiedCode === code.code ? "Copiado!" : "Copiar"}
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum código gerado
            </h3>
            <p className="text-gray-500 mb-6">
              Crie seu primeiro código de convite
            </p>
            <Button icon={Plus} onClick={handleOpenModal}>
              Gerar Primeiro Código
            </Button>
          </Card>
        )}
      </div>

      {/* Modal de Criação */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">Gerar Código de Convite</h2>

            <div className="space-y-6">
              {/* Tipo de Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Usuário
                </label>
                <div className="space-y-2">
                  <label
                    className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                    style={{
                      borderColor:
                        selectedRole === "PROFESSOR" ? "#3b82f6" : "#e5e7eb",
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="PROFESSOR"
                      checked={selectedRole === "PROFESSOR"}
                      onChange={(e) =>
                        setSelectedRole(e.target.value as "PROFESSOR")
                      }
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Professor</p>
                      <p className="text-sm text-gray-600">
                        Para cadastro de professores
                      </p>
                    </div>
                  </label>

                  <label
                    className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
                    style={{
                      borderColor:
                        selectedRole === "ADMIN" ? "#a855f7" : "#e5e7eb",
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="ADMIN"
                      checked={selectedRole === "ADMIN"}
                      onChange={(e) =>
                        setSelectedRole(e.target.value as "ADMIN")
                      }
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Administrador</p>
                      <p className="text-sm text-gray-600">
                        Para cadastro de admins
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Validade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Validade do Código
                </label>

                <label className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={hasExpiration}
                    onChange={(e) => setHasExpiration(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Código com validade
                  </span>
                </label>

                {hasExpiration && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Expira em</span>
                    <input
                      type="number"
                      value={expiresInDays}
                      onChange={(e) => setExpiresInDays(Number(e.target.value))}
                      min="1"
                      max="365"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <span className="text-sm text-gray-600">dias</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <Button
                onClick={handleCreateCode}
                isLoading={createInviteCode.isLoading}
                disabled={createInviteCode.isLoading}
                icon={Plus}
              >
                Gerar Código
              </Button>
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                disabled={createInviteCode.isLoading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
