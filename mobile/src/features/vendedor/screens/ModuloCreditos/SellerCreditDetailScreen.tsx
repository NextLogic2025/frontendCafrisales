import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { BRAND_COLORS } from '../../../../shared/types'
import { CreditService, CreditDetailResponse } from '../../../../services/api/CreditService'
import { UserClientService, UserClient } from '../../../../services/api/UserClientService'
import { OrderService, OrderDetail } from '../../../../services/api/OrderService'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { TextField } from '../../../../components/ui/TextField'
import { DatePickerModal } from '../../../../components/ui/DatePickerModal'
import { showGlobalToast } from '../../../../utils/toastService'
import { CreditDetailTemplate } from '../../../../components/credit/CreditDetailTemplate'


export function SellerCreditDetailScreen() {
  const route = useRoute<any>()
  const navigation = useNavigation<any>()
  const creditId: string | undefined = route.params?.creditId

  const [loading, setLoading] = React.useState(true)
  const [detail, setDetail] = React.useState<CreditDetailResponse | null>(null)
  const [client, setClient] = React.useState<UserClient | null>(null)
  const [orderDetail, setOrderDetail] = React.useState<OrderDetail | null>(null)
  const [paymentModalVisible, setPaymentModalVisible] = React.useState(false)
  const [paymentAmount, setPaymentAmount] = React.useState('')
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().slice(0, 10))
  const [paymentReference, setPaymentReference] = React.useState('')
  const [paymentNotes, setPaymentNotes] = React.useState('')
  const [submittingPayment, setSubmittingPayment] = React.useState(false)
  const [datePickerVisible, setDatePickerVisible] = React.useState(false)
  const [rejectModalVisible, setRejectModalVisible] = React.useState(false)
  const [rejectReason, setRejectReason] = React.useState('')
  const [rejecting, setRejecting] = React.useState(false)

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
        let clientData = await UserClientService.getClientForVendedor(credito.cliente_id)
        if (!clientData) {
          clientData = await UserClientService.getClient(credito.cliente_id)
        }
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
        <Header title="Detalle de credito" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SellerHeaderMenu />} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      </View>
    )
  }

  if (!detail?.credito) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Detalle de credito" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SellerHeaderMenu />} />
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={40} color={BRAND_COLORS.red} />
          <Text className="text-neutral-700 mt-3 text-center">No se pudo cargar el credito.</Text>
        </View>
      </View>
    )
  }

  const credito = detail.credito
  const saldo = detail.totales?.saldo ?? 0
  const totalPagado = detail.totales?.total_pagado ?? 0
  const pedido = orderDetail?.pedido
  const items = orderDetail?.items || []
  const canReject = credito.estado !== 'pagado' && credito.estado !== 'cancelado'

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

  const rejectCredit = async () => {
    if (!creditId) return
    setRejecting(true)
    try {
      const success = await CreditService.rejectCredit(creditId, rejectReason)
      if (!success) {
        showGlobalToast('No se pudo rechazar el credito', 'error')
        return
      }
      showGlobalToast('Credito rechazado', 'success')
      setRejectModalVisible(false)
      navigation.goBack()
    } finally {
      setRejecting(false)
    }
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Detalle de credito" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SellerHeaderMenu />} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <CreditDetailTemplate
          credit={credito}
          totals={detail.totales}
          payments={detail.pagos}
          client={client}
          orderDetail={orderDetail}
          footer={
            <View className="gap-3">
              <PrimaryButton title="Registrar pago" onPress={() => setPaymentModalVisible(true)} />
              {canReject ? (
                <Pressable
                  onPress={() => setRejectModalVisible(true)}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 items-center"
                >
                  <Text className="text-sm font-semibold text-red-600">Rechazar credito</Text>
                </Pressable>
              ) : null}
            </View>
          }
        />
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
          <View>
            <Text className="text-sm font-semibold text-neutral-700 mb-2">Fecha de pago</Text>
            <Pressable
              onPress={() => setDatePickerVisible(true)}
              className="flex-row items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3"
            >
              <Text className="text-sm text-neutral-900">{paymentDate || 'Selecciona una fecha'}</Text>
              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            </Pressable>
          </View>
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

      <DatePickerModal
        visible={datePickerVisible}
        title="Fecha de pago"
        infoText="Selecciona la fecha en que se registro el pago."
        initialDate={paymentDate}
        onSelectDate={(value) => setPaymentDate(value)}
        onClear={() => setPaymentDate('')}
        onClose={() => setDatePickerVisible(false)}
      />

      <GenericModal
        visible={rejectModalVisible}
        title="Rechazar credito"
        onClose={() => setRejectModalVisible(false)}
      >
        <View className="gap-4">
          <TextField
            label="Motivo (opcional)"
            value={rejectReason}
            onChangeText={setRejectReason}
            placeholder="Cliente no disponible, datos incorrectos..."
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

