import React from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { OrderDetailTemplate } from '../../../../components/orders/OrderDetailTemplate'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderDetail, OrderService } from '../../../../services/api/OrderService'
import { UserClientService } from '../../../../services/api/UserClientService'

export function WarehouseOrderDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const orderId = route.params?.orderId as string | undefined

  const [orderDetail, setOrderDetail] = React.useState<OrderDetail | null>(null)
  const [clientLabel, setClientLabel] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)
  const estado = orderDetail?.pedido?.estado || 'pendiente_validacion'
  const canValidate = estado === 'pendiente_validacion'

  const loadDetail = React.useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const detail = await OrderService.getOrderDetail(orderId)
      setOrderDetail(detail)
      const clienteId = detail?.pedido?.cliente_id
      if (clienteId) {
        const client = await UserClientService.getClient(clienteId)
        setClientLabel(client?.nombre_comercial || client?.ruc || clienteId)
      }
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
      <Header title="Detalle del pedido" variant="standard" onBackPress={() => navigation.goBack()} />

      {loading && !orderDetail ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          <OrderDetailTemplate orderDetail={orderDetail} clientLabel={clientLabel} />
          {!canValidate ? (
            <View className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-3">
              <Text className="text-xs text-red-700">
                Este pedido ya no está pendiente de validación.
              </Text>
            </View>
          ) : null}
          <View className="mt-6">
            <PrimaryButton
              title="Validar pedido"
              onPress={() => navigation.navigate('WarehouseValidarPedido', { orderId })}
              disabled={!orderDetail || !canValidate}
            />
          </View>
        </ScrollView>
      )}
    </View>
  )
}
