import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps'
import { useNavigation } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { PickerModal, PickerOption } from '../../../../components/ui/PickerModal'
import { DatePickerModal } from '../../../../components/ui/DatePickerModal'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { MiniMapPreview } from '../../../../components/ui/MiniMapPreview'
import { BRAND_COLORS } from '../../../../shared/types'
import { RouteService, Vehicle } from '../../../../services/api/RouteService'
import { OrderListItem, OrderService } from '../../../../services/api/OrderService'
import { Zone, ZoneService } from '../../../../services/api/ZoneService'
import { UserProfile, UserService } from '../../../../services/api/UserService'
import { UserClientService } from '../../../../services/api/UserClientService'
import { showGlobalToast } from '../../../../utils/toastService'
import { extractPolygons, MapPoint } from '../../../../utils/zoneGeometry'
import { isUuid } from '../../../../utils/validators'

type Option = PickerOption

type StopMarker = {
  id: string
  latitude: number
  longitude: number
  label: string
  orden: number
  address?: string
}

const FALLBACK_REGION = {
  latitude: -0.1807,
  longitude: -78.4678,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
}

export function SupervisorRouteFormScreen() {
  const navigation = useNavigation<any>()

  const [fecha, setFecha] = React.useState('')
  const [zonaId, setZonaId] = React.useState<string | null>(null)
  const [vehiculoId, setVehiculoId] = React.useState<string | null>(null)
  const [transportistaId, setTransportistaId] = React.useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = React.useState<string[]>([])
  const [activeOrderId, setActiveOrderId] = React.useState<string | null>(null)
  const [zonePolygon, setZonePolygon] = React.useState<MapPoint[] | null>(null)
  const [mapMarkers, setMapMarkers] = React.useState<StopMarker[]>([])
  const mapRef = React.useRef<MapView | null>(null)
  const modalMapRef = React.useRef<MapView | null>(null)

  const [zones, setZones] = React.useState<Zone[]>([])
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [transportistas, setTransportistas] = React.useState<UserProfile[]>([])
  const [orders, setOrders] = React.useState<OrderListItem[]>([])
  const [orderClientMap, setOrderClientMap] = React.useState<Record<string, { name?: string; address?: string }>>({})

  const [loading, setLoading] = React.useState(false)
  const [loadingOrders, setLoadingOrders] = React.useState(false)


  const [showDatePicker, setShowDatePicker] = React.useState(false)
  const [showZonePicker, setShowZonePicker] = React.useState(false)
  const [showVehiclePicker, setShowVehiclePicker] = React.useState(false)
  const [showTransportistaPicker, setShowTransportistaPicker] = React.useState(false)
  const [showMapModal, setShowMapModal] = React.useState(false)

  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [zonesData, vehiclesData, usersData] = await Promise.all([
        ZoneService.getZones('activo'),
        RouteService.getVehicles('disponible'),
        UserService.getUsers(),
      ])
      setZones(zonesData)
      setVehicles(vehiclesData)
      setTransportistas(usersData.filter((user) => user.role.toLowerCase().includes('transportista')))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  React.useEffect(() => {
    const fetchOrders = async () => {
      if (!zonaId || !fecha) {
        setOrders([])
        setSelectedOrders([])
        setOrderClientMap({})
        return
      }
      setLoadingOrders(true)
      try {
        const data = await OrderService.getOrdersByZoneDate({
          zona_id: zonaId,
          fecha_entrega: fecha,
          estado: 'validado,aceptado_cliente',
        })
        setOrders(data)
      } finally {
        setLoadingOrders(false)
      }
    }
    fetchOrders()
  }, [zonaId, fecha])

  React.useEffect(() => {
    const loadClientsForOrders = async () => {
      if (orders.length === 0) {
        setOrderClientMap({})
        return
      }
      const entries = await Promise.all(
        orders.map(async (order) => {
          if (!order.cliente_id) return null
          const client = await UserClientService.getClient(order.cliente_id)
          if (!client) return null
          return [
            order.id,
            {
              name: client.nombre_comercial || client.ruc || undefined,
              address: client.direccion || undefined,
            },
          ] as const
        }),
      )
      const next: Record<string, { name?: string; address?: string }> = {}
      entries.forEach((entry) => {
        if (entry) {
          next[entry[0]] = entry[1]
        }
      })
      setOrderClientMap(next)
    }
    loadClientsForOrders()
  }, [orders])

  const zoneOptions: Option[] = zones.map((zone) => ({
    id: zone.id,
    label: zone.nombre || zone.codigo,
    description: zone.codigo,
    icon: 'map-outline',
    color: BRAND_COLORS.red,
  }))

  const vehicleOptions: Option[] = vehicles.map((vehicle) => ({
    id: vehicle.id,
    label: vehicle.placa,
    description: vehicle.modelo || `Capacidad: ${vehicle.capacidad_kg ?? 'N/D'} kg`,
    icon: 'car-sport-outline',
    color: BRAND_COLORS.red,
  }))

  const transportistaOptions: Option[] = transportistas.map((user) => ({
    id: user.id,
    label: user.name || user.email,
    description: user.codigoEmpleado || user.email,
    icon: 'person-outline',
    color: BRAND_COLORS.red,
  }))

  const toggleOrder = (orderId: string) => {
    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) {
        const next = prev.filter((id) => id !== orderId)
        if (activeOrderId === orderId) {
          setActiveOrderId(next[0] || null)
        }
        return next
      }
      const next = [...prev, orderId]
      setActiveOrderId(orderId)
      return next
    })
  }

  const moveOrder = (orderId: string, direction: 'up' | 'down') => {
    setSelectedOrders((prev) => {
      const index = prev.indexOf(orderId)
      if (index < 0) return prev
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      const [moved] = next.splice(index, 1)
      next.splice(target, 0, moved)
      return next
    })
  }

  const orderById = React.useMemo(() => {
    return orders.reduce<Record<string, OrderListItem>>((acc, order) => {
      acc[order.id] = order
      return acc
    }, {})
  }, [orders])

  const formatOrderLabel = (order: OrderListItem | undefined, orderId: string) => {
    if (order?.numero_pedido) return order.numero_pedido
    return `#${orderId.slice(0, 8)}`
  }

  const isAssignableOrder = (order?: OrderListItem) => {
    if (!order?.estado) return true
    return ['validado', 'aceptado_cliente'].includes(order.estado)
  }

  const handleCreate = async () => {
    if (!fecha) {
      showGlobalToast('Selecciona una fecha', 'warning')
      return
    }
    const normalizedFecha = fecha.includes('T') ? fecha : `${fecha}T00:00:00.000Z`
    if (!zonaId) {
      showGlobalToast('Selecciona una zona', 'warning')
      return
    }
    if (!isUuid(zonaId)) {
      showGlobalToast('La zona seleccionada no es valida', 'warning')
      return
    }
    if (!vehiculoId) {
      showGlobalToast('Selecciona un vehiculo', 'warning')
      return
    }
    if (!isUuid(vehiculoId)) {
      showGlobalToast('El vehiculo seleccionado no es valido', 'warning')
      return
    }
    if (!transportistaId) {
      showGlobalToast('Selecciona un transportista', 'warning')
      return
    }
    if (!isUuid(transportistaId)) {
      showGlobalToast('El transportista seleccionado no es valido', 'warning')
      return
    }
    if (selectedOrders.length === 0) {
      showGlobalToast('Selecciona al menos un pedido', 'warning')
      return
    }
    const invalidOrder = selectedOrders.find((orderId) => !isUuid(orderId))
    if (invalidOrder) {
      showGlobalToast('Hay pedidos seleccionados con ID invalido', 'warning')
      return
    }

    setLoading(true)
    try {
      const payload = {
        fecha_rutero: normalizedFecha,
        zona_id: zonaId,
        vehiculo_id: vehiculoId,
        transportista_id: transportistaId,
        paradas: selectedOrders.map((pedidoId, index) => ({
          pedido_id: pedidoId,
          orden_entrega: index + 1,
        })),
      }
      const created = await RouteService.createLogisticsRoute(payload)
      if (!created) {
        showGlobalToast('No se pudo crear el rutero', 'error')
        return
      }
      showGlobalToast('Rutero creado', 'success')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const selectedZone = zones.find((zone) => zone.id === zonaId)
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehiculoId)
  const selectedTransportista = transportistas.find((user) => user.id === transportistaId)

  React.useEffect(() => {
    let cancelled = false
    const loadZoneGeometry = async () => {
      if (!zonaId) {
        setZonePolygon(null)
        return
      }
      const zone = await ZoneService.getZoneById(zonaId)
      if (cancelled) return
      const polygons = extractPolygons((zone?.zonaGeom ?? zone?.zona_geom ?? null) as any)
      setZonePolygon(polygons[0] ?? null)
    }
    loadZoneGeometry()
    return () => {
      cancelled = true
    }
  }, [zonaId])

  React.useEffect(() => {
    const loadMarkers = async () => {
      if (!selectedOrders.length) {
        setMapMarkers([])
        return
      }
      const results = await Promise.all(
        selectedOrders.map(async (orderId, index) => {
          try {
            const order = orderById[orderId] || (await OrderService.getOrderById(orderId))
            const clienteId = order?.cliente_id
            if (!clienteId) return null
            const client = await UserClientService.getClient(clienteId)
            if (!client?.latitud || !client?.longitud) return null
            return {
              id: orderId,
              latitude: Number(client.latitud),
              longitude: Number(client.longitud),
              label: client.nombre_comercial || client.ruc || formatOrderLabel(order, orderId),
              orden: index + 1,
              address: client.direccion || '',
            } as StopMarker
          } catch {
            return null
          }
        }),
      )
      setMapMarkers(results.filter((item): item is StopMarker => Boolean(item)))
    }
    loadMarkers()
  }, [selectedOrders, orderById])

  React.useEffect(() => {
    if (!mapRef.current) return
    const coords: { latitude: number; longitude: number }[] = []
    if (zonePolygon?.length) {
      coords.push(...zonePolygon)
    }
    if (mapMarkers.length) {
      coords.push(...mapMarkers.map((m) => ({ latitude: m.latitude, longitude: m.longitude })))
    }
    if (!coords.length) return
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
      animated: true,
    })
  }, [zonePolygon, mapMarkers])

  React.useEffect(() => {
    if (!activeOrderId || !mapRef.current) return
    const marker = mapMarkers.find((item) => item.id === activeOrderId)
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
  }, [activeOrderId, mapMarkers])

  React.useEffect(() => {
    if (!showMapModal || !modalMapRef.current) return
    const coords: { latitude: number; longitude: number }[] = []
    if (zonePolygon?.length) {
      coords.push(...zonePolygon)
    }
    if (mapMarkers.length) {
      coords.push(...mapMarkers.map((m) => ({ latitude: m.latitude, longitude: m.longitude })))
    }
    if (!coords.length) return
    modalMapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    })
  }, [showMapModal, zonePolygon, mapMarkers])

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Nuevo rutero logistico"
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
      />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
          <Text className="text-sm font-semibold text-neutral-700 mb-3">Datos generales</Text>

          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="border border-neutral-200 rounded-2xl px-4 py-3 bg-neutral-50"
          >
            <Text className="text-xs text-neutral-500 font-semibold">Fecha de entrega</Text>
            <Text className="text-sm text-neutral-900 mt-1">
              {fecha || 'Seleccionar fecha'}
            </Text>
          </Pressable>

          <View className="mt-4">
            <Pressable
              onPress={() => setShowZonePicker(true)}
              className="border border-neutral-200 rounded-2xl px-4 py-3 bg-neutral-50"
            >
              <Text className="text-xs text-neutral-500 font-semibold">Zona</Text>
              <Text className="text-sm text-neutral-900 mt-1">
                {selectedZone ? selectedZone.nombre : 'Seleccionar zona'}
              </Text>
            </Pressable>
          </View>

          {selectedZone ? (
            <View className="mt-4">
              {zonePolygon ? (
                <MiniMapPreview polygon={zonePolygon} height={160} />
              ) : (
                <View className="border border-neutral-200 rounded-2xl px-4 py-4 bg-neutral-50">
                  <Text className="text-xs text-neutral-500">
                    Esta zona no tiene poligono configurado.
                  </Text>
                </View>
              )}
            </View>
          ) : null}

          <View className="mt-4">
            <Pressable
              onPress={() => setShowVehiclePicker(true)}
              className="border border-neutral-200 rounded-2xl px-4 py-3 bg-neutral-50"
            >
              <Text className="text-xs text-neutral-500 font-semibold">Vehiculo</Text>
              <Text className="text-sm text-neutral-900 mt-1">
                {selectedVehicle ? selectedVehicle.placa : 'Seleccionar vehiculo'}
              </Text>
            </Pressable>
          </View>

          <View className="mt-4">
            <Pressable
              onPress={() => setShowTransportistaPicker(true)}
              className="border border-neutral-200 rounded-2xl px-4 py-3 bg-neutral-50"
            >
              <Text className="text-xs text-neutral-500 font-semibold">Transportista</Text>
              <Text className="text-sm text-neutral-900 mt-1">
                {selectedTransportista ? selectedTransportista.name : 'Seleccionar transportista'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-700">Pedidos disponibles</Text>
            <Text className="text-xs text-neutral-500">{selectedOrders.length} seleccionados</Text>
          </View>

          {loadingOrders ? (
            <View className="items-center py-6">
              <ActivityIndicator size="small" color={BRAND_COLORS.red} />
              <Text className="text-xs text-neutral-500 mt-2">Cargando pedidos...</Text>
            </View>
          ) : orders.length === 0 ? (
            <Text className="text-xs text-neutral-500 mt-3">
              Selecciona zona y fecha para ver pedidos validados.
            </Text>
          ) : (
            <View className="mt-3 gap-3">
              {orders.map((order) => {
                const isSelected = selectedOrders.includes(order.id)
                const isAssignable = isAssignableOrder(order)
                const label = formatOrderLabel(order, order.id)
                const clientInfo = orderClientMap[order.id]
                return (
                  <Pressable
                    key={order.id}
                    onPress={() => {
                      if (!isAssignable) {
                        showGlobalToast('Pedido ya asignado o no disponible', 'warning')
                        return
                      }
                      toggleOrder(order.id)
                    }}
                    className={`rounded-2xl border px-4 py-3 ${
                      isSelected ? 'border-brand-red bg-red-50' : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <Text className="text-xs text-neutral-500">Pedido</Text>
                    <Text className="text-sm font-semibold text-neutral-900">
                      {label}
                    </Text>
                    {clientInfo?.name ? (
                      <Text className="text-xs text-neutral-600 mt-1">Cliente: {clientInfo.name}</Text>
                    ) : order.cliente_id ? (
                      <Text className="text-xs text-neutral-500 mt-1">
                        Cliente: {order.cliente_id.slice(0, 8)}
                      </Text>
                    ) : null}
                    {clientInfo?.address ? (
                      <Text className="text-xs text-neutral-500 mt-1">
                        Direccion: {clientInfo.address}
                      </Text>
                    ) : null}
                    <Text className="text-xs text-neutral-500 mt-1">
                      Total: USD {(Number(order.total ?? 0)).toFixed(2)}
                    </Text>
                    {!isAssignable ? (
                      <Text className="text-[11px] text-amber-700 mt-2">
                        Estado: {order.estado?.replace(/_/g, ' ')} (no disponible)
                      </Text>
                    ) : null}
                    {isSelected ? (
                      <Text className="text-[11px] text-brand-red mt-2">Orden #{selectedOrders.indexOf(order.id) + 1}</Text>
                    ) : null}
                  </Pressable>
                )
              })}
            </View>
          )}
        </View>

        {selectedOrders.length > 0 ? (
          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <Text className="text-sm font-semibold text-neutral-700">Orden de entrega</Text>
            <Text className="text-xs text-neutral-500 mt-1">
              Usa subir/bajar para ajustar el orden. Este orden define la ruta.
            </Text>
            <View className="mt-3 gap-3">
              {selectedOrders.map((orderId, index) => {
                const order = orderById[orderId]
                const label = formatOrderLabel(order, orderId)
                return (
                  <View key={orderId} className="rounded-2xl border border-neutral-200 px-3 py-2 bg-white">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-xs text-neutral-500">#{index + 1}</Text>
                        <Text className="text-sm font-semibold text-neutral-900">{label}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Pressable
                          onPress={() => moveOrder(orderId, 'up')}
                          disabled={index === 0}
                          className={`px-3 py-2 rounded-xl border ${index === 0 ? 'border-neutral-200' : 'border-amber-200 bg-amber-50'}`}
                        >
                          <Text className={`text-xs font-semibold ${index === 0 ? 'text-neutral-300' : 'text-amber-700'}`}>Subir</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => moveOrder(orderId, 'down')}
                          disabled={index === selectedOrders.length - 1}
                          className={`ml-2 px-3 py-2 rounded-xl border ${index === selectedOrders.length - 1 ? 'border-neutral-200' : 'border-amber-200 bg-amber-50'}`}
                        >
                          <Text className={`text-xs font-semibold ${index === selectedOrders.length - 1 ? 'text-neutral-300' : 'text-amber-700'}`}>Bajar</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        ) : null}

        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-700">Mapa de paradas</Text>
            <Pressable onPress={() => setShowMapModal(true)} className="px-3 py-1 rounded-full bg-red-50">
              <Text className="text-xs font-semibold text-brand-red">Ampliar</Text>
            </Pressable>
          </View>
          <View className="mt-3 rounded-2xl overflow-hidden border border-neutral-200" style={{ height: 220 }}>
            <MapView
              ref={(ref) => { mapRef.current = ref }}
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
              {mapMarkers.map((marker) => (
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
          {mapMarkers.length === 0 ? (
            <Text className="text-xs text-neutral-500 mt-3">
              Selecciona pedidos con coordenadas para ver el mapa.
            </Text>
          ) : null}
        </View>

        <View className="mt-6">
          <PrimaryButton title={loading ? 'Creando...' : 'Crear rutero'} onPress={handleCreate} disabled={loading} />
        </View>
      </ScrollView>

      <DatePickerModal
        visible={showDatePicker}
        title="Fecha de entrega"
        infoText="Selecciona la fecha para planificar entregas"
        initialDate={fecha || undefined}
        onSelectDate={setFecha}
        onClose={() => setShowDatePicker(false)}
      />

      <PickerModal
        visible={showZonePicker}
        title="Seleccionar zona"
        options={zoneOptions}
        selectedId={zonaId || undefined}
        onSelect={(id) => {
          setZonaId(String(id))
          setShowZonePicker(false)
        }}
        onClose={() => setShowZonePicker(false)}
        infoText="Solo zonas activas"
        infoIcon="map-outline"
        infoColor={BRAND_COLORS.red}
      />

      <PickerModal
        visible={showVehiclePicker}
        title="Seleccionar vehiculo"
        options={vehicleOptions}
        selectedId={vehiculoId || undefined}
        onSelect={(id) => {
          setVehiculoId(id)
          setShowVehiclePicker(false)
        }}
        onClose={() => setShowVehiclePicker(false)}
        infoText="Solo vehiculos disponibles"
        infoIcon="car-sport-outline"
        infoColor={BRAND_COLORS.red}
      />

      <PickerModal
        visible={showTransportistaPicker}
        title="Seleccionar transportista"
        options={transportistaOptions}
        selectedId={transportistaId || undefined}
        onSelect={(id) => {
          setTransportistaId(id)
          setShowTransportistaPicker(false)
        }}
        onClose={() => setShowTransportistaPicker(false)}
        infoText="Transportistas activos"
        infoIcon="person-outline"
        infoColor={BRAND_COLORS.red}
      />

      <GenericModal
        visible={showMapModal}
        title="Mapa de paradas"
        onClose={() => setShowMapModal(false)}
      >
        <View className="rounded-2xl overflow-hidden border border-neutral-200" style={{ height: 360 }}>
          <MapView
            ref={(ref) => { modalMapRef.current = ref }}
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
            {mapMarkers.map((marker) => (
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
    </View>
  )
}
