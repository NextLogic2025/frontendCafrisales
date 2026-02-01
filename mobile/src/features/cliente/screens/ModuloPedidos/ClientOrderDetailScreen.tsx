import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Header } from '../../../../components/ui/Header'
import { ClientHeaderMenu } from '../../../../components/ui/ClientHeaderMenu'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderDetailTemplate } from '../../../../components/orders/OrderDetailTemplate'
import { OrderDetail, OrderService, OrderValidation } from '../../../../services/api/OrderService'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { TextField } from '../../../../components/ui/TextField'
import { showGlobalToast } from '../../../../utils/toastService'
import { getUserName } from '../../../../storage/authStorage'
import { CreditService } from '../../../../services/api/CreditService'
import { getValidToken } from '../../../../services/auth/authClient'
import { jwtDecode } from 'jwt-decode'

export function ClientOrderDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const orderId: string | undefined = route.params?.orderId || route.params?.pedidoId

  const [loading, setLoading] = React.useState(true)
  const [orderDetail, setOrderDetail] = React.useState<OrderDetail | null>(null)
  const [clientName, setClientName] = React.useState<string>('Cliente')
  const [canceling, setCanceling] = React.useState(false)
  const [creditApproved, setCreditApproved] = React.useState(false)
  const [validacionId, setValidacionId] = React.useState<string | null>(null)
  const [latestValidation, setLatestValidation] = React.useState<OrderValidation | null>(null)
  const [actionModalVisible, setActionModalVisible] = React.useState(false)
  const [actionType, setActionType] = React.useState<'acepta' | 'rechaza'>('acepta')
  const [actionComment, setActionComment] = React.useState('')
  const [responding, setResponding] = React.useState(false)

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

      if (data?.pedido?.estado === 'ajustado_bodega') {
        const validations = await OrderService.getOrderValidations(data.pedido.id)
        setValidacionId(validations[0]?.id || null)
        setLatestValidation(validations[0] || null)
      } else {
        setValidacionId(null)
        setLatestValidation(null)
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
  const isCredito = pedido?.metodo_pago === 'credito'
  const isAdjusted = pedido?.estado === 'ajustado_bodega'
  const validationItems = latestValidation?.items || []
  const validationByItemId = Object.fromEntries(
    validationItems
      .filter((item) => item.item_pedido_id)
      .map((item) => [item.item_pedido_id as string, item]),
  )

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

  const submitAdjustmentResponse = async () => {
    if (!pedido?.id || !validacionId) {
      showGlobalToast('No se encontró la validación del pedido', 'warning')
      return
    }
    setResponding(true)
    try {
      const token = await getValidToken()
      if (!token) {
        showGlobalToast('Sesión inválida', 'warning')
        return
      }
      const decoded = jwtDecode<{ sub?: string; userId?: string; id?: string; usuario_id?: string }>(token)
      const clienteId = decoded.sub || decoded.userId || decoded.id || decoded.usuario_id
      if (!clienteId) {
        showGlobalToast('No se pudo identificar al cliente', 'warning')
        return
      }
      const ok = await OrderService.respondToAdjustment(pedido.id, {
        pedido_id: pedido.id,
        validacion_id: validacionId,
        cliente_id: clienteId,
        accion: actionType,
        comentario: actionComment || undefined,
      })
      if (ok) {
        showGlobalToast(actionType === 'acepta' ? 'Ajuste aceptado' : 'Ajuste rechazado', 'success')
        setActionModalVisible(false)
        setActionComment('')
        await loadDetail()
      } else {
        showGlobalToast('No se pudo enviar la respuesta', 'error')
      }
    } finally {
      setResponding(false)
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
              {isAdjusted ? (
                <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
                  <Text className="text-sm font-semibold text-neutral-800 mb-2">
                    Cambios sugeridos por bodega
                  </Text>
                  {(orderDetail?.items || []).map((item, index) => {
                    const validation = item.id ? validationByItemId[item.id] : undefined
                    const estado = validation?.estado_resultado || 'aprobado'
                    const approved = validation?.cantidad_aprobada ?? item.cantidad_solicitada ?? 0
                    return (
                      <View
                        key={item.id || item.sku_id || `${index}`}
                        className={`${index > 0 ? 'mt-3 pt-3 border-t border-neutral-100' : ''}`}
                      >
                        <Text className="text-xs text-neutral-500">{item.sku_codigo_snapshot || 'SIN-CODIGO'}</Text>
                        <Text className="text-sm font-semibold text-neutral-900" numberOfLines={2}>
                          {item.sku_nombre_snapshot || 'Producto'}
                        </Text>
                        <View className="mt-2 flex-row justify-between">
                          <Text className="text-xs text-neutral-500">
                            Solicitado: {item.cantidad_solicitada ?? 0}
                          </Text>
                          <Text className="text-xs text-neutral-700">
                            Aprobado: {approved ?? 0}
                          </Text>
                        </View>
                        <Text className="text-xs text-amber-700 mt-1">
                          Estado: {estado.replace(/_/g, ' ')}
                        </Text>
                        {validation?.sku_aprobado_codigo_snapshot ? (
                          <Text className="text-xs text-neutral-500 mt-1">
                            Sustituido por: {validation.sku_aprobado_codigo_snapshot}
                          </Text>
                        ) : null}
                        {validation?.motivo ? (
                          <Text className="text-xs text-neutral-500 mt-1">Motivo: {validation.motivo}</Text>
                        ) : null}
                      </View>
                    )
                  })}
                </View>
              ) : null}
              {isAdjusted ? (
                <LinearGradient
                  colors={['#FEF3C7', '#FFF7ED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FDE68A' }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="h-10 w-10 rounded-full bg-amber-100 items-center justify-center mr-3">
                        <Ionicons name="alert-circle-outline" size={22} color="#D97706" />
                      </View>
                      <View>
                        <Text className="text-sm font-semibold text-amber-800">
                          Tu pedido fue ajustado por bodega
                        </Text>
                        <Text className="text-xs text-amber-700 mt-1">
                          Revisa los cambios y decide tu respuesta.
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="flex-row gap-3 mt-4">
                    <Pressable
                      onPress={() => {
                        setActionType('acepta')
                        setActionModalVisible(true)
                      }}
                      className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 items-center"
                    >
                      <Text className="text-sm font-semibold text-white">Aceptar</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setActionType('rechaza')
                        setActionModalVisible(true)
                      }}
                      className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 items-center"
                    >
                      <Text className="text-sm font-semibold text-red-600">Rechazar</Text>
                    </Pressable>
                  </View>
                </LinearGradient>
              ) : null}
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

      <GenericModal
        visible={actionModalVisible}
        title={actionType === 'acepta' ? 'Aceptar ajustes' : 'Rechazar ajustes'}
        onClose={() => setActionModalVisible(false)}
      >
        <View className="gap-4">
          <Text className="text-sm text-neutral-600">
            {actionType === 'acepta'
              ? 'Confirmas que aceptas los cambios realizados por bodega.'
              : 'Al rechazar, el pedido se cancelará automáticamente.'}
          </Text>
          <TextField
            label="Comentario (opcional)"
            value={actionComment}
            onChangeText={setActionComment}
            placeholder="Escribe un comentario si lo deseas"
          />
          <PrimaryButton
            title={responding ? 'Enviando...' : actionType === 'acepta' ? 'Aceptar ajustes' : 'Rechazar ajustes'}
            onPress={submitAdjustmentResponse}
            disabled={responding}
          />
        </View>
      </GenericModal>
    </View>
  )
}
