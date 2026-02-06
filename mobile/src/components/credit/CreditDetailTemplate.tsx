import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BRAND_COLORS } from '../../shared/types'
import { CreditResponse, CreditTotals, CreditPayment } from '../../services/api/CreditService'
import { UserClient } from '../../services/api/UserClientService'
import { OrderDetail } from '../../services/api/OrderService'
import { formatNameOrId, formatOrderLabel, formatShortId } from '../../utils/formatters'

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

type Props = {
  credit: CreditResponse
  totals?: CreditTotals
  payments?: CreditPayment[]
  client?: UserClient | null
  orderDetail?: OrderDetail | null
  showItemsToggle?: boolean
  showPayments?: boolean
  footer?: React.ReactNode
}

export function CreditDetailTemplate({
  credit,
  totals,
  payments,
  client,
  orderDetail,
  showItemsToggle = true,
  showPayments = true,
  footer,
}: Props) {
  const [showItems, setShowItems] = React.useState(false)
  const estado = credit.estado || 'activo'
  const estadoColor = estado === 'pagado' ? '#059669' : estado === 'vencido' ? BRAND_COLORS.red : '#2563EB'
  const saldo = totals?.saldo ?? 0
  const totalPagado = totals?.total_pagado ?? 0
  const pedido = orderDetail?.pedido
  const items = orderDetail?.items || []

  return (
    <View className="gap-4">
      <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Credito</Text>
            <Text className="text-base font-bold text-neutral-900">#{formatShortId(credit.id)}...</Text>
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
            <Text className="text-base font-semibold text-neutral-900">{formatMoney(credit.monto_aprobado)}</Text>
          </View>
          <View>
            <Text className="text-xs text-neutral-500">Saldo</Text>
            <Text className="text-base font-semibold text-neutral-900">{formatMoney(saldo)}</Text>
          </View>
        </View>

        <View className="mt-3">
          <Text className="text-xs text-neutral-500">Total pagado</Text>
          <Text className="text-sm font-semibold text-neutral-900">{formatMoney(totalPagado)}</Text>
        </View>
      </View>

      <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <Text className="text-xs text-neutral-500">Cliente</Text>
          <Text className="text-base font-semibold text-neutral-900" numberOfLines={1}>
          {formatNameOrId(client?.nombre_comercial || client?.ruc, credit.cliente_id)}
          </Text>
        {client?.ruc && <Text className="text-xs text-neutral-500 mt-1">RUC: {client.ruc}</Text>}
        {client?.telefono && <Text className="text-xs text-neutral-500 mt-1">Tel: {client.telefono}</Text>}
      </View>

      <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
        <Text className="text-xs text-neutral-500">Pedido</Text>
        <Text className="text-base font-semibold text-neutral-900">
          {formatOrderLabel(pedido?.numero_pedido, credit.pedido_id)}
        </Text>
        <View className="mt-2 flex-row justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Total pedido</Text>
            <Text className="text-sm font-semibold text-neutral-900">{formatMoney(pedido?.total ?? 0)}</Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-neutral-500">Vence</Text>
            <Text className="text-sm font-semibold text-neutral-900">{formatDate(credit.fecha_vencimiento)}</Text>
          </View>
        </View>

        {showItemsToggle ? (
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
        ) : null}

        {showItemsToggle && showItems ? (
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
                    <Text className="text-xs text-neutral-700">{formatMoney(item.subtotal ?? 0)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : null}
      </View>

      {showPayments ? (
        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <Text className="text-sm font-semibold text-neutral-700 mb-3">Pagos</Text>
          {payments && payments.length > 0 ? (
            payments.map((pago, index) => (
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
                  <Text className="text-sm font-semibold text-neutral-900">{formatMoney(pago.monto_pago)}</Text>
                </View>
                {pago.referencia ? (
                  <Text className="text-xs text-neutral-500 mt-1">Ref: {pago.referencia}</Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text className="text-xs text-neutral-500">No hay pagos registrados.</Text>
          )}
        </View>
      ) : null}

      {footer ? <View className="mt-2">{footer}</View> : null}
    </View>
  )
}
