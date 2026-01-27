import React from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderService, OrderDetail } from '../../../../services/api/OrderService'
import { UserClientService, UserClient } from '../../../../services/api/UserClientService'
import { CreditService } from '../../../../services/api/CreditService'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { TextField } from '../../../../components/ui/TextField'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { showGlobalToast } from '../../../../utils/toastService'

const formatMoney = (value?: number) => {
  const amount = Number.isFinite(value as number) ? (value as number) : 0
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function SellerCreditRequestDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const orderId: string | undefined = route.params?.orderId

  const [loading, setLoading] = React.useState(true)
  const [orderDetail, setOrderDetail] = React.useState<OrderDetail | null>(null)
  const [client, setClient] = React.useState<UserClient | null>(null)
  const [modalVisible, setModalVisible] = React.useState(false)
  const [creditPlazo, setCreditPlazo] = React.useState('30')
  const [creditNotas, setCreditNotas] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

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
    } finally {
      setLoading(false)
    }
  }, [orderId])

  React.useEffect(() => {
    loadDetail()
  }, [loadDetail])

  const approveCredit = async () => {
    const pedido = orderDetail?.pedido
    if (!pedido?.id || !pedido?.cliente_id) {
      showGlobalToast('No se pudo obtener el pedido', 'error')
      return
    }
    const plazo = Number(creditPlazo)
    if (!Number.isFinite(plazo) || plazo <= 0) {
      showGlobalToast('Ingresa un plazo valido', 'warning')
      return
    }
    setSubmitting(true)
    try {
      const credit = await CreditService.approveCredit({
        pedido_id: pedido.id,
        cliente_id: pedido.cliente_id,
        monto_aprobado: pedido.total || 0,
        plazo_dias: plazo,
        notas: creditNotas || undefined,
      })
      if (!credit) {
        showGlobalToast('No se pudo aprobar el credito', 'error')
        return
      }
      showGlobalToast('Credito aprobado correctamente', 'success')
      setModalVisible(false)
      navigation.goBack()
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Solicitud de credito" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SellerHeaderMenu />} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      </View>
    )
  }

  const pedido = orderDetail?.pedido
  const items = orderDetail?.items || []

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Solicitud de credito" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SellerHeaderMenu />} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <Text className="text-xs text-neutral-500">Cliente</Text>
          <Text className="text-base font-semibold text-neutral-900" numberOfLines={1}>
            {client?.nombre_comercial || client?.ruc || pedido?.cliente_id || 'Cliente'}
          </Text>
          {client?.ruc && <Text className="text-xs text-neutral-500 mt-1">RUC: {client.ruc}</Text>}
        </View>

        <View className="bg-white rounded-2xl border border-neutral-100 p-4 mt-4 shadow-sm">
          <Text className="text-xs text-neutral-500">Pedido</Text>
          <Text className="text-base font-semibold text-neutral-900">
            #{pedido?.numero_pedido || pedido?.id?.slice(0, 8)}
          </Text>
          <Text className="text-xs text-neutral-500 mt-1">Total: {formatMoney(pedido?.total)}</Text>
        </View>

        <View className="bg-white rounded-2xl border border-neutral-100 p-4 mt-4 shadow-sm">
          <Text className="text-sm font-semibold text-neutral-700 mb-3">Productos</Text>
          {items.length === 0 ? (
            <Text className="text-xs text-neutral-500">No hay productos.</Text>
          ) : (
            items.map((item, index) => (
              <View
                key={item.id || item.sku_id || `${index}`}
                className={`${index > 0 ? 'mt-3 pt-3 border-t border-neutral-100' : ''}`}
              >
                <Text className="text-xs text-neutral-500">{item.sku_codigo_snapshot || item.sku_id}</Text>
                <Text className="text-sm font-semibold text-neutral-900" numberOfLines={2}>
                  {item.sku_nombre_snapshot || 'Producto'}
                </Text>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-xs text-neutral-600">Cantidad: {item.cantidad_solicitada ?? 0}</Text>
                  <Text className="text-xs text-neutral-700">{formatMoney(item.subtotal)}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View className="mt-5">
          <PrimaryButton title="Aprobar credito" onPress={() => setModalVisible(true)} />
        </View>
      </ScrollView>

      <GenericModal visible={modalVisible} title="Aprobar credito" onClose={() => setModalVisible(false)}>
        <View className="gap-4">
          <TextField
            label="Plazo en dias"
            keyboardType="numeric"
            value={creditPlazo}
            onChangeText={setCreditPlazo}
            placeholder="30"
          />
          <TextField
            label="Notas (opcional)"
            value={creditNotas}
            onChangeText={setCreditNotas}
            placeholder="Observaciones"
          />
          <PrimaryButton
            title={submitting ? 'Aprobando...' : 'Confirmar'}
            onPress={approveCredit}
            disabled={submitting}
          />
        </View>
      </GenericModal>
    </View>
  )
}
