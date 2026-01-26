import React from 'react'
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { ToggleSwitch } from '../../../../components/ui/ToggleSwitch'
import { FeedbackModal } from '../../../../components/ui/FeedbackModal'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { BRAND_COLORS } from '../../../../shared/types'
import { Channel, ChannelService } from '../../../../services/api/ChannelService'
import { showGlobalToast } from '../../../../utils/toastService'
import { getUserFriendlyMessage } from '../../../../utils/errorMessages'

const CHANNEL_CODE_PREFIX = 'CANAL-'

const formatChannelCode = (code: string) => {
  if (!code) return ''
  if (code.toUpperCase().startsWith(CHANNEL_CODE_PREFIX)) {
    return `${CHANNEL_CODE_PREFIX}${code.slice(CHANNEL_CODE_PREFIX.length)}`
  }
  return `${CHANNEL_CODE_PREFIX}${code}`
}

export function SupervisorChannelDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()

  const channelParam: Channel | undefined = route.params?.channel
  const channelId: string | undefined = channelParam?.id || route.params?.channelId

  const [channel, setChannel] = React.useState<Channel | null>(channelParam ?? null)
  const [loading, setLoading] = React.useState(false)
  const [confirmVisible, setConfirmVisible] = React.useState(false)
  const [pendingActive, setPendingActive] = React.useState<boolean | null>(null)

  const loadData = React.useCallback(async () => {
    if (!channelId) return
    setLoading(true)
    try {
      const data = await ChannelService.getChannel(channelId)
      setChannel(data)
    } finally {
      setLoading(false)
    }
  }, [channelId])

  React.useEffect(() => {
    loadData()
    const unsubscribe = navigation.addListener('focus', loadData)
    return unsubscribe
  }, [loadData, navigation])

  const requestToggleActive = () => {
    if (!channel) return
    setPendingActive(!channel.activo)
    setConfirmVisible(true)
  }

  const handleConfirmToggle = async () => {
    if (!channel || pendingActive === null) return
    setConfirmVisible(false)
    setLoading(true)
    try {
      const updated = await ChannelService.updateChannel(channel.id, { activo: pendingActive })
      if (!updated) {
        throw new Error('UPDATE_ERROR')
      }
      setChannel(updated)
      showGlobalToast(
        `Canal ${pendingActive ? 'activado' : 'desactivado'} correctamente.`,
        'success'
      )
    } catch (error) {
      showGlobalToast(getUserFriendlyMessage(error, 'UPDATE_ERROR'), 'error')
    } finally {
      setPendingActive(null)
      setLoading(false)
    }
  }

  if (loading && !channel) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header
          title="Detalle Canal"
          variant="standard"
          onBackPress={() => navigation.goBack()}
          rightElement={<SupervisorHeaderMenu />}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
          <Text className="text-neutral-500 mt-4 text-sm">Cargando informacion...</Text>
        </View>
      </View>
    )
  }

  if (!channel) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header
          title="Detalle Canal"
          variant="standard"
          onBackPress={() => navigation.goBack()}
          rightElement={<SupervisorHeaderMenu />}
        />
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-neutral-100 w-20 h-20 rounded-full items-center justify-center mb-4">
            <Ionicons name="search-outline" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-lg font-bold text-neutral-900 text-center mb-2">
            Canal no encontrado
          </Text>
          <Text className="text-neutral-500 text-center">
            No se pudo cargar la informacion del canal
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Detalle Canal"
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} tintColor={BRAND_COLORS.red} />
        }
      >
        <View className="px-5 py-4">
          <View className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-2xl bg-red-50 items-center justify-center mr-3 border border-red-100">
                <Ionicons name="pricetag" size={22} color={BRAND_COLORS.red} />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-neutral-900" numberOfLines={2}>
                  {channel.nombre}
                </Text>
                <Text className="text-neutral-500 text-sm mt-1">Codigo: {formatChannelCode(channel.codigo)}</Text>
              </View>
            </View>

            {channel.descripcion ? (
              <View className="mb-4">
                <Text className="text-neutral-500 text-xs font-medium mb-1">Descripcion</Text>
                <Text className="text-neutral-900 text-sm font-semibold">
                  {channel.descripcion}
                </Text>
              </View>
            ) : null}

            <View className="flex-row items-center justify-between bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3">
              <Text className="text-neutral-700 font-semibold">Activo</Text>
              <ToggleSwitch checked={channel.activo} onToggle={requestToggleActive} />
            </View>
          </View>

          <View className="mt-6">
            <PrimaryButton
              title="Editar canal"
              onPress={() => navigation.navigate('SupervisorChannelForm', { channel })}
            />
          </View>
        </View>
      </ScrollView>

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
