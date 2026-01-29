import React from 'react'
import { View, Text, Image, Pressable, FlatList, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { GenericModal } from '../ui/GenericModal'
import { BRAND_COLORS } from '../../shared/types'
import { DeliveryEvidence } from '../../services/api/DeliveryService'

type Props = {
  visible: boolean
  onClose: () => void
  evidencias: DeliveryEvidence[]
}

const SCREEN_WIDTH = Dimensions.get('window').width

const getEvidenceIcon = (tipo: string): keyof typeof Ionicons.glyphMap => {
  switch (tipo) {
    case 'foto':
      return 'camera'
    case 'firma':
      return 'pencil'
    case 'documento':
      return 'document'
    case 'audio':
      return 'mic'
    default:
      return 'attach'
  }
}

const getEvidenceLabel = (tipo: string): string => {
  switch (tipo) {
    case 'foto':
      return 'Foto'
    case 'firma':
      return 'Firma'
    case 'documento':
      return 'Documento'
    case 'audio':
      return 'Audio'
    default:
      return 'Otro'
  }
}

export function EvidenceGalleryModal({ visible, onClose, evidencias }: Props) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  const handleClose = () => {
    setSelectedIndex(null)
    onClose()
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

  if (selectedIndex !== null && evidencias[selectedIndex]) {
    const evidence = evidencias[selectedIndex]
    return (
      <GenericModal visible={visible} onClose={() => setSelectedIndex(null)} title="Detalle" height="90%">
        <View className="flex-1">
          <Image
            source={{ uri: evidence.url }}
            className="w-full rounded-2xl"
            style={{ height: SCREEN_WIDTH - 40 }}
            resizeMode="contain"
          />
          <View className="mt-4 p-4 bg-neutral-50 rounded-2xl">
            <View className="flex-row items-center">
              <Ionicons name={getEvidenceIcon(evidence.tipo)} size={18} color={BRAND_COLORS.red} />
              <Text className="ml-2 text-sm font-semibold text-neutral-900">
                {getEvidenceLabel(evidence.tipo)}
              </Text>
            </View>
            {evidence.descripcion ? (
              <Text className="text-sm text-neutral-600 mt-2">{evidence.descripcion}</Text>
            ) : null}
            <Text className="text-xs text-neutral-500 mt-2">{formatDate(evidence.creado_en)}</Text>
          </View>
          <Pressable
            onPress={() => setSelectedIndex(null)}
            className="mt-4 py-3 rounded-xl border border-neutral-200 items-center"
          >
            <Text className="text-sm font-semibold text-neutral-600">Volver a galeria</Text>
          </Pressable>
        </View>
      </GenericModal>
    )
  }

  return (
    <GenericModal visible={visible} onClose={handleClose} title="Evidencias" height="80%">
      {evidencias.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12">
          <View className="w-16 h-16 rounded-full bg-neutral-100 items-center justify-center mb-4">
            <Ionicons name="images-outline" size={32} color="#9CA3AF" />
          </View>
          <Text className="text-base font-semibold text-neutral-700">Sin evidencias</Text>
          <Text className="text-sm text-neutral-500 mt-1 text-center px-8">
            Aun no se han agregado evidencias para esta entrega.
          </Text>
        </View>
      ) : (
        <FlatList
          data={evidencias}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => setSelectedIndex(index)}
              className="flex-1 rounded-2xl overflow-hidden border border-neutral-200 bg-white"
              style={{ maxWidth: (SCREEN_WIDTH - 52) / 2 }}
            >
              <Image
                source={{ uri: item.url }}
                className="w-full h-28"
                resizeMode="cover"
              />
              <View className="p-2">
                <View className="flex-row items-center">
                  <Ionicons name={getEvidenceIcon(item.tipo)} size={14} color={BRAND_COLORS.red} />
                  <Text className="ml-1 text-xs font-semibold text-neutral-700">
                    {getEvidenceLabel(item.tipo)}
                  </Text>
                </View>
                <Text className="text-[10px] text-neutral-500 mt-1" numberOfLines={1}>
                  {formatDate(item.creado_en)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </GenericModal>
  )
}
