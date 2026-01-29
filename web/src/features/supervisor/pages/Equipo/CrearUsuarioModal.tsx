import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from 'components/ui/Button'
import { TextField } from 'components/ui/TextField'
import {
  createUsuario,
  getUserById,
  getUserProfile,
  updateUsuarioCompleto,
  updateUsuarioPassword,
  updateUsuarioEmail,
  type Usuario
} from '../../services/usuariosApi'
import { Alert } from 'components/ui/Alert'
import { Modal } from 'components/ui/Modal'

// Icons
function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
  )
}

function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
  )
}

const ROLES = [
  { key: 'vendedor', label: 'Vendedor' },
  { key: 'bodeguero', label: 'Bodeguero' },
  { key: 'transportista', label: 'Transportista' },
  { key: 'supervisor', label: 'Supervisor' },
] as const

const EMP_PREFIX: Record<string, string> = {
  vendedor: 'VEN',
  bodeguero: 'BOD',
  transportista: 'TRAN',
  supervisor: 'SUP',
}

// Schema for create mode (password required)
const createSchema = z.object({
  role: z.enum(['vendedor', 'bodeguero', 'transportista', 'supervisor']),
  fullName: z.string().min(3, 'Nombre completo requerido (mínimo 2 palabras)'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'Teléfono requerido (7-15 dígitos)'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  empCode: z.string().min(1, 'Código requerido'),
  license: z.string().optional(),
  licenseExpiry: z.string().optional(),
}).refine((data) => {
  if (data.role === 'transportista' && !data.license) {
    return false
  }
  return true
}, {
  message: "Licencia requerida para transportista",
  path: ["license"]
})

// Schema for edit mode (password optional)
const editSchema = z.object({
  role: z.enum(['vendedor', 'bodeguero', 'transportista', 'supervisor']),
  fullName: z.string().min(3, 'Nombre completo requerido (mínimo 2 palabras)'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'Teléfono requerido (7-15 dígitos)'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  empCode: z.string().min(1, 'Código requerido'),
  license: z.string().optional(),
  licenseExpiry: z.string().optional(),
}).refine((data) => {
  if (data.role === 'transportista' && !data.license) {
    return false
  }
  return true
}, {
  message: "Licencia requerida para transportista",
  path: ["license"]
})

type FormValues = z.infer<typeof editSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: Usuario | null
  mode?: 'create' | 'edit'
}

export function CrearUsuarioModal({ isOpen, onClose, onSuccess, initialData, mode = 'create' }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [originalEmail, setOriginalEmail] = useState<string>('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(mode === 'create' ? createSchema : editSchema),
    defaultValues: {
      role: 'vendedor',
      fullName: '',
      email: '',
      phone: '',
      password: '',
      empCode: '',
      license: '',
      licenseExpiry: '',
    },
  })

  const selectedRole = watch('role')

  // Load user data when editing
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      loadUserData()
    } else if (isOpen && mode === 'create') {
      reset({
        role: 'vendedor',
        fullName: '',
        email: '',
        phone: '',
        password: '',
        empCode: '',
        license: '',
        licenseExpiry: '',
      })
    }
  }, [isOpen, mode, initialData])

  const loadUserData = async () => {
    if (!initialData) return

    setIsLoadingData(true)
    try {
      // Get user details and profile
      const [userData, profileData] = await Promise.all([
        getUserById(initialData.id),
        getUserProfile(initialData.id).catch(() => null),
      ])

      const fullName = profileData
        ? `${profileData.nombres} ${profileData.apellidos}`.trim()
        : initialData.nombreCompleto || initialData.nombre

      setOriginalEmail(userData.email || initialData.email)

      // Extract employee code (remove prefix)
      let empCode = ''
      let license = ''
      let licenseExpiry = ''
      const roleName = initialData.rol.nombre.toLowerCase()

      // Get role-specific data from userData
      if (roleName === 'vendedor' && userData.vendedor) {
        empCode = userData.vendedor.codigo_empleado?.replace(/^VEN-/, '') || ''
      } else if (roleName === 'bodeguero' && userData.bodeguero) {
        empCode = userData.bodeguero.codigo_empleado?.replace(/^BOD-/, '') || ''
      } else if (roleName === 'transportista' && userData.transportista) {
        empCode = userData.transportista.codigo_empleado?.replace(/^TRAN-/, '') || ''
        license = userData.transportista.numero_licencia || ''
        licenseExpiry = userData.transportista.licencia_vence_en || ''
      } else if (roleName === 'supervisor' && userData.supervisor) {
        empCode = userData.supervisor.codigo_empleado?.replace(/^SUP-/, '') || ''
      }

      reset({
        role: roleName as any,
        fullName,
        email: userData.email || initialData.email,
        phone: profileData?.telefono || initialData.telefono || '',
        password: '',
        empCode,
        license,
        licenseExpiry,
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      setServerError('Error al cargar datos del usuario')
    } finally {
      setIsLoadingData(false)
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const parts = values.fullName.trim().split(' ')
      const nombres = parts[0]
      const apellidos = parts.slice(1).join(' ') || parts[0]

      const prefix = EMP_PREFIX[values.role] ?? 'EMPL'
      const fullCode = `${prefix}-${values.empCode}`

      if (mode === 'create') {
        // CREATE MODE
        const payload: any = {
          email: values.email,
          password: values.password,
          rol: values.role.toUpperCase(),
          perfil: {
            nombres,
            apellidos,
            telefono: values.phone,
          },
        }

        if (values.role === 'vendedor') {
          payload.vendedor = { codigo_empleado: fullCode }
        } else if (values.role === 'bodeguero') {
          payload.bodeguero = { codigo_empleado: fullCode }
        } else if (values.role === 'transportista') {
          payload.transportista = {
            codigo_empleado: fullCode,
            numero_licencia: values.license!,
            ...(values.licenseExpiry ? { licencia_vence_en: values.licenseExpiry } : {}),
          }
        } else if (values.role === 'supervisor') {
          payload.supervisor = { codigo_empleado: fullCode }
        }

        await createUsuario(payload)
      } else {
        // EDIT MODE
        if (!initialData) throw new Error('No user data to edit')

        // 1. Update email if changed
        if (values.email !== originalEmail) {
          await updateUsuarioEmail(initialData.id, values.email)
        }

        // 2. Update password if provided
        if (values.password && values.password.trim() !== '') {
          await updateUsuarioPassword(initialData.id, values.password)
        }

        // 3. Update user data
        const updatePayload: any = {
          email: values.email,
          rol: values.role.toLowerCase(),
          perfil: {
            nombres,
            apellidos,
            telefono: values.phone,
          },
        }

        // Add role-specific data
        if (values.role === 'vendedor') {
          updatePayload.vendedor = { codigo_empleado: fullCode }
        } else if (values.role === 'bodeguero') {
          updatePayload.bodeguero = { codigo_empleado: fullCode }
        } else if (values.role === 'transportista') {
          updatePayload.transportista = {
            codigo_empleado: fullCode,
            numero_licencia: values.license!,
            ...(values.licenseExpiry ? { licencia_vence_en: values.licenseExpiry } : {}),
          }
        } else if (values.role === 'supervisor') {
          updatePayload.supervisor = { codigo_empleado: fullCode }
        }

        await updateUsuarioCompleto(initialData.id, updatePayload)
      }

      reset()
      onSuccess()
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message)
      } else {
        setServerError('Error desconocido')
      }
    }
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Editar Empleado' : 'Nuevo Empleado'}
      maxWidth="md"
      headerGradient="red"
    >
      {isLoadingData ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando datos...</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5 px-1 py-2">
          {serverError && (
            <Alert type="error" message={serverError} onClose={() => setServerError(null)} />
          )}

          {/* Role Tabs */}
          <div className="flex justify-between gap-2 rounded-xl bg-neutral-100 p-1">
            {ROLES.map((role) => (
              <button
                key={role.key}
                type="button"
                onClick={() => setValue('role', role.key)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${selectedRole === role.key
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-200'
                  }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <TextField
              label="Nombre completo"
              placeholder="Ej. Ana Gomez"
              {...register('fullName')}
              error={errors.fullName?.message}
              tone="light"
            />

            <TextField
              label="Email"
              placeholder="correo@empresa.com"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              tone="light"
            />

            <TextField
              label="Teléfono"
              placeholder="+59170000000"
              {...register('phone')}
              error={errors.phone?.message}
              tone="light"
            />

            <TextField
              label={mode === 'edit' ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
              placeholder="********"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={errors.password?.message}
              tone="light"
              right={
                <button type="button" onClick={() => setShowPassword(s => !s)} className="text-gray-400 hover:text-brand-red">
                  {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
                </button>
              }
            />

            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Código de empleado</label>
              <div className="flex items-center rounded-xl bg-neutral-50 px-3 ring-1 ring-neutral-200 focus-within:ring-2 focus-within:ring-brand-red transition-all">
                <span className="text-neutral-500 select-none font-medium">{EMP_PREFIX[selectedRole] ?? 'EMPL'}-</span>
                <input
                  {...register('empCode')}
                  className="w-full bg-transparent py-2.5 pl-2 text-neutral-900 placeholder-neutral-400 outline-none"
                  placeholder="01"
                />
              </div>
              {errors.empCode && <p className="text-xs text-red-500">{errors.empCode.message}</p>}
            </div>

            {selectedRole === 'transportista' && (
              <>
                <TextField
                  label="Número de Licencia"
                  placeholder="Ej. 123456-A"
                  {...register('license')}
                  error={errors.license?.message}
                  tone="light"
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Fecha de Vencimiento de Licencia (Opcional)
                  </label>
                  <input
                    type="date"
                    {...register('licenseExpiry')}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                  {errors.licenseExpiry && <p className="text-xs text-red-500 mt-1">{errors.licenseExpiry.message}</p>}
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-brand-red text-white hover:bg-brand-red/90 px-6 shadow-lg shadow-brand-red/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (mode === 'edit' ? 'Actualizando...' : 'Creando...') : (mode === 'edit' ? 'Actualizar empleado' : 'Crear empleado')}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  )
}
