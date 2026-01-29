import React from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { OrderDetailTemplate } from '../../../../components/orders/OrderDetailTemplate'
import { OrderDetail, OrderService } from '../../../../services/api/OrderService'
import { UserClient, UserClientService } from '../../../../services/api/UserClientService'
import { CreditService } from '../../../../services/api/CreditService'

export function SupervisorOrderDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const orderId: string | undefined = route.params?.orderId

  const [loading, setLoading] = React.useState(true)
  const [orderDetail, setOrderDetail] = React.useState<OrderDetail | null>(null)
  const [client, setClient] = React.useState<UserClient | null>(null)
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
      const clienteId = data?.pedido?.cliente_id
      if (clienteId) {
        const clientData = await UserClientService.getClient(clienteId)
        setClient(clientData)
      } else {
        setClient(null)
      }

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

  if (loading) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Detalle de pedido" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SupervisorHeaderMenu />} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      </View>
    )
  }

  if (!orderDetail?.pedido) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Detalle de pedido" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SupervisorHeaderMenu />} />
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={40} color={BRAND_COLORS.red} />
          <Text className="text-neutral-700 mt-3 text-center">No se pudo cargar el pedido.</Text>
        </View>
      </View>
    )
  }

  const clientLabel =
    client?.nombre_comercial ||
    `${client?.nombres || ''} ${client?.apellidos || ''}`.trim() ||
    client?.ruc ||
    orderDetail?.pedido?.cliente_id ||
    'Cliente'

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Detalle de pedido" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SupervisorHeaderMenu />} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <OrderDetailTemplate orderDetail={orderDetail} clientLabel={clientLabel} creditApproved={creditApproved} />
      </ScrollView>
    </View>
  )
}
