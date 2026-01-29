import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { RouteService, LogisticRoute } from '../../../../services/api/RouteService'
import { OrderResponse, OrderService } from '../../../../services/api/OrderService'
import { UserProfile, UserService } from '../../../../services/api/UserService'
import { UserClientService } from '../../../../services/api/UserClientService'
import { showGlobalToast } from '../../../../utils/toastService'
import { Zone, ZoneService } from '../../../../services/api/ZoneService'
import { MiniMapPreview } from '../../../../components/ui/MiniMapPreview'
import { extractPolygons, MapPoint } from '../../../../utils/zoneGeometry'

export function SupervisorRouteDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const ruteroId = route.params?.ruteroId as string | undefined

  const [loading, setLoading] = React.useState(false)
  const [rutero, setRutero] = React.useState<LogisticRoute | null>(null)
  const [transportistas, setTransportistas] = React.useState<UserProfile[]>([])
  const [zona, setZona] = React.useState<Zone | null>(null)
  const [zonePolygon, setZonePolygon] = React.useState<MapPoint[] | null>(null)
  const [updating, setUpdating] = React.useState(false)
  const [orderSummaryMap, setOrderSummaryMap] = React.useState<Record<string, OrderResponse>>({})
  const [clientNameMap, setClientNameMap] = React.useState<Record<string, string>>({})

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

  const loadTransportistas = React.useCallback(async () => {
    const users = await UserService.getUsers()
    setTransportistas(users.filter((user) => user.role.toLowerCase().includes('transportista')))
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadRutero()
      loadTransportistas()
    }, [loadRutero, loadTransportistas]),
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
    const loadOrders = async () => {
      const stops = rutero?.paradas || []
      if (stops.length === 0) {
        setOrderSummaryMap({})
        setClientNameMap({})
        return
      }
      const results = await Promise.all(
        stops.map(async (stop) => {
          const order = await OrderService.getOrderById(stop.pedido_id)
          let clientName = ''
          if (order?.cliente_id) {
            const client = await UserClientService.getClient(order.cliente_id)
            clientName = client?.nombre_comercial || client?.razon_social || client?.ruc || ''
          }
          return order ? { orderId: stop.pedido_id, order, clientName } : null
        })
      )
      const next: Record<string, OrderResponse> = {}
      const clientNext: Record<string, string> = {}
      results.forEach((entry) => {
        if (entry) {
          next[entry.orderId] = entry.order
          if (entry.clientName) {
            clientNext[entry.orderId] = entry.clientName
          }
        }
      })
      setOrderSummaryMap(next)
      setClientNameMap(clientNext)
    }
    loadOrders()
  }, [rutero?.paradas])

  const transportista = transportistas.find((user) => user.id === rutero?.transportista_id)

  const handlePublish = async () => {
    if (!ruteroId) return
    setUpdating(true)
    try {
      const updated = await RouteService.publishLogisticsRoute(ruteroId)
      if (!updated) {
        showGlobalToast('No se pudo publicar el rutero', 'error')
        return
      }
      showGlobalToast('Rutero publicado', 'success')
      setRutero(updated)
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = async () => {
    if (!ruteroId) return
    setUpdating(true)
    try {
      const updated = await RouteService.cancelLogisticsRoute(ruteroId, 'Rutero cancelado por supervisor')
      if (!updated) {
        showGlobalToast('No se pudo cancelar el rutero', 'error')
        return
      }
      showGlobalToast('Rutero cancelado', 'success')
      setRutero(updated)
    } finally {
      setUpdating(false)
    }
  }

  const estado = rutero?.estado || 'borrador'
  const paradas = rutero?.paradas || []
  const vehiculoDisponible = rutero?.vehiculo?.estado ? rutero.vehiculo.estado === 'disponible' : true
  const canPublish = estado === 'borrador' && paradas.length > 0 && vehiculoDisponible
  const canEdit = estado === 'borrador'

  const openHistory = () => {
    if (!ruteroId) return
    navigation.navigate('SupervisorRuteroHistorial', { ruteroId })
  }

  const openEdit = () => {
    if (!ruteroId) return
    navigation.navigate('SupervisorRuteroEdit', { ruteroId })
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Detalle rutero"
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
      />

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
            <Text className="text-xs text-slate-300">Rutero logístico</Text>
            <Text className="text-2xl font-extrabold text-white mt-1">
              {rutero?.id?.slice(0, 8) || '---'}
            </Text>
            <View className="mt-3 flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-slate-300">Fecha</Text>
                <Text className="text-sm font-semibold text-white">{rutero?.fecha_rutero?.slice(0, 10) || '-'}</Text>
              </View>
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
                <Text className="text-[11px] font-semibold text-white">{estado.replace(/_/g, ' ').toUpperCase()}</Text>
              </View>
            </View>
          </LinearGradient>

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <Text className="text-sm font-semibold text-neutral-700">Asignaciones</Text>
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
            <View className="mt-3">
              <Text className="text-xs text-neutral-500">Vehiculo</Text>
              <Text className="text-sm font-semibold text-neutral-900 mt-1">
                {rutero?.vehiculo?.placa || rutero?.vehiculo_id || 'N/D'}
              </Text>
              {rutero?.vehiculo?.modelo ? (
                <Text className="text-xs text-neutral-500 mt-1">{rutero.vehiculo.modelo}</Text>
              ) : null}
              {rutero?.vehiculo?.capacidad_kg ? (
                <Text className="text-xs text-neutral-500 mt-1">
                  Capacidad: {rutero.vehiculo.capacidad_kg} kg
                </Text>
              ) : null}
              {rutero?.vehiculo?.estado ? (
                <Text className="text-xs text-neutral-500 mt-1">
                  Estado: {rutero.vehiculo.estado.replace(/_/g, ' ')}
                </Text>
              ) : null}
            </View>
            <View className="mt-3">
              <Text className="text-xs text-neutral-500">Transportista</Text>
              <Text className="text-sm font-semibold text-neutral-900 mt-1">
                {transportista?.name || rutero?.transportista_id || 'N/D'}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <Text className="text-sm font-semibold text-neutral-700">Paradas</Text>
            {paradas.length === 0 ? (
              <Text className="text-xs text-neutral-500 mt-3">No hay pedidos asignados.</Text>
            ) : (
              <View className="mt-3 gap-3">
                {paradas.map((parada) => (
                  <View key={parada.id || parada.pedido_id} className="rounded-2xl border border-neutral-200 p-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-neutral-500">Pedido</Text>
                      <View className="px-2.5 py-1 rounded-full bg-red-50">
                        <Text className="text-[10px] font-semibold text-brand-red">#{parada.orden_entrega}</Text>
                      </View>
                    </View>
                    <Text className="text-sm font-semibold text-neutral-900 mt-1">
                      {orderSummaryMap[parada.pedido_id]?.numero_pedido || `#${parada.pedido_id.slice(0, 8)}`}
                    </Text>
                    <Text className="text-xs text-neutral-500 mt-1">
                      {clientNameMap[parada.pedido_id]
                        ? `Cliente: ${clientNameMap[parada.pedido_id]}`
                        : orderSummaryMap[parada.pedido_id]?.cliente_id
                          ? `Cliente: ${orderSummaryMap[parada.pedido_id]?.cliente_id?.slice(0, 8)}`
                          : `ID: ${parada.pedido_id.slice(0, 8)}`}
                    </Text>
                    <Text className="text-xs text-neutral-500 mt-1">
                      Total: USD {Number(orderSummaryMap[parada.pedido_id]?.total ?? 0).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className="mt-6 gap-3">
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={openHistory}
                className="flex-1 rounded-2xl border border-neutral-200 px-4 py-3 items-center bg-white"
              >
                <Text className="text-sm font-semibold text-neutral-700">Ver historial</Text>
              </Pressable>
              <Pressable
                onPress={openEdit}
                disabled={!canEdit}
                className={`flex-1 rounded-2xl border px-4 py-3 items-center ${canEdit ? 'border-amber-200 bg-amber-50' : 'border-neutral-200 bg-neutral-50'}`}
              >
                <Text className={`text-sm font-semibold ${canEdit ? 'text-amber-700' : 'text-neutral-300'}`}>
                  Editar rutero
                </Text>
              </Pressable>
            </View>

            {estado === 'borrador' ? (
              <PrimaryButton
                title={updating ? 'Publicando...' : 'Publicar rutero'}
                onPress={handlePublish}
                disabled={updating || !canPublish}
              />
            ) : null}

            {!canPublish && estado === 'borrador' ? (
              <View className="rounded-2xl border border-amber-200 px-4 py-3" style={{ backgroundColor: '#FFFBEB' }}>
                <Text className="text-xs text-amber-800">
                  Para publicar necesitas: vehiculo disponible y al menos un pedido asignado.
                </Text>
              </View>
            ) : null}

            {estado !== 'completado' && estado !== 'cancelado' ? (
              <Pressable
                onPress={handleCancel}
                className="rounded-2xl border border-red-200 px-4 py-3 items-center"
                style={{ backgroundColor: `${BRAND_COLORS.red}10` }}
                disabled={updating}
              >
                <View className="flex-row items-center">
                  <Ionicons name="close-circle-outline" size={18} color={BRAND_COLORS.red} />
                  <Text className="ml-2 text-sm font-semibold" style={{ color: BRAND_COLORS.red }}>
                    Cancelar rutero
                  </Text>
                </View>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      )}
    </View>
  )
}
