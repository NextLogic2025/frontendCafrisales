import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Avatar, Text } from '@/components/ui'

type Role =
  | 'cliente'
  | 'vendedor'
  | 'bodeguero'
  | 'supervisor'
  | 'transportista'
  | string

type ProfileUser = {
  id: string
  nombre: string
  email: string
  rol: Role
  telefono?: string
  avatar?: string
}

export interface ProfileScreenProps {
  user: ProfileUser
  onLogout: () => void
  onNavigate?: (screen: string, params?: any) => void
  onUpdateProfile?: (data: { nombres?: string; apellidos?: string; telefono?: string }) => Promise<boolean>
  isLoading?: boolean
}

const roleDisplay: Record<string, { label: string; bg: string; text: string }> = {
  supervisor: { label: 'Supervisor', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  vendedor: { label: 'Vendedor', bg: 'bg-blue-100', text: 'text-blue-700' },
  bodeguero: { label: 'Bodega', bg: 'bg-purple-100', text: 'text-purple-700' },
  transportista: { label: 'Transporte', bg: 'bg-orange-100', text: 'text-orange-700' },
  cliente: { label: 'Cliente', bg: 'bg-green-100', text: 'text-green-700' },
}

function splitName(fullName: string) {
  if (!fullName) return { nombres: '', apellidos: '' }
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) return { nombres: parts[0], apellidos: '' }
  return { nombres: parts.slice(0, -1).join(' '), apellidos: parts.slice(-1).join(' ') }
}

export function ProfileScreen({ user, onLogout, onNavigate, onUpdateProfile, isLoading }: ProfileScreenProps) {
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [mensajeColor, setMensajeColor] = useState<'success' | 'error' | 'info'>('info')

  const initialNames = useMemo(() => splitName(user.nombre), [user.nombre])
  const [nombres, setNombres] = useState(initialNames.nombres)
  const [apellidos, setApellidos] = useState(initialNames.apellidos)
  const [telefono, setTelefono] = useState(user.telefono || '')

  useEffect(() => {
    setNombres(initialNames.nombres)
    setApellidos(initialNames.apellidos)
    setTelefono(user.telefono || '')
  }, [initialNames, user.telefono])

  const roleMeta = roleDisplay[user.rol?.toLowerCase()] || {
    label: user.rol || 'Rol',
    bg: 'bg-neutral-200',
    text: 'text-neutral-800',
  }

  const handleSave = async () => {
    if (!onUpdateProfile) return
    setSaving(true)
    const payload = {
      nombres: nombres?.trim() || user.nombre,
      apellidos: apellidos?.trim() || user.nombre,
      telefono: telefono?.trim() || undefined,
    }
    const ok = await onUpdateProfile(payload)
    setSaving(false)
    setMensaje(ok ? 'Perfil actualizado' : 'No pudimos guardar. Intenta de nuevo.')
    setMensajeColor(ok ? 'success' : 'error')
    if (ok) setEditMode(false)
    setTimeout(() => setMensaje(null), 2500)
  }

  return (
    <View className="flex-1 bg-neutral-50">
      {isLoading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center bg-white/60 z-10">
          <ActivityIndicator size="large" color="#F0412D" />
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de perfil compacta */}
        <View className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm mb-4">
          <View className="flex-row items-center">
            <Avatar
              name={user.nombre}
              source={user.avatar ? { uri: user.avatar } : undefined}
              size="lg"
              className="border-2 border-red/20"
            />
            <View className="ml-4 flex-1">
              <Text variant="h3" weight="bold" color="text-neutral-800" numberOfLines={1}>
                {user.nombre || 'Usuario'}
              </Text>
              <Text variant="bodySmall" color="text-neutral-500" className="mt-0.5">
                {user.email}
              </Text>
              <View className={`self-start mt-2 px-3 py-1 rounded-full ${roleMeta.bg}`}>
                <Text variant="caption" weight="bold" color={roleMeta.text}>
                  {roleMeta.label}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Información personal */}
        <View className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text variant="body" weight="bold" color="text-neutral-800">
              Información personal
            </Text>
            <Pressable onPress={() => setEditMode((v) => !v)} className="px-3 py-1.5 rounded-lg bg-red/10">
              <Text variant="caption" weight="semibold" color="text-red">
                {editMode ? 'Cancelar' : 'Editar'}
              </Text>
            </Pressable>
          </View>

          <Field
            label="Nombres"
            icon="person-outline"
            editable={editMode}
            value={nombres}
            onChangeText={setNombres}
            placeholder="Ingresa tus nombres"
          />
          <Field
            label="Apellidos"
            icon="person"
            editable={editMode}
            value={apellidos}
            onChangeText={setApellidos}
            placeholder="Ingresa tus apellidos"
          />
          <Field
            label="Correo"
            icon="mail-outline"
            editable={false}
            value={user.email}
          />
          <Field
            label="Teléfono"
            icon="call-outline"
            editable={editMode}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Número de contacto"
            keyboardType="phone-pad"
          />

          {editMode && (
            <View className="flex-row gap-3 mt-2">
              <Pressable
                onPress={() => setEditMode(false)}
                className="flex-1 bg-neutral-100 rounded-xl items-center py-3"
                disabled={saving}
              >
                <Text weight="semibold" color="text-neutral-700">
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                className="flex-1 bg-red rounded-xl items-center py-3"
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text weight="bold" color="text-white">
                    Guardar
                  </Text>
                )}
              </Pressable>
            </View>
          )}
        </View>

        {/* Seguridad */}
        <View className="mt-4 bg-white rounded-2xl p-4 border border-neutral-100 shadow-sm">
          <Text variant="body" weight="bold" color="text-neutral-800" className="mb-3">
            Seguridad
          </Text>
          <Pressable
            className="flex-row items-center justify-between py-2"
            onPress={() => {
              setMensaje('La opción de cambiar contraseña estará disponible pronto.')
              setMensajeColor('info')
              setTimeout(() => setMensaje(null), 2500)
            }}
          >
            <View className="flex-row items-center">
              <View className="bg-neutral-100 p-2.5 rounded-xl mr-3">
                <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
              </View>
              <View>
                <Text variant="body" weight="medium" color="text-neutral-800">Cambiar contraseña</Text>
                <Text variant="caption" color="text-neutral-400">
                  Próximamente
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </Pressable>
        </View>

        {/* Botón cerrar sesión */}
        <Pressable
          onPress={onLogout}
          className="mt-4 bg-white border border-red/20 rounded-2xl items-center py-3.5 flex-row justify-center shadow-sm"
        >
          <Ionicons name="log-out-outline" size={20} color="#F0412D" />
          <Text variant="body" weight="bold" color="text-red" className="ml-2">
            Cerrar sesión
          </Text>
        </Pressable>

        {mensaje && (
          <View
            className={`mt-3 px-3 py-2 rounded-xl ${
              mensajeColor === 'success'
                ? 'bg-green-100'
                : mensajeColor === 'error'
                ? 'bg-red-100'
                : 'bg-neutral-100'
            }`}
          >
            <Text
              variant="bodySmall"
              color={
                mensajeColor === 'success'
                  ? 'text-green-700'
                  : mensajeColor === 'error'
                  ? 'text-red-700'
                  : 'text-neutral-700'
              }
            >
              {mensaje}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  editable = true,
  keyboardType = 'default',
}: {
  label: string
  value: string
  onChangeText?: (v: string) => void
  placeholder?: string
  icon?: keyof typeof Ionicons.glyphMap
  editable?: boolean
  keyboardType?: 'default' | 'phone-pad' | 'email-address'
}) {
  return (
    <View className="mb-3">
      <View className="flex-row items-center mb-1">
        {icon && <Ionicons name={icon} size={16} color="#9CA3AF" style={{ marginRight: 6 }} />}
        <Text variant="caption" weight="semibold" color="text-neutral-500">
          {label}
        </Text>
      </View>
      <TextInput
        value={value}
        editable={editable}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        className={`rounded-xl border px-4 py-3 text-neutral-800 ${
          editable ? 'bg-white border-neutral-200' : 'bg-neutral-100 border-neutral-200'
        }`}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  )
}
