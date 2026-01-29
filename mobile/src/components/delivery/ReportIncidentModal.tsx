import React from 'react'
import { View, Text, Pressable, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { GenericModal } from '../ui/GenericModal'
import { PrimaryButton } from '../ui/PrimaryButton'
import { BRAND_COLORS } from '../../services/shared/types'
import { DeliveryService, IncidentPayload, DeliveryIncident } from '../../services/api/DeliveryService'
import { showGlobalToast } from '../../utils/toastService'

type Severity = 'baja' | 'media' | 'alta' | 'critica'

type Props = {
  visible: boolean
  onClose: () => void
  entregaId: string
  onIncidentReported?: (incident: DeliveryIncident) => void
}

const INCIDENT_TYPES = [
  { id: 'producto_danado', label: 'Producto danado' },
  { id: 'faltante', label: 'Faltante de producto' },
  { id: 'cliente_ausente', label: 'Cliente ausente' },
  { id: 'direccion_incorrecta', label: 'Direccion incorrecta' },
  { id: 'vehiculo_averiado', label: 'Vehiculo averiado' },
  { id: 'accidente', label: 'Accidente' },
  { id: 'clima', label: 'Condiciones climaticas' },
  { id: 'otro', label: 'Otro' },
]

const SEVERITY_OPTIONS: { id: Severity; label: string; color: string; bg: string }[] = [
  { id: 'baja', label: 'Baja', color: '#166534', bg: '#DCFCE7' },
  { id: 'media', label: 'Media', color: '#92400E', bg: '#FEF3C7' },
  { id: 'alta', label: 'Alta', color: '#C2410C', bg: '#FFEDD5' },
  { id: 'critica', label: 'Critica', color: '#991B1B', bg: '#FEE2E2' },
]

export function ReportIncidentModal({ visible, onClose, entregaId, onIncidentReported }: Props) {
  const [selectedType, setSelectedType] = React.useState<string>('producto_danado')
  const [severity, setSeverity] = React.useState<Severity>('baja')
  const [description, setDescription] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  const resetForm = () => {
    setSelectedType('producto_danado')
    setSeverity('baja')
    setDescription('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    if (!description.trim()) {
      showGlobalToast('Ingresa una descripcion de la incidencia', 'warning')
      return
    }

    setSaving(true)
    try {
      const payload: IncidentPayload = {
        tipo_incidencia: selectedType,
        severidad: severity,
        descripcion: description.trim(),
      }

      const incident = await DeliveryService.reportIncident(entregaId, payload)
      if (!incident) {
        showGlobalToast('No se pudo reportar la incidencia', 'error')
        return
      }

      showGlobalToast('Incidencia reportada correctamente', 'success')
      onIncidentReported?.(incident)
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <GenericModal visible={visible} onClose={handleClose} title="Reportar incidencia" height="80%">
      <View className="gap-4">
        {/* Tipo de incidencia */}
        <View>
          <Text className="text-xs font-semibold text-neutral-500 mb-2">Tipo de incidencia</Text>
          <View className="flex-row flex-wrap gap-2">
            {INCIDENT_TYPES.map((type) => {
              const isActive = selectedType === type.id
              return (
                <Pressable
                  key={type.id}
                  onPress={() => setSelectedType(type.id)}
                  className={`px-3 py-2 rounded-xl border ${isActive ? 'border-brand-red bg-red-50' : 'border-neutral-200 bg-white'
                    }`}
                >
                  <Text
                    className={`text-xs font-semibold ${isActive ? 'text-brand-red' : 'text-neutral-600'
                      }`}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Severidad */}
        <View>
          <Text className="text-xs font-semibold text-neutral-500 mb-2">Severidad</Text>
          <View className="flex-row gap-2">
            {SEVERITY_OPTIONS.map((option) => {
              const isActive = severity === option.id
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSeverity(option.id)}
                  className={`flex-1 py-3 rounded-xl border items-center ${isActive ? 'border-2' : 'border'
                    }`}
                  style={{
                    backgroundColor: isActive ? option.bg : '#FAFAFA',
                    borderColor: isActive ? option.color : '#E5E7EB',
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: isActive ? option.color : '#6B7280' }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Descripcion */}
        <View>
          <Text className="text-xs font-semibold text-neutral-500 mb-2">
            Descripcion detallada *
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe la incidencia con el mayor detalle posible..."
            multiline
            numberOfLines={5}
            className="border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 bg-neutral-50"
            style={{ textAlignVertical: 'top', minHeight: 120 }}
          />
        </View>

        {/* Aviso */}
        <View className="flex-row items-start p-3 rounded-xl bg-amber-50 border border-amber-200">
          <Ionicons name="warning-outline" size={18} color="#92400E" />
          <Text className="flex-1 ml-2 text-xs text-amber-800">
            Las incidencias criticas seran notificadas inmediatamente al supervisor.
          </Text>
        </View>

        {/* Boton guardar */}
        <View className="mt-2">
          <PrimaryButton
            title={saving ? 'Reportando...' : 'Reportar incidencia'}
            onPress={handleSubmit}
            disabled={saving || !description.trim()}
            loading={saving}
          />
        </View>
      </View>
    </GenericModal>
  )
}
