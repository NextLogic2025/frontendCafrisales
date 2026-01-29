import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { BRAND_COLORS } from '../../../../shared/types'
import { RouteService, Vehicle, VehicleStatus } from '../../../../services/api/RouteService'
import { showGlobalToast } from '../../../../utils/toastService'

const statusOptions: { id: VehicleStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'disponible', label: 'Disponible', icon: 'checkmark-circle-outline' },
  { id: 'asignado', label: 'Asignado', icon: 'briefcase-outline' },
  { id: 'mantenimiento', label: 'Mantenimiento', icon: 'construct-outline' },
  { id: 'fuera_servicio', label: 'Fuera de servicio', icon: 'close-circle-outline' },
]

const statusBadge = (estado: VehicleStatus) => {
  switch (estado) {
    case 'disponible':
      return { bg: BRAND_COLORS.cream, text: BRAND_COLORS.red700 }
    case 'asignado':
      return { bg: `${BRAND_COLORS.gold}40`, text: BRAND_COLORS.red700 }
    case 'mantenimiento':
      return { bg: `${BRAND_COLORS.gold}60`, text: BRAND_COLORS.red700 }
    default:
      return { bg: `${BRAND_COLORS.red}20`, text: BRAND_COLORS.red700 }
  }
}

export function SupervisorVehicleDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const vehicleId = route.params?.vehicleId as string | undefined

  const [loading, setLoading] = React.useState(false)
  const [vehicle, setVehicle] = React.useState<Vehicle | null>(null)
  const [selectedStatus, setSelectedStatus] = React.useState<VehicleStatus>('disponible')
  const [updating, setUpdating] = React.useState(false)

  const loadVehicle = React.useCallback(async () => {
    if (!vehicleId) return
    setLoading(true)
    try {
      const data = await RouteService.getVehicle(vehicleId)
      setVehicle(data)
      if (data?.estado) setSelectedStatus(data.estado)
    } finally {
      setLoading(false)
    }
  }, [vehicleId])

  useFocusEffect(
    React.useCallback(() => {
      loadVehicle()
    }, [loadVehicle]),
  )

  const handleUpdateStatus = async () => {
    if (!vehicleId) return
    setUpdating(true)
    try {
      const updated = await RouteService.updateVehicleStatus(vehicleId, selectedStatus)
      if (!updated) {
        showGlobalToast('No se pudo actualizar el estado', 'error')
        return
      }
      setVehicle(updated)
      showGlobalToast('Estado actualizado', 'success')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Detalle vehiculo"
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
      />

      {loading && !vehicle ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          <LinearGradient
            colors={[BRAND_COLORS.red, BRAND_COLORS.red700]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 22, padding: 18 }}
          >
            <Text className="text-xs text-slate-300">Placa</Text>
            <Text className="text-2xl font-extrabold text-white mt-1">
              {vehicle?.placa || '---'}
            </Text>
            <Text className="text-sm text-slate-200 mt-2">
              {vehicle?.modelo || 'Modelo no especificado'}
            </Text>

            {vehicle?.estado ? (
              <View className="mt-4">
                <View className="self-start px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                  <Text className="text-[11px] font-semibold text-white uppercase">
                    {vehicle.estado.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>
            ) : null}
          </LinearGradient>

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <Text className="text-sm font-semibold text-neutral-700">Datos del vehiculo</Text>
            <View className="mt-3">
              <Text className="text-xs text-neutral-500">Capacidad</Text>
              <Text className="text-sm font-semibold text-neutral-900 mt-1">
                {vehicle?.capacidad_kg ? `${vehicle.capacidad_kg} kg` : 'No definida'}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <Text className="text-sm font-semibold text-neutral-700">Actualizar estado</Text>
            <View className="mt-3 gap-2">
              {statusOptions.map((option) => {
                const isActive = selectedStatus === option.id
                const badge = statusBadge(option.id)
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setSelectedStatus(option.id)}
                    className={`rounded-2xl border px-4 py-3 flex-row items-center ${isActive ? 'border-transparent' : 'border-neutral-200'}`}
                    style={{ backgroundColor: isActive ? `${badge.bg}` : '#FFFFFF' }}
                  >
                    <Ionicons name={option.icon} size={20} color={isActive ? badge.text : '#6B7280'} />
                    <Text className={`ml-3 text-sm font-semibold ${isActive ? '' : 'text-neutral-700'}`} style={{ color: isActive ? badge.text : '#374151' }}>
                      {option.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            <View className="mt-5">
              <PrimaryButton
                title={updating ? 'Actualizando...' : 'Guardar estado'}
                onPress={handleUpdateStatus}
                disabled={updating || !vehicleId}
              />
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  )
}
