import React from 'react'
import { ProfileScreen } from '@/features/shared'
import type { UserRole } from '@/components/domain/auth'

interface ClientePerfilScreenProps {
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

export function ClientePerfilScreen({ user, onLogout, onNavigate }: ClientePerfilScreenProps) {
  const userWithRole = {
    ...user,
    rol: 'CLIENTE' as UserRole,
  }

  return (
    <ProfileScreen
      user={userWithRole}
      onLogout={onLogout}
      onNavigate={onNavigate}
    />
  )
}
