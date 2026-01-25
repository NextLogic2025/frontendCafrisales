import React, { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  HelpCircle,
  MapPin,
  CreditCard,
  FileText,
  TrendingUp,
  Users,
  Trophy,
  Package,
  BarChart3,
  AlertTriangle,
  Truck,
  Calendar,
  FolderOpen,
  Settings,
  FileCheck,
  Shield,
  Info,
  LogOut,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Avatar,
  Badge,
  Divider,
  VStack,
  HStack,
  Button,
  AlertDialog,
} from '../../ui'
import { RoleGate, UserRole } from '../../domain/auth'
import { cn } from '@/utils'

// Tipos para el usuario
interface User {
  id: string
  nombre: string
  email: string
  rol: UserRole
  telefono?: string
  avatar?: string
}

export interface ProfileScreenProps {
  user: User
  onLogout: () => void
  onNavigate: (screen: string, params?: any) => void
  className?: string
}

interface MenuOption {
  title: string
  icon: React.ElementType
  onPress: () => void
  badge?: string
  danger?: boolean
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onLogout,
  onNavigate,
  className,
}) => {
  const [showLogoutAlert, setShowLogoutAlert] = useState(false)

  // Opciones comunes para TODOS los roles
  const commonOptions: MenuOption[] = [
    {
      title: 'Editar Perfil',
      icon: User,
      onPress: () => onNavigate('EditProfile'),
    },
    {
      title: 'Notificaciones',
      icon: Bell,
      onPress: () => onNavigate('Notifications'),
    },
    {
      title: 'Cambiar Contraseña',
      icon: Lock,
      onPress: () => onNavigate('ChangePassword'),
    },
    {
      title: 'Ayuda y Soporte',
      icon: HelpCircle,
      onPress: () => onNavigate('Support'),
    },
  ]

  // Opciones específicas por rol
  const clienteOptions: MenuOption[] = [
    {
      title: 'Mis Direcciones',
      icon: MapPin,
      onPress: () => onNavigate('Addresses'),
    },
    {
      title: 'Métodos de Pago',
      icon: CreditCard,
      onPress: () => onNavigate('PaymentMethods'),
    },
    {
      title: 'Historial de Pedidos',
      icon: FileText,
      onPress: () => onNavigate('OrderHistory'),
    },
  ]

  const vendedorOptions: MenuOption[] = [
    {
      title: 'Mis Zonas Asignadas',
      icon: MapPin,
      onPress: () => onNavigate('AssignedZones'),
    },
    {
      title: 'Comisiones',
      icon: TrendingUp,
      onPress: () => onNavigate('Commissions'),
    },
    {
      title: 'Clientes Asignados',
      icon: Users,
      onPress: () => onNavigate('AssignedClients'),
    },
    {
      title: 'Metas y Objetivos',
      icon: Trophy,
      onPress: () => onNavigate('Goals'),
    },
  ]

  const bodegueroOptions: MenuOption[] = [
    {
      title: 'Inventario Asignado',
      icon: Package,
      onPress: () => onNavigate('Inventory'),
    },
    {
      title: 'Estadísticas de Preparación',
      icon: BarChart3,
      onPress: () => onNavigate('Stats'),
    },
    {
      title: 'Alertas de Stock',
      icon: AlertTriangle,
      onPress: () => onNavigate('StockAlerts'),
      badge: '3',
    },
  ]

  const supervisorOptions: MenuOption[] = [
    {
      title: 'Mi Equipo',
      icon: Users,
      onPress: () => onNavigate('Team'),
    },
    {
      title: 'Reportes y Análisis',
      icon: FileText,
      onPress: () => onNavigate('Reports'),
    },
    {
      title: 'Configuración de Zonas',
      icon: Settings,
      onPress: () => onNavigate('ZoneSettings'),
    },
    {
      title: 'Aprobaciones Pendientes',
      icon: FileCheck,
      onPress: () => onNavigate('Approvals'),
      badge: '5',
    },
  ]

  const transportistaOptions: MenuOption[] = [
    {
      title: 'Mi Vehículo',
      icon: Truck,
      onPress: () => onNavigate('Vehicle'),
    },
    {
      title: 'Rutas Completadas',
      icon: MapPin,
      onPress: () => onNavigate('CompletedRoutes'),
    },
    {
      title: 'Documentación',
      icon: FolderOpen,
      onPress: () => onNavigate('Documents'),
    },
    {
      title: 'Horarios y Disponibilidad',
      icon: Calendar,
      onPress: () => onNavigate('Schedule'),
    },
  ]

  // Obtener opciones específicas según el rol
  const getRoleSpecificOptions = (): MenuOption[] => {
    switch (user.rol) {
      case 'CLIENTE':
        return clienteOptions
      case 'VENDEDOR':
        return vendedorOptions
      case 'BODEGUERO':
        return bodegueroOptions
      case 'SUPERVISOR':
        return supervisorOptions
      case 'TRANSPORTISTA':
        return transportistaOptions
      default:
        return []
    }
  }

  const roleOptions = getRoleSpecificOptions()

  // Obtener el nombre descriptivo del rol
  const getRoleName = (rol: UserRole): string => {
    const roleNames = {
      CLIENTE: 'Cliente',
      VENDEDOR: 'Vendedor',
      BODEGUERO: 'Bodeguero',
      SUPERVISOR: 'Supervisor',
      TRANSPORTISTA: 'Transportista',
    }
    return roleNames[rol]
  }

  // Obtener el color del badge según el rol
  const getRoleBadgeVariant = (rol: UserRole): 'primary' | 'success' | 'info' | 'warning' | 'secondary' => {
    const variants = {
      CLIENTE: 'primary' as const,
      VENDEDOR: 'success' as const,
      BODEGUERO: 'info' as const,
      SUPERVISOR: 'warning' as const,
      TRANSPORTISTA: 'secondary' as const,
    }
    return variants[rol] || 'default'
  }

  const handleLogoutConfirm = () => {
    setShowLogoutAlert(false)
    onLogout()
  }

  const MenuOptionItem: React.FC<{ option: MenuOption }> = ({ option }) => {
    const Icon = option.icon

    return (
      <button
        onClick={option.onPress}
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors',
          option.danger
            ? 'text-red-600 hover:bg-red-50'
            : 'text-neutral-700 hover:bg-neutral-50'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn('h-5 w-5', option.danger ? 'text-red-600' : 'text-red')} />
          <span className="text-sm font-medium">{option.title}</span>
        </div>

        {option.badge && (
          <Badge variant="danger" size="sm">
            {option.badge}
          </Badge>
        )}
      </button>
    )
  }

  return (
    <div className={cn('mx-auto max-w-4xl space-y-6', className)}>
      {/* Información del Usuario */}
      <Card variant="elevated">
        <CardContent padding="lg">
          <VStack gap="md" align="center">
            <Avatar
              name={user.nombre}
              src={user.avatar}
              size="2xl"
            />

            <VStack gap="xs" align="center">
              <h2 className="text-2xl font-bold text-neutral-900">{user.nombre}</h2>
              <div className="flex items-center gap-2 text-neutral-600">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.telefono && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{user.telefono}</span>
                </div>
              )}
              <Badge variant={getRoleBadgeVariant(user.rol)} className="mt-2">
                {getRoleName(user.rol)}
              </Badge>
            </VStack>
          </VStack>
        </CardContent>
      </Card>

      {/* Opciones Comunes */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <Divider />
        <CardContent padding="none">
          <div className="divide-y divide-neutral-100">
            {commonOptions.map((option) => (
              <MenuOptionItem key={option.title} option={option} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opciones Específicas del Rol */}
      {roleOptions.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>{user.rol}</CardTitle>
          </CardHeader>
          <Divider />
          <CardContent padding="none">
            <div className="divide-y divide-neutral-100">
              {roleOptions.map((option) => (
                <MenuOptionItem key={option.title} option={option} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuración Avanzada (Solo para Supervisor y Bodeguero) */}
      <RoleGate allowedRoles={['SUPERVISOR', 'BODEGUERO']} currentRole={user.rol}>
        <Card variant="elevated">
          <CardContent padding="none">
            <MenuOptionItem
              option={{
                title: 'Configuración Avanzada',
                icon: Settings,
                onPress: () => onNavigate('AdvancedSettings'),
              }}
            />
          </CardContent>
        </Card>
      </RoleGate>

      {/* Información */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <Divider />
        <CardContent padding="none">
          <div className="divide-y divide-neutral-100">
            <MenuOptionItem
              option={{
                title: 'Términos y Condiciones',
                icon: FileText,
                onPress: () => onNavigate('Terms'),
              }}
            />
            <MenuOptionItem
              option={{
                title: 'Política de Privacidad',
                icon: Shield,
                onPress: () => onNavigate('Privacy'),
              }}
            />
            <MenuOptionItem
              option={{
                title: 'Acerca de Cafrisales',
                icon: Info,
                onPress: () => onNavigate('About'),
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cerrar Sesión */}
      <Card variant="elevated">
        <CardContent padding="none">
          <MenuOptionItem
            option={{
              title: 'Cerrar Sesión',
              icon: LogOut,
              onPress: () => setShowLogoutAlert(true),
              danger: true,
            }}
          />
        </CardContent>
      </Card>

      {/* Versión */}
      <div className="text-center">
        <p className="text-xs text-neutral-400">Versión 1.0.0</p>
      </div>

      {/* Alert de confirmación de logout */}
      <AlertDialog
        open={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
        title="Cerrar Sesión"
        description="¿Estás seguro de que quieres cerrar sesión?"
        variant="warning"
        confirmLabel="Sí, cerrar sesión"
        cancelLabel="Cancelar"
        onConfirm={handleLogoutConfirm}
      />
    </div>
  )
}
