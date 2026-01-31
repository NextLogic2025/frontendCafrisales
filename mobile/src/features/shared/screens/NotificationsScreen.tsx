import React from 'react'
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../components/ui/Header'
import { CategoryFilter } from '../../../components/ui/CategoryFilter'
import { BRAND_COLORS } from '../../../shared/types'
import { useNotificationsOptional } from '../../../context/NotificationContext'

type FilterOption = 'todas' | 'no_leidas'

const formatText = (value?: string | null) => {
  if (!value) return ''
  return value.replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
}

const formatDate = (value?: string | null) => {
  if (!value) return '---'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '---'
  return date.toLocaleString()
}

export function NotificationsScreen() {
  const notificationsCtx = useNotificationsOptional()
  const [filter, setFilter] = React.useState<FilterOption>('todas')

  const notifications = notificationsCtx?.notifications ?? []
  const loading = notificationsCtx?.loading ?? false
  const currentUserId = notificationsCtx?.currentUserId ?? null

  const data = React.useMemo(() => {
    if (filter === 'no_leidas') {
      return notifications.filter((item) => !item.leida)
    }
    return notifications
  }, [notifications, filter])

  React.useEffect(() => {
    notificationsCtx?.refresh({ soloNoLeidas: filter === 'no_leidas' })
  }, [filter])

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Notificaciones" variant="standard" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => notificationsCtx?.refresh({ soloNoLeidas: filter === 'no_leidas' })}
            colors={[BRAND_COLORS.red]}
          />
        }
      >
        <View className="px-4 mt-4">
          <CategoryFilter
            categories={[
              { id: 'todas', name: 'Todas' },
              { id: 'no_leidas', name: 'No leidas' },
            ]}
            selectedId={filter}
            onSelect={(value) => setFilter(value as FilterOption)}
          />
        </View>

        <View className="px-4 mt-3">
          <Pressable
            onPress={() => notificationsCtx?.markAllRead()}
            className="self-end px-3 py-2 rounded-full border border-neutral-200 bg-white"
          >
            <Text className="text-xs font-semibold text-neutral-700">Marcar todo como leido</Text>
          </Pressable>
        </View>

        <View className="px-4 mt-4">
          {data.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center border border-neutral-200">
              <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
              <Text className="text-neutral-500 mt-2">No hay notificaciones</Text>
            </View>
          ) : (
            data.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (item.usuarioId && currentUserId && item.usuarioId !== currentUserId) return
                  notificationsCtx?.markAsRead(item.id)
                }}
                className={`mb-3 rounded-2xl border px-4 py-4 ${
                  item.leida ? 'bg-white border-neutral-200' : 'bg-amber-50 border-amber-200'
                }`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-sm font-bold text-neutral-900">
                      {formatText(item.titulo)}
                    </Text>
                    <Text className="text-xs text-neutral-600 mt-1">
                      {formatText(item.mensaje)}
                    </Text>
                    {item.usuarioId && currentUserId && item.usuarioId !== currentUserId ? (
                      <Text className="text-[10px] text-neutral-400 mt-2">
                        Notificacion de otro usuario
                      </Text>
                    ) : null}
                  </View>
                  {!item.leida && (
                    <View className="h-2.5 w-2.5 rounded-full bg-brand-red mt-1" />
                  )}
                </View>

                <View className="flex-row items-center justify-between mt-3">
                  <Text className="text-[11px] text-neutral-500">{formatDate(item.creadoEn)}</Text>
                  {item.prioridad ? (
                    <View className="px-2 py-0.5 rounded-full bg-neutral-100">
                      <Text className="text-[10px] font-semibold text-neutral-600 uppercase">
                        {formatText(item.prioridad)}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {item.requiereAccion && item.urlAccion ? (
                  <View className="mt-3 p-3 rounded-xl bg-white border border-neutral-200">
                    <Text className="text-[11px] text-neutral-500">Accion sugerida:</Text>
                    <Text className="text-xs text-neutral-700 mt-1">{item.urlAccion}</Text>
                  </View>
                ) : null}
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}
