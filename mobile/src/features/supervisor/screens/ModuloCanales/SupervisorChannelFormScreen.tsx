import React from 'react'
import { View, Text } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { TextField } from '../../../../components/ui/TextField'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { ToggleSwitch } from '../../../../components/ui/ToggleSwitch'
import { FeedbackModal } from '../../../../components/ui/FeedbackModal'
import { KeyboardFormLayout } from '../../../../components/ui/KeyboardFormLayout'
import { Channel, ChannelService } from '../../../../services/api/ChannelService'
import { showGlobalToast } from '../../../../utils/toastService'
import { getUserFriendlyMessage } from '../../../../utils/errorMessages'

const CHANNEL_CODE_PREFIX = 'CANAL-'

function normalizeChannelCodeSuffix(value: string) {
  const cleaned = value.trim()
  if (!cleaned) return ''
  if (cleaned.toUpperCase().startsWith(CHANNEL_CODE_PREFIX)) {
    return cleaned.slice(CHANNEL_CODE_PREFIX.length)
  }
  return cleaned
}

export function SupervisorChannelFormScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const channel = (route.params?.channel as Channel | null) ?? null
  const isEditing = !!channel

  const [codigo, setCodigo] = React.useState(normalizeChannelCodeSuffix(channel?.codigo ?? ''))
  const [nombre, setNombre] = React.useState(channel?.nombre ?? '')
  const [descripcion, setDescripcion] = React.useState(channel?.descripcion ?? '')
  const [activo, setActivo] = React.useState(channel?.activo ?? true)
  const [saving, setSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [confirmVisible, setConfirmVisible] = React.useState(false)
  const [pendingActive, setPendingActive] = React.useState<boolean | null>(null)

  const requestToggleActive = () => {
    setPendingActive(!activo)
    setConfirmVisible(true)
  }

  const handleConfirmToggle = () => {
    if (pendingActive === null) return
    setActivo(pendingActive)
    setPendingActive(null)
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!codigo.trim()) nextErrors.codigo = 'Codigo requerido'
    if (!nombre.trim()) nextErrors.nombre = 'Nombre requerido'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) {
      showGlobalToast('Completa los campos obligatorios.', 'error')
      return
    }

    setSaving(true)
    try {
      const suffix = codigo.trim()
      let codigoFinal = suffix ? `${CHANNEL_CODE_PREFIX}${suffix}` : ''
      if (isEditing && channel?.codigo && !channel.codigo.toUpperCase().startsWith(CHANNEL_CODE_PREFIX)) {
        const originalSuffix = normalizeChannelCodeSuffix(channel.codigo)
        if (originalSuffix === suffix) {
          codigoFinal = channel.codigo
        }
      }

      const payload = {
        codigo: codigoFinal,
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        activo,
      }

      if (isEditing && channel?.id) {
        const updated = await ChannelService.updateChannel(channel.id, payload)
        if (!updated) {
          throw new Error('UPDATE_ERROR')
        }
        showGlobalToast('Canal actualizado.', 'success')
        navigation.goBack()
        return
      }

      const created = await ChannelService.createChannel(payload)
      if (!created?.id) {
        throw new Error('CREATE_ERROR')
      }
      showGlobalToast('Canal creado.', 'success')
      navigation.goBack()
    } catch (error) {
      showGlobalToast(getUserFriendlyMessage(error, isEditing ? 'UPDATE_ERROR' : 'CREATE_ERROR'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title={isEditing ? 'Editar Canal' : 'Nuevo Canal'}
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
      />

      <KeyboardFormLayout>
        <View className="px-5 py-4 gap-5">
          <View className="bg-white rounded-3xl border border-neutral-200 p-5 gap-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center mr-3 border border-red-100">
                  <Ionicons name="pricetag-outline" size={20} color="#D92D20" />
                </View>
                <View>
                  <Text className="text-lg font-bold text-neutral-900">Informacion general</Text>
                  <Text className="text-sm text-neutral-500">Define codigo, nombre y descripcion.</Text>
                </View>
              </View>

              <TextField
                label="Codigo"
                placeholder="001"
                value={codigo}
                onChangeText={setCodigo}
                autoCapitalize="none"
                error={errors.codigo}
                left={<Text className="text-neutral-500 font-semibold">{CHANNEL_CODE_PREFIX}</Text>}
              />

              <TextField
                label="Nombre"
                placeholder="Minorista"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
                error={errors.nombre}
              />

              <TextField
                label="Descripcion"
                placeholder="Describe el canal comercial"
                value={descripcion ?? ''}
                onChangeText={setDescripcion}
                multiline
              />

              {isEditing ? (
                <View className="flex-row items-center justify-between bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3">
                  <Text className="text-neutral-700 font-semibold">Activo</Text>
                  <ToggleSwitch checked={activo} onToggle={requestToggleActive} />
                </View>
              ) : null}
            </View>

            <PrimaryButton
              title={isEditing ? 'Guardar cambios' : 'Crear canal'}
              onPress={handleSave}
              loading={saving}
            />
        </View>
      </KeyboardFormLayout>

      <FeedbackModal
        visible={confirmVisible}
        type="warning"
        title={pendingActive ? 'Activar canal' : 'Desactivar canal'}
        message={`Estas seguro de querer ${pendingActive ? 'activar' : 'desactivar'} este canal?`}
        confirmText="Si"
        cancelText="No"
        showCancel
        onClose={() => {
          setConfirmVisible(false)
          setPendingActive(null)
        }}
        onConfirm={handleConfirmToggle}
      />
    </View>
  )
}
