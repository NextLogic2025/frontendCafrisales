import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { UserProfile, UserService } from '../../../../services/api/UserService'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { TextField } from '../../../../components/ui/TextField'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { ToggleSwitch } from '../../../../components/ui/ToggleSwitch'
import { KeyboardFormLayout } from '../../../../components/ui/KeyboardFormLayout'
import { DatePickerModal } from '../../../../components/ui/DatePickerModal'
import { showGlobalToast } from '../../../../utils/toastService'
import { getUserFriendlyMessage } from '../../../../utils/errorMessages'

const ROLE_OPTIONS = [
  { id: 'vendedor', name: 'Vendedor' },
  { id: 'bodeguero', name: 'Bodeguero' },
  { id: 'transportista', name: 'Transportista' },
]

const ROLE_LABELS: Record<string, string> = {
  vendedor: 'Vendedor',
  bodeguero: 'Bodeguero',
  transportista: 'Transportista',
  supervisor: 'Supervisor',
}

const EMPLOYEE_CODE_PREFIX = 'EMPL-'

function normalizeRole(role?: string) {
  return (role || '').trim().toLowerCase()
}

function normalizeEmployeeCodeSuffix(value: string) {
  const cleaned = value.trim().toUpperCase()
  if (cleaned.startsWith(EMPLOYEE_CODE_PREFIX)) {
    return cleaned.slice(EMPLOYEE_CODE_PREFIX.length)
  }
  return cleaned
}

function hasFullName(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length >= 2
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function SupervisorTeamDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const user = (route.params?.user as UserProfile | null) ?? null
  const isEditing = !!user

  const [role, setRole] = React.useState<string>(normalizeRole(user?.role) || 'vendedor')
  const [nombre, setNombre] = React.useState(user?.name || '')
  const [email, setEmail] = React.useState(user?.email || '')
  const [telefono, setTelefono] = React.useState(user?.phone || '')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [codigoEmpleadoSuffix, setCodigoEmpleadoSuffix] = React.useState(
    normalizeEmployeeCodeSuffix(user?.codigoEmpleado || ''),
  )
  const [numeroLicencia, setNumeroLicencia] = React.useState(user?.numeroLicencia || '')
  const [licenciaVenceEn, setLicenciaVenceEn] = React.useState(user?.licenciaVenceEn || '')
  const [showDatePicker, setShowDatePicker] = React.useState(false)
  const [activo, setActivo] = React.useState(user?.active ?? true)
  const [saving, setSaving] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const requiresCodigo = ['vendedor', 'bodeguero', 'transportista'].includes(role)
  const isTransportista = role === 'transportista'

  const validateCreate = () => {
    const nextErrors: Record<string, string> = {}
    if (!nombre.trim()) {
      nextErrors.nombre = 'Nombre requerido'
    } else if (!hasFullName(nombre)) {
      nextErrors.nombre = 'Ingresa nombres y apellidos'
    }
    if (!email.trim()) nextErrors.email = 'Email requerido'
    if (!password.trim()) nextErrors.password = 'Contrasena requerida'
    if (!role) nextErrors.role = 'Rol requerido'
    if (requiresCodigo && !codigoEmpleadoSuffix.trim()) nextErrors.codigoEmpleado = 'Codigo requerido'
    if (isTransportista && !numeroLicencia.trim()) nextErrors.numeroLicencia = 'Numero de licencia requerido'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const validateUpdate = () => {
    const nextErrors: Record<string, string> = {}
    if (!role) nextErrors.role = 'Rol requerido'
    if (requiresCodigo && !codigoEmpleadoSuffix.trim()) nextErrors.codigoEmpleado = 'Codigo requerido'
    if (isTransportista && !numeroLicencia.trim()) nextErrors.numeroLicencia = 'Numero de licencia requerido'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleCreate = async () => {
    if (!validateCreate()) {
      showGlobalToast('Completa los campos obligatorios.', 'error')
      return
    }
    setSaving(true)
    try {
      const codigoEmpleado = codigoEmpleadoSuffix.trim()
        ? `${EMPLOYEE_CODE_PREFIX}${codigoEmpleadoSuffix.trim()}`
        : ''
      const result = await UserService.createUser({
        email: email.trim(),
        password: password.trim(),
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        rol: role,
        codigoEmpleado,
        numeroLicencia: numeroLicencia.trim(),
        licenciaVenceEn: licenciaVenceEn.trim(),
      })
      if (result.success) {
        showGlobalToast('Empleado creado correctamente.', 'success')
        navigation.goBack()
        return
      }
      showGlobalToast(result.message || 'No se pudo crear el empleado.', 'error')
    } catch (error) {
      showGlobalToast(getUserFriendlyMessage(error, 'CREATE_ERROR'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!user?.id) return
    if (!validateUpdate()) {
      showGlobalToast('Completa los campos obligatorios.', 'error')
      return
    }
    setSaving(true)
    try {
      const codigoEmpleado = codigoEmpleadoSuffix.trim()
        ? `${EMPLOYEE_CODE_PREFIX}${codigoEmpleadoSuffix.trim()}`
        : ''
      const result = await UserService.updateUser(user.id, {
        activo,
        rol: role,
        codigoEmpleado,
        numeroLicencia: numeroLicencia.trim(),
        licenciaVenceEn: licenciaVenceEn.trim(),
      })
      if (result.success) {
        showGlobalToast('Empleado actualizado.', 'success')
        navigation.goBack()
        return
      }
      showGlobalToast(result.message || 'No se pudo actualizar.', 'error')
    } catch (error) {
      showGlobalToast(getUserFriendlyMessage(error, 'UPDATE_ERROR'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const displayName = nombre.trim() || user?.name || 'Empleado'
  const displayRole = ROLE_LABELS[normalizeRole(role)] || role || 'Sin rol'
  const initials = getInitials(displayName)
  const licenciaLabel = licenciaVenceEn ? licenciaVenceEn : 'Selecciona fecha'

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title={isEditing ? 'Detalle del Empleado' : 'Nuevo Empleado'}
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
      />

      <KeyboardFormLayout>
        <View className="px-5 py-4 gap-5">
            {isEditing ? (
              <>
                <View className="bg-white rounded-3xl border border-neutral-200 p-5">
                  <View className="flex-row items-center">
                    <View className="w-14 h-14 rounded-2xl bg-red-50 items-center justify-center mr-3 border border-red-100">
                      <Text className="text-red-600 text-xl font-bold">{initials}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-neutral-900">{displayName}</Text>
                      <Text className="text-sm text-neutral-500">{user?.email || 'Sin email'}</Text>
                    </View>
                    <View className="px-3 py-1 rounded-full bg-neutral-100">
                      <Text className="text-xs font-semibold text-neutral-600 uppercase">{displayRole}</Text>
                    </View>
                  </View>

                  <View className="mt-4 flex-row items-center justify-between bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3">
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark-circle-outline" size={18} color="#16a34a" />
                      <Text className="ml-2 text-neutral-700 font-semibold">Activo</Text>
                    </View>
                    <ToggleSwitch checked={activo} onToggle={() => setActivo((prev) => !prev)} />
                  </View>
                </View>

                <View className="bg-white rounded-3xl border border-neutral-200 p-5 gap-4">
                  <Text className="text-sm font-semibold text-neutral-600">Rol y credenciales</Text>

                  <View>
                    <Text className="text-xs text-neutral-600 mb-1">Rol</Text>
                    <CategoryFilter categories={ROLE_OPTIONS} selectedId={role} onSelect={(id) => setRole(String(id))} />
                    {errors.role ? <Text className="text-xs text-red-700 mt-2">{errors.role}</Text> : null}
                  </View>

                  <TextField
                    label="Codigo de empleado"
                    placeholder="01"
                    value={codigoEmpleadoSuffix}
                    onChangeText={(value) => setCodigoEmpleadoSuffix(normalizeEmployeeCodeSuffix(value))}
                    autoCapitalize="characters"
                    keyboardType="number-pad"
                    error={errors.codigoEmpleado}
                    left={<Text className="text-neutral-500 font-semibold">{EMPLOYEE_CODE_PREFIX}</Text>}
                  />

                  {isTransportista ? (
                    <>
                      <TextField
                        label="Numero de licencia"
                        placeholder="ABC12345"
                        value={numeroLicencia}
                        onChangeText={setNumeroLicencia}
                        error={errors.numeroLicencia}
                      />
                      <TouchableOpacity onPress={() => setShowDatePicker(true)} className="gap-2">
                        <Text className="text-xs text-neutral-600">Licencia vence en</Text>
                        <View className="flex-row items-center rounded-2xl border px-4 py-3 bg-neutral-50 border-neutral-200">
                          <Text className="flex-1 text-neutral-900">{licenciaLabel}</Text>
                          <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                        </View>
                      </TouchableOpacity>
                    </>
                  ) : null}

                  <PrimaryButton title="Guardar cambios" onPress={handleUpdate} loading={saving} />
                </View>
              </>
            ) : (
              <View className="bg-white rounded-3xl border border-neutral-200 p-5 gap-5">
                <View>
                  <Text className="text-lg font-bold text-neutral-900">Datos del empleado</Text>
                  <Text className="text-sm text-neutral-500">Completa la informacion para crear un nuevo miembro.</Text>
                </View>

                <View>
                  <Text className="text-xs text-neutral-600 mb-1">Rol</Text>
                  <CategoryFilter categories={ROLE_OPTIONS} selectedId={role} onSelect={(id) => setRole(String(id))} />
                  {errors.role ? <Text className="text-xs text-red-700 mt-2">{errors.role}</Text> : null}
                </View>

                <View className="h-px bg-neutral-100" />

                <TextField
                  label="Nombre completo"
                  placeholder="Ej. Ana Gomez"
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                  error={errors.nombre}
                />
                <TextField
                  label="Email"
                  placeholder="correo@empresa.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  error={errors.email}
                />
                <TextField
                  label="Telefono"
                  placeholder="+59170000000"
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="default"
                />
                <TextField
                  label="Contrasena"
                  placeholder="********"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  error={errors.password}
                  right={
                    <TouchableOpacity
                      onPress={() => setShowPassword((prev) => !prev)}
                      accessibilityLabel={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    >
                      <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color="#6b7280" />
                    </TouchableOpacity>
                  }
                />

                <View className="h-px bg-neutral-100" />

                <TextField
                  label="Codigo de empleado"
                  placeholder="01"
                  value={codigoEmpleadoSuffix}
                  onChangeText={(value) => setCodigoEmpleadoSuffix(normalizeEmployeeCodeSuffix(value))}
                  autoCapitalize="characters"
                  keyboardType="number-pad"
                  error={errors.codigoEmpleado}
                  left={<Text className="text-neutral-500 font-semibold">{EMPLOYEE_CODE_PREFIX}</Text>}
                />

                {isTransportista ? (
                  <>
                    <TextField
                      label="Numero de licencia"
                      placeholder="ABC12345"
                      value={numeroLicencia}
                      onChangeText={setNumeroLicencia}
                      error={errors.numeroLicencia}
                    />
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} className="gap-2">
                      <Text className="text-xs text-neutral-600">Licencia vence en</Text>
                      <View className="flex-row items-center rounded-2xl border px-4 py-3 bg-neutral-50 border-neutral-200">
                        <Text className="flex-1 text-neutral-900">{licenciaLabel}</Text>
                        <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                      </View>
                    </TouchableOpacity>
                  </>
                ) : null}

                <PrimaryButton title="Crear empleado" onPress={handleCreate} loading={saving} />
              </View>
            )}

            {!isEditing ? (
              <TouchableOpacity onPress={() => navigation.goBack()} className="items-center">
                <Text className="text-neutral-500">Cancelar</Text>
              </TouchableOpacity>
            ) : null}
        </View>
      </KeyboardFormLayout>

      <DatePickerModal
        visible={showDatePicker}
        title="Vencimiento de licencia"
        infoText="Selecciona la fecha de vencimiento."
        initialDate={licenciaVenceEn || undefined}
        onSelectDate={(date) => setLicenciaVenceEn(date)}
        onClear={() => setLicenciaVenceEn('')}
        onClose={() => setShowDatePicker(false)}
      />
    </View>
  )
}
