import React from 'react'
import { View, Text, Pressable, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { GenericList } from '../../../../components/ui/GenericList'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { BRAND_COLORS } from '../../../../shared/types'
import { RouteService, Vehicle, VehicleStatus } from '../../../../services/api/RouteService'

type StatusFilter = VehicleStatus | 'todos'

const statusLabels: Record<VehicleStatus, string> = {
  disponible: 'Disponible',
  asignado: 'Asignado',
  mantenimiento: 'Mantenimiento',
  fuera_servicio: 'Fuera de servicio',
}

const statusBadge = (estado: VehicleStatus) => {
  switch (estado) {
    case 'disponible':
      return { bg: BRAND_COLORS.cream, text: BRAND_COLORS.red700 }
    case 'asignado':
      return { bg: `${BRAND_COLORS.gold}40`, text: BRAND_COLORS.red700 }
    case 'mantenimiento':
      return { bg: `${BRAND_COLORS.gold}60`, text: BRAND_COLORS.red700 }
    default:
      return { bg: `${BRAND_COLORS.red}20`, text: BRAND_COLORS.red700 }
  }
}

export function SupervisorVehiclesScreen() {
  const navigation = useNavigation<any>()
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('todos')
  const [loading, setLoading] = React.useState(false)

  const fetchVehicles = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await RouteService.getVehicles()
      setVehicles(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchVehicles()
    }, [fetchVehicles]),
  )

  const filtered = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return vehicles.filter((vehicle) => {
      if (statusFilter !== 'todos' && vehicle.estado !== statusFilter) return false
      if (!query) return true
      return (
        vehicle.placa.toLowerCase().includes(query) ||
        (vehicle.modelo ?? '').toLowerCase().includes(query)
      )
    })
  }, [vehicles, searchQuery, statusFilter])

  const statusOptions = [
    { id: 'todos', name: 'Todos' },
    { id: 'disponible', name: 'Disponibles' },
    { id: 'asignado', name: 'Asignados' },
    { id: 'mantenimiento', name: 'Mantenimiento' },
    { id: 'fuera_servicio', name: 'Fuera de servicio' },
  ]

  const menuActions = [
    {
      label: 'Nuevo vehiculo',
      icon: 'add-circle-outline' as const,
      onPress: () => navigation.navigate('SupervisorVehiculoForm', { vehicle: null }),
    },
    {
      label: 'Actualizar',
      icon: 'refresh' as const,
      onPress: fetchVehicles,
    },
  ]

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Vehiculos"
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu extraActions={menuActions} />}
      />

      <View className="px-5 py-4 bg-white shadow-sm z-10">
        <View className="flex-row items-center">
          <View className="flex-1 mr-3">
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por placa o modelo..."
              onClear={() => setSearchQuery('')}
            />
          </View>
          <TouchableOpacity
            className="w-14 h-14 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: BRAND_COLORS.red }}
            onPress={() => navigation.navigate('SupervisorVehiculoForm', { vehicle: null })}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View className="mt-3">
          <CategoryFilter
            categories={statusOptions}
            selectedId={statusFilter}
            onSelect={(value) => setStatusFilter(value as StatusFilter)}
          />
        </View>
      </View>

      <View className="flex-1">
        <GenericList
          items={filtered}
          onRefresh={fetchVehicles}
          isLoading={loading}
          emptyState={{
            icon: 'car-sport-outline',
            title: 'Sin vehiculos',
            message: 'Crea vehiculos para asignar ruteros logísticos.',
          }}
          renderItem={(vehicle) => {
            const badge = statusBadge(vehicle.estado)
            return (
              <Pressable
                onPress={() => navigation.navigate('SupervisorVehiculoDetalle', { vehicleId: vehicle.id })}
                className="bg-white rounded-2xl border border-neutral-200 px-4 py-4 mb-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <View style={styles.cardRow}>
                  <View style={styles.iconWrap}>
                    <Ionicons name="car-sport-outline" size={20} color={BRAND_COLORS.red} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.title}>{vehicle.placa}</Text>
                    <Text style={styles.subtitle}>{vehicle.modelo || 'Modelo no especificado'}</Text>
                    <Text style={styles.meta}>
                      Capacidad: {vehicle.capacidad_kg ? `${vehicle.capacidad_kg} kg` : 'N/D'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.text }]}>
                      {statusLabels[vehicle.estado]}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 6,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
})
