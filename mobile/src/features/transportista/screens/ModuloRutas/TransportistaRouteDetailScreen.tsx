import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View, TextInput } from 'react-native'
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { RouteService, LogisticRoute, RouteHistoryEntry } from '../../../../services/api/RouteService'
import { OrderService } from '../../../../services/api/OrderService'
import { Delivery, DeliveryDetail, DeliveryService } from '../../../../services/api/DeliveryService'
import { UserClientService } from '../../../../services/api/UserClientService'
import { ZoneService } from '../../../../services/api/ZoneService'
import { extractPolygons, MapPoint } from '../../../../utils/zoneGeometry'
import { showGlobalToast } from '../../../../utils/toastService'

type StopMarker = {
  id: string
  latitude: number
  longitude: number
  label: string
  orden: number
  orderNumber?: string
  address?: string
}

const FALLBACK_REGION = {
  latitude: -0.1807,
  longitude: -78.4678,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
}

export function TransportistaRouteDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const ruteroId = route.params?.ruteroId as string | undefined

  const [loading, setLoading] = React.useState(false)
  const [rutero, setRutero] = React.useState<LogisticRoute | null>(null)
  const [zonePolygon, setZonePolygon] = React.useState<MapPoint[] | null>(null)
  const [markers, setMarkers] = React.useState<StopMarker[]>([])
  const [activeStopId, setActiveStopId] = React.useState<string | null>(null)
  const [showMapModal, setShowMapModal] = React.useState(false)
  const [updating, setUpdating] = React.useState(false)
  const [deliveries, setDeliveries] = React.useState<Delivery[]>([])
  const [deliveryModalOpen, setDeliveryModalOpen] = React.useState(false)
  const [deliveryMode, setDeliveryMode] = React.useState<'complete' | 'no' | null>(null)
  const [deliveryTarget, setDeliveryTarget] = React.useState<Delivery | null>(null)
  const [deliveryNote, setDeliveryNote] = React.useState('')
  const [deliveryReason, setDeliveryReason] = React.useState('')
  const [evidenceModalOpen, setEvidenceModalOpen] = React.useState(false)
  const [incidentModalOpen, setIncidentModalOpen] = React.useState(false)
  const [deliveryDetail, setDeliveryDetail] = React.useState<DeliveryDetail | null>(null)
  const [evidenceType, setEvidenceType] = React.useState<'foto' | 'firma' | 'documento' | 'audio' | 'otro'>('foto')
  const [evidenceUrl, setEvidenceUrl] = React.useState('')
  const [evidenceDesc, setEvidenceDesc] = React.useState('')
  const [incidentType, setIncidentType] = React.useState('producto_danado')
  const [incidentSeverity, setIncidentSeverity] = React.useState<'baja' | 'media' | 'alta' | 'critica'>('media')
  const [incidentDesc, setIncidentDesc] = React.useState('')
  const [history, setHistory] = React.useState<RouteHistoryEntry[]>([])
  const [showHistoryModal, setShowHistoryModal] = React.useState(false)
  const mapRef = React.useRef<MapView | null>(null)
  const modalMapRef = React.useRef<MapView | null>(null)

  const loadRutero = React.useCallback(async () => {
    if (!ruteroId) return
    setLoading(true)
    try {
      const data = await RouteService.getLogisticsRoute(ruteroId)
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
    const loadDeliveries = async () => {
      if (!ruteroId) {
        setDeliveries([])
        return
      }
      const data = await DeliveryService.getDeliveries({ rutero_logistico_id: ruteroId })
      setDeliveries(data)
    }
    loadDeliveries()
  }, [ruteroId])

  React.useEffect(() => {
    const loadHistory = async () => {
      if (!ruteroId) {
        setHistory([])
        return
      }
      const data = await RouteService.getLogisticsRouteHistory(ruteroId)
      setHistory(data)
    }
    loadHistory()
  }, [ruteroId, rutero?.estado])

  React.useEffect(() => {
    const loadZone = async () => {
      if (!rutero?.zona_id) {
        setZonePolygon(null)
        return
      }
      const zone = await ZoneService.getZoneById(rutero.zona_id)
      const polygons = extractPolygons(zone?.zonaGeom ?? zone?.zona_geom ?? null)
      setZonePolygon(polygons[0] ?? null)
    }
    loadZone()
  }, [rutero?.zona_id])

  React.useEffect(() => {
    const loadMarkers = async () => {
      if (!rutero?.paradas?.length) {
        setMarkers([])
        return
      }
      const results = await Promise.all(
        rutero.paradas.map(async (stop) => {
          try {
            const detail = await OrderService.getOrderDetail(stop.pedido_id)
            const orderNumber = detail?.pedido?.numero_pedido
            const clienteId = detail?.pedido?.cliente_id
            if (!clienteId) return null
            const client = await UserClientService.getClient(clienteId)
            if (!client?.latitud || !client?.longitud) return null
            return {
              id: stop.pedido_id,
              latitude: Number(client.latitud),
              longitude: Number(client.longitud),
              label: client.nombre_comercial || stop.pedido_id.slice(0, 8),
              orden: stop.orden_entrega,
              orderNumber,
              address: client.direccion || '',
            }
          } catch {
            return null
          }
        }),
      )
      setMarkers(results.filter((item): item is StopMarker => Boolean(item)))
    }
    loadMarkers()
  }, [rutero?.paradas])

  React.useEffect(() => {
    const coords: { latitude: number; longitude: number }[] = []
    if (zonePolygon?.length) {
      coords.push(...zonePolygon)
    }
    if (markers.length) {
      coords.push(...markers.map((m) => ({ latitude: m.latitude, longitude: m.longitude })))
    }
    if (!coords.length || !mapRef.current) return
    mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true })
  }, [zonePolygon, markers])

  React.useEffect(() => {
    if (!activeStopId || !mapRef.current) return
    const marker = markers.find((item) => item.id === activeStopId)
    if (!marker) return
    mapRef.current.animateToRegion(
      {
        latitude: marker.latitude,
        longitude: marker.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      400,
    )
  }, [activeStopId, markers])

  React.useEffect(() => {
    if (!showMapModal || !modalMapRef.current) return
    const coords: { latitude: number; longitude: number }[] = []
    if (zonePolygon?.length) {
      coords.push(...zonePolygon)
    }
    if (markers.length) {
      coords.push(...markers.map((m) => ({ latitude: m.latitude, longitude: m.longitude })))
    }
    if (!coords.length) return
    modalMapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
      animated: true,
    })
  }, [showMapModal, zonePolygon, markers])

  const handleStart = async () => {
    if (!ruteroId) return
    setUpdating(true)
    try {
      const updated = await RouteService.startLogisticsRoute(ruteroId)
      if (!updated) {
        showGlobalToast('No se pudo iniciar el rutero', 'error')
        return
      }
      setRutero(updated)
      const refresh = await DeliveryService.getDeliveries({ rutero_logistico_id: ruteroId })
      setDeliveries(refresh)
      showGlobalToast('Rutero iniciado', 'success')
    } finally {
      setUpdating(false)
    }
  }

  const handleComplete = async () => {
    if (!ruteroId) return
    setUpdating(true)
    try {
      const updated = await RouteService.completeLogisticsRoute(ruteroId)
      if (!updated) {
        showGlobalToast('No se pudo completar el rutero', 'error')
        return
      }
      setRutero(updated)
      showGlobalToast('Rutero completado', 'success')
    } finally {
      setUpdating(false)
    }
  }

  const estado = rutero?.estado || 'publicado'
  const deliveriesByOrder = React.useMemo(() => {
    return deliveries.reduce<Record<string, Delivery>>((acc, item) => {
      acc[item.pedido_id] = item
      return acc
    }, {})
  }, [deliveries])

  const statusStyle = (status?: string) => {
    switch (status) {
      case 'entregado_completo':
        return { label: 'Entregado', bg: '#DCFCE7', color: '#166534' }
      case 'entregado_parcial':
        return { label: 'Parcial', bg: '#FEF3C7', color: '#92400E' }
      case 'no_entregado':
        return { label: 'No entregado', bg: '#FEE2E2', color: '#991B1B' }
      case 'en_ruta':
        return { label: 'En ruta', bg: '#FFE8D6', color: '#B45309' }
      default:
        return { label: 'Pendiente', bg: '#E5E7EB', color: '#4B5563' }
    }
  }

  const openDeliveryModal = (mode: 'complete' | 'no', delivery: Delivery) => {
    setDeliveryMode(mode)
    setDeliveryTarget(delivery)
    setDeliveryNote('')
    setDeliveryReason('')
    setDeliveryModalOpen(true)
  }

  const openEvidenceModal = async (delivery: Delivery) => {
    setDeliveryTarget(delivery)
    setEvidenceType('foto')
    setEvidenceUrl('')
    setEvidenceDesc('')
    const detail = await DeliveryService.getDeliveryDetail(delivery.id)
    setDeliveryDetail(detail)
    setEvidenceModalOpen(true)
  }

  const openIncidentModal = async (delivery: Delivery) => {
    setDeliveryTarget(delivery)
    setIncidentType('producto_danado')
    setIncidentSeverity('media')
    setIncidentDesc('')
    const detail = await DeliveryService.getDeliveryDetail(delivery.id)
    setDeliveryDetail(detail)
    setIncidentModalOpen(true)
  }

  const handleDeliverySubmit = async () => {
    if (!deliveryTarget || !deliveryMode) return
    if (deliveryMode === 'no' && !deliveryReason.trim()) {
      showGlobalToast('Ingresa el motivo de no entrega', 'warning')
      return
    }
    setUpdating(true)
    try {
      if (deliveryMode === 'complete') {
        const updated = await DeliveryService.completeDelivery(deliveryTarget.id, {
          observaciones: deliveryNote.trim() || undefined,
        })
        if (!updated) {
          showGlobalToast('No se pudo marcar la entrega', 'error')
          return
        }
      } else {
        const updated = await DeliveryService.markNoDelivery(deliveryTarget.id, {
          motivo_no_entrega: deliveryReason.trim(),
          observaciones: deliveryNote.trim() || undefined,
        })
        if (!updated) {
          showGlobalToast('No se pudo marcar la no entrega', 'error')
          return
        }
      }
      const refresh = await DeliveryService.getDeliveries({ rutero_logistico_id: ruteroId })
      setDeliveries(refresh)
      setDeliveryModalOpen(false)
      showGlobalToast('Entrega actualizada', 'success')
    } finally {
      setUpdating(false)
    }
  }

  const handleAddEvidence = async () => {
    if (!deliveryTarget) return
    if (!evidenceUrl.trim()) {
      showGlobalToast('Ingresa una URL de evidencia', 'warning')
      return
    }
    setUpdating(true)
    try {
      const created = await DeliveryService.addEvidence(deliveryTarget.id, {
        tipo: evidenceType,
        url: evidenceUrl.trim(),
        descripcion: evidenceDesc.trim() || undefined,
      })
      if (!created) {
        showGlobalToast('No se pudo guardar la evidencia', 'error')
        return
      }
      const detail = await DeliveryService.getDeliveryDetail(deliveryTarget.id)
      setDeliveryDetail(detail)
      showGlobalToast('Evidencia registrada', 'success')
      setEvidenceUrl('')
      setEvidenceDesc('')
    } finally {
      setUpdating(false)
    }
  }

  const handleReportIncident = async () => {
    if (!deliveryTarget) return
    if (!incidentDesc.trim()) {
      showGlobalToast('Ingresa una descripcion de la incidencia', 'warning')
      return
    }
    setUpdating(true)
    try {
      const created = await DeliveryService.reportIncident(deliveryTarget.id, {
        tipo_incidencia: incidentType.trim(),
        severidad: incidentSeverity,
        descripcion: incidentDesc.trim(),
      })
      if (!created) {
        showGlobalToast('No se pudo reportar la incidencia', 'error')
        return
      }
      const detail = await DeliveryService.getDeliveryDetail(deliveryTarget.id)
      setDeliveryDetail(detail)
      showGlobalToast('Incidencia reportada', 'success')
      setIncidentDesc('')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Detalle ruta" variant="standard" onBackPress={() => navigation.goBack()} />

      {loading && !rutero ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          <LinearGradient
            colors={[BRAND_COLORS.red, BRAND_COLORS.red700]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 22, padding: 18 }}
          >
            <Text className="text-xs text-slate-200">Rutero logístico</Text>
            <Text className="text-2xl font-extrabold text-white mt-1">
              {rutero?.id?.slice(0, 8) || '---'}
            </Text>
            <View className="mt-3 flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-slate-200">Fecha</Text>
                <Text className="text-sm font-semibold text-white">{rutero?.fecha_rutero?.slice(0, 10) || '-'}</Text>
              </View>
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
                <Text className="text-[11px] font-semibold text-white">{estado.replace(/_/g, ' ').toUpperCase()}</Text>
              </View>
            </View>
          </LinearGradient>

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-neutral-700">Mapa de ruta</Text>
              <Pressable onPress={() => setShowMapModal(true)} className="px-3 py-1 rounded-full bg-red-50">
                <Text className="text-xs font-semibold text-brand-red">Ampliar</Text>
              </Pressable>
            </View>
            <View
              className="mt-3 rounded-2xl overflow-hidden border border-neutral-200"
              style={{ height: 220 }}
            >
              <MapView
                ref={(ref) => (mapRef.current = ref)}
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={FALLBACK_REGION}
                scrollEnabled
                zoomEnabled
                pitchEnabled={false}
                rotateEnabled={false}
              >
                {zonePolygon && (
                  <Polygon
                    coordinates={zonePolygon}
                    strokeColor={BRAND_COLORS.red}
                    fillColor={`${BRAND_COLORS.red}22`}
                    strokeWidth={2}
                  />
                )}
                {markers.map((marker) => (
                  <Marker
                    key={marker.id}
                    coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                    title={`#${marker.orden} ${marker.label}`}
                    pinColor={BRAND_COLORS.red}
                  >
                    <View className="items-center">
                      <View className="w-8 h-8 rounded-full items-center justify-center border-2 border-white" style={{ backgroundColor: BRAND_COLORS.red }}>
                        <Text className="text-[11px] text-white font-bold">{marker.orden}</Text>
                      </View>
                    </View>
                  </Marker>
                ))}
              </MapView>
            </View>
            {markers.length === 0 ? (
              <Text className="text-xs text-neutral-500 mt-3">
                No hay coordenadas disponibles para mostrar en el mapa.
              </Text>
            ) : null}
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

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <Text className="text-sm font-semibold text-neutral-700">Paradas</Text>
            {rutero?.paradas?.length ? (
              <View className="mt-3 gap-3">
                {rutero.paradas.map((stop) => (
                  <Pressable
                    key={stop.pedido_id}
                    onPress={() => setActiveStopId(stop.pedido_id)}
                    className={`rounded-2xl border p-3 ${activeStopId === stop.pedido_id ? 'border-brand-red bg-red-50' : 'border-neutral-200 bg-white'}`}
                  >
                    <Text className="text-xs text-neutral-500">Pedido</Text>
                    <Text className="text-sm font-semibold text-neutral-900">
                      {markers.find((m) => m.id === stop.pedido_id)?.orderNumber || `#${stop.pedido_id.slice(0, 8)}`}
                    </Text>
                    {markers.find((m) => m.id === stop.pedido_id)?.label ? (
                      <Text className="text-xs text-neutral-500 mt-1">
                        Cliente: {markers.find((m) => m.id === stop.pedido_id)?.label}
                      </Text>
                    ) : null}
                    {markers.find((m) => m.id === stop.pedido_id)?.address ? (
                      <Text className="text-xs text-neutral-500 mt-1">
                        Direccion: {markers.find((m) => m.id === stop.pedido_id)?.address}
                      </Text>
                    ) : null}
                    <Text className="text-[11px] text-neutral-500 mt-1">Orden #{stop.orden_entrega}</Text>
                    <View className="mt-2 flex-row items-center justify-between">
                      <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: statusStyle(deliveriesByOrder[stop.pedido_id]?.estado).bg }}>
                        <Text className="text-[10px] font-semibold" style={{ color: statusStyle(deliveriesByOrder[stop.pedido_id]?.estado).color }}>
                          {statusStyle(deliveriesByOrder[stop.pedido_id]?.estado).label}
                        </Text>
                      </View>
                      {estado === 'en_curso' && deliveriesByOrder[stop.pedido_id] ? (
                        <View className="flex-row items-center gap-2">
                          <Pressable
                            onPress={() => openDeliveryModal('complete', deliveriesByOrder[stop.pedido_id])}
                            className="px-3 py-1 rounded-full border border-emerald-200"
                            style={{ backgroundColor: '#ECFDF3' }}
                          >
                            <Text className="text-[10px] font-semibold text-emerald-700">Entregado</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => openDeliveryModal('no', deliveriesByOrder[stop.pedido_id])}
                            className="px-3 py-1 rounded-full border border-red-200"
                            style={{ backgroundColor: '#FEE2E2' }}
                          >
                            <Text className="text-[10px] font-semibold text-red-700">No entregado</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                    {deliveriesByOrder[stop.pedido_id] ? (
                      <View className="mt-3 flex-row items-center gap-2">
                        <Pressable
                          onPress={() => openEvidenceModal(deliveriesByOrder[stop.pedido_id])}
                          className="px-3 py-1 rounded-full border border-amber-200"
                          style={{ backgroundColor: '#FFFBEB' }}
                        >
                          <Text className="text-[10px] font-semibold text-amber-700">Evidencia</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => openIncidentModal(deliveriesByOrder[stop.pedido_id])}
                          className="px-3 py-1 rounded-full border border-slate-200"
                          style={{ backgroundColor: '#F8FAFC' }}
                        >
                          <Text className="text-[10px] font-semibold text-slate-600">Incidencia</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text className="text-xs text-neutral-500 mt-2">No hay paradas asignadas.</Text>
            )}
          </View>

          <View className="mt-6 gap-3">
            {estado === 'publicado' ? (
              <PrimaryButton title={updating ? 'Iniciando...' : 'Iniciar rutero'} onPress={handleStart} disabled={updating} />
            ) : null}
            {estado === 'en_curso' ? (
              <PrimaryButton title={updating ? 'Completando...' : 'Completar rutero'} onPress={handleComplete} disabled={updating} />
            ) : null}
          </View>
        </ScrollView>
      )}

      <GenericModal
        visible={showMapModal}
        title="Mapa de ruta"
        onClose={() => setShowMapModal(false)}
      >
        <View className="rounded-2xl overflow-hidden border border-neutral-200" style={{ height: 360 }}>
          <MapView
            ref={(ref) => (modalMapRef.current = ref)}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={FALLBACK_REGION}
            scrollEnabled
            zoomEnabled
            pitchEnabled={false}
            rotateEnabled={false}
          >
            {zonePolygon && (
              <Polygon
                coordinates={zonePolygon}
                strokeColor={BRAND_COLORS.red}
                fillColor={`${BRAND_COLORS.red}22`}
                strokeWidth={2}
              />
            )}
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                title={`#${marker.orden} ${marker.label}`}
                pinColor={BRAND_COLORS.red}
              >
                <View className="items-center">
                  <View className="w-8 h-8 rounded-full items-center justify-center border-2 border-white" style={{ backgroundColor: BRAND_COLORS.red }}>
                    <Text className="text-[11px] text-white font-bold">{marker.orden}</Text>
                  </View>
                </View>
              </Marker>
            ))}
          </MapView>
        </View>
      </GenericModal>

      <GenericModal
        visible={deliveryModalOpen}
        title={deliveryMode === 'no' ? 'Marcar no entregado' : 'Confirmar entrega'}
        onClose={() => setDeliveryModalOpen(false)}
      >
        <View className="gap-3">
          {deliveryMode === 'no' ? (
            <View>
              <Text className="text-xs text-neutral-500 mb-1">Motivo</Text>
              <TextInput
                value={deliveryReason}
                onChangeText={setDeliveryReason}
                placeholder="Ej: Cliente no estaba"
                className="border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 bg-neutral-50"
              />
            </View>
          ) : null}
          <View>
            <Text className="text-xs text-neutral-500 mb-1">Observaciones (opcional)</Text>
            <TextInput
              value={deliveryNote}
              onChangeText={setDeliveryNote}
              placeholder="Notas de la entrega"
              className="border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 bg-neutral-50"
            />
          </View>
          <PrimaryButton
            title={updating ? 'Guardando...' : 'Confirmar'}
            onPress={handleDeliverySubmit}
            disabled={updating}
          />
        </View>
      </GenericModal>

      <GenericModal
        visible={evidenceModalOpen}
        title="Evidencias"
        onClose={() => setEvidenceModalOpen(false)}
      >
        <View className="gap-3">
          {deliveryDetail?.evidencias?.length ? (
            <View className="gap-2">
              {deliveryDetail.evidencias.map((item) => (
                <View key={item.id} className="rounded-xl border border-neutral-100 bg-white px-3 py-2">
                  <Text className="text-xs text-neutral-500">{item.tipo.toUpperCase()}</Text>
                  <Text className="text-sm text-neutral-900" numberOfLines={1}>{item.url}</Text>
                  {item.descripcion ? (
                    <Text className="text-xs text-neutral-500 mt-1">{item.descripcion}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-xs text-neutral-500">AÃºn no hay evidencias registradas.</Text>
          )}

          <Text className="text-xs text-neutral-500 mt-3">Tipo de evidencia</Text>
          <View className="flex-row flex-wrap gap-2">
            {['foto', 'firma', 'documento', 'audio', 'otro'].map((tipo) => {
              const active = evidenceType === tipo
              return (
                <Pressable
                  key={tipo}
                  onPress={() => setEvidenceType(tipo as any)}
                  className={`px-3 py-2 rounded-full border ${active ? 'border-brand-red bg-red-50' : 'border-neutral-200 bg-white'}`}
                >
                  <Text className={`text-xs font-semibold ${active ? 'text-brand-red' : 'text-neutral-600'}`}>
                    {tipo.toUpperCase()}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <View>
            <Text className="text-xs text-neutral-500 mb-1">URL</Text>
            <TextInput
              value={evidenceUrl}
              onChangeText={setEvidenceUrl}
              placeholder="https://..."
              className="border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 bg-neutral-50"
            />
          </View>
          <View>
            <Text className="text-xs text-neutral-500 mb-1">DescripciÃ³n (opcional)</Text>
            <TextInput
              value={evidenceDesc}
              onChangeText={setEvidenceDesc}
              placeholder="Detalle breve de la evidencia"
              className="border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 bg-neutral-50"
            />
          </View>
          <PrimaryButton
            title={updating ? 'Guardando...' : 'Agregar evidencia'}
            onPress={handleAddEvidence}
            disabled={updating}
          />
        </View>
      </GenericModal>

      <GenericModal
        visible={incidentModalOpen}
        title="Incidencias"
        onClose={() => setIncidentModalOpen(false)}
      >
        <View className="gap-3">
          {deliveryDetail?.incidencias?.length ? (
            <View className="gap-2">
              {deliveryDetail.incidencias.map((item) => (
                <View key={item.id} className="rounded-xl border border-neutral-100 bg-white px-3 py-2">
                  <Text className="text-xs text-neutral-500">{item.severidad.toUpperCase()}</Text>
                  <Text className="text-sm font-semibold text-neutral-900">{item.tipo_incidencia}</Text>
                  <Text className="text-xs text-neutral-500 mt-1">{item.descripcion}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-xs text-neutral-500">Aún no hay incidencias reportadas.</Text>
          )}

          <View>
            <Text className="text-xs text-neutral-500 mb-1">Tipo de incidencia</Text>
            <TextInput
              value={incidentType}
              onChangeText={setIncidentType}
              placeholder="Ej: Dirección incorrecta"
              className="border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 bg-neutral-50"
            />
          </View>

          <Text className="text-xs text-neutral-500">Severidad</Text>
          <View className="flex-row flex-wrap gap-2">
            {['baja', 'media', 'alta', 'critica'].map((level) => {
              const active = incidentSeverity === level
              return (
                <Pressable
                  key={level}
                  onPress={() => setIncidentSeverity(level as any)}
                  className={`px-3 py-2 rounded-full border ${active ? 'border-brand-red bg-red-50' : 'border-neutral-200 bg-white'}`}
                >
                  <Text className={`text-xs font-semibold ${active ? 'text-brand-red' : 'text-neutral-600'}`}>
                    {level.toUpperCase()}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <View>
            <Text className="text-xs text-neutral-500 mb-1">Descripción</Text>
            <TextInput
              value={incidentDesc}
              onChangeText={setIncidentDesc}
              placeholder="Detalle de la incidencia"
              multiline
              className="border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 bg-neutral-50"
            />
          </View>
          <PrimaryButton
            title={updating ? 'Guardando...' : 'Reportar incidencia'}
            onPress={handleReportIncident}
            disabled={updating}
          />
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
                  en_curso: { bg: '#FEF3C7', color: '#92400E', icon: 'navigate-outline' },
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
