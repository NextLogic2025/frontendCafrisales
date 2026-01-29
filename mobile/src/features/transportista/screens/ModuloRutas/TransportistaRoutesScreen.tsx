import React, { useDeferredValue } from 'react'
import { View, Text, Pressable, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { GenericList } from '../../../../components/ui/GenericList'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { RouteService, LogisticRoute } from '../../../../services/api/RouteService'

type StatusFilter = 'publicado' | 'en_curso' | 'todos'

const statusBadge = (estado: string) => {
  switch (estado) {
    case 'publicado':
      return { bg: `${BRAND_COLORS.gold}40`, text: BRAND_COLORS.red700 }
    case 'en_curso':
      return { bg: `${BRAND_COLORS.red}20`, text: BRAND_COLORS.red700 }
    default:
      return { bg: BRAND_COLORS.cream, text: BRAND_COLORS.red700 }
  }
}

export function TransportistaRoutesScreen() {
  const navigation = useNavigation<any>()
  const [routes, setRoutes] = React.useState<LogisticRoute[]>([])
  const [loading, setLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('todos')

  // useDeferredValue para búsqueda sin bloquear UI
  const deferredSearch = useDeferredValue(searchQuery.trim().toLowerCase())

  const fetchRoutes = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await RouteService.getLogisticsRoutes('publicado,en_curso')
      setRoutes(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchRoutes()
    }, [fetchRoutes]),
  )

  const filtered = React.useMemo(() => {
    return routes.filter((route) => {
      if (statusFilter !== 'todos' && route.estado !== statusFilter) return false
      if (!deferredSearch) return true
      return (
        route.id.toLowerCase().includes(deferredSearch) ||
        route.zona_id.toLowerCase().includes(deferredSearch)
      )
    })
  }, [routes, deferredSearch, statusFilter])

  const statusOptions = [
    { id: 'todos', name: 'Todos' },
    { id: 'publicado', name: 'Publicados' },
    { id: 'en_curso', name: 'En curso' },
  ]

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Rutas" variant="standard" />

      <View className="px-5 py-4 bg-white shadow-sm z-10">
        <View className="flex-row items-center">
          <View className="flex-1 mr-3">
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar rutero..."
              onClear={() => setSearchQuery('')}
            />
          </View>
          <TouchableOpacity
            className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: BRAND_COLORS.red }}
            onPress={fetchRoutes}
          >
            <Ionicons name="refresh" size={22} color="white" />
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
            icon: 'navigate-outline',
            title: 'Sin rutas',
            message: 'No tienes ruteros asignados en este momento.',
          }}
          renderItem={(route) => {
            const badge = statusBadge(route.estado)
            return (
              <Pressable
                onPress={() => navigation.navigate('TransportistaRutaDetalle', { ruteroId: route.id })}
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
                    <Ionicons name="navigate-outline" size={20} color={BRAND_COLORS.red} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.title}>Rutero {route.id.slice(0, 8)}</Text>
                    <Text style={styles.subtitle}>Fecha: {route.fecha_rutero?.slice(0, 10) || '-'}</Text>
                    <Text style={styles.meta}>Zona: {route.zona_id.slice(0, 8)}</Text>
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
