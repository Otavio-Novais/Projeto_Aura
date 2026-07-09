import { useState, type FormEvent } from 'react'
import { apiPost, apiPut } from '../api'
import { useAuth } from '../contexts/useAuth'
import { useToast } from '../contexts/useToast'
import FormField from '../components/FormField'
import { inputClass } from '../components/inputClass'

export default function ProfilePage() {
  const { user } = useAuth()
  const toast = useToast()

  const [email, setEmail] = useState(user?.email ?? '')
  const [savingEmail, setSavingEmail] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})
    setSavingEmail(true)
    try {
      await apiPut('/auth/profile', { email })
      toast.addToast('Email atualizado com sucesso', 'success')
    } catch (err) {
      toast.addToast(err instanceof Error ? err.message : 'Erro ao atualizar', 'error')
    } finally {
      setSavingEmail(false)
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    const e2: Record<string, string> = {}
    if (!currentPassword) e2.currentPassword = 'Senha atual é obrigatória'
    if (newPassword.length < 6) e2.newPassword = 'Mínimo 6 caracteres'
    if (newPassword !== confirmPassword) e2.confirmPassword = 'Senhas não conferem'
    setErrors(e2)
    if (Object.keys(e2).length > 0) return

    setSavingPassword(true)
    try {
      await apiPost('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      toast.addToast('Senha alterada com sucesso', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.addToast(err instanceof Error ? err.message : 'Erro ao alterar senha', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold mb-6">Meu Perfil</h2>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Dados da Conta</h3>
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-800">
          <div className="w-12 h-12 bg-purple-600/30 rounded-full flex items-center justify-center text-xl font-medium text-purple-400">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-lg">{user?.username}</p>
            <p className="text-sm text-gray-500">ID: {user?.id}</p>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <FormField label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass()}
              placeholder="seu@email.com"
            />
          </FormField>
          <button type="submit" disabled={savingEmail} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {savingEmail ? 'Salvando...' : 'Salvar Email'}
          </button>
        </form>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Alterar Senha</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <FormField label="Senha Atual" error={errors.currentPassword}>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); if (errors.currentPassword) setErrors({}) }}
              className={inputClass(errors.currentPassword)}
              placeholder="••••••••"
            />
          </FormField>
          <FormField label="Nova Senha" error={errors.newPassword}>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); if (errors.newPassword) setErrors({}) }}
              className={inputClass(errors.newPassword)}
              placeholder="Mínimo 6 caracteres"
            />
          </FormField>
          <FormField label="Confirmar Nova Senha" error={errors.confirmPassword}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors({}) }}
              className={inputClass(errors.confirmPassword)}
              placeholder="••••••••"
            />
          </FormField>
          <button type="submit" disabled={savingPassword} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {savingPassword ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
