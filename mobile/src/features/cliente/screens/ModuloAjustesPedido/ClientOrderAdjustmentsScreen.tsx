import React from 'react'
import { ActivityIndicator, FlatList, RefreshControl, Text, View, Pressable } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { ClientHeaderMenu } from '../../../../components/ui/ClientHeaderMenu'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderDetail, OrderListItem, OrderService } from '../../../../services/api/OrderService'

type AdjustmentItem = {
  order: OrderListItem
  detail: OrderDetail | null
}

export function ClientOrderAdjustmentsScreen() {
  const navigation = useNavigation<any>()
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState<AdjustmentItem[]>([])

  const loadAdjustments = React.useCallback(async () => {
    setLoading(true)
    try {
      const orders = await OrderService.getMyOrders()
      const adjusted = orders.filter((order) => order.estado === 'ajustado_bodega')
      const details = await Promise.all(
        adjusted.map(async (order) => {
          const detail = await OrderService.getOrderDetail(order.id)
          return { order, detail }
        }),
      )
      setItems(details)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadAdjustments()
    }, [loadAdjustments]),
  )

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Ajustes de pedidos"
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<ClientHeaderMenu />}
      />

      {loading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.order.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAdjustments} tintColor={BRAND_COLORS.red} />}
          renderItem={({ item }) => {
            const order = item.order
            const detail = item.detail
            return (
              <View className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4 shadow-sm">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs text-neutral-500">Pedido ajustado</Text>
                    <Text className="text-base font-bold text-neutral-900">
                      #{order.numero_pedido || order.id.slice(0, 8)}
                    </Text>
                  </View>
                  <View className="px-3 py-1 rounded-full bg-amber-50">
                    <Text className="text-xs font-semibold text-amber-700">AJUSTADO</Text>
                  </View>
                </View>

                <View className="mt-3">
                  <Text className="text-xs text-neutral-500 mb-2">Productos</Text>
                  {(detail?.items || []).length === 0 ? (
                    <Text className="text-xs text-neutral-500">Sin productos cargados.</Text>
                  ) : (
                    detail?.items?.map((product, index) => (
                      <View
                        key={product.id || product.sku_id || `${index}`}
                        className={`${index > 0 ? 'mt-2 pt-2 border-t border-neutral-100' : ''}`}
                      >
                        <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
                          {product.sku_nombre_snapshot || 'Producto'}
                        </Text>
                        <Text className="text-xs text-neutral-500">
                          Cantidad: {product.cantidad_solicitada ?? 0}
                        </Text>
                      </View>
                    ))
                  )}
                </View>

                <View className="mt-4 flex-row items-center justify-between">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-neutral-500">Total</Text>
                    <Text className="text-sm font-semibold text-neutral-900">
                      USD {Number(order.total ?? 0).toFixed(2)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => navigation.navigate('ClientePedidoDetalle', { orderId: order.id })}
                    className="px-3 py-2 rounded-xl bg-brand-red"
                  >
                    <Text className="text-xs font-semibold text-white">Ver detalle</Text>
                  </Pressable>
                </View>

                <View className="mt-4">
                  <View className="flex-row items-center">
                    <Ionicons name="alert-circle-outline" size={16} color="#D97706" />
                    <Text className="text-xs text-amber-700 ml-2">
                      Revisa el detalle y responde el ajuste.
                    </Text>
                  </View>
                </View>
              </View>
            )
          }}
          ListEmptyComponent={
            <View className="items-center justify-center py-14">
              <View className="p-4 rounded-full bg-amber-50 mb-4">
                <Ionicons name="alert-circle-outline" size={36} color="#F59E0B" />
              </View>
              <Text className="text-lg font-bold text-neutral-900 mb-2">Sin ajustes pendientes</Text>
              <Text className="text-sm text-neutral-500 text-center">
                No tienes pedidos ajustados por bodega.
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}
