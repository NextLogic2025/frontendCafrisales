/**
 * EJEMPLOS DE USO DEL PROFILESCREEN WEB
 *
 * Este archivo muestra cómo integrar el ProfileScreen en tu aplicación web
 * con cada uno de los 5 roles.
 */

import React from 'react'
import { ProfileScreen } from './ProfileScreen'
import { DashboardLayout, PageHeader } from '../../ui'
// import { useAuth } from '@/hooks/useAuth'
// import { useNavigate } from 'react-router-dom'

// ============================================================================
// Ejemplo 1: Uso básico con DashboardLayout
// ============================================================================
export function ProfilePage() {
  // const navigate = useNavigate()
  // const { user, logout } = useAuth()

  // Mock user para ejemplo
  const user = {
    id: '123',
    nombre: 'Juan Pérez',
    email: 'juan.perez@cafrisales.com',
    rol: 'VENDEDOR' as const,
    telefono: '+57 300 123 4567',
    avatar: 'https://i.pravatar.cc/150?u=juan',
  }

  const handleLogout = () => {
    // await logout()
    // navigate('/login')
    console.log('Logout triggered')
  }

  const handleNavigate = (screen: string, params?: any) => {
    // navigate(`/${screen.toLowerCase()}`, { state: params })
    console.log('Navigate to:', screen, params)
  }

  return (
    <DashboardLayout user={user} currentPath="/profile" onLogout={handleLogout}>
      <PageHeader title="Mi Perfil" description="Gestiona tu información personal" />

      <ProfileScreen user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
    </DashboardLayout>
  )
}

// ============================================================================
// Ejemplo 2: ProfileScreen para CLIENTE
// ============================================================================
export function ClienteProfilePage() {
  const clienteUser = {
    id: 'cli-001',
    nombre: 'María García',
    email: 'maria@tienda.com',
    rol: 'CLIENTE' as const,
    telefono: '+57 300 111 2222',
  }

  return (
    <DashboardLayout user={clienteUser} currentPath="/profile">
      <PageHeader title="Mi Perfil" />

      <ProfileScreen
        user={clienteUser}
        onLogout={() => console.log('Cliente logout')}
        onNavigate={(screen) => console.log('Navigate:', screen)}
      />
    </DashboardLayout>
  )
}

// ============================================================================
// Ejemplo 3: ProfileScreen para VENDEDOR con navegación
// ============================================================================
export function VendedorProfilePage() {
  const vendedorUser = {
    id: 'ven-001',
    nombre: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@cafrisales.com',
    rol: 'VENDEDOR' as const,
    telefono: '+57 311 222 3333',
    avatar: 'https://i.pravatar.cc/150?u=carlos',
  }

  const handleNavigate = (screen: string, params?: any) => {
    // Navegación específica para vendedor
    switch (screen) {
      case 'Commissions':
        console.log('Ver comisiones del vendedor', params)
        // navigate('/vendedor/comisiones')
        break
      case 'AssignedZones':
        console.log('Ver zonas asignadas', params)
        // navigate('/vendedor/zonas')
        break
      case 'AssignedClients':
        console.log('Ver clientes asignados', params)
        // navigate('/vendedor/clientes')
        break
      default:
        console.log('Navigate to:', screen)
    }
  }

  return (
    <DashboardLayout user={vendedorUser} currentPath="/profile">
      <PageHeader title="Mi Perfil" />

      <ProfileScreen
        user={vendedorUser}
        onLogout={() => console.log('Vendedor logout')}
        onNavigate={handleNavigate}
      />
    </DashboardLayout>
  )
}

// ============================================================================
// Ejemplo 4: ProfileScreen para BODEGUERO
// ============================================================================
export function BodegueroProfilePage() {
  const bodegueroUser = {
    id: 'bod-001',
    nombre: 'Luis Martínez',
    email: 'luis.martinez@cafrisales.com',
    rol: 'BODEGUERO' as const,
    telefono: '+57 312 333 4444',
  }

  return (
    <DashboardLayout user={bodegueroUser} currentPath="/profile">
      <PageHeader
        title="Mi Perfil"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Perfil' }]}
      />

      <ProfileScreen
        user={bodegueroUser}
        onLogout={() => console.log('Bodeguero logout')}
        onNavigate={(screen) => {
          if (screen === 'Inventory') {
            console.log('Ver inventario asignado')
          } else if (screen === 'StockAlerts') {
            console.log('Ver alertas de stock')
          } else if (screen === 'AdvancedSettings') {
            console.log('Configuración avanzada (solo bodeguero y supervisor)')
          }
        }}
      />
    </DashboardLayout>
  )
}

// ============================================================================
// Ejemplo 5: ProfileScreen para SUPERVISOR
// ============================================================================
export function SupervisorProfilePage() {
  const supervisorUser = {
    id: 'sup-001',
    nombre: 'Ana López',
    email: 'ana.lopez@cafrisales.com',
    rol: 'SUPERVISOR' as const,
    telefono: '+57 313 444 5555',
    avatar: 'https://i.pravatar.cc/150?u=ana',
  }

  return (
    <DashboardLayout user={supervisorUser} currentPath="/profile">
      <PageHeader title="Mi Perfil" />

      <ProfileScreen
        user={supervisorUser}
        onLogout={() => console.log('Supervisor logout')}
        onNavigate={(screen) => {
          if (screen === 'Team') {
            console.log('Ver equipo de trabajo')
          } else if (screen === 'Approvals') {
            console.log('Ver aprobaciones pendientes (5)')
          } else if (screen === 'AdvancedSettings') {
            console.log('Configuración avanzada (exclusiva supervisor/bodeguero)')
          }
        }}
      />
    </DashboardLayout>
  )
}

// ============================================================================
// Ejemplo 6: ProfileScreen para TRANSPORTISTA
// ============================================================================
export function TransportistaProfilePage() {
  const transportistaUser = {
    id: 'tra-001',
    nombre: 'Pedro Gómez',
    email: 'pedro.gomez@cafrisales.com',
    rol: 'TRANSPORTISTA' as const,
    telefono: '+57 314 555 6666',
  }

  return (
    <DashboardLayout user={transportistaUser} currentPath="/profile">
      <PageHeader title="Mi Perfil" />

      <ProfileScreen
        user={transportistaUser}
        onLogout={() => console.log('Transportista logout')}
        onNavigate={(screen) => {
          if (screen === 'Vehicle') {
            console.log('Ver información del vehículo')
          } else if (screen === 'CompletedRoutes') {
            console.log('Ver rutas completadas')
          }
        }}
      />
    </DashboardLayout>
  )
}

// ============================================================================
// Ejemplo 7: Integración con React Router
// ============================================================================
/*
import { Routes, Route } from 'react-router-dom'

export function ProfileRoutes() {
  return (
    <Routes>
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/edit" element={<EditProfilePage />} />
      <Route path="/profile/notifications" element={<NotificationsPage />} />
      <Route path="/profile/change-password" element={<ChangePasswordPage />} />

      // Rutas específicas por rol
      <Route path="/profile/addresses" element={<AddressesPage />} />
      <Route path="/profile/commissions" element={<CommissionsPage />} />
      <Route path="/profile/inventory" element={<InventoryPage />} />
    </Routes>
  )
}
*/

// ============================================================================
// Ejemplo 8: Uso con Context API para autenticación
// ============================================================================
/*
import { useAuth } from '@/contexts/AuthContext'

export function ProfilePageWithAuth() {
  const { user, logout } = useAuth()

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <DashboardLayout user={user} currentPath="/profile" onLogout={logout}>
      <PageHeader title="Mi Perfil" />

      <ProfileScreen
        user={user}
        onLogout={logout}
        onNavigate={(screen, params) => {
          // Lógica de navegación
        }}
      />
    </DashboardLayout>
  )
}
*/

// ============================================================================
// Ejemplo 9: Standalone (sin DashboardLayout)
// ============================================================================
export function StandaloneProfileScreen() {
  const user = {
    id: '123',
    nombre: 'Juan Pérez',
    email: 'juan@cafrisales.com',
    rol: 'VENDEDOR' as const,
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold">Mi Perfil</h1>

        <ProfileScreen
          user={user}
          onLogout={() => console.log('Logout')}
          onNavigate={(screen) => console.log('Navigate:', screen)}
        />
      </div>
    </div>
  )
}
