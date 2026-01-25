import { z } from 'zod'

export const BRAND_COLORS = {
  red: '#F0412D',
  red700: '#C52C1B',
  gold: '#F4D46A',
  cream: '#FFF5D9',
}

export const credentialsSchema = z.object({
  email: z.string().nonempty('Ingresa un correo válido').email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.string().optional(),
})

export type Credentials = z.infer<typeof credentialsSchema>
