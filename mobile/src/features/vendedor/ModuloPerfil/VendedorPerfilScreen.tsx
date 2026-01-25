import React from 'react'
import { ProfileScreen } from '@/features/shared'
import type { UserRole } from '@/components/domain/auth'

interface VendedorPerfilScreenProps {
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

export function VendedorPerfilScreen({ user, onLogout, onNavigate }: VendedorPerfilScreenProps) {
  const userWithRole = {
    ...user,
    rol: 'VENDEDOR' as UserRole,
  }

  return (
    <ProfileScreen
      user={userWithRole}
      onLogout={onLogout}
      onNavigate={onNavigate}
    />
  )
}
