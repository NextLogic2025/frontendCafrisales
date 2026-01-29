import React, { Suspense } from 'react'
import { ActivityIndicator, View, type ViewStyle } from 'react-native'
import type MapView from 'react-native-maps'
import type { MapViewProps } from 'react-native-maps'
import { useInteractionManager } from '../../hooks/useInteractionManager'
import { BRAND_COLORS } from '../../shared/types'

// Lazy import del componente de mapa
const LazyMap = React.lazy(() =>
  import('react-native-maps').then((module) => ({
    default: module.default,
  })),
)

type LazyMapViewProps = MapViewProps & {
  /** Estilos adicionales para el contenedor de carga */
  loadingContainerStyle?: ViewStyle
  /** Ref para acceder al MapView subyacente */
  mapRef?: React.RefObject<MapView | null>
}

/**
 * MapView con carga diferida para mejorar TTI (Time-To-Interactive).
 * - Espera a que las animaciones de navegación terminen antes de renderizar
 * - Muestra un placeholder mientras carga el componente del mapa
 *
 * @example
 * ```tsx
 * <LazyMapView
 *   mapRef={mapRef}
 *   style={{ flex: 1 }}
 *   provider={PROVIDER_GOOGLE}
 *   region={region}
 * >
 *   <Marker coordinate={position} />
 * </LazyMapView>
 * ```
 */
export function LazyMapView({
  loadingContainerStyle,
  mapRef,
  children,
  style,
  ...mapProps
}: LazyMapViewProps) {
  const isInteractionReady = useInteractionManager()

  // Placeholder mientras esperamos que termine la animación de navegación
  if (!isInteractionReady) {
    return (
      <View
        style={[
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F5F5F5',
          },
          style,
          loadingContainerStyle,
        ]}
      >
        <ActivityIndicator size="large" color={BRAND_COLORS.red} />
      </View>
    )
  }

  return (
    <Suspense
      fallback={
        <View
          style={[
            {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#F5F5F5',
            },
            style,
            loadingContainerStyle,
          ]}
        >
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      }
    >
      <LazyMap ref={mapRef} style={style} {...mapProps}>
        {children}
      </LazyMap>
    </Suspense>
  )
}
