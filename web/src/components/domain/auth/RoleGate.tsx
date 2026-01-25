import React from 'react'

export type UserRole = 'CLIENTE' | 'VENDEDOR' | 'BODEGUERO' | 'SUPERVISOR' | 'TRANSPORTISTA'

export interface RoleGateProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
  currentRole: UserRole
}

/**
 * Componente para renderizar contenido condicionalmente según el rol del usuario
 *
 * @example
 * <RoleGate allowedRoles={['VENDEDOR', 'SUPERVISOR']} currentRole={user.role}>
 *   <Card>Contenido solo para vendedores y supervisores</Card>
 * </RoleGate>
 */
export const RoleGate: React.FC<RoleGateProps> = ({
  allowedRoles,
  children,
  fallback = null,
  currentRole,
}) => {
  if (!allowedRoles.includes(currentRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
