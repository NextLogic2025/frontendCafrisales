import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { OrderService, OrderDetail } from '../../../../services/api/OrderService'
import { UserClientService, UserClient } from '../../../../services/api/UserClientService'
import { CreditService } from '../../../../services/api/CreditService'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { TextField } from '../../../../components/ui/TextField'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { showGlobalToast } from '../../../../utils/toastService'

const formatMoney = (value?: number | string | null) => {
  const amount = Number(value)
  const safeAmount = Number.isFinite(amount) ? amount : 0
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(safeAmount)
}

const computeOrderTotal = (pedido?: OrderDetail['pedido'], items: OrderDetail['items'] = []) => {
  const pedidoTotal = Number(pedido?.total)
  if (Number.isFinite(pedidoTotal) && pedidoTotal > 0) {
    return pedidoTotal
  }
  return items.reduce((sum, item) => {
    const subtotal = Number(item?.subtotal)
    if (Number.isFinite(subtotal) && subtotal > 0) return sum + subtotal
    const unit = Number(item?.precio_unitario_final)
    const qty = Number(item?.cantidad_solicitada)
    if (Number.isFinite(unit) && Number.isFinite(qty)) return sum + unit * qty
    return sum
  }, 0)
}

const buildItemTitle = (item: OrderDetail['items'][number]) => {
  const anyItem = item as any
  const name =
    item?.sku_nombre_snapshot ||
    anyItem?.producto_nombre_snapshot ||
    anyItem?.producto_nombre ||
    anyItem?.product_name ||
    item?.sku_codigo_snapshot ||
    'Producto'
  return name
}

const buildItemPresentation = (item: OrderDetail['items'][number]) => {
  const parts: string[] = []
  if (item?.sku_tipo_empaque_snapshot) parts.push(item.sku_tipo_empaque_snapshot)
  if (item?.sku_peso_gramos_snapshot) parts.push(`${item.sku_peso_gramos_snapshot} g`)
  return parts.join(' / ')
}

export function SellerCreditRequestDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const orderId: string | undefined = route.params?.orderId
  const fallbackClientName: string | undefined = route.params?.clientName
  const fallbackOrderNumber: string | undefined = route.params?.orderNumber

  const [loading, setLoading] = React.useState(true)
  const [orderDetail, setOrderDetail] = React.useState<OrderDetail | null>(null)
  const [client, setClient] = React.useState<UserClient | null>(null)
  const [modalVisible, setModalVisible] = React.useState(false)
  const [creditPlazo, setCreditPlazo] = React.useState('30')
  const [creditNotas, setCreditNotas] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [rejecting, setRejecting] = React.useState(false)
  const [rejectModalVisible, setRejectModalVisible] = React.useState(false)
  const [rejectReason, setRejectReason] = React.useState('')

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
        let clientData = await UserClientService.getClientForVendedor(clienteId)
        if (!clientData) {
          clientData = await UserClientService.getClient(clienteId)
        }
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
      const computedTotal = computeOrderTotal(pedido, orderDetail?.items || [])
      const credit = await CreditService.approveCredit({
        pedido_id: pedido.id,
        cliente_id: pedido.cliente_id,
        monto_aprobado: computedTotal || pedido.total || 0,
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

  const rejectCredit = async () => {
    if (!orderId) {
      showGlobalToast('No se pudo identificar el pedido', 'error')
      return
    }
    setRejecting(true)
    try {
      const success = await OrderService.cancelOrder(orderId, rejectReason)
      if (!success) {
        showGlobalToast('No se pudo rechazar el credito', 'error')
        return
      }
      showGlobalToast('Pedido rechazado', 'success')
      setRejectModalVisible(false)
      navigation.goBack()
    } finally {
      setRejecting(false)
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
  const computedTotal = computeOrderTotal(pedido, items)
  const clienteLabel =
    client?.nombre_comercial ||
    `${client?.nombres || ''} ${client?.apellidos || ''}`.trim() ||
    fallbackClientName ||
    client?.ruc ||
    pedido?.cliente_id ||
    'Cliente sin nombre'

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Solicitud de credito" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SellerHeaderMenu />} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <Text className="text-xs text-neutral-500">Cliente</Text>
          <Text className="text-base font-semibold text-neutral-900" numberOfLines={1}>
            {clienteLabel}
          </Text>
          {client?.ruc && <Text className="text-xs text-neutral-500 mt-1">RUC: {client.ruc}</Text>}
          {client?.telefono && <Text className="text-xs text-neutral-500 mt-1">Tel: {client.telefono}</Text>}
        </View>

        <View className="bg-white rounded-2xl border border-neutral-100 p-4 mt-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-neutral-500">Pedido</Text>
              <Text className="text-base font-semibold text-neutral-900">
                #
                {pedido?.numero_pedido ||
                  (pedido as any)?.numero ||
                  (pedido as any)?.numeroPedido ||
                  fallbackOrderNumber ||
                  pedido?.id?.slice(0, 8) ||
                  '-'}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-neutral-500">Total</Text>
              <Text className="text-base font-semibold text-neutral-900">{formatMoney(computedTotal)}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-neutral-100 p-4 mt-4 shadow-sm">
          <Text className="text-sm font-semibold text-neutral-700 mb-3">Productos</Text>
          {items.length === 0 ? (
            <Text className="text-xs text-neutral-500">No hay productos.</Text>
          ) : (
            items.map((item, index) => {
              const presentation = buildItemPresentation(item)
              const rawCode = item?.sku_codigo_snapshot
              const skuCode = rawCode && rawCode !== 'SIN-CODIGO' ? rawCode : item?.sku_id?.slice(0, 8)
              return (
                <View
                  key={item.id || item.sku_id || `${index}`}
                  className={`${index > 0 ? 'mt-3 pt-3 border-t border-neutral-100' : ''}`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-neutral-500">
                      {skuCode ? `SKU ${skuCode}` : 'SKU'}
                    </Text>
                    <Text className="text-xs text-neutral-500">
                      {item.cantidad_solicitada ?? 0} unid
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-neutral-900 mt-1" numberOfLines={2}>
                    {buildItemTitle(item)}
                  </Text>
                  {presentation ? (
                    <Text className="text-xs text-neutral-500 mt-1">{presentation}</Text>
                  ) : null}
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-xs text-neutral-500">Precio unitario</Text>
                    <Text className="text-xs text-neutral-700">{formatMoney(item.precio_unitario_final)}</Text>
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-xs text-neutral-500">Subtotal</Text>
                    <Text className="text-xs text-neutral-700">{formatMoney(item.subtotal)}</Text>
                  </View>
                  {item.descuento_item_tipo && item.descuento_item_valor != null ? (
                    <View className="mt-2 rounded-xl border border-red-100 bg-red-50 p-2">
                      <View className="flex-row justify-between">
                        <Text className="text-[11px] text-neutral-500">Precio base</Text>
                        <Text className="text-[11px] text-neutral-700">{formatMoney(item.precio_unitario_base ?? 0)}</Text>
                      </View>
                      <View className="flex-row justify-between mt-1">
                        <Text className="text-[11px] text-neutral-500">Descuento</Text>
                        <Text className="text-[11px] text-amber-700">
                          {item.descuento_item_tipo === 'porcentaje'
                            ? `${item.descuento_item_valor}%`
                            : `-${formatMoney(item.descuento_item_valor)}`}
                        </Text>
                      </View>
                      <View className="flex-row justify-between mt-1">
                        <Text className="text-[11px] text-neutral-500">Precio final</Text>
                        <Text className="text-[11px] text-neutral-900 font-semibold">{formatMoney(item.precio_unitario_final ?? 0)}</Text>
                      </View>
                      <View className="flex-row justify-between mt-1">
                        <Text className="text-[11px] text-neutral-500">Origen</Text>
                        <Text className="text-[11px] text-neutral-700">
                          {item.precio_origen === 'negociado' ? 'Negociado' : 'Catalogo'}
                          {item.requiere_aprobacion ? ' · Requiere aprobacion' : ''}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              )
            })
          )}
        </View>

        <View className="mt-5 gap-3">
          <PrimaryButton title="Aprobar credito" onPress={() => setModalVisible(true)} />
          <Pressable
            onPress={() => setRejectModalVisible(true)}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 items-center"
          >
            <Text className="text-sm font-semibold text-red-600">Rechazar credito</Text>
          </Pressable>
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

      <GenericModal visible={rejectModalVisible} title="Rechazar credito" onClose={() => setRejectModalVisible(false)}>
        <View className="gap-4">
          <TextField
            label="Motivo (opcional)"
            value={rejectReason}
            onChangeText={setRejectReason}
            placeholder="Sin stock, cliente no disponible..."
          />
          <PrimaryButton
            title={rejecting ? 'Rechazando...' : 'Confirmar rechazo'}
            onPress={rejectCredit}
            disabled={rejecting}
          />
        </View>
      </GenericModal>
    </View>
  )
}

