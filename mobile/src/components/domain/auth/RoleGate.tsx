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
 *   <ListItem title="Comisiones" />
 * </RoleGate>
 */
export function RoleGate({ allowedRoles, children, fallback = null, currentRole }: RoleGateProps) {
  if (!allowedRoles.includes(currentRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
