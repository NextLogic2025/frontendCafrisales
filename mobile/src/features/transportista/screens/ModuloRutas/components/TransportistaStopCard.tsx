import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { Delivery } from '../../../../../services/api/DeliveryService'

type StatusStyle = {
  label: string
  bg: string
  color: string
}

type StopCardProps = {
  pedidoId: string
  orden: number
  isActive: boolean
  orderNumber?: string
  clientLabel?: string
  address?: string
  estadoRutero: string
  updating: boolean
  delivery?: Delivery
  statusStyle: StatusStyle
  onSelect: () => void
  onStartDelivery: () => void
  onCompleteDelivery: () => void
  onNoDelivery: () => void
  onOpenDetail: () => void
  onOpenEvidence: () => void
  onOpenIncident: () => void
}

export function TransportistaStopCard({
  pedidoId,
  orden,
  isActive,
  orderNumber,
  clientLabel,
  address,
  estadoRutero,
  updating,
  delivery,
  statusStyle,
  onSelect,
  onStartDelivery,
  onCompleteDelivery,
  onNoDelivery,
  onOpenDetail,
  onOpenEvidence,
  onOpenIncident,
}: StopCardProps) {
  return (
    <Pressable
      onPress={onSelect}
      className={`rounded-2xl border p-3 ${isActive ? 'border-brand-red bg-red-50' : 'border-neutral-200 bg-white'}`}
    >
      <Text className="text-xs text-neutral-500">Pedido</Text>
      <Text className="text-sm font-semibold text-neutral-900">
        {orderNumber || `#${pedidoId.slice(0, 8)}`}
      </Text>
      {clientLabel ? (
        <Text className="text-xs text-neutral-500 mt-1">Cliente: {clientLabel}</Text>
      ) : null}
      {address ? (
        <Text className="text-xs text-neutral-500 mt-1">Direccion: {address}</Text>
      ) : null}
      <Text className="text-[11px] text-neutral-500 mt-1">Orden #{orden}</Text>
      <View className="mt-2 flex-row items-center justify-between">
        <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: statusStyle.bg }}>
          <Text className="text-[10px] font-semibold" style={{ color: statusStyle.color }}>
            {statusStyle.label}
          </Text>
        </View>
        {estadoRutero === 'en_curso' && delivery ? (
          <View className="flex-row items-center gap-2">
            {delivery.estado === 'pendiente' ? (
              <Pressable
                onPress={onStartDelivery}
                disabled={updating}
                className="px-3 py-1 rounded-full border border-amber-200"
                style={{ backgroundColor: '#FEF3C7' }}
              >
                <Text className="text-[10px] font-semibold text-amber-700">Iniciar</Text>
              </Pressable>
            ) : delivery.estado === 'en_ruta' ? (
              <>
                <Pressable
                  onPress={onCompleteDelivery}
                  disabled={updating}
                  className="px-3 py-1 rounded-full border border-emerald-200"
                  style={{ backgroundColor: '#ECFDF3' }}
                >
                  <Text className="text-[10px] font-semibold text-emerald-700">Entregado</Text>
                </Pressable>
                <Pressable
                  onPress={onNoDelivery}
                  disabled={updating}
                  className="px-3 py-1 rounded-full border border-red-200"
                  style={{ backgroundColor: '#FEE2E2' }}
                >
                  <Text className="text-[10px] font-semibold text-red-700">No entregado</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        ) : null}
      </View>
      {!delivery ? (
        <Text className="text-[11px] text-red-600 mt-2">
          Esta parada no tiene entrega creada. Primero inicia el rutero.
        </Text>
      ) : null}
      {delivery ? (
        <View className="mt-3 flex-row items-center gap-2">
          <Pressable
            onPress={onOpenDetail}
            disabled={updating}
            className="px-3 py-1 rounded-full border border-neutral-200"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <Text className="text-[10px] font-semibold text-neutral-600">Ir a entrega</Text>
          </Pressable>
          <Pressable
            onPress={onOpenEvidence}
            disabled={updating}
            className="px-3 py-1 rounded-full border border-amber-200"
            style={{ backgroundColor: '#FFFBEB' }}
          >
            <Text className="text-[10px] font-semibold text-amber-700">Evidencia</Text>
          </Pressable>
          <Pressable
            onPress={onOpenIncident}
            disabled={updating}
            className="px-3 py-1 rounded-full border border-slate-200"
            style={{ backgroundColor: '#F8FAFC' }}
          >
            <Text className="text-[10px] font-semibold text-slate-600">Incidencia</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  )
}
