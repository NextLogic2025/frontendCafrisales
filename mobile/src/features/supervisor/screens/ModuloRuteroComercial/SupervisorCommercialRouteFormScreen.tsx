import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps'
import { useNavigation } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { PickerModal, PickerOption } from '../../../../components/ui/PickerModal'
import { DatePickerModal } from '../../../../components/ui/DatePickerModal'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { BRAND_COLORS } from '../../../../shared/types'
import { RouteService } from '../../../../services/api/RouteService'
import { Zone, ZoneService } from '../../../../services/api/ZoneService'
import { UserProfile, UserService } from '../../../../services/api/UserService'
import { UserClient, UserClientService } from '../../../../services/api/UserClientService'
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

export function SupervisorCommercialRouteFormScreen() {
  const navigation = useNavigation<any>()

  const [fecha, setFecha] = React.useState('')
  const [zonaId, setZonaId] = React.useState<string | null>(null)
  const [vendedorId, setVendedorId] = React.useState<string | null>(null)
  const [selectedClients, setSelectedClients] = React.useState<string[]>([])
  const [clientObjectives, setClientObjectives] = React.useState<Record<string, string>>({})

  const [zones, setZones] = React.useState<Zone[]>([])
  const [vendors, setVendors] = React.useState<UserProfile[]>([])
  const [clients, setClients] = React.useState<UserClient[]>([])
  const [loading, setLoading] = React.useState(false)
  const [loadingClients, setLoadingClients] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [zonePolygon, setZonePolygon] = React.useState<MapPoint[] | null>(null)
  const [mapMarkers, setMapMarkers] = React.useState<StopMarker[]>([])
  const mapRef = React.useRef<MapView | null>(null)
  const modalMapRef = React.useRef<MapView | null>(null)

  const [showDatePicker, setShowDatePicker] = React.useState(false)
  const [showZonePicker, setShowZonePicker] = React.useState(false)
  const [showVendorPicker, setShowVendorPicker] = React.useState(false)
  const [showMapModal, setShowMapModal] = React.useState(false)

  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [zonesData, vendorData] = await Promise.all([
        ZoneService.getZones('activo'),
        UserService.getVendors(),
      ])
      setZones(zonesData)
      setVendors(vendorData)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  React.useEffect(() => {
    const loadClients = async () => {
      if (!vendedorId) {
        setClients([])
        setSelectedClients([])
        setClientObjectives({})
        return
      }
      setLoadingClients(true)
      try {
        const data = await UserClientService.getClientsByVendedor(vendedorId)
        setClients(data)
      } finally {
        setLoadingClients(false)
      }
    }
    loadClients()
  }, [vendedorId])

  const zoneOptions: Option[] = zones.map((zone) => ({
    id: zone.id,
    label: zone.nombre || zone.codigo,
    description: zone.codigo,
    icon: 'map-outline',
    color: BRAND_COLORS.red,
  }))

  const vendorOptions: Option[] = vendors.map((user) => ({
    id: user.id,
    label: user.name || user.email,
    description: user.codigoEmpleado || user.email,
    icon: 'person-outline',
    color: BRAND_COLORS.red,
  }))

  const toggleClient = (clientId: string) => {
    setSelectedClients((prev) => {
      if (prev.includes(clientId)) {
        const next = prev.filter((id) => id !== clientId)
        return next
      }
      return [...prev, clientId]
    })
  }

  const moveClient = (clientId: string, direction: 'up' | 'down') => {
    setSelectedClients((prev) => {
      const index = prev.indexOf(clientId)
      if (index < 0) return prev
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      const [moved] = next.splice(index, 1)
      next.splice(target, 0, moved)
      return next
    })
  }

  const filteredClients = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return clients
    return clients.filter((client) => {
      return (
        client.nombre_comercial?.toLowerCase().includes(query) ||
        client.ruc?.toLowerCase().includes(query) ||
        client.direccion?.toLowerCase().includes(query)
      )
    })
  }, [clients, searchQuery])

  const handleCreate = async () => {
    if (!fecha) {
      showGlobalToast('Selecciona una fecha', 'warning')
      return
    }
    const normalizedFecha = fecha.includes('T') ? fecha : `${fecha}T00:00:00.000Z`
    if (!zonaId || !isUuid(zonaId)) {
      showGlobalToast('Selecciona una zona valida', 'warning')
      return
    }
    if (!vendedorId || !isUuid(vendedorId)) {
      showGlobalToast('Selecciona un vendedor valido', 'warning')
      return
    }
    if (selectedClients.length === 0) {
      showGlobalToast('Selecciona al menos un cliente', 'warning')
      return
    }

    setLoading(true)
    try {
      const payload = {
        fecha_rutero: normalizedFecha,
        zona_id: zonaId,
        vendedor_id: vendedorId,
        paradas: selectedClients.map((clienteId, index) => ({
          cliente_id: clienteId,
          orden_visita: index + 1,
          objetivo: clientObjectives[clienteId]?.trim() || undefined,
        })),
      }
      const created = await RouteService.createCommercialRoute(payload)
      if (!created) {
        showGlobalToast('No se pudo crear el rutero', 'error')
        return
      }
      showGlobalToast('Rutero comercial creado', 'success')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }

  const selectedZone = zones.find((zone) => zone.id === zonaId)
  const selectedVendor = vendors.find((user) => user.id === vendedorId)

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
    const markers = selectedClients
      .map((clientId, index) => {
        const client = clients.find((item) => item.usuario_id === clientId)
        if (!client?.latitud || !client?.longitud) return null
        return {
          id: clientId,
          latitude: Number(client.latitud),
          longitude: Number(client.longitud),
          label: client.nombre_comercial || client.ruc || clientId.slice(0, 8),
          orden: index + 1,
          address: client.direccion || undefined,
        } as StopMarker
      })
      .filter((item): item is StopMarker => Boolean(item))
    setMapMarkers(markers)
  }, [selectedClients, clients])

  React.useEffect(() => {
    if (!mapRef.current) return
    const coords: { latitude: number; longitude: number }[] = []
    if (zonePolygon?.length) coords.push(...zonePolygon)
    if (mapMarkers.length) coords.push(...mapMarkers.map((m) => ({ latitude: m.latitude, longitude: m.longitude })))
    if (!coords.length) return
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
      animated: true,
    })
  }, [zonePolygon, mapMarkers])

  React.useEffect(() => {
    if (!showMapModal || !modalMapRef.current) return
    const coords: { latitude: number; longitude: number }[] = []
    if (zonePolygon?.length) coords.push(...zonePolygon)
    if (mapMarkers.length) coords.push(...mapMarkers.map((m) => ({ latitude: m.latitude, longitude: m.longitude })))
    if (!coords.length) return
    modalMapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    })
  }, [showMapModal, zonePolygon, mapMarkers])

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Nuevo rutero comercial"
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
            <Text className="text-xs text-neutral-500 font-semibold">Fecha del rutero</Text>
            <Text className="text-sm text-neutral-900 mt-1">{fecha || 'Seleccionar fecha'}</Text>
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

          <View className="mt-4">
            <Pressable
              onPress={() => setShowVendorPicker(true)}
              className="border border-neutral-200 rounded-2xl px-4 py-3 bg-neutral-50"
            >
              <Text className="text-xs text-neutral-500 font-semibold">Vendedor</Text>
              <Text className="text-sm text-neutral-900 mt-1">
                {selectedVendor ? selectedVendor.name : 'Seleccionar vendedor'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-700">Clientes disponibles</Text>
            <Text className="text-xs text-neutral-500">{selectedClients.length} seleccionados</Text>
          </View>

          <View className="mt-3">
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar cliente..."
              onClear={() => setSearchQuery('')}
            />
          </View>

          {loadingClients ? (
            <View className="items-center py-6">
              <ActivityIndicator size="small" color={BRAND_COLORS.red} />
              <Text className="text-xs text-neutral-500 mt-2">Cargando clientes...</Text>
            </View>
          ) : filteredClients.length === 0 ? (
            <Text className="text-xs text-neutral-500 mt-3">
              Selecciona un vendedor para ver sus clientes.
            </Text>
          ) : (
            <View className="mt-3 gap-3">
              {filteredClients.map((client) => {
                const isSelected = selectedClients.includes(client.usuario_id)
                return (
                  <Pressable
                    key={client.usuario_id}
                    onPress={() => toggleClient(client.usuario_id)}
                    className={`rounded-2xl border px-4 py-3 ${isSelected ? 'border-brand-red bg-red-50' : 'border-neutral-200 bg-white'}`}
                  >
                    <Text className="text-xs text-neutral-500">Cliente</Text>
                    <Text className="text-sm font-semibold text-neutral-900">{client.nombre_comercial}</Text>
                    {client.direccion ? (
                      <Text className="text-xs text-neutral-500 mt-1">Direccion: {client.direccion}</Text>
                    ) : null}
                    {isSelected ? (
                      <Text className="text-[11px] text-brand-red mt-2">Orden #{selectedClients.indexOf(client.usuario_id) + 1}</Text>
                    ) : null}
                  </Pressable>
                )
              })}
            </View>
          )}
        </View>

        {selectedClients.length > 0 ? (
          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <Text className="text-sm font-semibold text-neutral-700">Orden y objetivo</Text>
            <Text className="text-xs text-neutral-500 mt-1">
              Ajusta el orden de visita y agrega un objetivo si aplica.
            </Text>
            <View className="mt-3 gap-3">
              {selectedClients.map((clientId, index) => {
                const client = clients.find((item) => item.usuario_id === clientId)
                return (
                  <View key={clientId} className="rounded-2xl border border-neutral-200 px-3 py-3 bg-white">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-xs text-neutral-500">#{index + 1}</Text>
                        <Text className="text-sm font-semibold text-neutral-900">
                          {client?.nombre_comercial || clientId.slice(0, 8)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Pressable
                          onPress={() => moveClient(clientId, 'up')}
                          disabled={index === 0}
                          className={`px-3 py-2 rounded-xl border ${index === 0 ? 'border-neutral-200' : 'border-amber-200 bg-amber-50'}`}
                        >
                          <Text className={`text-xs font-semibold ${index === 0 ? 'text-neutral-300' : 'text-amber-700'}`}>Subir</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => moveClient(clientId, 'down')}
                          disabled={index === selectedClients.length - 1}
                          className={`ml-2 px-3 py-2 rounded-xl border ${index === selectedClients.length - 1 ? 'border-neutral-200' : 'border-amber-200 bg-amber-50'}`}
                        >
                          <Text className={`text-xs font-semibold ${index === selectedClients.length - 1 ? 'text-neutral-300' : 'text-amber-700'}`}>Bajar</Text>
                        </Pressable>
                      </View>
                    </View>
                    <View className="mt-3">
                      <Text className="text-xs text-neutral-500 mb-1">Objetivo (opcional)</Text>
                      <TextInput
                        value={clientObjectives[clientId] || ''}
                        onChangeText={(value) =>
                          setClientObjectives((prev) => ({ ...prev, [clientId]: value }))
                        }
                        placeholder="Ej: Cobranza, seguimiento, nuevo pedido"
                        className="border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 bg-neutral-50"
                      />
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        ) : null}

        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-700">Mapa de visitas</Text>
            <Pressable onPress={() => setShowMapModal(true)} className="px-3 py-1 rounded-full bg-red-50">
              <Text className="text-xs font-semibold text-brand-red">Ampliar</Text>
            </Pressable>
          </View>
          <View className="mt-3 rounded-2xl overflow-hidden border border-neutral-200" style={{ height: 240 }}>
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
              Selecciona clientes con coordenadas para ver el mapa.
            </Text>
          ) : null}
        </View>

        <View className="mt-6">
          <PrimaryButton title={loading ? 'Creando...' : 'Crear rutero'} onPress={handleCreate} disabled={loading} />
        </View>
      </ScrollView>

      <DatePickerModal
        visible={showDatePicker}
        title="Fecha del rutero"
        infoText="Selecciona la fecha para las visitas"
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
          setZonaId(id)
          setShowZonePicker(false)
        }}
        onClose={() => setShowZonePicker(false)}
        infoText="Solo zonas activas"
        infoIcon="map-outline"
        infoColor={BRAND_COLORS.red}
      />

      <PickerModal
        visible={showVendorPicker}
        title="Seleccionar vendedor"
        options={vendorOptions}
        selectedId={vendedorId || undefined}
        onSelect={(id) => {
          setVendedorId(id)
          setShowVendorPicker(false)
        }}
        onClose={() => setShowVendorPicker(false)}
        infoText="Vendedores activos"
        infoIcon="person-outline"
        infoColor={BRAND_COLORS.red}
      />

      <GenericModal
        visible={showMapModal}
        title="Mapa de visitas"
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
