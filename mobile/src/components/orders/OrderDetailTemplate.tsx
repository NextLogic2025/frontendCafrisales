import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { BRAND_COLORS } from '../../shared/types'
import { OrderDetail, OrderHistoryItem, OrderItemDetail, OrderResponse } from '../../services/api/OrderService'

const currencyFormatter = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

const formatMoney = (value?: number | string | null) => {
  const amount = Number(value)
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0)
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
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

const getOrderTotal = (pedido?: OrderResponse, items: OrderItemDetail[] = []) => {
  const total = Number(pedido?.total)
  if (Number.isFinite(total) && total > 0) return total
  return items.reduce((sum, item) => {
    const subtotal = Number(item?.subtotal)
    if (Number.isFinite(subtotal) && subtotal > 0) return sum + subtotal
    const unit = Number(item?.precio_unitario_final)
    const qty = Number(item?.cantidad_solicitada)
    if (Number.isFinite(unit) && Number.isFinite(qty)) return sum + unit * qty
    return sum
  }, 0)
}

const getOrderSubtotal = (pedido?: OrderResponse, items: OrderItemDetail[] = []) => {
  const subtotal = Number(pedido?.subtotal)
  if (Number.isFinite(subtotal) && subtotal > 0) return subtotal
  return items.reduce((sum, item) => {
    const line = Number(item?.subtotal)
    if (Number.isFinite(line) && line > 0) return sum + line
    const unit = Number(item?.precio_unitario_final)
    const qty = Number(item?.cantidad_solicitada)
    if (Number.isFinite(unit) && Number.isFinite(qty)) return sum + unit * qty
    return sum
  }, 0)
}

const getOrderDiscountAmount = (pedido?: OrderResponse, items: OrderItemDetail[] = []) => {
  const tipo = pedido?.descuento_pedido_tipo
  const valor = Number(pedido?.descuento_pedido_valor)
  if (!tipo || !Number.isFinite(valor) || valor <= 0) return 0
  const subtotal = getOrderSubtotal(pedido, items)
  if (!Number.isFinite(subtotal) || subtotal <= 0) return 0
  if (tipo === 'porcentaje') {
    return Number(((subtotal * valor) / 100).toFixed(2))
  }
  return Number(Math.min(subtotal, valor).toFixed(2))
}

const formatOrderDiscountLabel = (pedido?: OrderResponse) => {
  const tipo = pedido?.descuento_pedido_tipo
  const valor = Number(pedido?.descuento_pedido_valor)
  if (!tipo || !Number.isFinite(valor) || valor <= 0) return null
  if (tipo === 'porcentaje') {
    return `${valor}%`
  }
  return `-${formatMoney(valor)}`
}

const formatDiscountLabel = (item: OrderItemDetail) => {
  if (!item.descuento_item_tipo || item.descuento_item_valor == null) return null
  if (item.descuento_item_tipo === 'porcentaje') {
    return `${item.descuento_item_valor}%`
  }
  return `-${formatMoney(item.descuento_item_valor)}`
}

type Props = {
  orderDetail: OrderDetail | null
  clientLabel?: string
  history?: OrderHistoryItem[]
  footer?: React.ReactNode
  showClient?: boolean
  creditApproved?: boolean | null
}

export function OrderDetailTemplate({
  orderDetail,
  clientLabel,
  history,
  footer,
  showClient = true,
  creditApproved = null,
}: Props) {
  const pedido = orderDetail?.pedido
  const items = orderDetail?.items || []
  const historial = history || orderDetail?.historial || []
  const estado = pedido?.estado || 'pendiente_validacion'
  const estadoColor = statusColor(estado)
  const total = getOrderTotal(pedido, items)
  const orderDiscountAmount = getOrderDiscountAmount(pedido, items)
  const orderDiscountLabel = formatOrderDiscountLabel(pedido)

  return (
    <View className="gap-4">
      <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Pedido</Text>
            <Text className="text-base font-bold text-neutral-900">
              #{pedido?.numero_pedido || pedido?.id?.slice(0, 8) || '-'}
            </Text>
          </View>
          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${estadoColor}22` }}>
            <Text className="text-xs font-semibold" style={{ color: estadoColor }}>
              {formatStatus(estado).toUpperCase()}
            </Text>
          </View>
        </View>

        <View className="mt-3 flex-row justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Método de pago</Text>
            <Text className="text-sm font-semibold text-neutral-900">
              {pedido?.metodo_pago === 'credito' ? 'Crédito' : 'Contado'}
            </Text>
            {pedido?.metodo_pago === 'credito' ? (
              <Text className="text-xs text-neutral-500 mt-1">
                Crédito {creditApproved ? 'aprobado' : 'pendiente'}
              </Text>
            ) : null}
          </View>
          <View className="items-end">
            <Text className="text-xs text-neutral-500">Total</Text>
            <Text className="text-sm font-semibold text-neutral-900">{formatMoney(total)}</Text>
          </View>
        </View>

        <View className="mt-3 flex-row justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Subtotal</Text>
            <Text className="text-xs text-neutral-700">{formatMoney(pedido?.subtotal ?? 0)}</Text>
          </View>
          <View>
            <Text className="text-xs text-neutral-500">Impuesto</Text>
            <Text className="text-xs text-neutral-700">{formatMoney(pedido?.impuesto ?? 0)}</Text>
          </View>
        </View>

        {orderDiscountAmount > 0 ? (
          <View className="mt-2 flex-row justify-between">
            <View>
              <Text className="text-xs text-neutral-500">Descuento pedido</Text>
              <Text className="text-xs text-amber-700">{orderDiscountLabel}</Text>
            </View>
            <Text className="text-xs text-amber-700">-{formatMoney(orderDiscountAmount)}</Text>
          </View>
        ) : null}
      </View>

      {showClient ? (
        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <Text className="text-xs text-neutral-500">Cliente</Text>
          <Text className="text-base font-semibold text-neutral-900" numberOfLines={1}>
            {clientLabel || pedido?.cliente_id || 'Cliente'}
          </Text>
        </View>
      ) : null}

      <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
        <Text className="text-sm font-semibold text-neutral-700 mb-3">Productos</Text>
        {items.length === 0 ? (
          <Text className="text-xs text-neutral-500">No hay productos.</Text>
        ) : (
          items.map((item, index) => (
            <View
              key={item.id || item.sku_id || `${index}`}
              className={`${index > 0 ? 'mt-3 pt-3 border-t border-neutral-100' : ''}`}
            >
              <Text className="text-xs text-neutral-500">{item.sku_codigo_snapshot || 'SIN-CODIGO'}</Text>
              <Text className="text-sm font-semibold text-neutral-900" numberOfLines={2}>
                {item.sku_nombre_snapshot || 'Producto'}
              </Text>
              {item.sku_tipo_empaque_snapshot || item.sku_peso_gramos_snapshot ? (
                <Text className="text-xs text-neutral-500 mt-1">
                  {(item.sku_tipo_empaque_snapshot || '').trim()}
                  {item.sku_peso_gramos_snapshot ? ` · ${item.sku_peso_gramos_snapshot} g` : ''}
                </Text>
              ) : null}
              <View className="flex-row justify-between mt-2">
                <Text className="text-xs text-neutral-500">Cantidad: {item.cantidad_solicitada ?? 0}</Text>
                <Text className="text-xs text-neutral-700">{formatMoney(item.subtotal ?? 0)}</Text>
              </View>

              {item.descuento_item_tipo && item.descuento_item_valor != null ? (
                <View className="mt-2 bg-red-50 border border-red-100 rounded-xl p-2">
                  <View className="flex-row justify-between">
                    <Text className="text-[11px] text-neutral-500">Precio base</Text>
                    <Text className="text-[11px] text-neutral-700">{formatMoney(item.precio_unitario_base ?? 0)}</Text>
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-[11px] text-neutral-500">Descuento</Text>
                    <Text className="text-[11px] text-amber-700">{formatDiscountLabel(item) || '-'}</Text>
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
          ))
        )}
      </View>

      <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
        <Text className="text-sm font-semibold text-neutral-700 mb-3">Historial de estados</Text>
        {historial.length === 0 ? (
          <Text className="text-xs text-neutral-500">Sin historial registrado.</Text>
        ) : (
          historial.map((item, index) => (
            <View
              key={`${item.estado}-${item.creado_en}-${index}`}
              className={`${index > 0 ? 'mt-3 pt-3 border-t border-neutral-100' : ''}`}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-neutral-700 font-semibold">
                  {formatStatus(item.estado)}
                </Text>
                <Text className="text-xs text-neutral-500">{formatDate(item.creado_en)}</Text>
              </View>
              {item.motivo ? (
                <Text className="text-xs text-neutral-500 mt-1">{item.motivo}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>

      {footer ? <View className="mt-2">{footer}</View> : null}
    </View>
  )
}
