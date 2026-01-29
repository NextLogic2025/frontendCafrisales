import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { PickerModal, PickerOption } from '../../../../components/ui/PickerModal'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { CommercialRoute, CommercialStop, RouteService, RouteHistoryEntry } from '../../../../services/api/RouteService'
import { UserProfile, UserService } from '../../../../services/api/UserService'
import { UserClient, UserClientService } from '../../../../services/api/UserClientService'
import { Zone, ZoneService } from '../../../../services/api/ZoneService'
import { showGlobalToast } from '../../../../utils/toastService'

type Option = PickerOption

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

export function SupervisorCommercialRouteDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const ruteroId = route.params?.ruteroId as string | undefined

  const [rutero, setRutero] = React.useState<CommercialRoute | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [zone, setZone] = React.useState<Zone | null>(null)
  const [vendor, setVendor] = React.useState<UserProfile | null>(null)
  const [clients, setClients] = React.useState<UserClient[]>([])
  const [clientMap, setClientMap] = React.useState<Record<string, UserClient>>({})

  const [showAddStop, setShowAddStop] = React.useState(false)
  const [showClientPicker, setShowClientPicker] = React.useState(false)
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null)
  const [objective, setObjective] = React.useState('')
  const [saving, setSaving] = React.useState(false)
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
    const loadZone = async () => {
      if (!rutero?.zona_id) {
        setZone(null)
        return
      }
      const data = await ZoneService.getZoneById(rutero.zona_id)
      setZone(data)
    }
    loadZone()
  }, [rutero?.zona_id])

  React.useEffect(() => {
    const loadVendor = async () => {
      if (!rutero?.vendedor_id) {
        setVendor(null)
        return
      }
      const data = await UserService.getUserDetail(rutero.vendedor_id)
      setVendor(data)
    }
    loadVendor()
  }, [rutero?.vendedor_id])

  React.useEffect(() => {
    const loadClients = async () => {
      if (!rutero?.vendedor_id) {
        setClients([])
        return
      }
      const data = await UserClientService.getClientsByVendedor(rutero.vendedor_id)
      setClients(data)
      const map: Record<string, UserClient> = {}
      data.forEach((client) => {
        map[client.usuario_id] = client
      })
      setClientMap(map)
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

  const clientOptions: Option[] = clients.map((client) => ({
    id: client.usuario_id,
    label: client.nombre_comercial,
    description: client.direccion || client.ruc || '',
    icon: 'business-outline',
    color: BRAND_COLORS.red,
  }))

  const handlePublish = async () => {
    if (!ruteroId) return
    setSaving(true)
    try {
      const updated = await RouteService.publishCommercialRoute(ruteroId)
      if (!updated) {
        showGlobalToast('No se pudo publicar el rutero', 'error')
        return
      }
      showGlobalToast('Rutero publicado', 'success')
      setRutero(updated)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    if (!ruteroId) return
    setSaving(true)
    try {
      const updated = await RouteService.cancelCommercialRoute(ruteroId, 'Rutero cancelado por supervisor')
      if (!updated) {
        showGlobalToast('No se pudo cancelar el rutero', 'error')
        return
      }
      showGlobalToast('Rutero cancelado', 'success')
      setRutero(updated)
    } finally {
      setSaving(false)
    }
  }

  const handleAddStop = async () => {
    if (!ruteroId || !selectedClientId) return
    if (!rutero) return
    const nextOrder = (rutero.paradas?.length || 0) + 1
    setSaving(true)
    try {
      const added = await RouteService.addCommercialVisit(ruteroId, {
        cliente_id: selectedClientId,
        orden_visita: nextOrder,
        objetivo: objective.trim() || undefined,
      })
      if (!added) {
        showGlobalToast('No se pudo agregar la parada', 'error')
        return
      }
      showGlobalToast('Parada agregada', 'success')
      setShowAddStop(false)
      setSelectedClientId(null)
      setObjective('')
      await loadRutero()
    } finally {
      setSaving(false)
    }
  }

  const paradas = rutero?.paradas || []
  const estado = rutero?.estado || 'borrador'
  const badge = statusBadge(estado)
  const canPublish = estado === 'borrador' && paradas.length > 0
  const canEdit = estado === 'borrador'

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Detalle rutero"
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
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

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
            <Text className="text-sm font-semibold text-neutral-700">Asignaciones</Text>
            <View className="mt-3">
              <Text className="text-xs text-neutral-500">Zona</Text>
              <Text className="text-sm text-neutral-900">{zone?.nombre || rutero?.zona_id || '-'}</Text>
            </View>
            <View className="mt-3">
              <Text className="text-xs text-neutral-500">Vendedor</Text>
              <Text className="text-sm text-neutral-900">{vendor?.name || rutero?.vendedor_id || '-'}</Text>
            </View>
          </View>

          {/* Historial section */}
          <Pressable
            onPress={() => setShowHistoryModal(true)}
            className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4 flex-row items-center justify-between"
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

          <View className="mt-6 gap-3">
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => setShowAddStop(true)}
                disabled={!canEdit}
                className={`flex-1 rounded-2xl border px-4 py-3 items-center ${canEdit ? 'border-amber-200 bg-amber-50' : 'border-neutral-200 bg-neutral-50'}`}
              >
                <Text className={`text-sm font-semibold ${canEdit ? 'text-amber-700' : 'text-neutral-300'}`}>
                  Agregar parada
                </Text>
              </Pressable>
              <Pressable
                onPress={handlePublish}
                disabled={!canPublish || saving}
                className={`flex-1 rounded-2xl border px-4 py-3 items-center ${canPublish ? 'border-emerald-200 bg-emerald-50' : 'border-neutral-200 bg-neutral-50'}`}
              >
                <Text className={`text-sm font-semibold ${canPublish ? 'text-emerald-700' : 'text-neutral-300'}`}>
                  Publicar
                </Text>
              </Pressable>
            </View>
            <Pressable
              onPress={handleCancel}
              disabled={estado === 'cancelado' || estado === 'completado' || saving}
              className={`rounded-2xl border px-4 py-3 items-center ${estado === 'cancelado' || estado === 'completado' ? 'border-neutral-200 bg-neutral-50' : 'border-red-200 bg-red-50'}`}
            >
              <Text className={`text-sm font-semibold ${estado === 'cancelado' || estado === 'completado' ? 'text-neutral-300' : 'text-red-700'}`}>
                Cancelar rutero
              </Text>
            </Pressable>
          </View>

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-neutral-700">Paradas</Text>
              <Text className="text-xs text-neutral-500">{paradas.length} visitas</Text>
            </View>

            {paradas.length === 0 ? (
              <Text className="text-xs text-neutral-500 mt-3">Aun no hay paradas asignadas.</Text>
            ) : (
              <View className="mt-3 gap-3">
                {paradas.map((stop) => {
                  const info = stopStatus(stop)
                  const client = clientMap[stop.cliente_id]
                  return (
                    <View key={stop.id} className="rounded-2xl border border-neutral-200 p-4 bg-white">
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="text-xs text-neutral-500">Orden #{stop.orden_visita}</Text>
                          <Text className="text-sm font-semibold text-neutral-900">
                            {client?.nombre_comercial || stop.cliente_id.slice(0, 8)}
                          </Text>
                        </View>
                        <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: info.bg }}>
                          <Text className="text-[10px] font-semibold" style={{ color: info.text }}>
                            {info.label}
                          </Text>
                        </View>
                      </View>
                      {client?.direccion ? (
                        <Text className="text-xs text-neutral-500 mt-2">Direccion: {client.direccion}</Text>
                      ) : null}
                      {stop.objetivo ? (
                        <Text className="text-xs text-neutral-500 mt-2">Objetivo: {stop.objetivo}</Text>
                      ) : null}
                      {stop.resultado ? (
                        <Text className="text-xs text-neutral-500 mt-2">Resultado: {stop.resultado.replace(/_/g, ' ')}</Text>
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
        visible={showAddStop}
        title="Agregar parada"
        onClose={() => setShowAddStop(false)}
      >
        <View className="gap-3">
          <Pressable
            onPress={() => setShowClientPicker(true)}
            className="border border-neutral-200 rounded-2xl px-4 py-3 bg-neutral-50"
          >
            <Text className="text-xs text-neutral-500 font-semibold">Cliente</Text>
            <Text className="text-sm text-neutral-900 mt-1">
              {selectedClientId ? clientMap[selectedClientId]?.nombre_comercial || selectedClientId : 'Seleccionar cliente'}
            </Text>
          </Pressable>
          <View>
            <Text className="text-xs text-neutral-500 mb-1">Objetivo (opcional)</Text>
            <TextInput
              value={objective}
              onChangeText={setObjective}
              placeholder="Ej: Seguimiento de pedido"
              className="border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 bg-neutral-50"
            />
          </View>
          <PrimaryButton title={saving ? 'Guardando...' : 'Agregar parada'} onPress={handleAddStop} disabled={saving} />
        </View>
      </GenericModal>

      <PickerModal
        visible={showClientPicker}
        title="Seleccionar cliente"
        options={clientOptions}
        selectedId={selectedClientId || undefined}
        onSelect={(id) => {
          setSelectedClientId(id)
          setShowClientPicker(false)
        }}
        onClose={() => setShowClientPicker(false)}
        infoText="Clientes asignados al vendedor"
        infoIcon="business-outline"
        infoColor={BRAND_COLORS.red}
      />

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
