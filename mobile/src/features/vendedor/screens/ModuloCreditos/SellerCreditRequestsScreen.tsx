import React from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { jwtDecode } from 'jwt-decode'
import { Header } from '../../../../components/ui/Header'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderService, OrderListItem } from '../../../../services/api/OrderService'
import { UserClientService } from '../../../../services/api/UserClientService'
import { getValidToken } from '../../../../services/auth/authClient'
import { Ionicons } from '@expo/vector-icons'
import { CreditService } from '../../../../services/api/CreditService'

const formatMoney = (value?: number) => {
  const amount = Number.isFinite(value as number) ? (value as number) : 0
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function SellerCreditRequestsScreen() {
  const navigation = useNavigation<any>()
  const [requests, setRequests] = React.useState<OrderListItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [clientNameMap, setClientNameMap] = React.useState<Record<string, string>>({})

  const loadRequests = React.useCallback(async () => {
    setLoading(true)
    try {
      const token = await getValidToken()
      if (!token) {
        setRequests([])
        return
      }
      const decoded = jwtDecode<{ sub?: string; userId?: string }>(token)
      const vendedorId = decoded.sub || decoded.userId
      if (!vendedorId) {
        setRequests([])
        return
      }

      const clients = await UserClientService.getClientsByVendedor(vendedorId)
      const clientIds = new Set(clients.map((client) => client.usuario_id))
      const mapEntries = clients.map((client) => [client.usuario_id, client.nombre_comercial || client.ruc || client.usuario_id] as const)
      setClientNameMap(Object.fromEntries(mapEntries))

      const orders = await OrderService.getOrders()
      const pending = orders.filter(
        (order) =>
          order.metodo_pago === 'credito' &&
          order.estado === 'pendiente_validacion' &&
          order.cliente_id &&
          clientIds.has(order.cliente_id),
      )
      if (pending.length === 0) {
        setRequests([])
        return
      }

      const approvals = await Promise.all(
        pending.map(async (order) => {
          const credit = await CreditService.getCreditByOrder(order.id)
          return Boolean(credit?.credito?.id)
        }),
      )
      const filteredPending = pending.filter((_, index) => !approvals[index])
      setRequests(filteredPending)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadRequests()
    }, [loadRequests]),
  )

  const renderItem = ({ item }: { item: OrderListItem }) => {
    const clientLabel = item.cliente_id ? clientNameMap[item.cliente_id] || item.cliente_id : 'Cliente'
    return (
      <Pressable
        onPress={() => navigation.navigate('SolicitudCreditoDetalle', { orderId: item.id })}
        className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4 shadow-sm"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Pedido</Text>
            <Text className="text-base font-bold text-neutral-900">#{item.numero_pedido || item.id.slice(0, 8)}</Text>
          </View>
          <View className="px-3 py-1 rounded-full bg-amber-50">
            <Text className="text-xs font-semibold text-amber-700">CREDITO</Text>
          </View>
        </View>
        <View className="mt-3 flex-row justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Cliente</Text>
            <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
              {clientLabel}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-neutral-500">Total</Text>
            <Text className="text-sm font-semibold text-neutral-900">{formatMoney(item.total)}</Text>
          </View>
        </View>
      </Pressable>
    )
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Solicitudes de credito" variant="standard" rightElement={<SellerHeaderMenu />} />

      {loading && requests.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRequests} tintColor={BRAND_COLORS.red} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-14">
              <View className="p-4 rounded-full bg-red-50 mb-4">
                <Ionicons name="card-outline" size={36} color={BRAND_COLORS.red} />
              </View>
              <Text className="text-lg font-bold text-neutral-900 mb-2">Sin solicitudes</Text>
              <Text className="text-sm text-neutral-500 text-center">
                No hay pedidos a credito pendientes de aprobacion.
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}
