import React from 'react'
import { ActivityIndicator, FlatList, RefreshControl, Text, View, Pressable } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderListItem, OrderService } from '../../../../services/api/OrderService'
import { UserClientService } from '../../../../services/api/UserClientService'

export function WarehouseOrdersScreen() {
  const navigation = useNavigation<any>()
  const [orders, setOrders] = React.useState<OrderListItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [clientNameMap, setClientNameMap] = React.useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = React.useState<'todos' | 'contado' | 'credito'>('todos')

  const loadOrders = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await OrderService.getPendingValidationOrders()
      setOrders(data)
      const uniqueClientIds = Array.from(new Set(data.map((order) => order.cliente_id).filter(Boolean)))
      if (uniqueClientIds.length === 0) {
        setClientNameMap({})
        return
      }
      const pairs = await Promise.all(
        uniqueClientIds.map(async (clienteId) => {
          const client = await UserClientService.getClient(clienteId)
          return [clienteId, client?.nombre_comercial || client?.ruc || clienteId] as const
        }),
      )
      setClientNameMap(Object.fromEntries(pairs))
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadOrders()
    }, [loadOrders]),
  )

  const normalizedSearch = search.trim().toLowerCase()
  const filteredOrders = orders.filter((order) => {
    if (!normalizedSearch) return true
    const clientLabel = order.cliente_id ? clientNameMap[order.cliente_id] || order.cliente_id : ''
    const pedidoLabel = order.numero_pedido || order.id
    return clientLabel.toLowerCase().includes(normalizedSearch) || pedidoLabel.toLowerCase().includes(normalizedSearch)
  })
  const filteredByTab = filteredOrders.filter((order) => {
    if (activeTab === 'todos') return true
    return order.metodo_pago === activeTab
  })

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Pedidos pendientes" variant="standard" />

      <CategoryFilter
        categories={[
          { id: 'todos', name: 'Todos' },
          { id: 'contado', name: 'Contado' },
          { id: 'credito', name: 'Crédito' },
        ]}
        selectedId={activeTab}
        onSelect={(id) => setActiveTab(id as 'todos' | 'contado' | 'credito')}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por cliente o pedido"
      />

      <View className="px-5 pt-3">
        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <Text className="text-xs text-neutral-500">Total pendientes</Text>
          <Text className="text-2xl font-extrabold text-neutral-900 mt-1">{orders.length}</Text>
          <Text className="text-xs text-neutral-500 mt-1">
            Valida pedidos para enviarlos a ruta o ajustes.
          </Text>
        </View>
      </View>

      {loading && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <FlatList
          data={filteredByTab}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const clientLabel = item.cliente_id ? clientNameMap[item.cliente_id] || item.cliente_id : 'Cliente'
            const total = Number(item.total ?? 0)
            const metodo = item.metodo_pago === 'credito' ? 'Crédito' : 'Contado'
            return (
              <View className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4 shadow-sm">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs text-neutral-500">Pedido</Text>
                    <Text className="text-base font-bold text-neutral-900">
                      #{item.numero_pedido || item.id.slice(0, 8)}
                    </Text>
                  </View>
                  <View className="px-3 py-1 rounded-full bg-amber-50">
                    <Text className="text-xs font-semibold text-amber-700">PENDIENTE</Text>
                  </View>
                </View>

                <View className="mt-3 flex-row justify-between">
                  <View>
                    <Text className="text-xs text-neutral-500">Cliente</Text>
                    <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
                      {clientLabel}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-neutral-500">Total</Text>
                    <Text className="text-sm font-semibold text-neutral-900">
                      USD {Number.isFinite(total) ? total.toFixed(2) : '0.00'}
                    </Text>
                  </View>
                </View>

                <View className="mt-3 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="card-outline" size={14} color={BRAND_COLORS.red} />
                    <Text className="text-xs text-neutral-600 ml-2">{metodo}</Text>
                  </View>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => navigation.navigate('WarehousePedidoDetalle', { orderId: item.id })}
                      className="px-3 py-2 rounded-xl border border-neutral-200 bg-white"
                    >
                      <Text className="text-xs font-semibold text-neutral-700">Ver detalle</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => navigation.navigate('WarehouseValidarPedido', { orderId: item.id })}
                      className="px-3 py-2 rounded-xl bg-brand-red"
                    >
                      <Text className="text-xs font-semibold text-white">Validar</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )
          }}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadOrders} tintColor={BRAND_COLORS.red} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-14">
              <View className="p-4 rounded-full bg-amber-50 mb-4">
                <Ionicons name="receipt-outline" size={36} color="#F59E0B" />
              </View>
              <Text className="text-lg font-bold text-neutral-900 mb-2">Sin pedidos pendientes</Text>
              <Text className="text-sm text-neutral-500 text-center">
                No hay pedidos por validar en este momento.
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}
