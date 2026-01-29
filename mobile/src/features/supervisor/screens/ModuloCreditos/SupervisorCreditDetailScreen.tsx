import React from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { CreditService, CreditDetailResponse } from '../../../../services/api/CreditService'
import { UserClientService, UserClient } from '../../../../services/api/UserClientService'
import { OrderService, OrderDetail } from '../../../../services/api/OrderService'
import { CreditDetailTemplate } from '../../../../components/credit/CreditDetailTemplate'


export function SupervisorCreditDetailScreen() {
  const route = useRoute<any>()
  const navigation = useNavigation<any>()
  const creditId: string | undefined = route.params?.creditId

  const [loading, setLoading] = React.useState(true)
  const [detail, setDetail] = React.useState<CreditDetailResponse | null>(null)
  const [client, setClient] = React.useState<UserClient | null>(null)
  const [orderDetail, setOrderDetail] = React.useState<OrderDetail | null>(null)

  const loadDetail = React.useCallback(async () => {
    if (!creditId) {
      setDetail(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await CreditService.getCreditById(creditId)
      setDetail(data)

      const credito = data?.credito
      if (credito?.cliente_id) {
        const clientData = await UserClientService.getClient(credito.cliente_id)
        setClient(clientData)
      } else {
        setClient(null)
      }

      if (credito?.pedido_id) {
        const orderData = await OrderService.getOrderDetail(credito.pedido_id)
        setOrderDetail(orderData)
      } else {
        setOrderDetail(null)
      }
    } finally {
      setLoading(false)
    }
  }, [creditId])

  React.useEffect(() => {
    loadDetail()
  }, [loadDetail])

  if (loading) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Detalle de credito" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SupervisorHeaderMenu />} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      </View>
    )
  }

  if (!detail?.credito) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Detalle de credito" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SupervisorHeaderMenu />} />
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={40} color={BRAND_COLORS.red} />
          <Text className="text-neutral-700 mt-3 text-center">No se pudo cargar el credito.</Text>
        </View>
      </View>
    )
  }

  const credito = detail.credito

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Detalle de credito" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SupervisorHeaderMenu />} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <CreditDetailTemplate
          credit={credito}
          totals={detail.totales}
          payments={detail.pagos}
          client={client}
          orderDetail={orderDetail}
        />
      </ScrollView>
    </View>
  )
}
