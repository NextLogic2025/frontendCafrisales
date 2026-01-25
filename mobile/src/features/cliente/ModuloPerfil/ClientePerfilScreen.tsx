import React from 'react'
import { ProfileScreen } from '@/features/shared'
interface ClientePerfilScreenProps {
  user: {
    id: string
    nombre: string
    email: string
    telefono?: string
    avatar?: string
    rol?: string
  }
  onLogout: () => void
  onNavigate: (screen: string, params?: any) => void
  onUpdateProfile?: (data: { nombres?: string; apellidos?: string; telefono?: string }) => Promise<boolean>
  isLoading?: boolean
}

export function ClientePerfilScreen({
  user,
  onLogout,
  onNavigate,
  onUpdateProfile,
  isLoading,
}: ClientePerfilScreenProps) {
  const userWithRole = {
    ...user,
    rol: user.rol || 'cliente',
  }

  return (
    <ProfileScreen
      user={userWithRole}
      onLogout={onLogout}
      onNavigate={onNavigate}
      onUpdateProfile={onUpdateProfile}
      isLoading={isLoading}
    />
  )
}
