import React from 'react'
import { ProfileScreen } from '@/features/shared'

interface SupervisorPerfilScreenProps {
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

export function SupervisorPerfilScreen({
  user,
  onLogout,
  onNavigate,
  onUpdateProfile,
  isLoading,
}: SupervisorPerfilScreenProps) {
  const userWithRole = {
    ...user,
    rol: user.rol || 'supervisor',
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
