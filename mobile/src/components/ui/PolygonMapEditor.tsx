import React from 'react'
import { View, Pressable, Text, ViewStyle } from 'react-native'
import MapView, { Marker, Polygon, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps'
import { Ionicons } from '@expo/vector-icons'
import { BRAND_COLORS } from '../../services/shared/types'
import { MapPoint } from '../../utils/zoneGeometry'

const LOJA_REGION: Region = {
  latitude: -3.99313,
  longitude: -79.20422,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
}

type Props = {
  points: MapPoint[]
  onChangePoints?: (points: MapPoint[]) => void
  existingPolygons?: MapPoint[][]
  height?: number
  fullScreen?: boolean
  style?: ViewStyle
  editable?: boolean
  invalid?: boolean
  showControls?: boolean
  showHint?: boolean
  initialRegion?: Region
  fitToPolygons?: boolean
}

export function PolygonMapEditor({
  points,
  onChangePoints,
  existingPolygons = [],
  height = 260,
  fullScreen = false,
  style,
  editable = false,
  invalid = false,
  showControls = true,
  showHint = true,
  initialRegion = LOJA_REGION,
  fitToPolygons = true,
}: Props) {
  const mapRef = React.useRef<MapView | null>(null)
  const [mapReady, setMapReady] = React.useState(false)

  const allCoordinates = React.useMemo(() => {
    const existing = existingPolygons.flat()
    return [...existing, ...points]
  }, [existingPolygons, points])

  React.useEffect(() => {
    if (!fitToPolygons || !mapReady || allCoordinates.length === 0) return

    if (allCoordinates.length === 1) {
      mapRef.current?.animateToRegion(
        {
          ...initialRegion,
          latitude: allCoordinates[0].latitude,
          longitude: allCoordinates[0].longitude,
        },
        350
      )
      return
    }

    mapRef.current?.fitToCoordinates(allCoordinates, {
      edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
      animated: true,
    })
  }, [allCoordinates, fitToPolygons, initialRegion, mapReady])

  const handlePress = (event: { nativeEvent: { coordinate: MapPoint } }) => {
    if (!editable || !onChangePoints) return
    const next = [...points, event.nativeEvent.coordinate]
    onChangePoints(next)
  }

  const handleUndo = () => {
    if (!onChangePoints || points.length === 0) return
    onChangePoints(points.slice(0, -1))
  }

  const handleClear = () => {
    if (!onChangePoints || points.length === 0) return
    onChangePoints([])
  }

  const primaryStroke = invalid ? '#DC2626' : BRAND_COLORS.red
  const primaryFill = invalid ? 'rgba(220,38,38,0.32)' : 'rgba(239,68,68,0.22)'

  const containerStyle = fullScreen ? { flex: 1 } : { height }

  return (
    <View style={[containerStyle, style]} className="rounded-3xl overflow-hidden border border-neutral-200 bg-white">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        onPress={handlePress}
        onMapReady={() => setMapReady(true)}
      >
        {existingPolygons.map((polygon, index) => (
          <Polygon
            key={`zone-${index}`}
            coordinates={polygon}
            strokeColor="rgba(148,163,184,0.9)"
            fillColor="rgba(148,163,184,0.15)"
            strokeWidth={1.5}
          />
        ))}

        {points.length >= 3 ? (
          <Polygon
            coordinates={points}
            strokeColor={primaryStroke}
            fillColor={primaryFill}
            strokeWidth={2.2}
          />
        ) : points.length >= 2 ? (
          <Polyline coordinates={points} strokeColor={primaryStroke} strokeWidth={2} />
        ) : null}

        {points.map((point, index) => (
          <Marker
            key={`point-${index}`}
            coordinate={point}
            pinColor={primaryStroke}
          />
        ))}
      </MapView>

      {showControls && editable ? (
        <View className="absolute top-3 right-3 flex-row items-center">
          <Pressable
            onPress={handleUndo}
            accessibilityRole="button"
            disabled={points.length === 0}
            className={`w-10 h-10 rounded-full items-center justify-center mr-2 ${points.length === 0 ? 'bg-neutral-100' : 'bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Ionicons name="return-up-back" size={18} color={points.length === 0 ? '#9CA3AF' : '#111827'} />
          </Pressable>
          <Pressable
            onPress={handleClear}
            accessibilityRole="button"
            disabled={points.length === 0}
            className={`w-10 h-10 rounded-full items-center justify-center ${points.length === 0 ? 'bg-neutral-100' : 'bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Ionicons name="trash-outline" size={18} color={points.length === 0 ? '#9CA3AF' : '#111827'} />
          </Pressable>
        </View>
      ) : null}

      {editable && showHint ? (
        <View className="absolute bottom-3 left-3 bg-white/90 border border-neutral-200 px-3 py-2 rounded-2xl">
          <Text className="text-[11px] text-neutral-600">
            Toca el mapa para agregar puntos. Usa deshacer para corregir.
          </Text>
        </View>
      ) : null}
    </View>
  )
}
