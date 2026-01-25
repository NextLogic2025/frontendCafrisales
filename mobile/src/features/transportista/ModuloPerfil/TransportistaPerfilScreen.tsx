import React from 'react'
import { ProfileScreen } from '@/features/shared'
import type { UserRole } from '@/components/domain/auth'

interface TransportistaPerfilScreenProps {
  user: {
    id: string
    nombre: string
    email: string
    telefono?: string
    avatar?: string
  }
  onLogout: () => void
  onNavigate: (screen: string, params?: any) => void
}

export function TransportistaPerfilScreen({ user, onLogout, onNavigate }: TransportistaPerfilScreenProps) {
  const userWithRole = {
    ...user,
    rol: 'TRANSPORTISTA' as UserRole,
  }

  return (
    <ProfileScreen
      user={userWithRole}
      onLogout={onLogout}
      onNavigate={onNavigate}
    />
  )
}
