import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi'
import { BRAND_COLORS, credentialsSchema, type Credentials } from '../shared/types'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { TextField } from '../../components/ui/TextField'
import { ToastNotification } from '../../components/ui/ToastNotification'
import { signIn } from '../../services/auth/authClient'
import { getUserFriendlyMessage } from '../../utils/errorMessages'
import { useState } from 'react'
import logo from '../../assets/logo.png'

type LoginScreenProps = {
  onSignedIn: (credentials: Credentials) => void
  onForgotPassword: () => void
}

export function LoginScreen({ onSignedIn, onForgotPassword }: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)

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

  const onSubmit = handleSubmit(async (values) => {
    try {
      setServerError(null)
      const result = await signIn(values.email, values.password)
      onSignedIn({ ...values, role: result.user?.role ?? 'Vendedor' })
    } catch (error) {
      setServerError(getUserFriendlyMessage(error))
    }
  })

  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
      {serverError && <ToastNotification message={serverError} onHide={() => setServerError(null)} />}

      {/* Header with logo */}
      <div
        className="relative flex flex-col items-center px-8 py-10"
        style={{ backgroundColor: BRAND_COLORS.red }}
      >
        {/* Decorative shapes */}
        <div
          className="absolute -top-16 -left-16 h-40 w-40 rounded-full opacity-20"
          style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        />
        <div
          className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full opacity-25"
          style={{ backgroundColor: BRAND_COLORS.gold }}
        />

        <img
          src={logo}
          alt="Cafrisales"
          className="relative z-10 h-16 w-auto object-contain"
          style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.2))' }}
        />
      </div>

      {/* Form section */}
      <div className="px-8 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-neutral-800">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Ingresa tus credenciales para acceder
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextField
                label="Correo electrónico"
                placeholder="ejemplo@cafrisales.com"
                {...field}
                error={errors.email?.message}
                left={<FiMail size={18} color={BRAND_COLORS.red700} />}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <TextField
                label="Contraseña"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                {...field}
                error={errors.password?.message}
                left={<FiLock size={18} color={BRAND_COLORS.red700} />}
                right={
                  <button
                    type="button"
                    className="text-neutral-400 transition-colors hover:text-red700"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                }
              />
            )}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-neutral-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember((prev) => !prev)}
                className="h-4 w-4 rounded border-neutral-300 accent-red"
              />
              Recordarme
            </label>
            <button
              type="button"
              className="font-medium text-red700 transition-colors hover:text-red"
              onClick={onForgotPassword}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <PrimaryButton title="Ingresar" loading={isSubmitting} type="submit" />
        </form>
      </div>
    </div>
  )
}
