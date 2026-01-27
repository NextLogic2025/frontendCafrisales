import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { jwtDecode } from 'jwt-decode'
import { Header } from '../../../../components/ui/Header'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderDetailTemplate } from '../../../../components/orders/OrderDetailTemplate'
import { OrderDetail, OrderService } from '../../../../services/api/OrderService'
import { UserClient, UserClientService } from '../../../../services/api/UserClientService'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { showGlobalToast } from '../../../../utils/toastService'
import { getValidToken } from '../../../../services/auth/authClient'
import { CreditService } from '../../../../services/api/CreditService'

export function SellerOrderDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const orderId: string | undefined = route.params?.orderId

  const [loading, setLoading] = React.useState(true)
  const [orderDetail, setOrderDetail] = React.useState<OrderDetail | null>(null)
  const [client, setClient] = React.useState<UserClient | null>(null)
  const [paymentModalVisible, setPaymentModalVisible] = React.useState(false)
  const [updatingPayment, setUpdatingPayment] = React.useState(false)
  const [vendedorId, setVendedorId] = React.useState<string | null>(null)
  const [creditApproved, setCreditApproved] = React.useState<boolean>(false)

  const loadDetail = React.useCallback(async () => {
    if (!orderId) {
      setOrderDetail(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const token = await getValidToken()
      if (token) {
        const decoded = jwtDecode<{ sub?: string; userId?: string }>(token)
        setVendedorId(decoded.sub || decoded.userId || null)
      }

      const data = await OrderService.getOrderDetail(orderId)
      setOrderDetail(data)

      const clienteId = data?.pedido?.cliente_id
      if (clienteId) {
        let clientData = await UserClientService.getClientForVendedor(clienteId)
        if (!clientData) {
          clientData = await UserClientService.getClient(clienteId)
        }
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

  const pedido = orderDetail?.pedido
  const isPending = pedido?.estado === 'pendiente_validacion'
  const createdByMe =
    vendedorId &&
    ((pedido as any)?.creado_por_id === vendedorId || (pedido as any)?.creado_por === vendedorId)
  const canChangePayment = Boolean(isPending && createdByMe && !creditApproved)
  const isCredito = pedido?.metodo_pago === 'credito'

  const updatePaymentMethod = async (metodo: 'contado' | 'credito') => {
    if (!pedido?.id) return
    setUpdatingPayment(true)
    try {
      const success = await OrderService.updatePaymentMethod(pedido.id, metodo)
      if (!success) {
        showGlobalToast('No se pudo actualizar el metodo de pago', 'error')
        return
      }
      showGlobalToast('Metodo de pago actualizado', 'success')
      setPaymentModalVisible(false)
      await loadDetail()
    } finally {
      setUpdatingPayment(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Detalle de pedido" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SellerHeaderMenu />} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      </View>
    )
  }

  if (!orderDetail?.pedido) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Detalle de pedido" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SellerHeaderMenu />} />
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
    pedido?.cliente_id ||
    'Cliente'

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Detalle de pedido" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SellerHeaderMenu />} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <OrderDetailTemplate
          orderDetail={orderDetail}
          clientLabel={clientLabel}
          creditApproved={creditApproved}
          footer={
            canChangePayment ? (
              <PrimaryButton title="Cambiar metodo de pago" onPress={() => setPaymentModalVisible(true)} />
            ) : null
          }
        />
      </ScrollView>

      <GenericModal
        visible={paymentModalVisible}
        title="Metodo de pago"
        onClose={() => setPaymentModalVisible(false)}
      >
        <View className="gap-3">
          <PrimaryButton
            title="Cambiar a contado"
            onPress={() => updatePaymentMethod('contado')}
            disabled={updatingPayment}
          />
          <Pressable
            onPress={() => updatePaymentMethod('credito')}
            className={`rounded-xl border px-4 py-3 items-center ${isCredito ? 'border-neutral-200 bg-neutral-100' : 'border-brand-red bg-white'}`}
            disabled={updatingPayment || isCredito}
          >
            <Text className={`text-sm font-semibold ${isCredito ? 'text-neutral-400' : 'text-brand-red'}`}>
              Cambiar a crédito
            </Text>
          </Pressable>
        </View>
      </GenericModal>
    </View>
  )
}
