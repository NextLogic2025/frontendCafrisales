import React from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { TextField } from '../../../../components/ui/TextField'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { RouteService } from '../../../../services/api/RouteService'
import { showGlobalToast } from '../../../../utils/toastService'

export function SupervisorVehicleFormScreen() {
  const navigation = useNavigation<any>()
  const [placa, setPlaca] = React.useState('')
  const [modelo, setModelo] = React.useState('')
  const [capacidad, setCapacidad] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  const validate = () => {
    if (!placa.trim()) {
      showGlobalToast('Ingresa la placa', 'warning')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        placa: placa.trim().toUpperCase(),
        modelo: modelo.trim() || undefined,
        capacidad_kg: capacidad ? Number(capacidad) : undefined,
      }
      const created = await RouteService.createVehicle(payload)
      if (!created) {
        showGlobalToast('No se pudo crear el vehiculo', 'error')
        return
      }
      showGlobalToast('Vehiculo creado', 'success')
      navigation.goBack()
    } finally {
      setSaving(false)
    }
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Nuevo vehiculo"
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
      />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <Text className="text-sm font-semibold text-neutral-700 mb-3">Datos del vehiculo</Text>
          <TextField
            label="Placa"
            value={placa}
            onChangeText={setPlaca}
            placeholder="ABC-1234"
            autoCapitalize="characters"
          />
          <View className="mt-4">
            <TextField
              label="Modelo (opcional)"
              value={modelo}
              onChangeText={setModelo}
              placeholder="Ej: Nissan NP300"
            />
          </View>
          <View className="mt-4">
            <TextField
              label="Capacidad (kg)"
              value={capacidad}
              onChangeText={setCapacidad}
              keyboardType="numeric"
              placeholder="Ej: 1500"
            />
          </View>
        </View>

        <View className="mt-6">
          <PrimaryButton title={saving ? 'Guardando...' : 'Crear vehiculo'} onPress={handleSave} disabled={saving} />
        </View>

        {saving ? (
          <View className="mt-4 items-center">
            <ActivityIndicator size="small" color={BRAND_COLORS.red} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  )
}
