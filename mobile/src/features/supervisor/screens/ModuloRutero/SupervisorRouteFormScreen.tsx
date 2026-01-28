import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { PickerModal, PickerOption } from '../../../../components/ui/PickerModal'
import { DatePickerModal } from '../../../../components/ui/DatePickerModal'
import { MiniMapPreview } from '../../../../components/ui/MiniMapPreview'
import { BRAND_COLORS } from '../../../../shared/types'
import { RouteService, Vehicle } from '../../../../services/api/RouteService'
import { OrderListItem, OrderService } from '../../../../services/api/OrderService'
import { Zone, ZoneService } from '../../../../services/api/ZoneService'
import { UserProfile, UserService } from '../../../../services/api/UserService'
import { showGlobalToast } from '../../../../utils/toastService'
import { extractPolygons, MapPoint } from '../../../../utils/zoneGeometry'

type Option = PickerOption

export function SupervisorRouteFormScreen() {
  const navigation = useNavigation<any>()

  const [fecha, setFecha] = React.useState('')
  const [zonaId, setZonaId] = React.useState<string | null>(null)
  const [vehiculoId, setVehiculoId] = React.useState<string | null>(null)
  const [transportistaId, setTransportistaId] = React.useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = React.useState<string[]>([])
  const [zonePolygon, setZonePolygon] = React.useState<MapPoint[] | null>(null)

  const [zones, setZones] = React.useState<Zone[]>([])
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [transportistas, setTransportistas] = React.useState<UserProfile[]>([])
  const [orders, setOrders] = React.useState<OrderListItem[]>([])

  const [loading, setLoading] = React.useState(false)
  const [loadingOrders, setLoadingOrders] = React.useState(false)

  const [showDatePicker, setShowDatePicker] = React.useState(false)
  const [showZonePicker, setShowZonePicker] = React.useState(false)
  const [showVehiclePicker, setShowVehiclePicker] = React.useState(false)
  const [showTransportistaPicker, setShowTransportistaPicker] = React.useState(false)

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
        return prev.filter((id) => id !== orderId)
      }
      return [...prev, orderId]
    })
  }

  const handleCreate = async () => {
    if (!fecha) {
      showGlobalToast('Selecciona una fecha', 'warning')
      return
    }
    if (!zonaId) {
      showGlobalToast('Selecciona una zona', 'warning')
      return
    }
    if (!vehiculoId) {
      showGlobalToast('Selecciona un vehiculo', 'warning')
      return
    }
    if (!transportistaId) {
      showGlobalToast('Selecciona un transportista', 'warning')
      return
    }
    if (selectedOrders.length === 0) {
      showGlobalToast('Selecciona al menos un pedido', 'warning')
      return
    }

    setLoading(true)
    try {
      const payload = {
        fecha_rutero: fecha,
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
    if (!selectedZone) {
      setZonePolygon(null)
      return
    }
    const polygons = extractPolygons(selectedZone.zonaGeom ?? selectedZone.zona_geom ?? null)
    setZonePolygon(polygons[0] ?? null)
  }, [selectedZone])

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Nuevo rutero logístico"
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
                    Esta zona no tiene polígono configurado.
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
                return (
                  <Pressable
                    key={order.id}
                    onPress={() => toggleOrder(order.id)}
                    className={`rounded-2xl border px-4 py-3 ${isSelected ? 'border-brand-red bg-red-50' : 'border-neutral-200 bg-white'}`}
                  >
                    <Text className="text-xs text-neutral-500">Pedido</Text>
                    <Text className="text-sm font-semibold text-neutral-900">
                      #{order.numero_pedido || order.id.slice(0, 8)}
                    </Text>
                    <Text className="text-xs text-neutral-500 mt-1">
                      Total: USD {(Number(order.total ?? 0)).toFixed(2)}
                    </Text>
                    {isSelected ? (
                      <Text className="text-[11px] text-brand-red mt-2">Orden #{selectedOrders.indexOf(order.id) + 1}</Text>
                    ) : null}
                  </Pressable>
                )
              })}
            </View>
          )}
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
          setZonaId(id)
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
    </View>
  )
}
