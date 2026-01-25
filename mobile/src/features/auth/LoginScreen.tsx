import { Ionicons } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BRAND_COLORS, credentialsSchema, type Credentials } from '../shared/types'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { TextField } from '../../components/ui/TextField'
import { ToastNotification } from '../../components/ui/ToastNotification'
import { signIn } from '../../services/auth/authClient'
import { getUserFriendlyMessage } from '../../utils/errorMessages'
import logo from '../../../assets/logo.png'

type Props = {
  onSignedIn: (role: string, email: string) => void
  onForgotPassword: () => void
}

export function LoginScreen({ onSignedIn, onForgotPassword }: Props) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [remember, setRemember] = React.useState(true)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'Vendedor',
    },
  })

  React.useEffect(() => {
    if (serverError) {
      setServerError(null)
    }
  }, [control._formState.isDirty])

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      setServerError(null)
      const auth = await signIn(email, password)
      onSignedIn(auth.user?.role ?? 'Vendedor', email)
    } catch (error) {
      setServerError(getUserFriendlyMessage(error, 'No pudimos iniciar sesión, inténtalo de nuevo.'))
    }
  })

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" backgroundColor={BRAND_COLORS.red} />

      <View className="relative bg-red pb-12 pt-12">
        <View className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-30 bg-[#F59E0B]" />
        <View className="absolute top-6 left-[-20px] h-20 w-20 rounded-full opacity-30 bg-[#FCD34D]" />
        <View className="items-center justify-center px-6">
          <View className="rounded-3xl bg-white/20 px-8 py-4 shadow-[0_20px_45px_rgba(0,0,0,0.2)]">
            <Image source={logo} className="w-48 h-20" resizeMode="contain" />
          </View>
          <Text
            className="mt-4 text-center text-sm font-semibold uppercase text-white/80"
            style={{ letterSpacing: 1.5 }}
          >
            Alimentando tu vida
          </Text>
        </View>
      </View>

      {serverError && (
        <ToastNotification
          message={serverError}
          type="error"
          duration={3500}
          onHide={() => setServerError(null)}
        />
      )}

      <SafeAreaView className="flex-1 px-4 -mt-10" edges={['bottom']}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="mt-6 rounded-4xl bg-white px-6 py-8 shadow-[0_25px_55px_rgba(15,23,42,0.15)]">
            <View className="items-center mb-6">
              <Text className="text-2xl font-bold text-neutral-900 text-center">Iniciar sesión</Text>
              <View className="mt-2 h-1 w-16 rounded-full bg-red/70" />
              <Text className="text-neutral-500 mt-2 text-center text-sm">
                Ingresa tus credenciales para acceder
              </Text>
            </View>
            <View className="w-full space-y-6">
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange, onBlur, ref } }) => (
                  <TextField
                    label="Correo electrónico"
                    placeholder="ejemplo@cafrisales.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    ref={ref}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textContentType="emailAddress"
                    error={errors.email?.message}
                    left={<Ionicons name="mail-outline" size={20} color={BRAND_COLORS.red} />}
                    variant="filled"
                  />
                )}
              />

              <View>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { value, onChange, onBlur, ref } }) => (
                    <TextField
                      label="Contraseña"
                      placeholder="••••••••"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      ref={ref}
                      secureTextEntry={!showPassword}
                      error={errors.password?.message}
                      left={<Ionicons name="lock-closed-outline" size={20} color={BRAND_COLORS.red} />}
                      right={
                        <Pressable
                          onPress={() => setShowPassword((prev) => !prev)}
                          hitSlop={10}
                          className="p-1"
                        >
                          <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#6B7280"
                          />
                        </Pressable>
                      }
                      variant="filled"
                    />
                  )}
                />
                <View className="items-end mt-2">
                  <Pressable onPress={onForgotPassword} hitSlop={10}>
                    <Text className="text-red font-semibold text-sm py-1">
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={() => setRemember((prev) => !prev)}
                className="flex-row items-center gap-2 self-start"
              >
                <Ionicons
                  name={remember ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={remember ? BRAND_COLORS.red : '#9CA3AF'}
                />
                <Text className="text-neutral-600">Mantener sesión iniciada</Text>
              </Pressable>
            </View>

            <View className="mt-6">
              <PrimaryButton
                title={isSubmitting ? 'Verificando...' : 'Ingresar'}
                loading={isSubmitting}
                onPress={onSubmit}
                className="w-full"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
