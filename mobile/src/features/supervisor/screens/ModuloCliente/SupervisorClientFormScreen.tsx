import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { TextField } from '../../../../components/ui/TextField'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { PickerModal, PickerOption } from '../../../../components/ui/PickerModal'
import { LocationPickerMap } from '../../../../components/ui/LocationPickerMap'
import { KeyboardFormLayout } from '../../../../components/ui/KeyboardFormLayout'
import { BRAND_COLORS } from '../../../../shared/types'
import { Zone, ZoneService } from '../../../../services/api/ZoneService'
import { Channel, ChannelService } from '../../../../services/api/ChannelService'
import { UserClient, UserClientService } from '../../../../services/api/UserClientService'
import { UserProfile, UserService } from '../../../../services/api/UserService'
import { showGlobalToast } from '../../../../utils/toastService'
import { getUserFriendlyMessage } from '../../../../utils/errorMessages'
import { extractPolygons } from '../../../../utils/zoneGeometry'

type MapPoint = { latitude: number; longitude: number }

const toFixedOrEmpty = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  return Number(value).toFixed(6)
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function SupervisorClientFormScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const client = (route.params?.client as UserClient | null) ?? null
  const isEditing = !!client

  const [nombres, setNombres] = React.useState(client?.nombres || '')
  const [apellidos, setApellidos] = React.useState(client?.apellidos || '')
  const [email, setEmail] = React.useState(client?.email || '')
  const [telefono, setTelefono] = React.useState(client?.telefono || '')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [nombreComercial, setNombreComercial] = React.useState(client?.nombre_comercial || '')
  const [ruc, setRuc] = React.useState(client?.ruc || '')
  const [direccion, setDireccion] = React.useState(client?.direccion || '')
  const [canalId, setCanalId] = React.useState(client?.canal_id || '')
  const [zonaId, setZonaId] = React.useState(client?.zona_id || '')
  const [vendedorId, setVendedorId] = React.useState(client?.vendedor_asignado_id || '')
  const [latitud, setLatitud] = React.useState(toFixedOrEmpty(client?.latitud ?? null))
  const [longitud, setLongitud] = React.useState(toFixedOrEmpty(client?.longitud ?? null))
  const [mapPoint, setMapPoint] = React.useState<MapPoint | null>(
    client?.latitud && client?.longitud ? { latitude: Number(client.latitud), longitude: Number(client.longitud) } : null
  )
  const [zonePolygons, setZonePolygons] = React.useState<MapPoint[][]>([])

  const [zones, setZones] = React.useState<Zone[]>([])
  const [channels, setChannels] = React.useState<Channel[]>([])
  const [vendors, setVendors] = React.useState<UserProfile[]>([])
  const [showCanalModal, setShowCanalModal] = React.useState(false)
  const [showZonaModal, setShowZonaModal] = React.useState(false)
  const [showVendedorModal, setShowVendedorModal] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const waitForClient = React.useCallback(async (usuarioId: string) => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const clientData = await UserClientService.getClient(usuarioId)
      if (clientData) return clientData
      await delay(350)
    }
    return null
  }, [])

  const loadSelectors = React.useCallback(async () => {
    const [zonesData, channelsData, vendorData] = await Promise.all([
      ZoneService.getZones('activo'),
      ChannelService.getChannels(),
      UserService.getVendors(),
    ])
    setZones(zonesData)
    setChannels(channelsData.filter((item) => item.activo))
    setVendors(vendorData)
  }, [])

  React.useEffect(() => {
    loadSelectors()
  }, [loadSelectors])

  React.useEffect(() => {
    if (!zonaId) {
      setZonePolygons([])
      return
    }

    const selectedZone = zones.find((item) => item.id === zonaId)
    const geometry = selectedZone?.zonaGeom ?? selectedZone?.zona_geom ?? null
    if (geometry) {
      setZonePolygons(extractPolygons(geometry))
      return
    }

    let active = true
    ZoneService.getZoneById(zonaId).then((zoneData) => {
      if (!active) return
      const nextGeometry = zoneData?.zonaGeom ?? zoneData?.zona_geom ?? null
      setZonePolygons(extractPolygons(nextGeometry))
    })

    return () => {
      active = false
    }
  }, [zonaId, zones])

  const canalOptions = channels.map<PickerOption>((item) => ({
    id: item.id,
    label: item.nombre,
    description: item.descripcion || undefined,
    icon: 'briefcase-outline',
    color: BRAND_COLORS.red,
  }))

  const zonaOptions = zones.map<PickerOption>((item) => ({
    id: item.id,
    label: item.nombre,
    description: item.codigo,
    icon: 'map-outline',
    color: BRAND_COLORS.red,
  }))

  const vendedorOptions = vendors.map<PickerOption>((item) => ({
    id: item.id,
    label: item.name,
    description: item.email,
    icon: 'person-outline',
    color: '#2563EB',
  }))

  const selectedCanal = channels.find((item) => item.id === canalId)
  const selectedZona = zones.find((item) => item.id === zonaId)
  const selectedVendedor = vendors.find((item) => item.id === vendedorId)

  const updateMapPoint = (point: MapPoint) => {
    setMapPoint(point)
    setLatitud(point.latitude.toFixed(6))
    setLongitud(point.longitude.toFixed(6))
  }

  const updateMapFromInputs = (nextLat: string, nextLon: string) => {
    const latNum = Number(nextLat)
    const lonNum = Number(nextLon)
    if (!Number.isNaN(latNum) && !Number.isNaN(lonNum)) {
      setMapPoint({ latitude: latNum, longitude: lonNum })
    }
  }

  const handleLatitudChange = (value: string) => {
    setLatitud(value)
    updateMapFromInputs(value, longitud)
  }

  const handleLongitudChange = (value: string) => {
    setLongitud(value)
    updateMapFromInputs(latitud, value)
  }

  const handleRucChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 13)
    setRuc(digits)
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (!nombres.trim()) nextErrors.nombres = 'Nombres requeridos'
    if (!apellidos.trim()) nextErrors.apellidos = 'Apellidos requeridos'
    if (!email.trim()) nextErrors.email = 'Email requerido'
    if (!isEditing && !password.trim()) nextErrors.password = 'Contrasena requerida'
    if (!nombreComercial.trim()) nextErrors.nombreComercial = 'Nombre comercial requerido'
    if (!canalId) nextErrors.canalId = 'Selecciona un canal'
    if (!zonaId) nextErrors.zonaId = 'Selecciona una zona'
    if (!direccion.trim()) nextErrors.direccion = 'Direccion requerida'
    if (ruc.trim() && ruc.trim().length !== 12) nextErrors.ruc = 'El RUC debe tener 12 digitos'
    if (!mapPoint || !latitud.trim() || !longitud.trim()) nextErrors.ubicacion = 'Marca la ubicacion en el mapa'

    setErrors(nextErrors)
    return {
      isValid: Object.keys(nextErrors).length === 0,
      hasLocationError: Boolean(nextErrors.ubicacion),
    }
  }

  const handleCreate = async () => {
    const validation = validate()
    if (!validation.isValid) {
      if (validation.hasLocationError) {
        showGlobalToast('Debes marcar la ubicacion del cliente en el mapa.', 'error')
      } else {
        showGlobalToast('Completa los campos obligatorios.', 'error')
      }
      return
    }

    setSaving(true)
    try {
      const fullName = `${nombres.trim()} ${apellidos.trim()}`.trim()
      const result = await UserService.createUser({
        email: email.trim(),
        password: password.trim(),
        nombre: fullName,
        telefono: telefono.trim(),
        rol: 'cliente',
        canalId,
        nombreComercial: nombreComercial.trim(),
        ruc: ruc.trim() || undefined,
        zonaId,
        direccion: direccion.trim(),
        latitud: latitud ? Number(latitud) : undefined,
        longitud: longitud ? Number(longitud) : undefined,
        vendedorAsignadoId: vendedorId || undefined,
      })

      if (!result.success) {
        showGlobalToast(result.message || 'No se pudo crear el cliente.', 'error')
        return
      }

      const syncedClient = result.userId ? await waitForClient(result.userId) : null
      showGlobalToast('Cliente creado correctamente.', 'success')
      navigation.navigate('SupervisorTabs', {
        screen: 'Clientes',
        params: syncedClient ? { upsertClient: syncedClient } : { refresh: true },
        merge: true,
      })
    } catch (error) {
      showGlobalToast(getUserFriendlyMessage(error, 'CREATE_ERROR'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!client?.usuario_id) return
    const validation = validate()
    if (!validation.isValid) {
      if (validation.hasLocationError) {
        showGlobalToast('Debes marcar la ubicacion del cliente en el mapa.', 'error')
      } else {
        showGlobalToast('Completa los campos obligatorios.', 'error')
      }
      return
    }

    setSaving(true)
    try {
      const clientResult = await UserClientService.updateClient(client.usuario_id, {
        canal_id: canalId,
        nombre_comercial: nombreComercial.trim(),
        ruc: ruc.trim() || null,
        zona_id: zonaId,
        direccion: direccion.trim(),
        latitud: latitud ? Number(latitud) : null,
        longitud: longitud ? Number(longitud) : null,
        vendedor_asignado_id: vendedorId || null,
      })

      if (!clientResult) {
        showGlobalToast('No se pudo actualizar el cliente.', 'error')
        return
      }

      const profileResult = await UserService.updateUser(client.usuario_id, {
        nombre: `${nombres.trim()} ${apellidos.trim()}`.trim(),
        telefono: telefono.trim(),
      })
      if (!profileResult.success) {
        showGlobalToast(profileResult.message || 'No se pudo actualizar el perfil.', 'error')
        return
      }

      showGlobalToast('Cliente actualizado correctamente.', 'success')
      navigation.goBack()
    } catch (error) {
      showGlobalToast(getUserFriendlyMessage(error, 'UPDATE_ERROR'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = () => {
    if (isEditing) {
      handleUpdate()
    } else {
      handleCreate()
    }
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
      />

      <KeyboardFormLayout>
        <View className="px-5 py-4 gap-5">
            <View className="bg-white rounded-3xl border border-neutral-200 p-5 gap-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center mr-3 border border-red-100">
                  <Ionicons name="person-outline" size={20} color={BRAND_COLORS.red} />
                </View>
                <View>
                  <Text className="text-lg font-bold text-neutral-900">Cuenta del cliente</Text>
                  <Text className="text-sm text-neutral-500">Datos del usuario y contacto.</Text>
                </View>
              </View>

              <TextField
                label="Nombres"
                placeholder="Ej. Ana Maria"
                value={nombres}
                onChangeText={setNombres}
                autoCapitalize="words"
                error={errors.nombres}
              />
              <TextField
                label="Apellidos"
                placeholder="Ej. Gomez"
                value={apellidos}
                onChangeText={setApellidos}
                autoCapitalize="words"
                error={errors.apellidos}
              />
              <TextField
                label="Email"
                placeholder="correo@empresa.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                editable={!isEditing}
                error={errors.email}
              />
              <TextField
                label="Telefono"
                placeholder="+593 999 999 999"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
              />

              {!isEditing ? (
                <TextField
                  label="Contrasena"
                  placeholder="********"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  error={errors.password}
                  right={
                    <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                      <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
                    </Pressable>
                  }
                />
              ) : null}
            </View>

            <View className="bg-white rounded-3xl border border-neutral-200 p-5 gap-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center mr-3 border border-red-100">
                  <Ionicons name="business-outline" size={20} color={BRAND_COLORS.red} />
                </View>
                <View>
                  <Text className="text-lg font-bold text-neutral-900">Datos comerciales</Text>
                  <Text className="text-sm text-neutral-500">Informacion del negocio.</Text>
                </View>
              </View>

              <TextField
                label="Nombre comercial"
                placeholder="Ej. Tienda Central"
                value={nombreComercial}
                onChangeText={setNombreComercial}
                autoCapitalize="words"
                error={errors.nombreComercial}
              />
              <TextField
                label="RUC"
                placeholder="999999999999"
                value={ruc}
                onChangeText={handleRucChange}
                keyboardType="numeric"
                maxLength={12}
                error={errors.ruc}
              />
              <TextField
                label="Direccion"
                placeholder="Av. Principal y Secundaria"
                value={direccion}
                onChangeText={setDireccion}
                autoCapitalize="sentences"
                error={errors.direccion}
              />

              <Pressable onPress={() => setShowCanalModal(true)} className="gap-2">
                <Text className="text-xs text-neutral-600">Canal comercial</Text>
                <View className={`flex-row items-center rounded-2xl border px-4 py-3 bg-neutral-50 ${errors.canalId ? 'border-red-400/60' : 'border-neutral-200'}`}>
                  <Text className="flex-1 text-neutral-900">
                    {selectedCanal ? selectedCanal.nombre : 'Selecciona un canal'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#6B7280" />
                </View>
                {errors.canalId ? <Text className="text-xs text-red-700">{errors.canalId}</Text> : null}
              </Pressable>

              <Pressable onPress={() => setShowZonaModal(true)} className="gap-2">
                <Text className="text-xs text-neutral-600">Zona asignada</Text>
                <View className={`flex-row items-center rounded-2xl border px-4 py-3 bg-neutral-50 ${errors.zonaId ? 'border-red-400/60' : 'border-neutral-200'}`}>
                  <Text className="flex-1 text-neutral-900">
                    {selectedZona ? `${selectedZona.nombre} (${selectedZona.codigo})` : 'Selecciona una zona'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#6B7280" />
                </View>
                {errors.zonaId ? <Text className="text-xs text-red-700">{errors.zonaId}</Text> : null}
              </Pressable>

              <Pressable onPress={() => setShowVendedorModal(true)} className="gap-2">
                <Text className="text-xs text-neutral-600">Vendedor asignado (opcional)</Text>
                <View className="flex-row items-center rounded-2xl border px-4 py-3 bg-neutral-50 border-neutral-200">
                  <Text className="flex-1 text-neutral-900">
                    {selectedVendedor ? selectedVendedor.name : 'Seleccionar vendedor'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#6B7280" />
                </View>
              </Pressable>
            </View>

            <View className="bg-white rounded-3xl border border-neutral-200 p-5 gap-4">
              <View className="flex-row items-center">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center mr-3 border border-red-100">
                    <Ionicons name="pin-outline" size={20} color={BRAND_COLORS.red} />
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-neutral-900">Ubicacion</Text>
                    <Text className="text-sm text-neutral-500">Marca la ubicacion en el mapa.</Text>
                  </View>
                </View>
              </View>

              <LocationPickerMap value={mapPoint} onChange={updateMapPoint} polygons={zonePolygons} />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TextField
                    label="Latitud"
                    placeholder="-3.99"
                    value={latitud}
                    onChangeText={handleLatitudChange}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <TextField
                    label="Longitud"
                    placeholder="-79.20"
                    value={longitud}
                    onChangeText={handleLongitudChange}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <PrimaryButton
              title={isEditing ? 'Guardar cambios' : 'Crear cliente'}
              onPress={handleSave}
              loading={saving}
            />
        </View>
      </KeyboardFormLayout>

      <PickerModal
        visible={showCanalModal}
        title="Selecciona canal"
        options={canalOptions}
        selectedId={canalId}
        onSelect={(id) => {
          setCanalId(id)
          setShowCanalModal(false)
        }}
        onClose={() => setShowCanalModal(false)}
      />

      <PickerModal
        visible={showZonaModal}
        title="Selecciona zona"
        options={zonaOptions}
        selectedId={zonaId}
        onSelect={(id) => {
          setZonaId(id)
          setShowZonaModal(false)
        }}
        onClose={() => setShowZonaModal(false)}
      />

      <PickerModal
        visible={showVendedorModal}
        title="Selecciona vendedor"
        options={vendedorOptions}
        selectedId={vendedorId}
        onSelect={(id) => {
          setVendedorId(id)
          setShowVendedorModal(false)
        }}
        onClose={() => setShowVendedorModal(false)}
      />
    </View>
  )
}
