# Guía del ProfileScreen - Multi-Rol

Sistema de perfil de usuario adaptativo para los 5 roles del sistema Cafrisales.

## 📋 Descripción

El **ProfileScreen** es un componente único que se adapta automáticamente según el rol del usuario (`CLIENTE`, `VENDEDOR`, `BODEGUERO`, `SUPERVISOR`, `TRANSPORTISTA`). Cada rol tiene:

- ✅ **Opciones comunes** (editar perfil, notificaciones, contraseña, ayuda)
- ✅ **Opciones específicas del rol** (diferentes para cada tipo de usuario)
- ✅ **Secciones condicionales** (usando `RoleGate`)

---

## 🚀 Instalación y Setup

### 1. Dependencia requerida

Asegúrate de tener instalado `@react-native-community/datetimepicker` para el DatePicker:

```bash
npm install @react-native-community/datetimepicker
```

o con Expo:

```bash
npx expo install @react-native-community/datetimepicker
```

### 2. Importación

```typescript
import { ProfileScreen } from '@/features/shared'
import { RoleGate } from '@/components/domain/auth'
```

---

## 📱 Uso Básico

```tsx
import React from 'react'
import { ProfileScreen } from '@/features/shared'

export function ProfileContainer() {
  const user = {
    id: '123',
    nombre: 'Juan Pérez',
    email: 'juan@cafrisales.com',
    rol: 'VENDEDOR',
    telefono: '+57 300 123 4567',
    avatar: 'https://...', // Opcional
  }

  const handleLogout = async () => {
    // Tu lógica de logout
    await logout()
    navigation.navigate('Login')
  }

  const handleNavigate = (screen: string, params?: any) => {
    if (screen === 'Back') {
      navigation.goBack()
      return
    }
    navigation.navigate(screen, params)
  }

  return (
    <ProfileScreen
      user={user}
      onLogout={handleLogout}
      onNavigate={handleNavigate}
    />
  )
}
```

---

## 👥 Opciones por Rol

### 🛒 CLIENTE
- Mis Direcciones
- Métodos de Pago
- Historial de Pedidos

### 💼 VENDEDOR
- Mis Zonas Asignadas
- Comisiones
- Clientes Asignados
- Metas y Objetivos

### 📦 BODEGUERO
- Inventario Asignado
- Estadísticas de Preparación
- Alertas de Stock (con badge de notificación)

### 👔 SUPERVISOR
- Mi Equipo
- Reportes y Análisis
- Configuración de Zonas
- Aprobaciones Pendientes (con badge)
- **Configuración Avanzada** (exclusiva)

### 🚛 TRANSPORTISTA
- Mi Vehículo
- Rutas Completadas
- Documentación
- Horarios y Disponibilidad

---

## 🎨 Personalización

### Agregar nuevas opciones para un rol

```typescript
// En ProfileScreen.tsx, agrega a las opciones del rol:

const vendedorOptions: MenuOption[] = [
  // ... opciones existentes
  {
    title: 'Nueva Opción',
    icon: 'star-outline',
    onPress: () => onNavigate('NewScreen'),
    badge: '2', // Opcional: badge de notificación
  },
]
```

### Cambiar colores del badge por rol

```typescript
const getRoleBadgeVariant = (rol: UserRole) => {
  const variants = {
    CLIENTE: 'primary',      // Rojo
    VENDEDOR: 'success',     // Verde
    BODEGUERO: 'info',       // Azul
    SUPERVISOR: 'warning',   // Amarillo
    TRANSPORTISTA: 'secondary', // Dorado
  }
  return variants[rol]
}
```

---

## 🔐 RoleGate Component

Usa `RoleGate` para mostrar contenido condicionalmente según el rol.

### Ejemplo 1: Ocultar opción para ciertos roles

```tsx
import { RoleGate } from '@/components/domain/auth'

<RoleGate allowedRoles={['SUPERVISOR', 'BODEGUERO']} currentRole={user.rol}>
  <Card>
    <ListItem title="Configuración Avanzada" />
  </Card>
</RoleGate>
```

### Ejemplo 2: Con fallback

```tsx
<RoleGate
  allowedRoles={['VENDEDOR']}
  currentRole={user.rol}
  fallback={<Text>No tienes acceso a esta sección</Text>}
>
  <ComisionesWidget />
</RoleGate>
```

### Ejemplo 3: Múltiples roles

```tsx
<RoleGate allowedRoles={['VENDEDOR', 'SUPERVISOR', 'BODEGUERO']} currentRole={user.rol}>
  <ReportsSection />
</RoleGate>
```

---

## 🎯 Navegación entre Pantallas

El callback `onNavigate` recibe el nombre de la pantalla y opcionalmente parámetros.

```tsx
const handleNavigate = (screen: string, params?: any) => {
  switch (screen) {
    case 'Back':
      navigation.goBack()
      break

    case 'EditProfile':
      navigation.navigate('EditProfile')
      break

    case 'Commissions':
      // Solo para vendedores
      navigation.navigate('Commissions', { userId: user.id })
      break

    case 'Approvals':
      // Solo para supervisores
      navigation.navigate('Approvals', { filter: 'pending' })
      break

    default:
      navigation.navigate(screen as never, params as never)
  }
}
```

---

## 💡 Ejemplos Avanzados

### Ejemplo 1: Agregar contador de notificaciones dinámico

```tsx
const [notificationCount, setNotificationCount] = useState(0)

// Modifica commonOptions para incluir el badge dinámico
const commonOptions: MenuOption[] = [
  {
    title: 'Notificaciones',
    icon: 'notifications-outline',
    onPress: () => onNavigate('Notifications'),
    badge: notificationCount > 0 ? String(notificationCount) : undefined,
  },
  // ...
]
```

### Ejemplo 2: Integrar con Hook de Autenticación

```tsx
import { useAuth } from '@/hooks/useAuth'

export function ProfileContainer() {
  const { user, logout, isLoading } = useAuth()

  if (isLoading) {
    return <FullScreenLoader visible={true} text="Cargando perfil..." />
  }

  if (!user) {
    return <Redirect to="/login" />
  }

  return <ProfileScreen user={user} onLogout={logout} onNavigate={handleNavigate} />
}
```

### Ejemplo 3: Pantallas específicas por rol en Stack Navigator

```tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

export function ProfileStack() {
  const { user } = useAuth()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreenContainer} />

      {/* Pantallas comunes */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />

      {/* Pantallas de CLIENTE */}
      {user.rol === 'CLIENTE' && (
        <>
          <Stack.Screen name="Addresses" component={AddressesScreen} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
        </>
      )}

      {/* Pantallas de VENDEDOR */}
      {user.rol === 'VENDEDOR' && (
        <>
          <Stack.Screen name="Commissions" component={CommissionsScreen} />
          <Stack.Screen name="AssignedZones" component={ZonesScreen} />
        </>
      )}

      {/* Pantallas de SUPERVISOR */}
      {user.rol === 'SUPERVISOR' && (
        <>
          <Stack.Screen name="Team" component={TeamScreen} />
          <Stack.Screen name="Approvals" component={ApprovalsScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}
```

---

## 🧪 Testing

### Ejemplo de test con diferentes roles

```tsx
import { render, fireEvent } from '@testing-library/react-native'
import { ProfileScreen } from './ProfileScreen'

describe('ProfileScreen', () => {
  it('muestra opciones de VENDEDOR correctamente', () => {
    const user = {
      id: '1',
      nombre: 'Test Vendedor',
      email: 'test@test.com',
      rol: 'VENDEDOR',
    }

    const { getByText } = render(
      <ProfileScreen
        user={user}
        onLogout={jest.fn()}
        onNavigate={jest.fn()}
      />
    )

    expect(getByText('Comisiones')).toBeTruthy()
    expect(getByText('Mis Zonas Asignadas')).toBeTruthy()
  })

  it('no muestra configuración avanzada para CLIENTE', () => {
    const user = {
      id: '1',
      nombre: 'Test Cliente',
      email: 'test@test.com',
      rol: 'CLIENTE',
    }

    const { queryByText } = render(
      <ProfileScreen
        user={user}
        onLogout={jest.fn()}
        onNavigate={jest.fn()}
      />
    )

    expect(queryByText('Configuración Avanzada')).toBeNull()
  })
})
```

---

## ✨ Features Incluidas

- ✅ Diseño profesional con NativeWind
- ✅ Animaciones fluidas con Reanimated
- ✅ Safe Area manejada automáticamente
- ✅ Pull to refresh (si lo implementas en container)
- ✅ Alert de confirmación para logout
- ✅ Badges de notificación dinámicos
- ✅ Avatar con fallback a iniciales
- ✅ Accesibilidad y UX optimizada
- ✅ TypeScript completo
- ✅ Fácil de extender y mantener

---

## 🎨 Estructura Visual

```
┌─────────────────────────┐
│   HEADER (Rojo)         │
│   "Mi Perfil"           │
├─────────────────────────┤
│                         │
│   [Avatar Circular]     │
│   Juan Pérez            │
│   juan@cafrisales.com   │
│   [Badge: VENDEDOR]     │
│                         │
├─────────────────────────┤
│   GENERAL               │
├─────────────────────────┤
│ 👤 Editar Perfil        │
│ 🔔 Notificaciones   [3] │
│ 🔒 Cambiar Contraseña   │
│ ❓ Ayuda y Soporte      │
├─────────────────────────┤
│   VENDEDOR              │
├─────────────────────────┤
│ 📍 Mis Zonas Asignadas  │
│ 📈 Comisiones           │
│ 👥 Clientes Asignados   │
│ 🏆 Metas y Objetivos    │
├─────────────────────────┤
│   INFORMACIÓN           │
├─────────────────────────┤
│ 📄 Términos y Condic.   │
│ 🛡️ Política de Privac.  │
│ ℹ️ Acerca de Cafrisales │
├─────────────────────────┤
│ 🚪 Cerrar Sesión        │
├─────────────────────────┤
│   Versión 1.0.0         │
└─────────────────────────┘
```

---

## 📚 Archivos Relacionados

- `ProfileScreen.tsx` - Componente principal
- `RoleGate.tsx` - Componente para renderizado condicional
- `ProfileScreen.example.tsx` - Ejemplos de uso

---

¡Listo para usar en tu app! 🚀
