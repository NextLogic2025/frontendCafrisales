import React from 'react'
import { Text, View } from 'react-native'

type Props = {
  estado: string
  paradasCount: number
  entregasCount: number
  entregasCompletadas: number
  entregasPendientes: number
  hasStops: boolean
  hasDeliveries: boolean
}

export function TransportistaRouteStatusCard({
  estado,
  paradasCount,
  entregasCount,
  entregasCompletadas,
  entregasPendientes,
  hasStops,
  hasDeliveries,
}: Props) {
  return (
    <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
      <Text className="text-sm font-semibold text-neutral-700">Estado operativo</Text>
      <View className="mt-2 flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-neutral-500">Paradas</Text>
          <Text className="text-sm font-semibold text-neutral-900">{paradasCount}</Text>
        </View>
        <View>
          <Text className="text-xs text-neutral-500">Entregas</Text>
          <Text className="text-sm font-semibold text-neutral-900">{entregasCount}</Text>
        </View>
        <View>
          <Text className="text-xs text-neutral-500">Completadas</Text>
          <Text className="text-sm font-semibold text-neutral-900">{entregasCompletadas}</Text>
        </View>
      </View>
      {!hasStops ? (
        <View className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
          <Text className="text-xs text-amber-700">
            Este rutero no tiene paradas. Agrega pedidos antes de iniciar.
          </Text>
        </View>
      ) : null}
      {estado === 'publicado' && hasStops && !hasDeliveries ? (
        <View className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
          <Text className="text-xs text-amber-700">
            Inicia el rutero para generar entregas y habilitar acciones.
          </Text>
        </View>
      ) : null}
      {estado === 'en_curso' && hasDeliveries && entregasPendientes > 0 ? (
        <View className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
          <Text className="text-xs text-amber-700">
            Tienes {entregasPendientes} entregas pendientes. Debes cerrarlas antes de completar el rutero.
          </Text>
        </View>
      ) : null}
      {estado === 'en_curso' && !hasDeliveries ? (
        <View className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
          <Text className="text-xs text-red-700">
            No se generaron entregas. Revisa el delivery-service y vuelve a iniciar el rutero.
          </Text>
        </View>
      ) : null}
      {estado === 'completado' ? (
        <View className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          <Text className="text-xs text-emerald-700">
            Rutero completado. Ya no se pueden registrar acciones.
          </Text>
        </View>
      ) : null}
    </View>
  )
}
