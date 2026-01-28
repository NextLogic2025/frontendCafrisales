import React from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { Header } from '../../../../components/ui/Header'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderDetail, OrderService, OrderValidation } from '../../../../services/api/OrderService'

export function WarehouseHistoryDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const orderId = route.params?.orderId as string | undefined

  const [loading, setLoading] = React.useState(false)
  const [detail, setDetail] = React.useState<OrderDetail | null>(null)
  const [validations, setValidations] = React.useState<OrderValidation[]>([])
  const [loadingValidations, setLoadingValidations] = React.useState(false)

  const loadDetail = React.useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const data = await OrderService.getOrderDetail(orderId)
      setDetail(data)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  const loadValidations = React.useCallback(async () => {
    if (!orderId) return
    setLoadingValidations(true)
    try {
      const data = await OrderService.getOrderValidations(orderId)
      setValidations(data)
    } finally {
      setLoadingValidations(false)
    }
  }, [orderId])

  useFocusEffect(
    React.useCallback(() => {
      loadDetail()
      loadValidations()
    }, [loadDetail, loadValidations]),
  )

  const pedido = detail?.pedido
  const items = detail?.items || []
  const historial = detail?.historial || []

  const lastValidation = validations
    .slice()
    .sort((a, b) => {
      if ((b.numero_version || 0) !== (a.numero_version || 0)) {
        return (b.numero_version || 0) - (a.numero_version || 0)
      }
      return String(b.validado_en || '').localeCompare(String(a.validado_en || ''))
    })[0]

  const validationMap = new Map(
    (lastValidation?.items || [])
      .filter((item) => item.item_pedido_id)
      .map((item) => [item.item_pedido_id as string, item]),
  )

  const formatMoney = (value?: number | null) => {
    const parsed = Number(value ?? 0)
    if (!Number.isFinite(parsed)) return '0.00'
    return parsed.toFixed(2)
  }

  const estadoLabel = (estado?: string | null) => {
    if (!estado) return 'SIN ESTADO'
    return estado.replace(/_/g, ' ').toUpperCase()
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Detalle" variant="standard" onBackPress={() => navigation.goBack()} />

      {loading && !detail ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          <LinearGradient
            colors={['#0F172A', '#1E293B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 16 }}
          >
            <Text className="text-xs text-slate-200">Pedido</Text>
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-xl font-extrabold text-white">
                #{pedido?.numero_pedido || pedido?.id?.slice?.(0, 8) || '-'}
              </Text>
              <View className="px-3 py-1 rounded-full bg-white/10">
                <Text className="text-[11px] font-semibold text-white">{estadoLabel(pedido?.estado)}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mt-3">
              <View>
                <Text className="text-xs text-slate-300">Subtotal</Text>
                <Text className="text-sm font-semibold text-white">USD {formatMoney(pedido?.subtotal)}</Text>
              </View>
              <View>
                <Text className="text-xs text-slate-300">Impuesto</Text>
                <Text className="text-sm font-semibold text-white">USD {formatMoney(pedido?.impuesto)}</Text>
              </View>
              <View>
                <Text className="text-xs text-slate-300">Total</Text>
                <Text className="text-sm font-semibold text-white">USD {formatMoney(pedido?.total)}</Text>
              </View>
            </View>
          </LinearGradient>

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <Text className="text-sm font-semibold text-neutral-700 mb-3">Items solicitados</Text>
            {items.length === 0 ? (
              <Text className="text-xs text-neutral-500">No hay items.</Text>
            ) : (
              items.map((item, index) => (
                <View
                  key={item.id || item.sku_id || `${index}`}
                  className={`${index > 0 ? 'mt-4 pt-4 border-t border-neutral-100' : ''}`}
                >
                  <Text className="text-xs text-neutral-500">{item.sku_codigo_snapshot || 'SIN-CODIGO'}</Text>
                  <Text className="text-sm font-semibold text-neutral-900" numberOfLines={2}>
                    {item.sku_nombre_snapshot || 'Producto'}
                  </Text>
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-xs text-neutral-500">
                      Cantidad solicitada: {item.cantidad_solicitada ?? 0}
                    </Text>
                    <Text className="text-xs text-neutral-500">
                      Subtotal: USD {formatMoney(item.subtotal)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-neutral-700">Resultado de validacion</Text>
              {loadingValidations ? (
                <Text className="text-xs text-neutral-400">Cargando...</Text>
              ) : (
                <Text className="text-xs text-neutral-500">Version {lastValidation?.numero_version ?? '-'}</Text>
              )}
            </View>

            {!lastValidation ? (
              <Text className="text-xs text-neutral-500 mt-3">Aun no hay validacion registrada.</Text>
            ) : (
              <View className="mt-3">
                {items.map((item, index) => {
                  const result = item.id ? validationMap.get(item.id) : undefined
                  const estado = result?.estado_resultado || 'aprobado'
                  const badgeColor =
                    estado === 'aprobado'
                      ? 'bg-emerald-50 text-emerald-700'
                      : estado === 'aprobado_parcial'
                      ? 'bg-amber-50 text-amber-700'
                      : estado === 'sustituido'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-red-50 text-red-700'

                  return (
                    <View
                      key={item.id || item.sku_id || `${index}-result`}
                      className={`${index > 0 ? 'mt-4 pt-4 border-t border-neutral-100' : ''}`}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs text-neutral-500">{item.sku_codigo_snapshot || 'SIN-CODIGO'}</Text>
                        <View className={`px-2.5 py-1 rounded-full ${badgeColor}`}>
                          <Text className="text-[10px] font-semibold">
                            {estado.replace(/_/g, ' ').toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-sm font-semibold text-neutral-900 mt-1" numberOfLines={2}>
                        {item.sku_nombre_snapshot || 'Producto'}
                      </Text>
                      <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-xs text-neutral-500">
                          Solicitado: {item.cantidad_solicitada ?? 0}
                        </Text>
                        <Text className="text-xs text-neutral-500">
                          Aprobado: {result?.cantidad_aprobada ?? 0}
                        </Text>
                      </View>
                      {estado === 'sustituido' ? (
                        <Text className="text-xs text-neutral-500 mt-1">
                          SKU aprobado: {result?.sku_aprobado_nombre_snapshot || 'Producto'} ({result?.sku_aprobado_codigo_snapshot || 'SIN-CODIGO'})
                        </Text>
                      ) : null}
                      {result?.motivo ? (
                        <Text className="text-xs text-neutral-500 mt-1">Motivo: {result.motivo}</Text>
                      ) : null}
                    </View>
                  )
                })}
              </View>
            )}
          </View>

          {historial.length > 0 ? (
            <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
              <Text className="text-sm font-semibold text-neutral-700 mb-3">Trazabilidad</Text>
              {historial.map((h, index) => (
                <View
                  key={`${h.estado}-${index}`}
                  className={`${index > 0 ? 'mt-3 pt-3 border-t border-neutral-100' : ''}`}
                >
                  <Text className="text-xs font-semibold text-neutral-800">{estadoLabel(h.estado)}</Text>
                  <Text className="text-xs text-neutral-500 mt-1">{h.motivo || 'Sin motivo'}</Text>
                  {h.creado_en ? (
                    <Text className="text-[11px] text-neutral-400 mt-1">{h.creado_en}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  )
}
