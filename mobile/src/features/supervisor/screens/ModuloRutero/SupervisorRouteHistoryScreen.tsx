import React from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { RouteHistoryEntry, RouteService } from '../../../../services/api/RouteService'

const formatEstado = (estado: string) => estado.replace(/_/g, ' ').toUpperCase()

export function SupervisorRouteHistoryScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const ruteroId = route.params?.ruteroId as string | undefined

  const [loading, setLoading] = React.useState(false)
  const [history, setHistory] = React.useState<RouteHistoryEntry[]>([])

  const loadHistory = React.useCallback(async () => {
    if (!ruteroId) return
    setLoading(true)
    try {
      const data = await RouteService.getLogisticsRouteHistory(ruteroId)
      setHistory(data)
    } finally {
      setLoading(false)
    }
  }, [ruteroId])

  useFocusEffect(
    React.useCallback(() => {
      loadHistory()
    }, [loadHistory]),
  )

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Historial del rutero"
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
            <Text className="text-sm font-semibold text-neutral-700">Trazabilidad</Text>
            <Text className="text-xs text-neutral-500 mt-1">
              Cambios de estado del rutero.
            </Text>

            {history.length === 0 ? (
              <Text className="text-xs text-neutral-500 mt-4">Sin registros de historial.</Text>
            ) : (
              <View className="mt-4 gap-3">
                {history.map((entry, index) => (
                  <View
                    key={`${entry.id}-${index}`}
                    className="rounded-2xl border border-neutral-200 p-3 bg-white"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[11px] text-neutral-500">Estado</Text>
                      <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FEE2E2' }}>
                        <Text className="text-[10px] font-semibold text-brand-red">
                          {formatEstado(entry.estado)}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs text-neutral-500 mt-2">Fecha</Text>
                    <Text className="text-sm font-semibold text-neutral-900">
                      {entry.creado_en?.slice(0, 19).replace('T', ' ') || '---'}
                    </Text>
                    {entry.motivo ? (
                      <Text className="text-xs text-neutral-500 mt-2">Motivo: {entry.motivo}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  )
}
