import React from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderDetail, OrderService } from '../../../../services/api/OrderService'

export function WarehouseHistoryDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const orderId = route.params?.orderId as string | undefined

  const [loading, setLoading] = React.useState(false)
  const [detail, setDetail] = React.useState<OrderDetail | null>(null)

  const loadDetail = React.useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const data = await OrderService.getOrderDetail(orderId)
      setDetail(data)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useFocusEffect(
    React.useCallback(() => {
      loadDetail()
    }, [loadDetail]),
  )

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Detalle" variant="standard" onBackPress={() => navigation.goBack()} />

      {loading && !detail ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
            <Text className="text-xs text-neutral-500">Pedido</Text>
            <Text className="text-base font-bold text-neutral-900">
              #{detail?.pedido?.numero_pedido || detail?.pedido?.id?.slice?.(0, 8) || '-'}
            </Text>
            <Text className="text-xs text-neutral-500 mt-1">Estado: {detail?.pedido?.estado || '-'}</Text>
            <Text className="text-xs text-neutral-500 mt-1">Total: USD {(detail?.pedido?.total ?? 0).toFixed?.(2) ?? '0.00'}</Text>
          </View>

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <Text className="text-sm font-semibold text-neutral-700 mb-3">Items</Text>
            {(detail?.items || []).length === 0 ? (
              <Text className="text-xs text-neutral-500">No hay items.</Text>
            ) : (
              detail?.items?.map((item, index) => (
                <View
                  key={item.id || item.sku_id || `${index}`}
                  className={`${index > 0 ? 'mt-3 pt-3 border-t border-neutral-100' : ''}`}
                >
                  <Text className="text-xs text-neutral-500">{item.sku_codigo_snapshot || 'SIN-CODIGO'}</Text>
                  <Text className="text-sm font-semibold text-neutral-900" numberOfLines={2}>
                    {item.sku_nombre_snapshot || 'Producto'}
                  </Text>
                  <Text className="text-xs text-neutral-500 mt-1">
                    Cantidad: {item.cantidad_solicitada ?? 0} · Subtotal: USD {(item.subtotal ?? 0).toFixed?.(2) ?? '0.00'}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  )
}
