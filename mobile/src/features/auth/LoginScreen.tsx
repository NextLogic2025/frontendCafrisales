import { Ionicons } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BRAND_COLORS, credentialsSchema, type Credentials } from '../shared/types'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { TextField } from '../../components/ui/TextField'
import { ToastNotification } from '../../components/ui/ToastNotification'
import { loginWithCredentials, SignedInUser } from '../../services/authService'
import { getUserFriendlyMessage } from '../../utils/errorMessages'
import logo from '../../../assets/logo.png'

type Props = {
  onSignedIn: (user: SignedInUser) => void
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
    if (serverError) setServerError(null)
  }, [control._formState.isDirty])

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      setServerError(null)
      const auth = await loginWithCredentials(email, password)
      onSignedIn({ ...auth, email })
    } catch (error) {
      setServerError(getUserFriendlyMessage(error, 'No pudimos iniciar sesión, inténtalo de nuevo.'))
    }
  })

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" backgroundColor={BRAND_COLORS.red} />

      {serverError && (
        <ToastNotification
          message={serverError}
          type="error"
          duration={4000}
          onHide={() => setServerError(null)}
        />
      )}

      {/* Header rojo con formas decorativas */}
      <View className="bg-red pt-12 pb-20">
        {/* Círculos decorativos */}
        <View className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full opacity-10" />
        <View className="absolute top-20 -left-8 w-24 h-24 bg-gold rounded-full opacity-20" />
        <View className="absolute -bottom-6 right-10 w-16 h-16 bg-white rounded-full opacity-10" />

        {/* Logo */}
        <View className="items-center justify-center px-6">
          <View className="bg-white/20 rounded-2xl px-6 py-4">
            <Image
              source={logo}
              style={{ width: 180, height: 70 }}
              resizeMode="contain"
            />
          </View>
          <Text className="mt-3 text-white/90 text-sm font-medium tracking-wide uppercase">
            Alimentando tu vida
          </Text>
        </View>
      </View>

      {/* Formulario con overlap */}
      <SafeAreaView className="flex-1 -mt-10" edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
          >
            {/* Card del formulario */}
            <View className="bg-white rounded-3xl px-6 py-8 shadow-lg">
              {/* Título */}
              <View className="items-center mb-8">
                <Text className="text-2xl font-bold text-neutral-800">
                  Bienvenido
                </Text>
                <View className="mt-2 h-1 w-16 rounded-full bg-red" />
                <Text className="text-neutral-500 mt-3 text-center text-sm">
                  Ingresa a tu cuenta para continuar
                </Text>
              </View>

              {/* Campos */}
              <View className="gap-5">
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      label="Correo electrónico"
                      placeholder="ejemplo@cafrilosa.com"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      error={errors.email?.message}
                      left={
                        <Ionicons
                          name="mail-outline"
                          size={20}
                          color={BRAND_COLORS.red}
                        />
                      }
                    />
                  )}
                />

                <View>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        label="Contraseña"
                        placeholder="••••••••"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                        textContentType="password"
                        error={errors.password?.message}
                        left={
                          <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color={BRAND_COLORS.red}
                          />
                        }
                        right={
                          <Pressable
                            onPress={() => setShowPassword(!showPassword)}
                            hitSlop={10}
                            className="p-1"
                          >
                            <Ionicons
                              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={20}
                              color={BRAND_COLORS.red}
                            />
                          </Pressable>
                        }
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

                {/* Checkbox */}
                <Pressable
                  onPress={() => setRemember(!remember)}
                  className="flex-row items-center gap-2 self-start"
                >
                  <View
                    className={`w-5 h-5 rounded border-2 items-center justify-center ${
                      remember ? 'bg-red border-red' : 'border-neutral-300'
                    }`}
                  >
                    {remember && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text className="text-neutral-600">Mantener sesión iniciada</Text>
                </Pressable>

                {/* Botón */}
                <View className="mt-4">
                  <PrimaryButton
                    title={isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
                    loading={isSubmitting}
                    onPress={onSubmit}
                    size="lg"
                    style={{
                      shadowColor: BRAND_COLORS.red,
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.35,
                      shadowRadius: 12,
                      elevation: 10,
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Footer */}
            <View className="mt-6 mb-4 items-center">
              <Text className="text-neutral-400 text-xs">
                © 2024 Cafrilosa. Todos los derechos reservados.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Forma decorativa inferior */}
      <View className="absolute bottom-0 left-0 right-0 h-2 bg-red" />
    </View>
  )
}
