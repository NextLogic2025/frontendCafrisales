import React from 'react'
import { ActivityIndicator, ScrollView, Text, View, Pressable } from 'react-native'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { jwtDecode } from 'jwt-decode'
import { LinearGradient } from 'expo-linear-gradient'
import { Header } from '../../../../components/ui/Header'
import { TextField } from '../../../../components/ui/TextField'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { showGlobalToast } from '../../../../utils/toastService'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderDetail, OrderItemDetail, OrderService } from '../../../../services/api/OrderService'
import { getValidToken } from '../../../../services/auth/authClient'

type EstadoResultado = 'aprobado' | 'aprobado_parcial' | 'sustituido' | 'rechazado'

type ItemValidationState = {
  itemId: string
  skuId?: string
  skuName?: string
  skuCode?: string
  quantity: number
  estado: EstadoResultado
  cantidadAprobada: string
  skuAprobadoId: string
  motivo: string
}

type DecodedToken = {
  sub?: string
  userId?: string
  id?: string
  usuario_id?: string
}

const defaultMotivoForEstado = (estado: EstadoResultado) => {
  switch (estado) {
    case 'aprobado':
      return 'Stock disponible'
    case 'aprobado_parcial':
      return 'Stock parcial'
    case 'sustituido':
      return 'Sustitución por falta de stock'
    case 'rechazado':
      return 'Sin stock'
  }
}

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

const estadoBadgeStyles = (estado: EstadoResultado) => {
  switch (estado) {
    case 'aprobado':
      return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' }
    case 'aprobado_parcial':
      return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' }
    case 'sustituido':
      return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' }
    case 'rechazado':
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
  }
}

const getInitialState = (item: OrderItemDetail): ItemValidationState => {
  const qty = Number(item.cantidad_solicitada ?? 0)
  return {
    itemId: item.id || '',
    skuId: item.sku_id,
    skuName: item.sku_nombre_snapshot,
    skuCode: item.sku_codigo_snapshot,
    quantity: qty,
    estado: 'aprobado',
    cantidadAprobada: String(qty),
    skuAprobadoId: '',
    motivo: defaultMotivoForEstado('aprobado'),
  }
}

export function WarehouseValidateOrderScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const orderId = route.params?.orderId as string | undefined

  const [orderDetail, setOrderDetail] = React.useState<OrderDetail | null>(null)
  const [items, setItems] = React.useState<ItemValidationState[]>([])
  const [observaciones, setObservaciones] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [bodegueroId, setBodegueroId] = React.useState<string | null>(null)
  const [filter, setFilter] = React.useState<'todos' | EstadoResultado>('todos')
  const pedidoEstado = orderDetail?.pedido?.estado || 'pendiente_validacion'
  const canValidate = pedidoEstado === 'pendiente_validacion'
  const totalItems = orderDetail?.items?.length || 0
  const hasMissingItems = totalItems > 0 && items.length !== totalItems

  const loadDetail = React.useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const detail = await OrderService.getOrderDetail(orderId)
      setOrderDetail(detail)
      const next = (detail?.items || []).map(getInitialState)
      setItems(next)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  const loadUserId = React.useCallback(async () => {
    const token = await getValidToken()
    if (!token) return
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      const id = decoded.sub || decoded.userId || decoded.id || decoded.usuario_id
      if (id) setBodegueroId(id)
    } catch {
      setBodegueroId(null)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadDetail()
      loadUserId()
    }, [loadDetail, loadUserId]),
  )

  const updateItem = (itemId: string, patch: Partial<ItemValidationState>) => {
    setItems((prev) => prev.map((item) => (item.itemId === itemId ? { ...item, ...patch } : item)))
  }

  const setEstado = (item: ItemValidationState, estado: EstadoResultado) => {
    const qty = item.quantity
    if (estado === 'rechazado') {
      updateItem(item.itemId, {
        estado,
        cantidadAprobada: '',
        skuAprobadoId: '',
        motivo: defaultMotivoForEstado(estado),
      })
      return
    }
    if (estado === 'aprobado_parcial') {
      const suggested = qty > 1 ? qty - 1 : 1
      updateItem(item.itemId, {
        estado,
        cantidadAprobada: String(suggested),
        skuAprobadoId: '',
        motivo: defaultMotivoForEstado(estado),
      })
      return
    }
    if (estado === 'sustituido') {
      updateItem(item.itemId, {
        estado,
        cantidadAprobada: String(qty),
        motivo: defaultMotivoForEstado(estado),
      })
      return
    }
    updateItem(item.itemId, {
      estado,
      cantidadAprobada: String(qty),
      skuAprobadoId: '',
      motivo: defaultMotivoForEstado(estado),
    })
  }

  const validateBeforeSubmit = () => {
    if (!canValidate) {
      showGlobalToast('El pedido ya no está pendiente de validación', 'warning')
      return false
    }
    if (!bodegueroId) {
      showGlobalToast('No se pudo identificar al bodeguero', 'warning')
      return false
    }
    if (!isUuid(bodegueroId)) {
      showGlobalToast('ID de bodeguero inválido', 'warning')
      return false
    }
    if (items.length === 0) {
      showGlobalToast('No hay items para validar', 'warning')
      return false
    }
    if (items.some((item) => !item.itemId)) {
      showGlobalToast('No se pudieron identificar los items del pedido', 'warning')
      return false
    }
    if (items.some((item) => !isUuid(item.itemId))) {
      showGlobalToast('Hay items con ID inválido', 'warning')
      return false
    }
    if (hasMissingItems) {
      showGlobalToast('Faltan items por validar en el pedido', 'warning')
      return false
    }

    for (const item of items) {
      const qty = item.quantity
      const approved = Number(item.cantidadAprobada)
      if (!item.motivo.trim()) {
        showGlobalToast('Agrega un motivo en todos los items', 'warning')
        return false
      }
      switch (item.estado) {
        case 'aprobado':
          if (!Number.isFinite(approved) || approved <= 0 || approved > qty) {
            showGlobalToast('Cantidad inválida en items aprobados', 'warning')
            return false
          }
          break
        case 'aprobado_parcial':
          if (!Number.isFinite(approved) || approved <= 0 || approved >= qty) {
            showGlobalToast('La aprobación parcial debe ser menor a la cantidad solicitada', 'warning')
            return false
          }
          break
        case 'sustituido':
          if (!item.skuAprobadoId.trim()) {
            showGlobalToast('Ingresa el SKU aprobado en sustitución', 'warning')
            return false
          }
          if (!isUuid(item.skuAprobadoId.trim())) {
            showGlobalToast('El SKU aprobado debe ser un UUID válido', 'warning')
            return false
          }
          if (!Number.isFinite(approved) || approved <= 0 || approved > qty) {
            showGlobalToast('Cantidad inválida en sustitución', 'warning')
            return false
          }
          break
        case 'rechazado':
          if (Number.isFinite(approved) && approved > 0) {
            showGlobalToast('Cantidad debe ser 0 cuando se rechaza', 'warning')
            return false
          }
          break
      }
    }
    return true
  }

  const submitValidation = async () => {
    if (!orderId) return
    if (!validateBeforeSubmit()) return
    setSubmitting(true)
    try {
      const payload = {
        pedido_id: orderId,
        bodeguero_id: bodegueroId as string,
        observaciones: observaciones || undefined,
        items_resultados: items.map((item) => ({
          item_pedido_id: item.itemId,
          estado_resultado: item.estado,
          sku_aprobado_id: item.estado === 'sustituido' ? item.skuAprobadoId.trim() : undefined,
          cantidad_aprobada:
            item.estado === 'rechazado' ? undefined : Number(item.cantidadAprobada),
          motivo: item.motivo.trim(),
        })),
      }
      const ok = await OrderService.validateOrder(orderId, payload)
      if (ok) {
        showGlobalToast('Validación registrada', 'success')
        navigation.navigate('WarehouseTabs', { screen: 'Pedidos' })
      } else {
        showGlobalToast('No se pudo validar el pedido', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const requiresCliente = items.some((item) => {
    if (item.estado === 'rechazado' || item.estado === 'sustituido' || item.estado === 'aprobado_parcial') {
      return true
    }
    if (item.estado === 'aprobado') {
      const approved = Number(item.cantidadAprobada)
      return Number.isFinite(approved) && approved < item.quantity
    }
    return false
  })

  const visibleItems = filter === 'todos' ? items : items.filter((item) => item.estado === filter)

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Validar pedido" variant="standard" onBackPress={() => navigation.goBack()} />

      {loading && !orderDetail ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
          <LinearGradient
            colors={['#FFF7ED', '#FFFBEB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#FED7AA' }}
          >
            <Text className="text-xs text-amber-700 font-semibold">Validación de pedido</Text>
            <Text className="text-xl font-extrabold text-neutral-900 mt-1">
              #{orderDetail?.pedido?.numero_pedido || orderId?.slice(0, 8)}
            </Text>
            <Text className="text-xs text-amber-700 mt-2">
              {totalItems} items por validar
            </Text>
          </LinearGradient>

          <View className="flex-row items-center justify-between mt-4">
            <View className="flex-row items-center">
              <View className="h-6 w-6 rounded-full bg-brand-red/10 items-center justify-center mr-2">
                <Text className="text-[11px] font-bold text-brand-red">1</Text>
              </View>
              <Text className="text-xs text-neutral-600">Selecciona resultado por ítem</Text>
            </View>
            <View className="flex-row items-center">
              <View className="h-6 w-6 rounded-full bg-brand-red/10 items-center justify-center mr-2">
                <Text className="text-[11px] font-bold text-brand-red">2</Text>
              </View>
              <Text className="text-xs text-neutral-600">Confirmar validación</Text>
            </View>
          </View>

          {!canValidate ? (
            <View className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-3">
              <Text className="text-xs text-red-700">
                Este pedido ya no está pendiente de validación.
              </Text>
            </View>
          ) : null}

          {hasMissingItems ? (
            <View className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-3">
              <Text className="text-xs text-red-700">
                Faltan items por validar. ({items.length}/{totalItems})
              </Text>
            </View>
          ) : null}

          {requiresCliente ? (
            <View className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-3">
              <Text className="text-xs text-amber-800">
                Hay ajustes en el pedido. Se notificará al cliente para aceptar o rechazar.
              </Text>
            </View>
          ) : null}

          <View className="mt-6">
            <View className="flex-row flex-wrap gap-2 mb-4">
              {(['todos', 'aprobado', 'aprobado_parcial', 'sustituido', 'rechazado'] as const).map((estado) => {
                const isActive = filter === estado
                return (
                  <Pressable
                    key={estado}
                    onPress={() => setFilter(estado as 'todos' | EstadoResultado)}
                    className={`px-3 py-1.5 rounded-full border ${
                      isActive ? 'bg-brand-red/10 border-brand-red' : 'border-neutral-200'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${isActive ? 'text-brand-red' : 'text-neutral-600'}`}>
                      {estado === 'todos'
                        ? 'Todos'
                        : estado === 'aprobado'
                        ? 'Aprobados'
                        : estado === 'aprobado_parcial'
                        ? 'Parciales'
                        : estado === 'sustituido'
                        ? 'Sustituidos'
                        : 'Rechazados'}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>

          <View className="space-y-4">
            {visibleItems.map((item) => (
              <View key={item.itemId} className="bg-white rounded-3xl border border-neutral-100 p-4 shadow-sm">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-xs text-neutral-500">{item.skuCode || 'SIN-CODIGO'}</Text>
                    <Text className="text-sm font-semibold text-neutral-900" numberOfLines={2}>
                      {item.skuName || 'Producto'}
                    </Text>
                    <Text className="text-xs text-neutral-500 mt-1">Cantidad solicitada: {item.quantity}</Text>
                  </View>
                  {(() => {
                    const badge = estadoBadgeStyles(item.estado)
                    return (
                      <View className={`px-3 py-1 rounded-full border ${badge.bg} ${badge.border}`}>
                        <Text className={`text-[11px] font-semibold ${badge.text}`}>
                          {item.estado === 'aprobado'
                            ? 'Aprobado'
                            : item.estado === 'aprobado_parcial'
                            ? 'Parcial'
                            : item.estado === 'sustituido'
                            ? 'Sustituido'
                            : 'Rechazado'}
                        </Text>
                      </View>
                    )
                  })()}
                </View>

                <View className="flex-row flex-wrap gap-2 mt-4">
                  {(['aprobado', 'aprobado_parcial', 'sustituido', 'rechazado'] as EstadoResultado[]).map((estado) => {
                    const isActive = item.estado === estado
                    const badge = estadoBadgeStyles(estado)
                    return (
                      <Pressable
                        key={estado}
                        onPress={() => setEstado(item, estado)}
                        className={`px-3 py-1.5 rounded-full border ${
                          isActive ? `${badge.bg} ${badge.border}` : 'border-neutral-200'
                        }`}
                      >
                        <Text className={`text-xs font-semibold ${isActive ? badge.text : 'text-neutral-600'}`}>
                          {estado === 'aprobado'
                            ? 'Aprobado'
                            : estado === 'aprobado_parcial'
                            ? 'Parcial'
                            : estado === 'sustituido'
                            ? 'Sustituido'
                            : 'Rechazado'}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>

                <View className="mt-3">
                  {item.estado !== 'rechazado' ? (
                    <TextField
                      label="Cantidad aprobada"
                      keyboardType="numeric"
                      value={item.cantidadAprobada}
                      onChangeText={(value) => updateItem(item.itemId, { cantidadAprobada: value })}
                      placeholder={String(item.quantity)}
                    />
                  ) : null}
                </View>

                {item.estado === 'sustituido' ? (
                  <View className="mt-3">
                    <TextField
                      label="SKU aprobado"
                      value={item.skuAprobadoId}
                      onChangeText={(value) => updateItem(item.itemId, { skuAprobadoId: value })}
                      placeholder="UUID del SKU aprobado"
                    />
                  </View>
                ) : null}

                <View className="mt-3">
                  <TextField
                    label="Motivo"
                    value={item.motivo}
                    onChangeText={(value) => updateItem(item.itemId, { motivo: value })}
                    placeholder="Ej: Stock disponible"
                  />
                </View>
              </View>
            ))}
          </View>

          <View className="mt-6 bg-white rounded-3xl border border-neutral-100 p-4 shadow-sm">
            <TextField
              label="Observaciones generales"
              value={observaciones}
              onChangeText={setObservaciones}
              placeholder="Notas para el pedido (opcional)"
            />
          </View>

          <View className="mt-6">
            <PrimaryButton
              title={submitting ? 'Validando...' : 'Confirmar validación'}
              onPress={submitValidation}
              disabled={submitting || !canValidate}
            />
          </View>
        </ScrollView>
      )}

    </View>
  )
}
