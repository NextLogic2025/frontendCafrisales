import React from 'react'
import { View, Text, Pressable, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { GenericList } from '../../../../components/ui/GenericList'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { FeedbackModal, FeedbackType } from '../../../../components/ui/FeedbackModal'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { Channel, ChannelService, ChannelStatusFilter } from '../../../../services/api/ChannelService'

const CHANNEL_CODE_PREFIX = 'CANAL-'

const formatChannelCode = (code: string) => {
  if (!code) return ''
  if (code.toUpperCase().startsWith(CHANNEL_CODE_PREFIX)) {
    return `${CHANNEL_CODE_PREFIX}${code.slice(CHANNEL_CODE_PREFIX.length)}`
  }
  return `${CHANNEL_CODE_PREFIX}${code}`
}

export function SupervisorChannelsScreen() {
  const navigation = useNavigation<any>()
  const [channels, setChannels] = React.useState<Channel[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<ChannelStatusFilter>('activo')
  const [loading, setLoading] = React.useState(false)

  const [feedbackVisible, setFeedbackVisible] = React.useState(false)
  const [feedbackConfig, setFeedbackConfig] = React.useState<{
    type: FeedbackType
    title: string
    message: string
    onConfirm?: () => void
    showCancel?: boolean
    confirmText?: string
  }>({ type: 'info', title: '', message: '' })

  const fetchChannels = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await ChannelService.getChannels()
      setChannels(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchChannels()
    }, [fetchChannels])
  )

  const filteredChannels = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return channels.filter((channel) => {
      if (statusFilter === 'activo' && !channel.activo) return false
      if (statusFilter === 'inactivo' && channel.activo) return false

      if (!query) return true
      return (
        channel.nombre.toLowerCase().includes(query) ||
        channel.codigo.toLowerCase().includes(query) ||
        (channel.descripcion ?? '').toLowerCase().includes(query)
      )
    })
  }, [channels, searchQuery, statusFilter])

  const confirmToggleStatus = (channel: Channel) => {
    const isInactive = !channel.activo
    const actionVerb = isInactive ? 'Activar' : 'Desactivar'

    setFeedbackConfig({
      type: 'warning',
      title: `${actionVerb} canal?`,
      message: `Estas seguro de que deseas ${actionVerb.toLowerCase()} el canal ${channel.nombre}?`,
      showCancel: true,
      confirmText: 'Si, continuar',
      onConfirm: () => executeToggleStatus(channel),
    })
    setFeedbackVisible(true)
  }

  const executeToggleStatus = async (channel: Channel) => {
    setFeedbackVisible(false)
    setLoading(true)
    try {
      const updated = await ChannelService.updateChannel(channel.id, { activo: !channel.activo })
      if (!updated) {
        throw new Error('UPDATE_ERROR')
      }
      setTimeout(() => {
        setFeedbackConfig({
          type: 'success',
          title: channel.activo ? 'Canal Desactivado' : 'Canal Activado',
          message: `El canal ${channel.nombre} fue ${channel.activo ? 'desactivado' : 'activado'} correctamente.`,
          showCancel: false,
          confirmText: 'Entendido',
          onConfirm: () => setFeedbackVisible(false),
        })
        setFeedbackVisible(true)
      }, 250)
      await fetchChannels()
    } catch (error) {
      setTimeout(() => {
        setFeedbackConfig({
          type: 'error',
          title: 'Error',
          message: 'No se pudo actualizar el estado del canal.',
          showCancel: false,
          confirmText: 'Cerrar',
          onConfirm: () => setFeedbackVisible(false),
        })
        setFeedbackVisible(true)
      }, 250)
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { id: 'activo', name: 'Activos' },
    { id: 'inactivo', name: 'Inactivos' },
  ]

  const menuActions = [
    {
      label: 'Nuevo canal',
      icon: 'add-circle-outline' as const,
      onPress: () => navigation.navigate('SupervisorChannelForm', { channel: null }),
    },
    {
      label: 'Actualizar',
      icon: 'refresh' as const,
      onPress: fetchChannels,
    },
  ]

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Canales"
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu extraActions={menuActions} />}
      />

      <View className="px-5 py-4 bg-white shadow-sm z-10">
        <View className="flex-row items-center">
          <View className="flex-1 mr-3">
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar canal..."
              onClear={() => setSearchQuery('')}
            />
          </View>
          <TouchableOpacity
            className="w-14 h-14 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: BRAND_COLORS.red }}
            onPress={() => navigation.navigate('SupervisorChannelForm', { channel: null })}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View className="mt-3">
          <CategoryFilter
            categories={statusOptions}
            selectedId={statusFilter}
            onSelect={(value) => setStatusFilter(value as ChannelStatusFilter)}
          />
        </View>
      </View>

      <View className="flex-1">
        <GenericList
          items={filteredChannels}
          onRefresh={fetchChannels}
          isLoading={loading}
          emptyState={{
            icon: 'pricetag-outline',
            title: 'Sin canales',
            message: 'Crea canales para clasificar clientes y promociones.',
          }}
          renderItem={(channel) => (
            <Pressable
              onPress={() => navigation.navigate('SupervisorChannelDetail', { channel })}
              onLongPress={() => confirmToggleStatus(channel)}
              className="bg-white rounded-2xl border border-neutral-200 px-4 py-4 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <View style={styles.cardRow}>
                <View
                  style={[
                    styles.iconWrap,
                    channel.activo ? styles.iconWrapActive : styles.iconWrapInactive,
                  ]}
                >
                  <Ionicons
                    name="pricetag"
                    size={20}
                    color={channel.activo ? BRAND_COLORS.red : '#9CA3AF'}
                  />
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.title, !channel.activo && styles.textMuted]} numberOfLines={1}>
                    {channel.nombre}
                  </Text>
                  <Text style={styles.codeText}>Codigo: {formatChannelCode(channel.codigo)}</Text>
                  {channel.descripcion ? (
                    <Text style={styles.description} numberOfLines={2}>
                      {channel.descripcion}
                    </Text>
                  ) : null}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    channel.activo ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      channel.activo ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      channel.activo ? styles.textActive : styles.textInactive,
                    ]}
                  >
                    {channel.activo ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      </View>

      <FeedbackModal
        visible={feedbackVisible}
        type={feedbackConfig.type}
        title={feedbackConfig.title}
        message={feedbackConfig.message}
        onClose={() => setFeedbackVisible(false)}
        onConfirm={feedbackConfig.onConfirm}
        showCancel={feedbackConfig.showCancel}
        confirmText={feedbackConfig.confirmText}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  iconWrapActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  iconWrapInactive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  codeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusActive: {
    backgroundColor: '#ECFDF5',
  },
  statusInactive: {
    backgroundColor: '#FEF2F2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  dotActive: {
    backgroundColor: '#10B981',
  },
  dotInactive: {
    backgroundColor: BRAND_COLORS.red,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  textActive: {
    color: '#059669',
  },
  textInactive: {
    color: BRAND_COLORS.red,
  },
  textMuted: {
    color: '#6B7280',
  },
})
