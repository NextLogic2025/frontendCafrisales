import React from 'react'
import { View, Text } from 'react-native'
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native'
import MapView, { Polygon, PROVIDER_GOOGLE, Region } from 'react-native-maps'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { PolygonMapEditor } from '../../../../components/ui/PolygonMapEditor'
import { showGlobalToast } from '../../../../utils/toastService'
import { Zone, ZoneService } from '../../../../services/api/ZoneService'
import { MapPoint, extractPolygons, polygonsOverlap } from '../../../../utils/zoneGeometry'

const LOJA_REGION: Region = {
  latitude: -3.99313,
  longitude: -79.20422,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
}

type ZonePolygon = {
  zone: Zone
  polygon: MapPoint[]
}

export function SupervisorZonesMapScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const [zones, setZones] = React.useState<Zone[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selectedZone, setSelectedZone] = React.useState<Zone | null>(null)
  const mapRef = React.useRef<MapView | null>(null)
  const [mapReady, setMapReady] = React.useState(false)
  const isEditMode = route.params?.mode === 'edit'
  const editingZoneId = route.params?.zoneId as string | null | undefined
  const draft = route.params?.draft as
    | {
        codigoSuffix?: string
        nombre?: string
        descripcion?: string
        activo?: boolean
      }
    | undefined
  const [mapPoints, setMapPoints] = React.useState<MapPoint[]>(
    (route.params?.points as MapPoint[] | undefined) ?? [],
  )

  React.useEffect(() => {
    if (isEditMode) {
      setMapPoints((route.params?.points as MapPoint[] | undefined) ?? [])
    }
  }, [isEditMode, route.params?.points])

  const fetchZones = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await ZoneService.getZonesMap('todos')
      setZones(data)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchZones()
  }, [fetchZones])

  const zonePolygons = React.useMemo<ZonePolygon[]>(() => {
    return zones.flatMap((zone) =>
      extractPolygons(zone.zonaGeom ?? zone.zona_geom ?? null).map((polygon) => ({
        zone,
        polygon,
      })),
    )
  }, [zones])

  const fitToAll = React.useCallback(() => {
    if (!mapReady || zonePolygons.length === 0) return
    const allCoordinates = zonePolygons.flatMap((item) => item.polygon)
    if (allCoordinates.length === 0) return
    mapRef.current?.fitToCoordinates(allCoordinates, {
      edgePadding: { top: 64, right: 64, bottom: 64, left: 64 },
      animated: true,
    })
  }, [mapReady, zonePolygons])

  React.useEffect(() => {
    if (!isEditMode) {
      fitToAll()
    }
  }, [fitToAll, isEditMode])

  const existingZones = React.useMemo(() => {
    if (!editingZoneId) return zones
    return zones.filter((zone) => zone.id !== editingZoneId)
  }, [zones, editingZoneId])

  const overlapZone = React.useMemo(() => {
    if (!isEditMode || mapPoints.length < 3) return null
    for (const zone of existingZones) {
      const polygons = extractPolygons(zone.zonaGeom ?? zone.zona_geom ?? null)
      for (const polygon of polygons) {
        if (polygonsOverlap(mapPoints, polygon)) {
          return zone
        }
      }
    }
    return null
  }, [existingZones, isEditMode, mapPoints])

  const handleSave = () => {
    if (mapPoints.length < 3) {
      showGlobalToast('Marca al menos 3 puntos en el mapa.', 'error')
      return
    }
    if (overlapZone) {
      showGlobalToast(`La zona se superpone con ${overlapZone.nombre}.`, 'error')
      return
    }
    navigation.dispatch(
      CommonActions.navigate({
        name: 'SupervisorZoneDetail',
        params: { mapPoints, draft },
        merge: true,
      })
    )
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title={isEditMode ? 'Dibujar zona' : 'Mapa de Zonas'}
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
        rightAction={isEditMode ? { icon: 'checkmark', onPress: handleSave } : undefined}
      />

      <View className="flex-1 bg-white">
        {isEditMode ? (
          <PolygonMapEditor
            points={mapPoints}
            onChangePoints={setMapPoints}
            existingPolygons={existingZones.flatMap((zone) => extractPolygons(zone.zonaGeom ?? zone.zona_geom ?? null))}
            editable
            invalid={!!overlapZone}
            showControls
            showHint={false}
            fullScreen
            style={{ borderRadius: 0, borderWidth: 0 }}
          />
        ) : (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={LOJA_REGION}
            onMapReady={() => setMapReady(true)}
          >
            {zonePolygons.map((item, index) => {
              const isSelected = selectedZone?.id === item.zone.id
              const isInactive = item.zone.activo === false
              return (
                <Polygon
                  key={`${item.zone.id}-${index}`}
                  coordinates={item.polygon}
                  strokeColor={
                    isSelected
                      ? 'rgba(220,38,38,0.95)'
                      : isInactive
                        ? 'rgba(148,163,184,0.6)'
                        : 'rgba(148,163,184,0.9)'
                  }
                  fillColor={
                    isSelected
                      ? 'rgba(239,68,68,0.22)'
                      : isInactive
                        ? 'rgba(148,163,184,0.08)'
                        : 'rgba(148,163,184,0.12)'
                  }
                  strokeWidth={isSelected ? 2.6 : 1.3}
                  tappable
                  onPress={() => setSelectedZone(item.zone)}
                />
              )
            })}
          </MapView>
        )}

        {!isEditMode ? (
          selectedZone || loading ? (
            <View className="absolute bottom-6 left-4 right-4 bg-white border border-neutral-200 rounded-2xl px-4 py-3">
              <Text className="text-xs text-neutral-500">
                {loading ? 'Cargando zonas...' : 'Zona seleccionada'}
              </Text>
              <Text className="text-base font-bold text-neutral-900">
                {loading ? 'Espera un momento' : selectedZone?.nombre}
              </Text>
              {!loading && selectedZone ? (
                <Text className="text-xs text-neutral-500">Codigo: {selectedZone.codigo}</Text>
              ) : null}
            </View>
          ) : null
        ) : overlapZone ? (
          <View className="absolute bottom-6 left-4 right-4 bg-white border border-red-200 rounded-2xl px-4 py-3">
            <Text className="text-xs text-red-600">
              La zona se superpone con {overlapZone.nombre}. Ajusta el poligono.
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}
