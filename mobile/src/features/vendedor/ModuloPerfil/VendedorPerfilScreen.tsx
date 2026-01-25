import React from 'react'
import { ProfileScreen } from '@/features/shared'

interface VendedorPerfilScreenProps {
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

export function VendedorPerfilScreen({
  user,
  onLogout,
  onNavigate,
  onUpdateProfile,
  isLoading,
}: VendedorPerfilScreenProps) {
  const userWithRole = {
    ...user,
    rol: user.rol || 'vendedor',
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
