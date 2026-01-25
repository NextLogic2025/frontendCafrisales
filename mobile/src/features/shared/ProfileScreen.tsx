import React, { useState } from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  ScrollScreen,
  Header,
  Card,
  ListItem,
  Avatar,
  Divider,
  AlertDialog,
  VStack,
  Text,
  Badge,
} from '@/components/ui'
import { RoleGate, UserRole } from '@/components/domain/auth'

// Tipos para el usuario (ajusta según tu implementación real)
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
}

interface MenuOption {
  title: string
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
  badge?: string
  danger?: boolean
}

export function ProfileScreen({ user, onLogout, onNavigate }: ProfileScreenProps) {
  const [showLogoutAlert, setShowLogoutAlert] = useState(false)

  // Opciones comunes para TODOS los roles
  const commonOptions: MenuOption[] = [
    {
      title: 'Editar Perfil',
      icon: 'person-outline',
      onPress: () => onNavigate('EditProfile'),
    },
    {
      title: 'Notificaciones',
      icon: 'notifications-outline',
      onPress: () => onNavigate('Notifications'),
    },
    {
      title: 'Cambiar Contraseña',
      icon: 'lock-closed-outline',
      onPress: () => onNavigate('ChangePassword'),
    },
    {
      title: 'Ayuda y Soporte',
      icon: 'help-circle-outline',
      onPress: () => onNavigate('Support'),
    },
  ]

  // Opciones específicas por rol
  const clienteOptions: MenuOption[] = [
    {
      title: 'Mis Direcciones',
      icon: 'location-outline',
      onPress: () => onNavigate('Addresses'),
    },
    {
      title: 'Métodos de Pago',
      icon: 'card-outline',
      onPress: () => onNavigate('PaymentMethods'),
    },
    {
      title: 'Historial de Pedidos',
      icon: 'receipt-outline',
      onPress: () => onNavigate('OrderHistory'),
    },
  ]

  const vendedorOptions: MenuOption[] = [
    {
      title: 'Mis Zonas Asignadas',
      icon: 'map-outline',
      onPress: () => onNavigate('AssignedZones'),
    },
    {
      title: 'Comisiones',
      icon: 'trending-up-outline',
      onPress: () => onNavigate('Commissions'),
    },
    {
      title: 'Clientes Asignados',
      icon: 'people-outline',
      onPress: () => onNavigate('AssignedClients'),
    },
    {
      title: 'Metas y Objetivos',
      icon: 'trophy-outline',
      onPress: () => onNavigate('Goals'),
    },
  ]

  const bodegueroOptions: MenuOption[] = [
    {
      title: 'Inventario Asignado',
      icon: 'cube-outline',
      onPress: () => onNavigate('Inventory'),
    },
    {
      title: 'Estadísticas de Preparación',
      icon: 'stats-chart-outline',
      onPress: () => onNavigate('Stats'),
    },
    {
      title: 'Alertas de Stock',
      icon: 'warning-outline',
      onPress: () => onNavigate('StockAlerts'),
      badge: '3',
    },
  ]

  const supervisorOptions: MenuOption[] = [
    {
      title: 'Mi Equipo',
      icon: 'people-outline',
      onPress: () => onNavigate('Team'),
    },
    {
      title: 'Reportes y Análisis',
      icon: 'document-text-outline',
      onPress: () => onNavigate('Reports'),
    },
    {
      title: 'Configuración de Zonas',
      icon: 'settings-outline',
      onPress: () => onNavigate('ZoneSettings'),
    },
    {
      title: 'Aprobaciones Pendientes',
      icon: 'checkmark-circle-outline',
      onPress: () => onNavigate('Approvals'),
      badge: '5',
    },
  ]

  const transportistaOptions: MenuOption[] = [
    {
      title: 'Mi Vehículo',
      icon: 'car-outline',
      onPress: () => onNavigate('Vehicle'),
    },
    {
      title: 'Rutas Completadas',
      icon: 'navigate-outline',
      onPress: () => onNavigate('CompletedRoutes'),
    },
    {
      title: 'Documentación',
      icon: 'folder-outline',
      onPress: () => onNavigate('Documents'),
    },
    {
      title: 'Horarios y Disponibilidad',
      icon: 'calendar-outline',
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
  const getRoleBadgeVariant = (rol: UserRole) => {
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

  return (
    <>
      <Header title="Mi Perfil" showBackButton onBackPress={() => onNavigate('Back')} />

      <ScrollScreen variant="withTabs">
        {/* Información del Usuario */}
        <Card variant="elevated" className="mb-4">
          <VStack gap="md" align="center">
            <Avatar
              name={user.nombre}
              source={user.avatar ? { uri: user.avatar } : undefined}
              size="2xl"
            />

            <VStack gap="xs" align="center">
              <Text variant="h3" weight="bold" align="center">
                {user.nombre}
              </Text>
              <Text variant="body" color="text-neutral-600" align="center">
                {user.email}
              </Text>
              {user.telefono && (
                <Text variant="bodySmall" color="text-neutral-500" align="center">
                  {user.telefono}
                </Text>
              )}
              <Badge variant={getRoleBadgeVariant(user.rol)}>{getRoleName(user.rol)}</Badge>
            </VStack>
          </VStack>
        </Card>

        {/* Opciones Comunes */}
        <Card variant="elevated" className="mb-4">
          <Text variant="label" color="text-neutral-500" className="mb-3 px-1">
            GENERAL
          </Text>
          {commonOptions.map((option, index) => (
            <React.Fragment key={option.title}>
              {index > 0 && <Divider />}
              <ListItem
                title={option.title}
                leftIcon={
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={option.danger ? '#EF4444' : '#F0412D'}
                  />
                }
                rightAccessory={
                  option.badge ? (
                    <Badge variant="danger" size="sm">
                      {option.badge}
                    </Badge>
                  ) : undefined
                }
                showChevron
                onPress={option.onPress}
              />
            </React.Fragment>
          ))}
        </Card>

        {/* Opciones Específicas del Rol */}
        {roleOptions.length > 0 && (
          <Card variant="elevated" className="mb-4">
            <Text variant="label" color="text-neutral-500" className="mb-3 px-1">
              {user.rol}
            </Text>
            {roleOptions.map((option, index) => (
              <React.Fragment key={option.title}>
                {index > 0 && <Divider />}
                <ListItem
                  title={option.title}
                  leftIcon={<Ionicons name={option.icon} size={24} color="#F0412D" />}
                  rightAccessory={
                    option.badge ? (
                      <Badge variant="danger" size="sm">
                        {option.badge}
                      </Badge>
                    ) : undefined
                  }
                  showChevron
                  onPress={option.onPress}
                />
              </React.Fragment>
            ))}
          </Card>
        )}

        {/* Configuración (Solo para Supervisor y Bodeguero) */}
        <RoleGate allowedRoles={['SUPERVISOR', 'BODEGUERO']} currentRole={user.rol}>
          <Card variant="elevated" className="mb-4">
            <ListItem
              title="Configuración Avanzada"
              leftIcon={<Ionicons name="construct-outline" size={24} color="#F0412D" />}
              showChevron
              onPress={() => onNavigate('AdvancedSettings')}
            />
          </Card>
        </RoleGate>

        {/* Acerca de */}
        <Card variant="elevated" className="mb-4">
          <Text variant="label" color="text-neutral-500" className="mb-3 px-1">
            INFORMACIÓN
          </Text>
          <ListItem
            title="Términos y Condiciones"
            leftIcon={<Ionicons name="document-text-outline" size={24} color="#9CA3AF" />}
            showChevron
            onPress={() => onNavigate('Terms')}
          />
          <Divider />
          <ListItem
            title="Política de Privacidad"
            leftIcon={<Ionicons name="shield-checkmark-outline" size={24} color="#9CA3AF" />}
            showChevron
            onPress={() => onNavigate('Privacy')}
          />
          <Divider />
          <ListItem
            title="Acerca de Cafrisales"
            leftIcon={<Ionicons name="information-circle-outline" size={24} color="#9CA3AF" />}
            showChevron
            onPress={() => onNavigate('About')}
          />
        </Card>

        {/* Cerrar Sesión */}
        <Card variant="elevated" className="mb-6">
          <ListItem
            title="Cerrar Sesión"
            leftIcon={<Ionicons name="log-out-outline" size={24} color="#EF4444" />}
            onPress={() => setShowLogoutAlert(true)}
          />
        </Card>

        {/* Versión */}
        <View className="items-center pb-4">
          <Text variant="caption" color="text-neutral-400">
            Versión 1.0.0
          </Text>
        </View>
      </ScrollScreen>

      {/* Alert de confirmación de logout */}
      <AlertDialog
        visible={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
        title="Cerrar Sesión"
        description="¿Estás seguro de que quieres cerrar sesión?"
        variant="warning"
        confirmLabel="Sí, cerrar sesión"
        cancelLabel="Cancelar"
        onConfirm={handleLogoutConfirm}
        icon="log-out-outline"
      />
    </>
  )
}
