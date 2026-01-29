import React from 'react'
import { View, Text, Pressable, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { GenericList } from '../../../../components/ui/GenericList'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { CommercialRoute, RouteService } from '../../../../services/api/RouteService'
import { UserProfile, UserService } from '../../../../services/api/UserService'
import { Zone, ZoneService } from '../../../../services/api/ZoneService'

type StatusFilter = 'todos' | 'borrador' | 'publicado' | 'en_curso' | 'completado' | 'cancelado'

const statusBadge = (estado: string) => {
  switch (estado) {
    case 'borrador':
      return { bg: BRAND_COLORS.cream, text: BRAND_COLORS.red700 }
    case 'publicado':
      return { bg: `${BRAND_COLORS.gold}40`, text: BRAND_COLORS.red700 }
    case 'en_curso':
      return { bg: `${BRAND_COLORS.gold}60`, text: BRAND_COLORS.red700 }
    case 'completado':
      return { bg: `${BRAND_COLORS.red}15`, text: BRAND_COLORS.red700 }
    default:
      return { bg: `${BRAND_COLORS.red}25`, text: BRAND_COLORS.red700 }
  }
}

export function SupervisorCommercialRoutesScreen() {
  const navigation = useNavigation<any>()
  const [routes, setRoutes] = React.useState<CommercialRoute[]>([])
  const [loading, setLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('todos')
  const [zones, setZones] = React.useState<Zone[]>([])
  const [vendors, setVendors] = React.useState<UserProfile[]>([])

  const fetchRoutes = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await RouteService.getCommercialRoutes()
      setRoutes(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadLookups = React.useCallback(async () => {
    const [zonesData, vendorData] = await Promise.all([
      ZoneService.getZones('activo'),
      UserService.getVendors(),
    ])
    setZones(zonesData)
    setVendors(vendorData)
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchRoutes()
      loadLookups()
    }, [fetchRoutes, loadLookups]),
  )

  const zoneMap = React.useMemo(() => new Map(zones.map((zone) => [zone.id, zone])), [zones])
  const vendorMap = React.useMemo(() => new Map(vendors.map((vendor) => [vendor.id, vendor])), [vendors])

  const filtered = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return routes.filter((route) => {
      if (statusFilter !== 'todos' && route.estado !== statusFilter) return false
      if (!query) return true
      const zoneName = zoneMap.get(route.zona_id)?.nombre || ''
      const vendorName = vendorMap.get(route.vendedor_id)?.name || ''
      return (
        route.id.toLowerCase().includes(query) ||
        route.zona_id.toLowerCase().includes(query) ||
        route.vendedor_id.toLowerCase().includes(query) ||
        zoneName.toLowerCase().includes(query) ||
        vendorName.toLowerCase().includes(query)
      )
    })
  }, [routes, searchQuery, statusFilter, zoneMap, vendorMap])

  const statusOptions = [
    { id: 'todos', name: 'Todos' },
    { id: 'borrador', name: 'Borrador' },
    { id: 'publicado', name: 'Publicado' },
    { id: 'en_curso', name: 'En curso' },
    { id: 'completado', name: 'Completado' },
    { id: 'cancelado', name: 'Cancelado' },
  ]

  const menuActions = [
    {
      label: 'Nuevo rutero comercial',
      icon: 'add-circle-outline' as const,
      onPress: () => navigation.navigate('SupervisorRuteroComercialForm'),
    },
    {
      label: 'Actualizar',
      icon: 'refresh' as const,
      onPress: fetchRoutes,
    },
  ]

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Ruteros comerciales"
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
              placeholder="Buscar por zona o vendedor..."
              onClear={() => setSearchQuery('')}
            />
          </View>
          <TouchableOpacity
            className="w-14 h-14 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: BRAND_COLORS.red }}
            onPress={() => navigation.navigate('SupervisorRuteroComercialForm')}
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
          onRefresh={fetchRoutes}
          isLoading={loading}
          emptyState={{
            icon: 'map-outline',
            title: 'Sin ruteros comerciales',
            message: 'Crea ruteros para planificar visitas de vendedores.',
          }}
          renderItem={(route) => {
            const badge = statusBadge(route.estado)
            const fecha = route.fecha_rutero?.slice(0, 10) || 'Sin fecha'
            const zone = zoneMap.get(route.zona_id)
            const vendor = vendorMap.get(route.vendedor_id)
            return (
              <Pressable
                onPress={() => navigation.navigate('SupervisorRuteroComercialDetalle', { ruteroId: route.id })}
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
                    <Ionicons name="walk-outline" size={20} color={BRAND_COLORS.red} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.title}>Rutero {route.id.slice(0, 8)}</Text>
                    <Text style={styles.subtitle}>Fecha: {fecha}</Text>
                    <Text style={styles.meta}>Zona: {zone?.nombre || route.zona_id.slice(0, 8)}</Text>
                    <Text style={styles.meta}>Vendedor: {vendor?.name || route.vendedor_id.slice(0, 8)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.text }]}>
                      {route.estado.replace(/_/g, ' ').toUpperCase()}
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
    fontSize: 10,
    fontWeight: '700',
  },
})
