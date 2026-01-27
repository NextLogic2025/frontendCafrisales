import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { BRAND_COLORS } from '../../../../shared/types'
import { CreditService, CreditDetailResponse } from '../../../../services/api/CreditService'
import { UserClientService, UserClient } from '../../../../services/api/UserClientService'
import { OrderService, OrderDetail } from '../../../../services/api/OrderService'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { TextField } from '../../../../components/ui/TextField'
import { showGlobalToast } from '../../../../utils/toastService'

const currencyFormatter = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

const formatMoney = (value?: number | null) => currencyFormatter.format(Number.isFinite(value as number) ? (value as number) : 0)

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
}

const shortenId = (value?: string) => {
  if (!value) return '-'
  return `${value.slice(0, 8)}...`
}

export function SupervisorCreditDetailScreen() {
  const route = useRoute<any>()
  const navigation = useNavigation<any>()
  const creditId: string | undefined = route.params?.creditId

  const [loading, setLoading] = React.useState(true)
  const [detail, setDetail] = React.useState<CreditDetailResponse | null>(null)
  const [client, setClient] = React.useState<UserClient | null>(null)
  const [orderDetail, setOrderDetail] = React.useState<OrderDetail | null>(null)
  const [showItems, setShowItems] = React.useState(false)
  const [paymentModalVisible, setPaymentModalVisible] = React.useState(false)
  const [paymentAmount, setPaymentAmount] = React.useState('')
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().slice(0, 10))
  const [paymentReference, setPaymentReference] = React.useState('')
  const [paymentNotes, setPaymentNotes] = React.useState('')
  const [submittingPayment, setSubmittingPayment] = React.useState(false)

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

  const registerPayment = async () => {
    if (!creditId) return
    const amount = Number.parseFloat(paymentAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      showGlobalToast('Ingresa un monto valido', 'warning')
      return
    }
    setSubmittingPayment(true)
    try {
      const success = await CreditService.registerPayment(creditId, {
        monto_pago: amount,
        fecha_pago: paymentDate || undefined,
        referencia: paymentReference || undefined,
        notas: paymentNotes || undefined,
      })
      if (success) {
        showGlobalToast('Pago registrado correctamente', 'success')
        setPaymentAmount('')
        setPaymentReference('')
        setPaymentNotes('')
        setPaymentModalVisible(false)
        await loadDetail()
      } else {
        showGlobalToast('No se pudo registrar el pago', 'error')
      }
    } finally {
      setSubmittingPayment(false)
    }
  }

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
  const estado = credito.estado || 'activo'
  const estadoColor = estado === 'pagado' ? '#059669' : estado === 'vencido' ? BRAND_COLORS.red : '#2563EB'
  const saldo = detail.totales?.saldo ?? 0
  const totalPagado = detail.totales?.total_pagado ?? 0
  const pedido = orderDetail?.pedido
  const items = orderDetail?.items || []

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Detalle de credito" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SupervisorHeaderMenu />} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-neutral-500">Credito</Text>
              <Text className="text-base font-bold text-neutral-900">#{shortenId(credito.id)}</Text>
            </View>
            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${estadoColor}22` }}>
              <Text className="text-xs font-semibold" style={{ color: estadoColor }}>
                {estado.toUpperCase()}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row justify-between">
            <View>
              <Text className="text-xs text-neutral-500">Monto aprobado</Text>
              <Text className="text-base font-semibold text-neutral-900">{formatMoney(Number(credito.monto_aprobado))}</Text>
            </View>
            <View>
              <Text className="text-xs text-neutral-500">Saldo</Text>
              <Text className="text-base font-semibold text-neutral-900">{formatMoney(Number(saldo))}</Text>
            </View>
          </View>

          <View className="mt-3">
            <Text className="text-xs text-neutral-500">Total pagado</Text>
            <Text className="text-sm font-semibold text-neutral-900">{formatMoney(Number(totalPagado))}</Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-neutral-100 p-4 mt-4 shadow-sm">
          <Text className="text-xs text-neutral-500">Cliente</Text>
          <Text className="text-base font-semibold text-neutral-900" numberOfLines={1}>
            {client?.nombre_comercial || client?.ruc || credito.cliente_id}
          </Text>
          {client?.ruc && <Text className="text-xs text-neutral-500 mt-1">RUC: {client.ruc}</Text>}
          {client?.telefono && <Text className="text-xs text-neutral-500 mt-1">Tel: {client.telefono}</Text>}
        </View>

        <View className="bg-white rounded-2xl border border-neutral-100 p-4 mt-4 shadow-sm">
          <Text className="text-xs text-neutral-500">Pedido</Text>
          <Text className="text-base font-semibold text-neutral-900">
            {pedido?.numero_pedido ? `#${pedido.numero_pedido}` : `#${shortenId(credito.pedido_id)}`}
          </Text>
          <View className="mt-2 flex-row justify-between">
            <View>
              <Text className="text-xs text-neutral-500">Total pedido</Text>
              <Text className="text-sm font-semibold text-neutral-900">{formatMoney(Number(pedido?.total ?? 0))}</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-neutral-500">Vence</Text>
              <Text className="text-sm font-semibold text-neutral-900">{formatDate(credito.fecha_vencimiento)}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => setShowItems((prev) => !prev)}
            className="mt-4 flex-row items-center justify-between bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2"
          >
            <View className="flex-row items-center">
              <Ionicons name="list-outline" size={16} color={BRAND_COLORS.red} />
              <Text className="text-xs text-neutral-700 font-semibold ml-2">
                Productos del pedido ({items.length})
              </Text>
            </View>
            <Ionicons
              name={showItems ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={18}
              color={showItems ? BRAND_COLORS.red : '#9CA3AF'}
            />
          </Pressable>

          {showItems && (
            <View className="mt-3">
              {items.length === 0 ? (
                <Text className="text-xs text-neutral-500">No hay productos para mostrar.</Text>
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
                      <Text className="text-xs text-neutral-700">
                        {formatMoney(Number(item.subtotal ?? 0))}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        <View className="bg-white rounded-2xl border border-neutral-100 p-4 mt-4 shadow-sm">
          <Text className="text-sm font-semibold text-neutral-700 mb-3">Pagos</Text>
          {detail.pagos && detail.pagos.length > 0 ? (
            detail.pagos.map((pago, index) => (
              <View
                key={pago.id}
                className={`${index > 0 ? 'mt-3 pt-3 border-t border-neutral-100' : ''}`}
              >
                <View className="flex-row justify-between">
                  <Text className="text-xs text-neutral-500">Fecha</Text>
                  <Text className="text-xs text-neutral-700">{formatDate(pago.fecha_pago)}</Text>
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-xs text-neutral-500">Monto</Text>
                  <Text className="text-sm font-semibold text-neutral-900">
                    {formatMoney(Number(pago.monto_pago))}
                  </Text>
                </View>
                {pago.referencia && (
                  <Text className="text-xs text-neutral-500 mt-1">Ref: {pago.referencia}</Text>
                )}
              </View>
            ))
          ) : (
            <Text className="text-xs text-neutral-500">No hay pagos registrados.</Text>
          )}
        </View>

        <View className="mt-4">
          <PrimaryButton title="Registrar pago" onPress={() => setPaymentModalVisible(true)} />
        </View>
      </ScrollView>

      <GenericModal
        visible={paymentModalVisible}
        title="Registrar pago"
        onClose={() => setPaymentModalVisible(false)}
      >
        <View className="gap-4">
          <TextField
            label="Monto"
            keyboardType="numeric"
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            placeholder="0.00"
          />
          <TextField
            label="Fecha (YYYY-MM-DD)"
            value={paymentDate}
            onChangeText={setPaymentDate}
            placeholder="2026-01-27"
          />
          <TextField
            label="Referencia (opcional)"
            value={paymentReference}
            onChangeText={setPaymentReference}
            placeholder="Recibo, transferencia..."
          />
          <TextField
            label="Notas (opcional)"
            value={paymentNotes}
            onChangeText={setPaymentNotes}
            placeholder="Observaciones"
          />
          <PrimaryButton
            title={submittingPayment ? 'Registrando...' : 'Confirmar pago'}
            onPress={registerPayment}
            disabled={submittingPayment}
          />
        </View>
      </GenericModal>
    </View>
  )
}
