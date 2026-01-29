import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BRAND_COLORS } from '../../services/shared/types'
import { OrderListItem } from '../../services/api/OrderService'

const formatMoney = (value?: number | string | null) => {
  const amount = Number(value)
  const safe = Number.isFinite(amount) ? amount : 0
  return `$${safe.toFixed(2)}`
}

const formatStatus = (estado?: string) => {
  switch (estado) {
    case 'pendiente_validacion':
      return 'Pendiente'
    case 'ajustado_bodega':
      return 'Ajustado'
    case 'aceptado_cliente':
      return 'Aceptado'
    case 'validado':
      return 'Validado'
    case 'asignado_ruta':
      return 'Asignado'
    case 'en_ruta':
      return 'En ruta'
    case 'entregado':
      return 'Entregado'
    case 'cancelado':
      return 'Cancelado'
    case 'rechazado_cliente':
      return 'Rechazado'
    default:
      return estado ? estado.replace(/_/g, ' ') : 'Pendiente'
  }
}

const statusColor = (estado?: string) => {
  switch (estado) {
    case 'entregado':
      return '#059669'
    case 'cancelado':
    case 'rechazado_cliente':
      return BRAND_COLORS.red
    case 'en_ruta':
      return '#2563EB'
    default:
      return '#D97706'
  }
}

const getOrderTotal = (order: OrderListItem) => {
  const total = Number(order.total)
  if (Number.isFinite(total) && total > 0) return total
  if (order.items && order.items.length > 0) {
    return order.items.reduce((sum, item) => {
      const subtotal = Number(item?.subtotal)
      if (Number.isFinite(subtotal) && subtotal > 0) return sum + subtotal
      const unit = Number(item?.precio_unitario_final)
      const qty = Number(item?.cantidad_solicitada)
      if (Number.isFinite(unit) && Number.isFinite(qty)) return sum + unit * qty
      return sum
    }, 0)
  }
  return 0
}

type Props = {
  order: OrderListItem
  clientLabel?: string
  onPress?: () => void
  showClient?: boolean
}

export function OrderListCard({ order, clientLabel, onPress, showClient = true }: Props) {
  const estado = order.estado || 'pendiente_validacion'
  const estadoColor = statusColor(estado)
  const total = getOrderTotal(order)

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4 shadow-sm"
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-neutral-500">Pedido</Text>
          <Text className="text-base font-bold text-neutral-900">
            #{order.numero_pedido || order.id.slice(0, 8)}
          </Text>
        </View>
        <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${estadoColor}22` }}>
          <Text className="text-xs font-semibold" style={{ color: estadoColor }}>
            {formatStatus(estado).toUpperCase()}
          </Text>
        </View>
      </View>

      <View className="mt-3 flex-row justify-between">
        {showClient ? (
          <View>
            <Text className="text-xs text-neutral-500">Cliente</Text>
            <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
              {clientLabel || order.cliente_id || 'Cliente'}
            </Text>
          </View>
        ) : (
          <View />
        )}
        <View>
          <Text className="text-xs text-neutral-500">Total</Text>
          <Text className="text-sm font-semibold text-neutral-900">{formatMoney(total)}</Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="card-outline" size={14} color={BRAND_COLORS.red} />
          <Text className="text-xs text-neutral-600 ml-2">
            {order.metodo_pago === 'credito' ? 'Crédito' : 'Contado'}
          </Text>
        </View>
        {order.fecha_entrega_sugerida ? (
          <Text className="text-xs text-neutral-500">
            Entrega: {new Date(order.fecha_entrega_sugerida).toLocaleDateString('es-EC')}
          </Text>
        ) : null}
      </View>
    </Pressable>
  )
}
