import React from 'react'
import { View, Text, Pressable, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { jwtDecode } from 'jwt-decode'
import { Header } from '../../../../components/ui/Header'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { GenericList } from '../../../../components/ui/GenericList'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { BRAND_COLORS } from '../../../../shared/types'
import { Delivery, DeliveryService } from '../../../../services/api/DeliveryService'
import { getValidToken } from '../../../../services/auth/authClient'

type StatusFilter = 'todos' | 'pendiente' | 'en_ruta' | 'entregado_completo' | 'no_entregado'

type DecodedToken = {
  sub?: string
  userId?: string
  id?: string
}

const statusBadge = (estado: string) => {
  switch (estado) {
    case 'pendiente':
      return { bg: BRAND_COLORS.cream, text: BRAND_COLORS.red700 }
    case 'en_ruta':
      return { bg: `${BRAND_COLORS.gold}50`, text: BRAND_COLORS.red700 }
    case 'entregado_completo':
      return { bg: `${BRAND_COLORS.red}15`, text: BRAND_COLORS.red700 }
    default:
      return { bg: `${BRAND_COLORS.red}25`, text: BRAND_COLORS.red700 }
  }
}

export function TransportistaDeliveriesScreen() {
  const navigation = useNavigation<any>()
  const [deliveries, setDeliveries] = React.useState<Delivery[]>([])
  const [loading, setLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('todos')
  const [transportistaId, setTransportistaId] = React.useState<string | null>(null)

  const loadTransportistaId = React.useCallback(async () => {
    const token = await getValidToken()
    if (!token) return
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      const id = decoded.sub || decoded.userId || decoded.id
      if (id) setTransportistaId(id)
    } catch {
      setTransportistaId(null)
    }
  }, [])

  const fetchDeliveries = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await DeliveryService.getDeliveries({
        transportista_id: transportistaId ?? undefined,
      })
      setDeliveries(data)
    } finally {
      setLoading(false)
    }
  }, [transportistaId])

  useFocusEffect(
    React.useCallback(() => {
      loadTransportistaId()
      fetchDeliveries()
    }, [loadTransportistaId, fetchDeliveries]),
  )

  const filtered = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return deliveries.filter((delivery) => {
      if (statusFilter !== 'todos' && delivery.estado !== statusFilter) return false
      if (!query) return true
      return delivery.pedido_id.toLowerCase().includes(query)
    })
  }, [deliveries, searchQuery, statusFilter])

  const statusOptions = [
    { id: 'todos', name: 'Todos' },
    { id: 'pendiente', name: 'Pendientes' },
    { id: 'en_ruta', name: 'En ruta' },
    { id: 'entregado_completo', name: 'Entregados' },
    { id: 'no_entregado', name: 'No entregados' },
  ]

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Entregas" variant="standard" />

      <View className="px-5 py-4 bg-white shadow-sm z-10">
        <View className="flex-row items-center">
          <View className="flex-1 mr-3">
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por pedido..."
              onClear={() => setSearchQuery('')}
            />
          </View>
          <TouchableOpacity
            className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: BRAND_COLORS.red }}
            onPress={fetchDeliveries}
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
          onRefresh={fetchDeliveries}
          isLoading={loading}
          emptyState={{
            icon: 'car-sport-outline',
            title: 'Sin entregas',
            message: 'No tienes entregas asignadas.',
          }}
          renderItem={(delivery) => {
            const badge = statusBadge(delivery.estado)
            return (
              <Pressable
                onPress={() => navigation.navigate('TransportistaEntregaDetalle', { entregaId: delivery.id })}
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
                    <Text style={styles.title}>Pedido {delivery.pedido_id.slice(0, 8)}</Text>
                    <Text style={styles.subtitle}>Rutero {delivery.rutero_logistico_id.slice(0, 8)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.text }]}>
                      {delivery.estado.replace(/_/g, ' ').toUpperCase()}
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
