import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { ClientHeaderMenu } from '../../../../components/ui/ClientHeaderMenu'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderDetailTemplate } from '../../../../components/orders/OrderDetailTemplate'
import { OrderDetail, OrderService } from '../../../../services/api/OrderService'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { showGlobalToast } from '../../../../utils/toastService'
import { getUserName } from '../../../../storage/authStorage'
import { CreditService } from '../../../../services/api/CreditService'

export function ClientOrderDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const orderId: string | undefined = route.params?.orderId

  const [loading, setLoading] = React.useState(true)
  const [orderDetail, setOrderDetail] = React.useState<OrderDetail | null>(null)
  const [clientName, setClientName] = React.useState<string>('Cliente')
  const [canceling, setCanceling] = React.useState(false)
  const [creditApproved, setCreditApproved] = React.useState(false)

  const loadDetail = React.useCallback(async () => {
    if (!orderId) {
      setOrderDetail(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await OrderService.getOrderDetail(orderId)
      setOrderDetail(data)
      const storedName = await getUserName()
      setClientName(storedName || 'Cliente')

      if (data?.pedido?.id && data?.pedido?.metodo_pago === 'credito') {
        const credit = await CreditService.getCreditByOrder(data.pedido.id)
        setCreditApproved(Boolean(credit?.credito?.id))
      } else {
        setCreditApproved(false)
      }
    } finally {
      setLoading(false)
    }
  }, [orderId])

  React.useEffect(() => {
    loadDetail()
  }, [loadDetail])

  const pedido = orderDetail?.pedido
  const isPending = pedido?.estado === 'pendiente_validacion'
  const isCredito = pedido?.metodo_pago === 'credito'

  const cancelOrder = async () => {
    if (!pedido?.id) return
    setCanceling(true)
    try {
      const success = await OrderService.cancelOrder(pedido.id, 'Pedido cancelado por cliente')
      if (!success) {
        showGlobalToast('No se pudo cancelar el pedido', 'error')
        return
      }
      showGlobalToast('Pedido cancelado', 'success')
      await loadDetail()
    } finally {
      setCanceling(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Detalle de pedido" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<ClientHeaderMenu />} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      </View>
    )
  }

  if (!orderDetail?.pedido) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Detalle de pedido" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<ClientHeaderMenu />} />
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={40} color={BRAND_COLORS.red} />
          <Text className="text-neutral-700 mt-3 text-center">No se pudo cargar el pedido.</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Detalle de pedido" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<ClientHeaderMenu />} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <OrderDetailTemplate
          orderDetail={orderDetail}
          clientLabel={clientName}
          showClient={false}
          creditApproved={creditApproved}
          footer={
            <View className="gap-3">
              {isPending ? (
                <Pressable
                  onPress={cancelOrder}
                  disabled={canceling}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 items-center"
                >
                  <Text className="text-sm font-semibold text-red-600">
                    {canceling ? 'Cancelando...' : 'Cancelar pedido'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          }
        />
      </ScrollView>
    </View>
  )
}
