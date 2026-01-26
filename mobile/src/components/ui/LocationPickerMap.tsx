import React from 'react'
import { View, Text } from 'react-native'
import MapView, { Marker, Polygon, PROVIDER_GOOGLE, Region } from 'react-native-maps'
import { BRAND_COLORS } from '../../shared/types'

type MapPoint = { latitude: number; longitude: number }

type Props = {
  value?: MapPoint | null
  onChange?: (point: MapPoint) => void
  height?: number
  editable?: boolean
  polygons?: MapPoint[][]
}

const LOJA_REGION: Region = {
  latitude: -3.99313,
  longitude: -79.20422,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
}

export function LocationPickerMap({
  value,
  onChange,
  height = 220,
  editable = true,
  polygons = [],
}: Props) {
  const mapRef = React.useRef<MapView | null>(null)
  const [mapReady, setMapReady] = React.useState(false)

  const region = value
    ? { ...LOJA_REGION, latitude: value.latitude, longitude: value.longitude, latitudeDelta: 0.04, longitudeDelta: 0.04 }
    : LOJA_REGION

  const mapPolygons = React.useMemo(() => polygons.filter((polygon) => polygon.length >= 3), [polygons])

  React.useEffect(() => {
    if (!mapReady) return
    if (value) {
      mapRef.current?.animateToRegion(region, 300)
      return
    }
    if (mapPolygons.length === 0) return
    mapRef.current?.fitToCoordinates(mapPolygons.flat(), {
      edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
      animated: true,
    })
  }, [mapPolygons, mapReady, region, value])

  return (
    <View className="rounded-3xl overflow-hidden border border-neutral-200 bg-white" style={{ height }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={region}
        onMapReady={() => setMapReady(true)}
        onPress={(event) => {
          if (!editable || !onChange) return
          onChange(event.nativeEvent.coordinate)
        }}
      >
        {mapPolygons.map((polygon, index) => (
          <Polygon
            key={`zone-${index}`}
            coordinates={polygon}
            strokeColor="rgba(217,45,32,0.8)"
            fillColor="rgba(217,45,32,0.18)"
            strokeWidth={2}
          />
        ))}
        {value ? <Marker coordinate={value} pinColor={BRAND_COLORS.red} /> : null}
      </MapView>
      {editable ? (
        <View className="absolute bottom-3 left-3 bg-white/90 border border-neutral-200 px-3 py-2 rounded-2xl">
          <Text className="text-[11px] text-neutral-600">Toca el mapa para guardar la ubicacion.</Text>
        </View>
      ) : null}
    </View>
  )
}
