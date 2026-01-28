import React from 'react'
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderListCard } from '../../../../components/orders/OrderListCard'
import { OrderListItem, OrderService } from '../../../../services/api/OrderService'
import { UserClientService } from '../../../../services/api/UserClientService'

export function WarehouseOrdersScreen() {
  const navigation = useNavigation<any>()
  const [orders, setOrders] = React.useState<OrderListItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [clientNameMap, setClientNameMap] = React.useState<Record<string, string>>({})

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

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Pedidos pendientes" variant="standard" />

      <View className="px-5 pt-4">
        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <Text className="text-xs text-neutral-500">Total pendientes</Text>
          <Text className="text-2xl font-extrabold text-neutral-900 mt-1">{orders.length}</Text>
          <Text className="text-xs text-neutral-500 mt-1">
            Valida pedidos para enviarlos a ruta o ajustes.
          </Text>
        </View>

        <View className="mt-4">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch('')}
            placeholder="Buscar por cliente o pedido"
          />
        </View>
      </View>

      {loading && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderListCard
              order={item}
              clientLabel={item.cliente_id ? clientNameMap[item.cliente_id] || item.cliente_id : 'Cliente'}
              onPress={() => navigation.navigate('WarehousePedidoDetalle', { orderId: item.id })}
            />
          )}
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
