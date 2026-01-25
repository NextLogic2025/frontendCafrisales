import React from 'react'
import { ProfileScreen } from '@/features/shared'
import type { UserRole } from '@/components/domain/auth'

interface BodegueroPerfilScreenProps {
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

export function BodegueroPerfilScreen({ user, onLogout, onNavigate }: BodegueroPerfilScreenProps) {
  const userWithRole = {
    ...user,
    rol: 'BODEGUERO' as UserRole,
  }

  return (
    <ProfileScreen
      user={userWithRole}
      onLogout={onLogout}
      onNavigate={onNavigate}
    />
  )
}
