# Guía del ProfileScreen Web - Multi-Rol

Sistema de perfil de usuario adaptativo para los 5 roles del sistema Cafrisales (versión WEB).

## 📋 Descripción

El **ProfileScreen** es un componente único que se adapta automáticamente según el rol del usuario (`CLIENTE`, `VENDEDOR`, `BODEGUERO`, `SUPERVISOR`, `TRANSPORTISTA`). Cada rol tiene:

- ✅ **Opciones comunes** (Editar perfil, notificaciones, contraseña, ayuda)
- ✅ **Opciones específicas del rol** (diferentes para cada tipo de usuario)
- ✅ **Secciones condicionales** (usando `RoleGate`)
- ✅ **Diseño profesional web** con Cards y layout responsive

---

## 🚀 Uso Básico

```tsx
import { ProfileScreen } from '@/components/features/shared'
import { DashboardLayout, PageHeader } from '@/components/ui'

export function ProfilePage() {
  const user = {
    id: '123',
    nombre: 'Juan Pérez',
    email: 'juan@cafrisales.com',
    rol: 'VENDEDOR',
    telefono: '+57 300 123 4567',
    avatar: 'https://...',
  }

  const handleLogout = () => {
    // Tu lógica de logout
    logout()
    navigate('/login')
  }

  const handleNavigate = (screen: string, params?: any) => {
    navigate(`/${screen.toLowerCase()}`, { state: params })
  }

  return (
    <DashboardLayout user={user} currentPath="/profile">
      <PageHeader title="Mi Perfil" description="Gestiona tu información personal" />

      <ProfileScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
    </DashboardLayout>
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
- **Configuración Avanzada** (exclusiva con Supervisor)

### 👔 SUPERVISOR
- Mi Equipo
- Reportes y Análisis
- Configuración de Zonas
- Aprobaciones Pendientes (con badge)
- **Configuración Avanzada** (exclusiva con Bodeguero)

### 🚛 TRANSPORTISTA
- Mi Vehículo
- Rutas Completadas
- Documentación
- Horarios y Disponibilidad

---

## 🎨 Estructura Visual Web

```
┌─────────────────────────────────────────┐
│   DASHBOARD LAYOUT (Sidebar + Header)  │
├─────────────────────────────────────────┤
│                                         │
│   PageHeader: "Mi Perfil"              │
│                                         │
│   ┌─────────────────────────────────┐  │
│   │    [Avatar Grande]              │  │
│   │    Juan Pérez                   │  │
│   │    📧 juan@cafrisales.com       │  │
│   │    📱 +57 300 123 4567          │  │
│   │    [Badge: VENDEDOR]            │  │
│   └─────────────────────────────────┘  │
│                                         │
│   ┌─────────────────────────────────┐  │
│   │ GENERAL                         │  │
│   ├─────────────────────────────────┤  │
│   │ 👤 Editar Perfil               →│  │
│   │ 🔔 Notificaciones              →│  │
│   │ 🔒 Cambiar Contraseña          →│  │
│   │ ❓ Ayuda y Soporte             →│  │
│   └─────────────────────────────────┘  │
│                                         │
│   ┌─────────────────────────────────┐  │
│   │ VENDEDOR                        │  │
│   ├─────────────────────────────────┤  │
│   │ 📍 Mis Zonas Asignadas         →│  │
│   │ 📈 Comisiones                  →│  │
│   │ 👥 Clientes Asignados          →│  │
│   │ 🏆 Metas y Objetivos           →│  │
│   └─────────────────────────────────┘  │
│                                         │
│   ┌─────────────────────────────────┐  │
│   │ INFORMACIÓN                     │  │
│   ├─────────────────────────────────┤  │
│   │ 📄 Términos y Condiciones      →│  │
│   │ 🛡️ Política de Privacidad      →│  │
│   │ ℹ️ Acerca de Cafrisales        →│  │
│   └─────────────────────────────────┘  │
│                                         │
│   ┌─────────────────────────────────┐  │
│   │ 🚪 Cerrar Sesión (rojo)        →│  │
│   └─────────────────────────────────┘  │
│                                         │
│   Versión 1.0.0                        │
└─────────────────────────────────────────┘
```

---

## 🔧 Navegación entre Pantallas

```tsx
const handleNavigate = (screen: string, params?: any) => {
  switch (screen) {
    case 'EditProfile':
      navigate('/profile/edit')
      break

    case 'Notifications':
      navigate('/profile/notifications')
      break

    case 'Commissions':
      // Solo para vendedores
      navigate('/vendedor/comisiones', { state: params })
      break

    case 'Approvals':
      // Solo para supervisores
      navigate('/supervisor/aprobaciones', { state: params })
      break

    case 'Inventory':
      // Solo para bodegueros
      navigate('/bodega/inventario')
      break

    default:
      navigate(`/${screen.toLowerCase()}`, { state: params })
  }
}
```

---

## 🎯 RoleGate Component

Usa `RoleGate` para mostrar contenido condicionalmente según el rol.

```tsx
import { RoleGate } from '@/components/domain/auth'

<RoleGate allowedRoles={['SUPERVISOR', 'BODEGUERO']} currentRole={user.rol}>
  <Card>
    <MenuOption title="Configuración Avanzada" />
  </Card>
</RoleGate>
```

### Con fallback

```tsx
<RoleGate
  allowedRoles={['VENDEDOR']}
  currentRole={user.rol}
  fallback={<Text>No tienes acceso a esta sección</Text>}
>
  <ComisionesSection />
</RoleGate>
```

---

## 📱 Responsive Design

El ProfileScreen es **100% responsive**:

- **Desktop** (>1024px): Cards amplias, layout espaciado
- **Tablet** (768-1024px): Cards adaptadas
- **Mobile** (<768px): Cards full-width, stack vertical

```tsx
<ProfileScreen
  user={user}
  onLogout={logout}
  onNavigate={handleNavigate}
  className="px-4 md:px-6 lg:px-8" // Padding responsive
/>
```

---

## 💡 Ejemplos Avanzados

### Ejemplo 1: Con React Router

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'

export function ProfileRoutes() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" />

  return (
    <Routes>
      <Route path="/" element={<ProfilePage />} />
      <Route path="/edit" element={<EditProfilePage />} />
      <Route path="/notifications" element={<NotificationsPage />} />

      {/* Rutas específicas por rol */}
      {user.rol === 'CLIENTE' && (
        <>
          <Route path="/addresses" element={<AddressesPage />} />
          <Route path="/payment-methods" element={<PaymentMethodsPage />} />
        </>
      )}

      {user.rol === 'VENDEDOR' && (
        <>
          <Route path="/commissions" element={<CommissionsPage />} />
          <Route path="/zones" element={<ZonesPage />} />
        </>
      )}
    </Routes>
  )
}
```

---

### Ejemplo 2: Con badges dinámicos

```tsx
const [notificationCount, setNotificationCount] = useState(0)
const [approvalCount, setApprovalCount] = useState(0)

// Los badges se actualizan automáticamente en el ProfileScreen
// según los datos que vengan del backend
```

---

### Ejemplo 3: Standalone (sin DashboardLayout)

```tsx
export function StandaloneProfile() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <Container size="lg">
        <PageHeader title="Mi Perfil" />

        <ProfileScreen
          user={user}
          onLogout={logout}
          onNavigate={handleNavigate}
        />
      </Container>
    </div>
  )
}
```

---

## 🎨 Personalización de Colores por Rol

```tsx
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

<Badge variant={getRoleBadgeVariant(user.rol)}>
  {getRoleName(user.rol)}
</Badge>
```

---

## ✨ Features Incluidas

- ✅ Diseño profesional con Cards
- ✅ Animaciones suaves (hover, transitions)
- ✅ AlertDialog para confirmar logout
- ✅ Badges dinámicos de notificaciones
- ✅ Avatar con fallback a iniciales
- ✅ Iconos de Lucide React
- ✅ Accesibilidad optimizada
- ✅ TypeScript completo
- ✅ Responsive design
- ✅ Fácil de extender

---

## 📚 Archivos Relacionados

- `ProfileScreen.tsx` - Componente principal
- `RoleGate.tsx` - Componente para renderizado condicional
- `ProfileScreen.example.tsx` - 9 ejemplos de uso completos

---

¡Listo para usar en tu aplicación web! 🚀
