import React from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { Header } from '../../../../components/ui/Header'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { BRAND_COLORS } from '../../../../shared/types'
import { RouteService, LogisticRoute } from '../../../../services/api/RouteService'
import { OrderService } from '../../../../services/api/OrderService'
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
  const [updating, setUpdating] = React.useState(false)
  const mapRef = React.useRef<MapView | null>(null)

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
            <Text className="text-sm font-semibold text-neutral-700">Mapa de ruta</Text>
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
                  />
                ))}
              </MapView>
            </View>
            {markers.length === 0 ? (
              <Text className="text-xs text-neutral-500 mt-3">
                No hay coordenadas disponibles para mostrar en el mapa.
              </Text>
            ) : null}
          </View>

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <Text className="text-sm font-semibold text-neutral-700">Paradas</Text>
            {rutero?.paradas?.length ? (
              <View className="mt-3 gap-3">
                {rutero.paradas.map((stop) => (
                  <View key={stop.pedido_id} className="rounded-2xl border border-neutral-200 p-3">
                    <Text className="text-xs text-neutral-500">Pedido</Text>
                    <Text className="text-sm font-semibold text-neutral-900">{stop.pedido_id}</Text>
                    <Text className="text-[11px] text-neutral-500 mt-1">Orden #{stop.orden_entrega}</Text>
                  </View>
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
    </View>
  )
}
