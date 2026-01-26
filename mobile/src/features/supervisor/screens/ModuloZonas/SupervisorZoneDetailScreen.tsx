import React from 'react'
import { View, Text } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { TextField } from '../../../../components/ui/TextField'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { ToggleSwitch } from '../../../../components/ui/ToggleSwitch'
import { FeedbackModal } from '../../../../components/ui/FeedbackModal'
import { PolygonMapEditor } from '../../../../components/ui/PolygonMapEditor'
import { KeyboardFormLayout } from '../../../../components/ui/KeyboardFormLayout'
import { showGlobalToast } from '../../../../utils/toastService'
import { getUserFriendlyMessage } from '../../../../utils/errorMessages'
import { Zone, ZoneHelpers, ZoneSchedule, ZoneService } from '../../../../services/api/ZoneService'
import { extractPolygons, MapPoint, polygonsOverlap, toMultiPolygon } from '../../../../utils/zoneGeometry'

const DEFAULT_SCHEDULE: ZoneSchedule[] = Array.from({ length: 7 }).map((_, index) => ({
  diaSemana: index,
  entregasHabilitadas: true,
  visitasHabilitadas: true,
}))

const ZONE_CODE_PREFIX = 'ZN-'

function mergeSchedules(existing: ZoneSchedule[]) {
  const map = new Map(existing.map((item) => [item.diaSemana, item]))
  return DEFAULT_SCHEDULE.map((day) => ({
    ...day,
    ...map.get(day.diaSemana),
  }))
}

function normalizeZoneCodeSuffix(value: string) {
  const cleaned = value.trim().toUpperCase()
  if (cleaned.startsWith(ZONE_CODE_PREFIX)) {
    return cleaned.slice(ZONE_CODE_PREFIX.length)
  }
  return cleaned
}

export function SupervisorZoneDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const zone = (route.params?.zone as Zone | null) ?? null
  const isEditing = !!zone

  const [codigoSuffix, setCodigoSuffix] = React.useState(
    normalizeZoneCodeSuffix(zone?.codigo || ''),
  )
  const [nombre, setNombre] = React.useState(zone?.nombre || '')
  const [descripcion, setDescripcion] = React.useState(zone?.descripcion || '')
  const [activo, setActivo] = React.useState(zone?.activo ?? true)
  const [confirmVisible, setConfirmVisible] = React.useState(false)
  const [pendingActive, setPendingActive] = React.useState<boolean | null>(null)
  const [schedules, setSchedules] = React.useState<ZoneSchedule[]>(DEFAULT_SCHEDULE)
  const [loadingSchedules, setLoadingSchedules] = React.useState(false)
  const [existingZones, setExistingZones] = React.useState<Zone[]>([])
  const [mapPoints, setMapPoints] = React.useState<MapPoint[]>([])
  const [saving, setSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const loadSchedules = React.useCallback(async () => {
    if (!zone?.id) return
    setLoadingSchedules(true)
    try {
      const data = await ZoneService.getZoneSchedules(zone.id)
      setSchedules(mergeSchedules(data))
    } finally {
      setLoadingSchedules(false)
    }
  }, [zone?.id])

  React.useEffect(() => {
    if (zone?.id) {
      loadSchedules()
    }
  }, [zone?.id, loadSchedules])

  React.useEffect(() => {
    const draft = route.params?.draft as
      | {
          codigoSuffix?: string
          nombre?: string
          descripcion?: string
          activo?: boolean
        }
      | undefined
    if (!draft) return
    if (typeof draft.codigoSuffix === 'string') setCodigoSuffix(draft.codigoSuffix)
    if (typeof draft.nombre === 'string') setNombre(draft.nombre)
    if (typeof draft.descripcion === 'string') setDescripcion(draft.descripcion)
    if (typeof draft.activo === 'boolean') setActivo(draft.activo)
    navigation.setParams({ draft: undefined })
  }, [navigation, route.params?.draft])

  React.useEffect(() => {
    const geometry = zone?.zonaGeom ?? zone?.zona_geom ?? null
    const polygons = extractPolygons(geometry)
    if (polygons.length > 0) {
      setMapPoints(polygons[0])
    }
  }, [zone?.id, zone?.zonaGeom, zone?.zona_geom])

  React.useEffect(() => {
    const incomingPoints = route.params?.mapPoints as MapPoint[] | undefined
    if (incomingPoints && incomingPoints.length > 0) {
      setMapPoints(incomingPoints)
      navigation.setParams({ mapPoints: undefined })
    }
  }, [navigation, route.params?.mapPoints])

  const loadZones = React.useCallback(async () => {
    const data = await ZoneService.getZones('todos')
    const filtered = zone?.id ? data.filter((item) => item.id !== zone.id) : data
    setExistingZones(filtered)
  }, [zone?.id])

  React.useEffect(() => {
    loadZones()
  }, [loadZones])

  const overlapZone = React.useMemo(() => {
    if (mapPoints.length < 3) return null
    for (const item of existingZones) {
      const polygons = extractPolygons(item.zonaGeom ?? item.zona_geom ?? null)
      for (const polygon of polygons) {
        if (polygonsOverlap(mapPoints, polygon)) {
          return item
        }
      }
    }
    return null
  }, [existingZones, mapPoints])

  const mapError = React.useMemo(() => {
    if (mapPoints.length < 3) return 'Marca al menos 3 puntos en el mapa'
    if (overlapZone) return `La zona se superpone con ${overlapZone.nombre}`
    return ''
  }, [mapPoints.length, overlapZone])

  React.useEffect(() => {
    if (overlapZone) {
      showGlobalToast(`No puedes superponer la zona con ${overlapZone.nombre}.`, 'error')
    }
  }, [overlapZone])

  const requestToggleActive = () => {
    setPendingActive(!activo)
    setConfirmVisible(true)
  }

  const handleConfirmToggle = () => {
    if (pendingActive === null) return
    setActivo(pendingActive)
    setPendingActive(null)
  }

  const updateSchedule = (day: number, key: 'entregasHabilitadas' | 'visitasHabilitadas') => {
    setSchedules((prev) =>
      prev.map((item) =>
        item.diaSemana === day ? { ...item, [key]: !item[key] } : item
      )
    )
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!codigoSuffix.trim()) nextErrors.codigo = 'Codigo requerido'
    if (!nombre.trim()) nextErrors.nombre = 'Nombre requerido'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0 && !mapError
  }

  const handleSave = async () => {
    if (mapPoints.length < 3) {
      showGlobalToast('Marca al menos 3 puntos para definir la zona.', 'error')
      return
    }
    if (!validate()) {
      showGlobalToast('Completa los campos obligatorios.', 'error')
      return
    }

    const geometry = toMultiPolygon(mapPoints)
    if (!geometry) {
      showGlobalToast('Define el poligono de la zona en el mapa.', 'error')
      return
    }
    if (overlapZone) {
      showGlobalToast(`No puedes superponer la zona con ${overlapZone.nombre}.`, 'error')
      return
    }
    const codigo = codigoSuffix.trim()
      ? `${ZONE_CODE_PREFIX}${codigoSuffix.trim()}`
      : ''
    setSaving(true)
    try {
      if (isEditing && zone?.id) {
        const updated = await ZoneService.updateZone(zone.id, {
          codigo,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          activo,
          zonaGeom: geometry,
        })
        if (!updated) {
          showGlobalToast('No se pudo actualizar la zona.', 'error')
          return
        }
        await ZoneService.updateZoneSchedules(zone.id, schedules)
        showGlobalToast('Zona actualizada.', 'success')
        navigation.reset({
          index: 1,
          routes: [
            { name: 'SupervisorTabs' },
            { name: 'SupervisorZones', params: { upsertZone: updated } },
          ],
        })
        return
      }

      const created = await ZoneService.createZone({
        codigo,
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        zonaGeom: geometry,
      })

      if (!created?.id) {
        showGlobalToast('No se pudo crear la zona.', 'error')
        return
      }

      await ZoneService.updateZoneSchedules(created.id, schedules)
      showGlobalToast('Zona creada.', 'success')
      navigation.reset({
        index: 1,
        routes: [
          { name: 'SupervisorTabs' },
          { name: 'SupervisorZones', params: { upsertZone: created } },
        ],
      })
    } catch (error) {
      showGlobalToast(getUserFriendlyMessage(error, 'CREATE_ERROR'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title={isEditing ? 'Detalle de Zona' : 'Nueva Zona'}
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
      />

      <KeyboardFormLayout>
        <View className="px-5 py-4 gap-5">
            <View className="bg-white rounded-3xl border border-neutral-200 p-5 gap-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center mr-3 border border-red-100">
                  <Ionicons name="map-outline" size={20} color="#D92D20" />
                </View>
                <View>
                  <Text className="text-lg font-bold text-neutral-900">Informacion general</Text>
                  <Text className="text-sm text-neutral-500">Define el codigo y el nombre de la zona.</Text>
                </View>
              </View>

              <TextField
                label="Codigo"
                placeholder="01"
                value={codigoSuffix}
                onChangeText={(value) => setCodigoSuffix(normalizeZoneCodeSuffix(value))}
                autoCapitalize="characters"
                keyboardType="number-pad"
                error={errors.codigo}
                left={<Text className="text-neutral-500 font-semibold">{ZONE_CODE_PREFIX}</Text>}
              />
              <TextField
                label="Nombre"
                placeholder="Zona Central"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
                error={errors.nombre}
              />
              <TextField
                label="Descripcion"
                placeholder="Cobertura principal de la ciudad"
                value={descripcion}
                onChangeText={setDescripcion}
              />

              {isEditing ? (
                <View className="flex-row items-center justify-between bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3">
                  <Text className="text-neutral-700 font-semibold">Activo</Text>
                  <ToggleSwitch checked={activo} onToggle={requestToggleActive} />
                </View>
              ) : null}
            </View>

            <View className="bg-white rounded-3xl border border-neutral-200 p-5 gap-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center mr-3 border border-red-100">
                    <Ionicons name="navigate-outline" size={20} color="#D92D20" />
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-neutral-900">Mapa de cobertura</Text>
                    <Text className="text-sm text-neutral-500">Dibuja el poligono de la zona.</Text>
                  </View>
                </View>
                <Text
                  className="text-xs font-semibold text-red-600"
                  onPress={() =>
                    navigation.navigate('SupervisorZonesMap', {
                      mode: 'edit',
                      points: mapPoints,
                      zoneId: zone?.id ?? null,
                      draft: {
                        codigoSuffix,
                        nombre,
                        descripcion,
                        activo,
                      },
                    })
                  }
                >
                  Expandir mapa
                </Text>
              </View>

              <PolygonMapEditor
                points={mapPoints}
                onChangePoints={setMapPoints}
                existingPolygons={existingZones.flatMap((item) => extractPolygons(item.zonaGeom ?? item.zona_geom ?? null))}
                editable
                invalid={!!overlapZone}
                fitToPolygons
              />

              {mapError ? (
                <Text className="text-xs text-red-600">{mapError}</Text>
              ) : (
                <Text className="text-xs text-neutral-500">
                  Puntos actuales: {mapPoints.length}. Puedes deshacer o limpiar en el mapa.
                </Text>
              )}
            </View>

            <View className="bg-white rounded-3xl border border-neutral-200 p-5 gap-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-bold text-neutral-900">Horarios</Text>
                  <Text className="text-sm text-neutral-500">Configura entregas y visitas por dia.</Text>
                </View>
                {loadingSchedules ? (
                  <Ionicons name="hourglass-outline" size={18} color="#9CA3AF" />
                ) : null}
              </View>

              {schedules.map((schedule) => (
                <View
                  key={schedule.diaSemana}
                  className="flex-row items-center justify-between border border-neutral-100 rounded-2xl px-4 py-3"
                >
                  <View className="flex-1">
                    <Text className="text-neutral-800 font-semibold">
                      {ZoneHelpers.getDayLabel(schedule.diaSemana)}
                    </Text>
                    <Text className="text-xs text-neutral-500 mt-1">Entrega y visita</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="items-center mr-3">
                      <Text className="text-[10px] text-neutral-500 mb-1">Entrega</Text>
                      <ToggleSwitch
                        checked={schedule.entregasHabilitadas}
                        onToggle={() => updateSchedule(schedule.diaSemana, 'entregasHabilitadas')}
                      />
                    </View>
                    <View className="items-center">
                      <Text className="text-[10px] text-neutral-500 mb-1">Visita</Text>
                      <ToggleSwitch
                        checked={schedule.visitasHabilitadas}
                        onToggle={() => updateSchedule(schedule.diaSemana, 'visitasHabilitadas')}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <PrimaryButton
              title={isEditing ? 'Guardar cambios' : 'Crear zona'}
              onPress={handleSave}
              loading={saving}
              disabled={!!mapError}
            />
        </View>
      </KeyboardFormLayout>

      <FeedbackModal
        visible={confirmVisible}
        type="warning"
        title={pendingActive ? 'Activar zona' : 'Desactivar zona'}
        message={`¿Estas seguro de querer ${pendingActive ? 'activar' : 'desactivar'} esta zona?`}
        confirmText="Si"
        cancelText="No"
        showCancel
        onClose={() => {
          setConfirmVisible(false)
          setPendingActive(null)
        }}
        onConfirm={handleConfirmToggle}
      />
    </View>
  )
}
