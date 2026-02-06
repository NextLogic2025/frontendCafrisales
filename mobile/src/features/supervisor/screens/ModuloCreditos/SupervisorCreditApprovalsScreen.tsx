import React from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderService, OrderListItem } from '../../../../services/api/OrderService'
import { UserClientService } from '../../../../services/api/UserClientService'
import { formatNameOrId, formatOrderLabel } from '../../../../utils/formatters'

const formatMoney = (value?: number) => {
  const amount = Number.isFinite(value as number) ? (value as number) : 0
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function SupervisorCreditApprovalsScreen() {
  const navigation = useNavigation<any>()
  const [requests, setRequests] = React.useState<OrderListItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [clientNameMap, setClientNameMap] = React.useState<Record<string, string>>({})

  const loadRequests = React.useCallback(async () => {
    setLoading(true)
    try {
      const orders = await OrderService.getOrders()
      const pending = orders.filter(
        (order) => order.metodo_pago === 'credito' && order.estado === 'pendiente_validacion',
      )
      setRequests(pending)

      const uniqueClientIds = Array.from(
        new Set(pending.map((order) => order.cliente_id).filter((id): id is string => typeof id === 'string' && id.length > 0)),
      )
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
      loadRequests()
    }, [loadRequests]),
  )

  const renderItem = ({ item }: { item: OrderListItem }) => {
    const clientLabel = formatNameOrId(clientNameMap[item.cliente_id], item.cliente_id) || 'Cliente'
    return (
      <Pressable
        onPress={() => navigation.navigate('SupervisorSolicitudCreditoDetalle', { orderId: item.id })}
        className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4 shadow-sm"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Pedido</Text>
            <Text className="text-base font-bold text-neutral-900">
              {formatOrderLabel(item.numero_pedido, item.id)}
            </Text>
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
      <Header title="Solicitudes de credito" variant="standard" rightElement={<SupervisorHeaderMenu />} />

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
