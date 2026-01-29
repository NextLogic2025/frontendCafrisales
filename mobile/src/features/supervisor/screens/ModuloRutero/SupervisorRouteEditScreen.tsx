import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { PickerModal, PickerOption } from '../../../../components/ui/PickerModal'
import { MiniMapPreview } from '../../../../components/ui/MiniMapPreview'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { RouteService, LogisticRoute, Vehicle } from '../../../../services/api/RouteService'
import { OrderListItem, OrderService } from '../../../../services/api/OrderService'
import { Zone, ZoneService } from '../../../../services/api/ZoneService'
import { UserClientService } from '../../../../services/api/UserClientService'
import { showGlobalToast } from '../../../../utils/toastService'
import { extractPolygons, MapPoint } from '../../../../utils/zoneGeometry'

type Option = PickerOption

export function SupervisorRouteEditScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const ruteroId = route.params?.ruteroId as string | undefined

  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [rutero, setRutero] = React.useState<LogisticRoute | null>(null)
  const [zona, setZona] = React.useState<Zone | null>(null)
  const [zonePolygon, setZonePolygon] = React.useState<MapPoint[] | null>(null)
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [vehiculoId, setVehiculoId] = React.useState<string | null>(null)
  const [showVehiclePicker, setShowVehiclePicker] = React.useState(false)

  const [orders, setOrders] = React.useState<OrderListItem[]>([])
  const [selectedOrders, setSelectedOrders] = React.useState<string[]>([])
  const [orderClientMap, setOrderClientMap] = React.useState<Record<string, { name?: string; address?: string }>>({})
  const initialOrdersRef = React.useRef<string[]>([])

  const loadRutero = React.useCallback(async () => {
    if (!ruteroId) return
    setLoading(true)
    try {
      const data = await RouteService.getLogisticsRoute(ruteroId)
      setRutero(data)
      const stops = (data?.paradas || []).slice().sort((a, b) => a.orden_entrega - b.orden_entrega)
      const stopIds = stops.map((stop) => stop.pedido_id)
      setSelectedOrders(stopIds)
      initialOrdersRef.current = stopIds
      setVehiculoId(data?.vehiculo_id ?? null)
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
        setZona(null)
        setZonePolygon(null)
        return
      }
      const data = await ZoneService.getZoneById(rutero.zona_id)
      setZona(data)
      const polygons = extractPolygons(data?.zonaGeom ?? data?.zona_geom ?? null)
      setZonePolygon(polygons[0] ?? null)
    }
    loadZone()
  }, [rutero?.zona_id])

  React.useEffect(() => {
    const loadVehicles = async () => {
      const data = await RouteService.getVehicles('disponible')
      if (rutero?.vehiculo_id && !data.find((v) => v.id === rutero.vehiculo_id)) {
        const current = await RouteService.getVehicle(rutero.vehiculo_id)
        if (current) {
          setVehicles([current, ...data])
          return
        }
      }
      setVehicles(data)
    }
    loadVehicles()
  }, [rutero?.vehiculo_id])

  React.useEffect(() => {
    const fetchOrders = async () => {
      if (!rutero?.zona_id || !rutero?.fecha_rutero) {
        setOrders([])
        setOrderClientMap({})
        return
      }
      const fecha = rutero.fecha_rutero.slice(0, 10)
      const data = await OrderService.getOrdersByZoneDate({
        zona_id: rutero.zona_id,
        fecha_entrega: fecha,
        estado: 'validado,aceptado_cliente',
      })
      setOrders(data)
    }
    fetchOrders()
  }, [rutero?.zona_id, rutero?.fecha_rutero])

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
              name: client.nombre_comercial || client.razon_social || client.ruc || undefined,
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

  const orderById = React.useMemo(() => {
    return orders.reduce<Record<string, OrderListItem>>((acc, order) => {
      acc[order.id] = order
      return acc
    }, {})
  }, [orders])

  const vehicleOptions: Option[] = vehicles.map((vehicle) => ({
    id: vehicle.id,
    label: vehicle.placa,
    description: vehicle.modelo || `Capacidad: ${vehicle.capacidad_kg ?? 'N/D'} kg`,
    icon: 'car-sport-outline',
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

  const formatOrderLabel = (order: OrderListItem | undefined, orderId: string) => {
    if (order?.numero_pedido) return order.numero_pedido
    return `#${orderId.slice(0, 8)}`
  }

  const handleSave = async () => {
    if (!ruteroId || !rutero) return
    if (rutero.estado !== 'borrador') {
      showGlobalToast('Solo puedes editar ruteros en borrador', 'warning')
      return
    }
    if (!vehiculoId) {
      showGlobalToast('Selecciona un vehiculo', 'warning')
      return
    }
    if (selectedOrders.length === 0) {
      showGlobalToast('Selecciona al menos un pedido', 'warning')
      return
    }

    setSaving(true)
    try {
      if (vehiculoId !== rutero.vehiculo_id) {
        const updated = await RouteService.updateLogisticsRouteVehicle(ruteroId, vehiculoId)
        if (!updated) {
          showGlobalToast('No se pudo actualizar el vehiculo', 'error')
          return
        }
      }

      const current = initialOrdersRef.current
      const changed =
        current.length !== selectedOrders.length ||
        current.some((id, index) => id !== selectedOrders[index])

      if (changed) {
        for (const pedidoId of current) {
          await RouteService.removeLogisticsRouteOrder(ruteroId, pedidoId)
        }
        for (const [index, pedidoId] of selectedOrders.entries()) {
          await RouteService.addLogisticsRouteOrder(ruteroId, {
            pedido_id: pedidoId,
            orden_entrega: index + 1,
          })
        }
      }

      showGlobalToast('Rutero actualizado', 'success')
      navigation.goBack()
    } finally {
      setSaving(false)
    }
  }

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehiculoId)

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Editar rutero"
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
          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
            <Text className="text-sm font-semibold text-neutral-700">Datos del rutero</Text>
            <View className="mt-3">
              <Text className="text-xs text-neutral-500">Fecha</Text>
              <Text className="text-sm font-semibold text-neutral-900 mt-1">
                {rutero?.fecha_rutero?.slice(0, 10) || '---'}
              </Text>
            </View>
            <View className="mt-3">
              <Text className="text-xs text-neutral-500">Zona</Text>
              <Text className="text-sm font-semibold text-neutral-900 mt-1">
                {zona?.nombre || rutero?.zona_id || 'N/D'}
              </Text>
            </View>
            {zonePolygon ? (
              <View className="mt-3">
                <MiniMapPreview polygon={zonePolygon} height={140} />
              </View>
            ) : null}
          </View>

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <Text className="text-sm font-semibold text-neutral-700">Vehiculo</Text>
            <Pressable
              onPress={() => setShowVehiclePicker(true)}
              className="mt-3 border border-neutral-200 rounded-2xl px-4 py-3 bg-neutral-50"
            >
              <Text className="text-xs text-neutral-500 font-semibold">Vehiculo asignado</Text>
              <Text className="text-sm text-neutral-900 mt-1">
                {selectedVehicle ? selectedVehicle.placa : 'Seleccionar vehiculo'}
              </Text>
            </Pressable>
          </View>

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <Text className="text-sm font-semibold text-neutral-700">Pedidos disponibles</Text>
            {orders.length === 0 ? (
              <Text className="text-xs text-neutral-500 mt-3">
                No hay pedidos validados para esta zona y fecha.
              </Text>
            ) : (
              <View className="mt-3 gap-3">
                {orders.map((order) => {
                  const isSelected = selectedOrders.includes(order.id)
                  const label = formatOrderLabel(order, order.id)
                  const clientInfo = orderClientMap[order.id]
                  return (
                    <Pressable
                      key={order.id}
                      onPress={() => toggleOrder(order.id)}
                      className={`rounded-2xl border px-4 py-3 ${isSelected ? 'border-brand-red bg-red-50' : 'border-neutral-200 bg-white'}`}
                    >
                      <Text className="text-xs text-neutral-500">Pedido</Text>
                      <Text className="text-sm font-semibold text-neutral-900">{label}</Text>
                      {clientInfo?.name ? (
                        <Text className="text-xs text-neutral-600 mt-1">Cliente: {clientInfo.name}</Text>
                      ) : order.cliente_id ? (
                        <Text className="text-xs text-neutral-500 mt-1">Cliente: {order.cliente_id.slice(0, 8)}</Text>
                      ) : null}
                      {clientInfo?.address ? (
                        <Text className="text-xs text-neutral-500 mt-1">Direccion: {clientInfo.address}</Text>
                      ) : null}
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

          {selectedOrders.length > 0 ? (
            <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
              <Text className="text-sm font-semibold text-neutral-700">Orden de entrega</Text>
              <Text className="text-xs text-neutral-500 mt-1">
                Ajusta el orden antes de guardar.
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

          <View className="mt-6">
            <PrimaryButton title={saving ? 'Guardando...' : 'Guardar cambios'} onPress={handleSave} disabled={saving} />
          </View>
        </ScrollView>
      )}

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
    </View>
  )
}
