import React from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { jwtDecode } from 'jwt-decode'
import { Header } from '../../../../components/ui/Header'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { GenericList } from '../../../../components/ui/GenericList'
import { BRAND_COLORS } from '../../../../shared/types'
import { CommercialRoute, RouteService } from '../../../../services/api/RouteService'
import { UserClientService, UserClient } from '../../../../services/api/UserClientService'
import { getValidToken } from '../../../../services/auth/authClient'

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

export function SellerCommercialRoutesScreen() {
  const navigation = useNavigation<any>()
  const [routes, setRoutes] = React.useState<CommercialRoute[]>([])
  const [loading, setLoading] = React.useState(false)
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('todos')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [clientMap, setClientMap] = React.useState<Record<string, UserClient>>({})

  const loadRoutes = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await RouteService.getCommercialRoutes()
      setRoutes(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadClients = React.useCallback(async () => {
    const token = await getValidToken()
    if (!token) return
    const decoded = jwtDecode<{ sub?: string; userId?: string }>(token)
    const vendedorId = decoded.sub || decoded.userId
    if (!vendedorId) return
    const clients = await UserClientService.getClientsByVendedor(vendedorId)
    const map: Record<string, UserClient> = {}
    clients.forEach((client) => {
      map[client.usuario_id] = client
    })
    setClientMap(map)
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadRoutes()
      loadClients()
    }, [loadRoutes, loadClients]),
  )

  const filtered = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return routes.filter((route) => {
      if (statusFilter !== 'todos' && route.estado !== statusFilter) return false
      if (!query) return true
      return route.id.toLowerCase().includes(query) || route.zona_id.toLowerCase().includes(query)
    })
  }, [routes, searchQuery, statusFilter])

  const statusOptions = [
    { id: 'todos', name: 'Todos' },
    { id: 'borrador', name: 'Borrador' },
    { id: 'publicado', name: 'Publicado' },
    { id: 'en_curso', name: 'En curso' },
    { id: 'completado', name: 'Completado' },
    { id: 'cancelado', name: 'Cancelado' },
  ]

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Rutero comercial" variant="standard" rightElement={<SellerHeaderMenu />} />

      <View className="px-5 py-4 bg-white shadow-sm z-10">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por zona o rutero..."
          onClear={() => setSearchQuery('')}
        />
        <View className="mt-3">
          <CategoryFilter
            categories={statusOptions}
            selectedId={statusFilter}
            onSelect={(value) => setStatusFilter(value as StatusFilter)}
          />
        </View>
      </View>

      {loading && routes.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <GenericList
          items={filtered}
          onRefresh={loadRoutes}
          isLoading={loading}
          emptyState={{
            icon: 'navigate-outline',
            title: 'Sin ruteros comerciales',
            message: 'No hay ruteros asignados por ahora.',
          }}
          renderItem={(item) => {
            const badge = statusBadge(item.estado)
            const fecha = item.fecha_rutero?.slice(0, 10) || 'Sin fecha'
            const stopCount = item.paradas?.length || 0
            return (
              <Pressable
                onPress={() => navigation.navigate('SellerRuteroComercialDetalle', { ruteroId: item.id, clientMap })}
                className="bg-white rounded-2xl border border-neutral-200 px-4 py-4 mb-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: '#FEF2F2' }}>
                    <Ionicons name="walk-outline" size={20} color={BRAND_COLORS.red} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-neutral-900">Rutero {item.id.slice(0, 8)}</Text>
                    <Text className="text-xs text-neutral-500 mt-1">Fecha: {fecha}</Text>
                    <Text className="text-xs text-neutral-500 mt-1">Paradas: {stopCount}</Text>
                  </View>
                  <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: badge.bg }}>
                    <Text className="text-[10px] font-semibold" style={{ color: badge.text }}>
                      {item.estado.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )
          }}
        />
      )}
    </View>
  )
}
