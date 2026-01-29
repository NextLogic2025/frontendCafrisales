import React from 'react'
import { View, Text, Pressable, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { GenericList } from '../../../../components/ui/GenericList'
import { FloatingIconButton } from '../../../../components/ui/FloatingIconButton'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { Zone, ZoneService, ZoneStatusFilter } from '../../../../services/api/ZoneService'

export function SupervisorZonesScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const [zones, setZones] = React.useState<Zone[]>([])
  const [filteredZones, setFilteredZones] = React.useState<Zone[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<ZoneStatusFilter>('activo')
  const [loading, setLoading] = React.useState(false)

  const fetchZones = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await ZoneService.getZones(statusFilter)
      setZones(data)
      setFilteredZones(data)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  const upsertZone = React.useCallback((incoming: Zone) => {
    setZones((prev) => {
      const exists = prev.find((item) => item.id === incoming.id)
      if (!exists) {
        return [incoming, ...prev]
      }
      return prev.map((item) => (item.id === incoming.id ? { ...item, ...incoming } : item))
    })
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchZones()
    }, [fetchZones])
  )

  React.useEffect(() => {
    fetchZones()
  }, [fetchZones])

  React.useEffect(() => {
    const incoming = route.params?.upsertZone as Zone | undefined
    if (incoming) {
      upsertZone(incoming)
      navigation.setParams({ upsertZone: undefined })
    }
    if (route.params?.refresh) {
      fetchZones()
      navigation.setParams({ refresh: undefined })
    }
  }, [route.params?.upsertZone, route.params?.refresh, fetchZones, navigation, upsertZone])

  React.useEffect(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      setFilteredZones(zones)
      return
    }
    setFilteredZones(
      zones.filter((zone) =>
        zone.nombre.toLowerCase().includes(query) ||
        zone.codigo.toLowerCase().includes(query)
      )
    )
  }, [searchQuery, zones])

  const statusOptions = [
    { id: 'activo', name: 'Activas' },
    { id: 'inactivo', name: 'Inactivas' },
  ]

  const menuActions = [
    {
      label: 'Nueva zona',
      icon: 'add-circle-outline' as const,
      onPress: () => navigation.navigate('SupervisorZoneDetail', { zone: null }),
    },
    {
      label: 'Actualizar',
      icon: 'refresh' as const,
      onPress: fetchZones,
    },
  ]

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Zonas"
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
              placeholder="Buscar zona..."
              onClear={() => setSearchQuery('')}
            />
          </View>
          <TouchableOpacity
            className="w-14 h-14 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: BRAND_COLORS.red }}
            onPress={() => navigation.navigate('SupervisorZoneDetail', { zone: null })}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>
        <View className="mt-3">
          <CategoryFilter
            categories={statusOptions}
            selectedId={statusFilter}
            onSelect={(value) => setStatusFilter(value as ZoneStatusFilter)}
          />
        </View>
      </View>

      <View className="flex-1">
        <GenericList
          items={filteredZones}
          onRefresh={fetchZones}
          isLoading={loading}
          emptyState={{
            icon: 'map-outline',
            title: 'Sin zonas',
            message: 'Crea tu primera zona para organizar las rutas.',
          }}
          renderItem={(zone) => (
            <Pressable
              onPress={() => navigation.navigate('SupervisorZoneDetail', { zone })}
              className="bg-white rounded-2xl border border-neutral-200 px-4 py-4 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <View className="flex-row items-start">
                <View className="w-12 h-12 rounded-2xl bg-red-50 items-center justify-center mr-3 border border-red-100">
                  <Ionicons name="map" size={22} color={BRAND_COLORS.red} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-neutral-900">{zone.nombre}</Text>
                  <Text className="text-xs text-neutral-500 mt-1">Codigo: {zone.codigo}</Text>
                  {zone.descripcion ? (
                    <Text className="text-sm text-neutral-600 mt-2" numberOfLines={2}>
                      {zone.descripcion}
                    </Text>
                  ) : null}
                  {zone.activo === false ? (
                    <View className="mt-2 bg-neutral-100 self-start px-2 py-1 rounded-full">
                      <Text className="text-[10px] text-neutral-600 font-semibold">Inactiva</Text>
                    </View>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
            </Pressable>
          )}
        />

        <FloatingIconButton
          icon="map-outline"
          accessibilityLabel="Ver mapa general"
          onPress={() => navigation.navigate('SupervisorZonesMap')}
        />
      </View>
    </View>
  )
}
