import React from 'react'
import { View, Text, Pressable, TextInput, Image, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { GenericModal } from '../ui/GenericModal'
import { PrimaryButton } from '../ui/PrimaryButton'
import { BRAND_COLORS } from '../../shared/types'
import { DeliveryService, EvidencePayload, DeliveryEvidence } from '../../services/api/DeliveryService'
import { showGlobalToast } from '../../utils/toastService'

type EvidenceType = 'foto' | 'firma' | 'documento' | 'audio' | 'otro'

type Props = {
  visible: boolean
  onClose: () => void
  entregaId: string
  onEvidenceAdded?: (evidence: DeliveryEvidence) => void
}

const EVIDENCE_TYPES: { id: EvidenceType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'foto', label: 'Foto', icon: 'camera-outline' },
  { id: 'firma', label: 'Firma', icon: 'pencil-outline' },
  { id: 'documento', label: 'Documento', icon: 'document-outline' },
  { id: 'otro', label: 'Otro', icon: 'attach-outline' },
]

export function AddEvidenceModal({ visible, onClose, entregaId, onEvidenceAdded }: Props) {
  const [selectedType, setSelectedType] = React.useState<EvidenceType>('foto')
  const [description, setDescription] = React.useState('')
  const [imageUri, setImageUri] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)

  const resetForm = () => {
    setSelectedType('foto')
    setDescription('')
    setImageUri(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) {
      showGlobalToast('Se necesitan permisos para acceder a la galeria', 'warning')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri)
    }
  }

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
    if (!permissionResult.granted) {
      showGlobalToast('Se necesitan permisos para usar la camara', 'warning')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri)
    }
  }

  const handleSubmit = async () => {
    if (!imageUri) {
      showGlobalToast('Selecciona o toma una foto primero', 'warning')
      return
    }

    setUploading(true)
    try {
      // En produccion, aqui subirias la imagen a un servicio de almacenamiento
      // y obtendrias la URL. Por ahora usamos la URI local como placeholder.
      const payload: EvidencePayload = {
        tipo: selectedType,
        url: imageUri,
        mime_type: 'image/jpeg',
        descripcion: description.trim() || undefined,
      }

      const evidence = await DeliveryService.addEvidence(entregaId, payload)
      if (!evidence) {
        showGlobalToast('No se pudo guardar la evidencia', 'error')
        return
      }

      showGlobalToast('Evidencia guardada correctamente', 'success')
      onEvidenceAdded?.(evidence)
      handleClose()
    } finally {
      setUploading(false)
    }
  }

  return (
    <GenericModal visible={visible} onClose={handleClose} title="Agregar evidencia" height="70%">
      <View className="gap-4">
        {/* Tipo de evidencia */}
        <View>
          <Text className="text-xs font-semibold text-neutral-500 mb-2">Tipo de evidencia</Text>
          <View className="flex-row flex-wrap gap-2">
            {EVIDENCE_TYPES.map((type) => {
              const isActive = selectedType === type.id
              return (
                <Pressable
                  key={type.id}
                  onPress={() => setSelectedType(type.id)}
                  className={`flex-row items-center px-4 py-2.5 rounded-xl border ${isActive ? 'border-brand-red bg-red-50' : 'border-neutral-200 bg-white'
                    }`}
                >
                  <Ionicons
                    name={type.icon}
                    size={18}
                    color={isActive ? BRAND_COLORS.red : '#6B7280'}
                  />
                  <Text
                    className={`ml-2 text-sm font-semibold ${isActive ? 'text-brand-red' : 'text-neutral-600'
                      }`}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Captura de imagen */}
        <View>
          <Text className="text-xs font-semibold text-neutral-500 mb-2">Imagen</Text>
          {imageUri ? (
            <View className="rounded-2xl overflow-hidden border border-neutral-200">
              <Image source={{ uri: imageUri }} className="w-full h-48" resizeMode="cover" />
              <Pressable
                onPress={() => setImageUri(null)}
                className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
              >
                <Ionicons name="close" size={16} color="white" />
              </Pressable>
            </View>
          ) : (
            <View className="flex-row gap-3">
              <Pressable
                onPress={takePhoto}
                className="flex-1 border border-dashed border-neutral-300 rounded-2xl py-6 items-center justify-center bg-neutral-50"
              >
                <Ionicons name="camera-outline" size={32} color={BRAND_COLORS.red} />
                <Text className="text-xs text-neutral-600 mt-2 font-semibold">Tomar foto</Text>
              </Pressable>
              <Pressable
                onPress={pickImage}
                className="flex-1 border border-dashed border-neutral-300 rounded-2xl py-6 items-center justify-center bg-neutral-50"
              >
                <Ionicons name="images-outline" size={32} color={BRAND_COLORS.red} />
                <Text className="text-xs text-neutral-600 mt-2 font-semibold">Galeria</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Descripcion */}
        <View>
          <Text className="text-xs font-semibold text-neutral-500 mb-2">
            Descripcion (opcional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe brevemente la evidencia..."
            multiline
            numberOfLines={3}
            className="border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 bg-neutral-50"
            style={{ textAlignVertical: 'top', minHeight: 80 }}
          />
        </View>

        {/* Boton guardar */}
        <View className="mt-2">
          <PrimaryButton
            title={uploading ? 'Guardando...' : 'Guardar evidencia'}
            onPress={handleSubmit}
            disabled={uploading || !imageUri}
            loading={uploading}
          />
        </View>
      </View>
    </GenericModal>
  )
}
