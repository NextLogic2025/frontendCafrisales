/**
 * EJEMPLO DE USO DEL PROFILESCREEN
 *
 * Este archivo muestra cómo integrar el ProfileScreen en tu aplicación
 * con cada uno de los 5 roles.
 */

import React from 'react'
import { ProfileScreen } from './ProfileScreen'
import { useNavigation } from '@react-navigation/native'
// import { useAuth } from '@/hooks/useAuth' // Tu hook de autenticación

// Ejemplo 1: Uso básico con hook de autenticación
export function ProfileScreenContainer() {
  const navigation = useNavigation()
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

  const handleLogout = async () => {
    // await logout()
    // navigation.navigate('Login')
    console.log('Logout triggered')
  }

  const handleNavigate = (screen: string, params?: any) => {
    if (screen === 'Back') {
      navigation.goBack()
      return
    }

    // navigation.navigate(screen as never, params as never)
    console.log('Navigate to:', screen, params)
  }

  return <ProfileScreen user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
}

// ============================================================================
// Ejemplo 2: ProfileScreen para CLIENTE
// ============================================================================
export function ClienteProfileScreen() {
  const navigation = useNavigation()

  const clienteUser = {
    id: 'cli-001',
    nombre: 'María García',
    email: 'maria@tienda.com',
    rol: 'CLIENTE' as const,
    telefono: '+57 300 111 2222',
  }

  return (
    <ProfileScreen
      user={clienteUser}
      onLogout={() => console.log('Cliente logout')}
      onNavigate={(screen) => console.log('Navigate:', screen)}
    />
  )
}

// ============================================================================
// Ejemplo 3: ProfileScreen para VENDEDOR
// ============================================================================
export function VendedorProfileScreen() {
  const vendedorUser = {
    id: 'ven-001',
    nombre: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@cafrisales.com',
    rol: 'VENDEDOR' as const,
    telefono: '+57 311 222 3333',
    avatar: 'https://i.pravatar.cc/150?u=carlos',
  }

  return (
    <ProfileScreen
      user={vendedorUser}
      onLogout={() => console.log('Vendedor logout')}
      onNavigate={(screen) => {
        // Navegación específica para vendedor
        if (screen === 'Commissions') {
          console.log('Ver comisiones del vendedor')
        } else if (screen === 'AssignedZones') {
          console.log('Ver zonas asignadas')
        }
      }}
    />
  )
}

// ============================================================================
// Ejemplo 4: ProfileScreen para BODEGUERO
// ============================================================================
export function BodegueroProfileScreen() {
  const bodegueroUser = {
    id: 'bod-001',
    nombre: 'Luis Martínez',
    email: 'luis.martinez@cafrisales.com',
    rol: 'BODEGUERO' as const,
    telefono: '+57 312 333 4444',
  }

  return (
    <ProfileScreen
      user={bodegueroUser}
      onLogout={() => console.log('Bodeguero logout')}
      onNavigate={(screen) => {
        if (screen === 'Inventory') {
          console.log('Ver inventario asignado')
        } else if (screen === 'StockAlerts') {
          console.log('Ver alertas de stock')
        }
      }}
    />
  )
}

// ============================================================================
// Ejemplo 5: ProfileScreen para SUPERVISOR
// ============================================================================
export function SupervisorProfileScreen() {
  const supervisorUser = {
    id: 'sup-001',
    nombre: 'Ana López',
    email: 'ana.lopez@cafrisales.com',
    rol: 'SUPERVISOR' as const,
    telefono: '+57 313 444 5555',
    avatar: 'https://i.pravatar.cc/150?u=ana',
  }

  return (
    <ProfileScreen
      user={supervisorUser}
      onLogout={() => console.log('Supervisor logout')}
      onNavigate={(screen) => {
        if (screen === 'Team') {
          console.log('Ver equipo de trabajo')
        } else if (screen === 'Approvals') {
          console.log('Ver aprobaciones pendientes')
        } else if (screen === 'AdvancedSettings') {
          console.log('Configuración avanzada (solo supervisor)')
        }
      }}
    />
  )
}

// ============================================================================
// Ejemplo 6: ProfileScreen para TRANSPORTISTA
// ============================================================================
export function TransportistaProfileScreen() {
  const transportistaUser = {
    id: 'tra-001',
    nombre: 'Pedro Gómez',
    email: 'pedro.gomez@cafrisales.com',
    rol: 'TRANSPORTISTA' as const,
    telefono: '+57 314 555 6666',
  }

  return (
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
  )
}

// ============================================================================
// Ejemplo 7: Integración con React Navigation (Stack Navigator)
// ============================================================================
/*
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

export function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreenContainer} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      // ... más screens según necesites
    </Stack.Navigator>
  )
}
*/

// ============================================================================
// Ejemplo 8: Uso con Context API para autenticación
// ============================================================================
/*
import { useAuth } from '@/contexts/AuthContext'

export function ProfileWithAuth() {
  const { user, logout } = useAuth()

  if (!user) {
    return <Redirect to="/login" />
  }

  return (
    <ProfileScreen
      user={user}
      onLogout={logout}
      onNavigate={(screen, params) => {
        // Lógica de navegación
      }}
    />
  )
}
*/

// ============================================================================
// Ejemplo 9: Mostrar opciones condicionales con RoleGate
// ============================================================================
/*
import { RoleGate } from '@/components/domain/auth'

// En tu componente personalizado
<RoleGate allowedRoles={['VENDEDOR', 'SUPERVISOR']} currentRole={user.rol}>
  <Card>
    <ListItem
      title="Ver Comisiones"
      icon={<Ionicons name="trending-up" />}
    />
  </Card>
</RoleGate>
*/
