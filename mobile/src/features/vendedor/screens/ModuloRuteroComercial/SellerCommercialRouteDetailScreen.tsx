import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { BRAND_COLORS } from '../../../../shared/types'
import { CommercialRoute, CommercialStop, RouteService, RouteHistoryEntry } from '../../../../services/api/RouteService'
import { UserClient, UserClientService } from '../../../../services/api/UserClientService'
import { showGlobalToast } from '../../../../utils/toastService'

const statusBadge = (estado: string) => {
  switch (estado) {
    case 'borrador':
      return { bg: BRAND_COLORS.cream, text: BRAND_COLORS.red700 }
    case 'publicado':
      return { bg: `${BRAND_COLORS.gold}40`, text: BRAND_COLORS.red700 }
    case 'en_curso':
      return { bg: `${BRAND_COLORS.gold}60`, text: BRAND_COLORS.red700 }
    case 'completado':
      return { bg: `${BRAND_COLORS.red}15`, text: BRAND_COLORS.red700 }
    default:
      return { bg: `${BRAND_COLORS.red}25`, text: BRAND_COLORS.red700 }
  }
}

const stopStatus = (stop: CommercialStop) => {
  if (stop.checkout_en) return { label: 'Completado', bg: '#DCFCE7', text: '#166534' }
  if (stop.checkin_en) return { label: 'En visita', bg: '#FEF3C7', text: '#92400E' }
  return { label: 'Pendiente', bg: '#E5E7EB', text: '#4B5563' }
}

const RESULT_OPTIONS = [
  { id: 'pedido_tomado', label: 'Pedido tomado' },
  { id: 'no_compro', label: 'No compró' },
  { id: 'no_atendido', label: 'No atendido' },
  { id: 'seguimiento', label: 'Seguimiento' },
  { id: 'cobranza', label: 'Cobranza' },
]

export function SellerCommercialRouteDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const ruteroId = route.params?.ruteroId as string | undefined

  const [rutero, setRutero] = React.useState<CommercialRoute | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [clients, setClients] = React.useState<Record<string, UserClient>>({})

  const [checkoutModalOpen, setCheckoutModalOpen] = React.useState(false)
  const [targetStop, setTargetStop] = React.useState<CommercialStop | null>(null)
  const [selectedResult, setSelectedResult] = React.useState<string>('pedido_tomado')
  const [notes, setNotes] = React.useState('')
  const [history, setHistory] = React.useState<RouteHistoryEntry[]>([])
  const [showHistoryModal, setShowHistoryModal] = React.useState(false)

  const loadRutero = React.useCallback(async () => {
    if (!ruteroId) return
    setLoading(true)
    try {
      const data = await RouteService.getCommercialRoute(ruteroId)
      setRutero(data)
    } finally {
      setLoading(false)
    }
  }, [ruteroId])

  useFocusEffect(
    React.useCallback(() => {
      loadRutero()
    }, [loadRutero]),
  )

  React.useEffect(() => {
    const loadClients = async () => {
      if (!rutero?.vendedor_id) return
      const data = await UserClientService.getClientsByVendedor(rutero.vendedor_id)
      const map: Record<string, UserClient> = {}
      data.forEach((client) => {
        map[client.usuario_id] = client
      })
      setClients(map)
    }
    loadClients()
  }, [rutero?.vendedor_id])

  React.useEffect(() => {
    const loadHistory = async () => {
      if (!ruteroId) {
        setHistory([])
        return
      }
      const data = await RouteService.getCommercialRouteHistory(ruteroId)
      setHistory(data)
    }
    loadHistory()
  }, [ruteroId, rutero?.estado])

  const handleStart = async () => {
    if (!ruteroId) return
    setSaving(true)
    try {
      const updated = await RouteService.startCommercialRoute(ruteroId)
      if (!updated) {
        showGlobalToast('No se pudo iniciar el rutero', 'error')
        return
      }
      showGlobalToast('Rutero iniciado', 'success')
      setRutero(updated)
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async () => {
    if (!ruteroId) return
    setSaving(true)
    try {
      const updated = await RouteService.completeCommercialRoute(ruteroId)
      if (!updated) {
        showGlobalToast('No se pudo completar el rutero', 'error')
        return
      }
      showGlobalToast('Rutero completado', 'success')
      setRutero(updated)
    } finally {
      setSaving(false)
    }
  }

  const handleCheckin = async (stop: CommercialStop) => {
    if (!stop?.id) return
    setSaving(true)
    try {
      const updated = await RouteService.checkinCommercialStop(stop.id)
      if (!updated) {
        showGlobalToast('No se pudo registrar el check-in', 'error')
        return
      }
      await loadRutero()
      showGlobalToast('Check-in registrado', 'success')
    } finally {
      setSaving(false)
    }
  }

  const openCheckout = (stop: CommercialStop) => {
    setTargetStop(stop)
    setSelectedResult(stop.resultado || 'pedido_tomado')
    setNotes(stop.notas || '')
    setCheckoutModalOpen(true)
  }

  const handleCheckout = async () => {
    if (!targetStop?.id) return
    setSaving(true)
    try {
      const updated = await RouteService.checkoutCommercialStop(targetStop.id, {
        resultado: selectedResult,
        notas: notes.trim() || undefined,
      })
      if (!updated) {
        showGlobalToast('No se pudo guardar el resultado', 'error')
        return
      }
      await loadRutero()
      showGlobalToast('Resultado guardado', 'success')
      setCheckoutModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const paradas = rutero?.paradas || []
  const estado = rutero?.estado || 'borrador'
  const badge = statusBadge(estado)
  const allVisited = paradas.length > 0 && paradas.every((stop) => stop.checkout_en)

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Detalle rutero"
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SellerHeaderMenu />}
      />

      {loading && !rutero ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
          <View className="rounded-3xl p-5 mb-5" style={{ backgroundColor: BRAND_COLORS.red }}>
            <Text className="text-xs text-slate-100">Rutero comercial</Text>
            <Text className="text-2xl font-bold text-white mt-2">{rutero?.id?.slice(0, 8) || '---'}</Text>
            <View className="flex-row items-center justify-between mt-4">
              <View>
                <Text className="text-xs text-slate-100">Fecha</Text>
                <Text className="text-sm font-semibold text-white">{rutero?.fecha_rutero?.slice(0, 10) || '-'}</Text>
              </View>
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: badge.bg }}>
                <Text className="text-[10px] font-semibold" style={{ color: badge.text }}>
                  {estado.replace(/_/g, ' ').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Historial section */}
          <Pressable
            onPress={() => setShowHistoryModal(true)}
            className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mb-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: '#F3F4F6' }}>
                <Ionicons name="time-outline" size={20} color="#6B7280" />
              </View>
              <View>
                <Text className="text-sm font-semibold text-neutral-700">Historial de estados</Text>
                <Text className="text-xs text-neutral-500">{history.length} {history.length === 1 ? 'cambio' : 'cambios'} registrados</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          {estado === 'publicado' ? (
            <PrimaryButton title={saving ? 'Iniciando...' : 'Iniciar rutero'} onPress={handleStart} disabled={saving} />
          ) : null}
          {estado === 'en_curso' ? (
            <View className="mt-4">
              <PrimaryButton
                title={saving ? 'Completando...' : 'Completar rutero'}
                onPress={handleComplete}
                disabled={!allVisited || saving}
              />
              {!allVisited ? (
                <Text className="text-xs text-neutral-500 mt-2">
                  Completa todas las paradas antes de finalizar.
                </Text>
              ) : null}
            </View>
          ) : null}

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-neutral-700">Paradas</Text>
              <Text className="text-xs text-neutral-500">{paradas.length} visitas</Text>
            </View>

            {paradas.length === 0 ? (
              <Text className="text-xs text-neutral-500 mt-3">AÃºn no hay paradas asignadas.</Text>
            ) : (
              <View className="mt-3 gap-3">
                {paradas.map((stop) => {
                  const status = stopStatus(stop)
                  const client = clients[stop.cliente_id]
                  return (
                    <View key={stop.id} className="rounded-2xl border border-neutral-200 p-4 bg-white">
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="text-xs text-neutral-500">Orden #{stop.orden_visita}</Text>
                          <Text className="text-sm font-semibold text-neutral-900">
                            {client?.nombre_comercial || stop.cliente_id.slice(0, 8)}
                          </Text>
                        </View>
                        <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: status.bg }}>
                          <Text className="text-[10px] font-semibold" style={{ color: status.text }}>
                            {status.label}
                          </Text>
                        </View>
                      </View>
                      {client?.direccion ? (
                        <Text className="text-xs text-neutral-500 mt-2">DirecciÃ³n: {client.direccion}</Text>
                      ) : null}
                      {stop.objetivo ? (
                        <Text className="text-xs text-neutral-500 mt-2">Objetivo: {stop.objetivo}</Text>
                      ) : null}

                      {estado === 'en_curso' ? (
                        <View className="flex-row items-center gap-2 mt-3">
                          <Pressable
                            onPress={() => handleCheckin(stop)}
                            disabled={Boolean(stop.checkin_en) || saving}
                            className={`px-3 py-1 rounded-full border ${stop.checkin_en ? 'border-neutral-200 bg-neutral-50' : 'border-amber-200 bg-amber-50'}`}
                          >
                            <Text className={`text-[10px] font-semibold ${stop.checkin_en ? 'text-neutral-300' : 'text-amber-700'}`}>
                              Check-in
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => openCheckout(stop)}
                            disabled={!stop.checkin_en || Boolean(stop.checkout_en) || saving}
                            className={`px-3 py-1 rounded-full border ${stop.checkout_en ? 'border-neutral-200 bg-neutral-50' : 'border-emerald-200 bg-emerald-50'}`}
                          >
                            <Text className={`text-[10px] font-semibold ${stop.checkout_en ? 'text-neutral-300' : 'text-emerald-700'}`}>
                              Checkout
                            </Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  )
                })}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <GenericModal
        visible={checkoutModalOpen}
        title="Resultado de visita"
        onClose={() => setCheckoutModalOpen(false)}
      >
        <View className="gap-3">
          <Text className="text-xs text-neutral-500">Resultado</Text>
          <View className="flex-row flex-wrap gap-2">
            {RESULT_OPTIONS.map((option) => {
              const active = selectedResult === option.id
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSelectedResult(option.id)}
                  className={`px-3 py-2 rounded-full border ${active ? 'border-brand-red bg-red-50' : 'border-neutral-200 bg-white'}`}
                >
                  <Text className={`text-xs font-semibold ${active ? 'text-brand-red' : 'text-neutral-600'}`}>
                    {option.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
          <View>
            <Text className="text-xs text-neutral-500 mb-1">Notas (opcional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Comentarios de la visita"
              className="border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 bg-neutral-50"
            />
          </View>
          <PrimaryButton title={saving ? 'Guardando...' : 'Guardar'} onPress={handleCheckout} disabled={saving} />
        </View>
      </GenericModal>

      <GenericModal
        visible={showHistoryModal}
        title="Historial de estados"
        onClose={() => setShowHistoryModal(false)}
      >
        <View className="gap-3">
          {history.length > 0 ? (
            <View className="gap-2">
              {history.map((entry, index) => {
                const statusColors: Record<string, { bg: string; color: string; icon: string }> = {
                  borrador: { bg: '#F3F4F6', color: '#4B5563', icon: 'document-outline' },
                  publicado: { bg: '#DBEAFE', color: '#1D4ED8', icon: 'paper-plane-outline' },
                  en_curso: { bg: '#FEF3C7', color: '#92400E', icon: 'walk-outline' },
                  completado: { bg: '#DCFCE7', color: '#166534', icon: 'checkmark-circle-outline' },
                  cancelado: { bg: '#FEE2E2', color: '#991B1B', icon: 'close-circle-outline' },
                }
                const style = statusColors[entry.estado] || statusColors.borrador
                const dateStr = entry.creado_en
                  ? new Date(entry.creado_en).toLocaleString('es-EC', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-'
                return (
                  <View
                    key={entry.id || index}
                    className="rounded-xl border border-neutral-100 bg-white px-3 py-3 flex-row items-start"
                  >
                    <View
                      className="w-9 h-9 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: style.bg }}
                    >
                      <Ionicons name={style.icon as any} size={18} color={style.color} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-semibold text-neutral-900">
                          {entry.estado.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: style.bg }}>
                          <Text className="text-[10px] font-semibold" style={{ color: style.color }}>
                            {entry.tipo}
                          </Text>
                        </View>
                      </View>
                      {entry.motivo ? (
                        <Text className="text-xs text-neutral-600 mt-1">{entry.motivo}</Text>
                      ) : null}
                      <Text className="text-[11px] text-neutral-400 mt-1">{dateStr}</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          ) : (
            <Text className="text-xs text-neutral-500">No hay historial registrado.</Text>
          )}
        </View>
      </GenericModal>
    </View>
  )
}
