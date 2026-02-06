import React from 'react'
import { View, Text, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { GenericModal } from '../ui/GenericModal'
import { DeliveryIncident } from '../../services/api/DeliveryService'

type Props = {
  visible: boolean
  onClose: () => void
  incidencias: DeliveryIncident[]
}

const getSeverityStyle = (severidad: string) => {
  switch (severidad) {
    case 'baja':
      return { bg: '#DCFCE7', text: '#166534', label: 'Baja' }
    case 'media':
      return { bg: '#FEF3C7', text: '#92400E', label: 'Media' }
    case 'alta':
      return { bg: '#FFEDD5', text: '#C2410C', label: 'Alta' }
    case 'critica':
      return { bg: '#FEE2E2', text: '#991B1B', label: 'Critica' }
    default:
      return { bg: '#E5E7EB', text: '#4B5563', label: severidad }
  }
}

const getIncidentTypeLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    producto_danado: 'Producto danado',
    faltante: 'Faltante de producto',
    cliente_ausente: 'Cliente ausente',
    direccion_incorrecta: 'Direccion incorrecta',
    vehiculo_averiado: 'Vehiculo averiado',
    accidente: 'Accidente',
    clima: 'Condiciones climaticas',
    otro: 'Otro',
  }
  return labels[tipo] || tipo
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return 'Sin fecha'
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function IncidentListModal({ visible, onClose, incidencias }: Props) {
  return (
    <GenericModal visible={visible} onClose={onClose} title="Incidencias" height="80%" scrollable={false}>
      {incidencias.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12">
          <View className="w-16 h-16 rounded-full bg-neutral-100 items-center justify-center mb-4">
            <Ionicons name="alert-circle-outline" size={32} color="#9CA3AF" />
          </View>
          <Text className="text-base font-semibold text-neutral-700">Sin incidencias</Text>
          <Text className="text-sm text-neutral-500 mt-1 text-center px-8">
            No se han reportado incidencias para esta entrega.
          </Text>
        </View>
      ) : (
        <FlatList
          data={incidencias}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
          renderItem={({ item }) => {
            const severity = getSeverityStyle(item.severidad)
            const isResolved = Boolean(item.resuelto_en)
            return (
              <View className="rounded-2xl border border-neutral-200 p-4 bg-white">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-semibold text-neutral-900">
                      {getIncidentTypeLabel(item.tipo_incidencia)}
                    </Text>
                    <Text className="text-xs text-neutral-500 mt-1">
                      {formatDate(item.reportado_en)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View
                      className="px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: severity.bg }}
                    >
                      <Text className="text-[10px] font-bold" style={{ color: severity.text }}>
                        {severity.label}
                      </Text>
                    </View>
                    {isResolved ? (
                      <View className="px-2.5 py-1 rounded-full bg-emerald-100">
                        <Text className="text-[10px] font-bold text-emerald-700">Resuelto</Text>
                      </View>
                    ) : (
                      <View className="px-2.5 py-1 rounded-full bg-amber-100">
                        <Text className="text-[10px] font-bold text-amber-700">Pendiente</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className="mt-3 p-3 rounded-xl bg-neutral-50">
                  <Text className="text-sm text-neutral-700">{item.descripcion}</Text>
                </View>

                {isResolved && item.resolucion ? (
                  <View className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="checkmark-circle" size={14} color="#166534" />
                      <Text className="ml-1 text-xs font-semibold text-emerald-700">
                        Resolucion
                      </Text>
                    </View>
                    <Text className="text-sm text-emerald-800">{item.resolucion}</Text>
                    <Text className="text-[10px] text-emerald-600 mt-1">
                      {formatDate(item.resuelto_en)}
                    </Text>
                  </View>
                ) : null}
              </View>
            )
          }}
        />
      )}
    </GenericModal>
  )
}
