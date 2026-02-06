import React from 'react'
import { View, Text, Pressable, StyleSheet, RefreshControl, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'

import { Header } from '../../../../components/ui/Header'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { DashboardCard } from '../../../../components/ui/DashboardCard'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderResponse, OrderService } from '../../../../services/api/OrderService'
import { RouteService } from '../../../../services/api/RouteService'
import { UserClientService } from '../../../../services/api/UserClientService'
import { showGlobalToast } from '../../../../utils/toastService'
import { formatNameOrId, formatOrderLabel } from '../../../../utils/formatters'
import { lookupCache } from '../../../../utils/lookupCache'

type StatusFilter = 'todos' | 'pendientes' | 'preparados'

type PreparedStopItem = {
  routeId: string
  pedidoId: string
  orden: number
  preparado_en?: string | null
  preparado_por?: string | null
}

const getStatusBadge = (isPrepared: boolean) => {
  if (isPrepared) {
    return { bg: '#DCFCE7', text: '#166534', label: 'Preparado', icon: 'checkmark-circle-outline' }
  }
  return { bg: '#FEF3C7', text: '#92400E', label: 'Pendiente', icon: 'time-outline' }
}

export function WarehouseDeliveriesListScreen() {
  const navigation = useNavigation<any>()
  const [stops, setStops] = React.useState<PreparedStopItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('todos')
  const [orderMap, setOrderMap] = React.useState<Record<string, OrderResponse>>({})
  const [clientMap, setClientMap] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    lookupCache.preload()
  }, [])

  const fetchStops = React.useCallback(async () => {
    setLoading(true)
    try {
      const routes = await RouteService.getLogisticsRoutes('publicado')
      const detailedRoutes = await Promise.all(
        routes.map((route) => RouteService.getLogisticsRoute(route.id)),
      )

      const nextStops: PreparedStopItem[] = []
      detailedRoutes.forEach((route) => {
        if (!route?.paradas) return
        route.paradas.forEach((stop) => {
          nextStops.push({
            routeId: route.id,
            pedidoId: stop.pedido_id,
            orden: stop.orden_entrega,
            preparado_en: stop.preparado_en || null,
            preparado_por: stop.preparado_por || null,
          })
        })
      })
      setStops(nextStops)

      const pedidoIds = Array.from(new Set(nextStops.map((d) => d.pedidoId).filter(Boolean)))
      if (pedidoIds.length > 0) {
        const details = await Promise.all(
          pedidoIds.map(async (pedidoId) => {
            const detail = await OrderService.getOrderById(pedidoId)
            return detail ? [pedidoId, detail] as const : null
          }),
        )
        const nextMap: Record<string, OrderResponse> = {}
        const nextClients: Record<string, string> = {}
        details.forEach((entry) => {
          if (!entry) return
          const [pedidoId, detail] = entry
          nextMap[pedidoId] = detail
          if (detail?.numero_pedido) {
            lookupCache.setOrderLabel(pedidoId, detail.numero_pedido)
          }
          if (detail?.cliente_id) {
            nextClients[pedidoId] = detail.cliente_id
          }
        })
        setOrderMap(nextMap)
        if (Object.keys(nextClients).length > 0) {
          const clientDetails = await Promise.all(
            Object.entries(nextClients).map(async ([pedidoId, clienteId]) => {
              const client = await UserClientService.getClient(clienteId)
              return client ? [pedidoId, client.nombre_comercial || client.ruc || clienteId] as const : [pedidoId, clienteId] as const
            }),
          )
          const clientNames: Record<string, string> = {}
          clientDetails.forEach(([pedidoId, name]) => {
            clientNames[pedidoId] = name
            lookupCache.setClientName(pedidoId, name)
          })
          setClientMap(clientNames)
        } else {
          setClientMap({})
        }
      } else {
        setOrderMap({})
        setClientMap({})
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchStops()
    }, [fetchStops]),
  )

  const kpis = React.useMemo(() => {
    const pendientes = stops.filter((d) => !d.preparado_en).length
    const preparados = stops.filter((d) => d.preparado_en).length
    return { total: stops.length, pendientes, preparados }
  }, [stops])

  const filtered = React.useMemo(() => {
    if (statusFilter === 'todos') return stops
    if (statusFilter === 'pendientes') return stops.filter((d) => !d.preparado_en)
    return stops.filter((d) => d.preparado_en)
  }, [stops, statusFilter])

  const statusOptions = [
    { id: 'todos', name: 'Todos' },
    { id: 'pendientes', name: 'Pendientes' },
    { id: 'preparados', name: 'Preparados' },
  ]

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Preparación de pedidos" variant="standard" onBackPress={() => navigation.goBack()} />

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStops} colors={[BRAND_COLORS.red]} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-4 pt-4">
          <View className="flex-row justify-between -mx-1.5">
            <DashboardCard label="Total" value={kpis.total} icon="cube-outline" color={BRAND_COLORS.red} columns={3} />
            <DashboardCard label="Pendientes" value={kpis.pendientes} icon="time-outline" color="#F59E0B" columns={3} />
            <DashboardCard label="Preparados" value={kpis.preparados} icon="checkmark-circle-outline" color="#10B981" columns={3} />
          </View>
        </View>

        <View className="px-4 py-4">
          <CategoryFilter
            categories={statusOptions}
            selectedId={statusFilter}
            onSelect={(value) => setStatusFilter(value as StatusFilter)}
          />
        </View>

        <View className="px-4">
          {filtered.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center border border-neutral-200">
              <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
              <Text className="text-neutral-500 mt-2 text-center">
                No hay pedidos pendientes de preparación
              </Text>
            </View>
          ) : (
            filtered.map((stop) => {
              const isPrepared = Boolean(stop.preparado_en)
              const badge = getStatusBadge(isPrepared)
              const key = `${stop.routeId}:${stop.pedidoId}`
              const orderDetail = orderMap[stop.pedidoId]
              const clientLabel =
                clientMap[stop.pedidoId] ||
                lookupCache.getClientName(stop.pedidoId) ||
                formatNameOrId(undefined, orderDetail?.cliente_id)
              return (
                <Pressable
                  key={key}
                  onPress={() => navigation.navigate('WarehousePedidoDetalle', { orderId: stop.pedidoId })}
                  className="bg-white rounded-2xl border border-neutral-200 px-4 py-4 mb-3"
                  style={styles.card}
                >
                  <View style={styles.cardRow}>
                    <View style={[styles.iconWrap, { backgroundColor: badge.bg }]}>
                      <Ionicons name={badge.icon as any} size={20} color={badge.text} />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.title}>
                        Pedido {formatOrderLabel(orderDetail?.numero_pedido, stop.pedidoId)}
                      </Text>
                      <Text style={styles.subtitle}>
                        Cliente: {clientLabel}
                      </Text>
                      <Text style={styles.date}>Orden #{stop.orden}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                  </View>
                  <View className="mt-3 flex-row items-center justify-between">
                    <Text className="text-xs text-neutral-500">{isPrepared ? 'Preparado' : 'Sin preparar'}</Text>
                    <Pressable
                      disabled={isPrepared}
                      onPress={async () => {
                        const updated = await RouteService.markLogisticsStopPrepared(stop.routeId, stop.pedidoId)
                        if (!updated) {
                          showGlobalToast('No se pudo marcar como preparado', 'error')
                          return
                        }
                        setStops((prev) =>
                          prev.map((item) =>
                            item.routeId === stop.routeId && item.pedidoId === stop.pedidoId
                              ? { ...item, preparado_en: new Date().toISOString() }
                              : item,
                          ),
                        )
                        showGlobalToast('Pedido preparado', 'success')
                      }}
                      className={`px-3 py-2 rounded-xl border ${
                        isPrepared ? 'border-neutral-200 bg-neutral-50' : 'border-emerald-200 bg-emerald-50'
                      }`}
                    >
                      <Text className={`text-xs font-semibold ${isPrepared ? 'text-neutral-400' : 'text-emerald-700'}`}>
                        {isPrepared ? 'Preparado' : 'Marcar preparado'}
                      </Text>
                    </Pressable>
                  </View>
                </Pressable>
              )
            })
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  date: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
})
