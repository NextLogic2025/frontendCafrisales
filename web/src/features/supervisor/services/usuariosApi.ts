import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'

export interface Usuario {
  id: string
  email: string
  nombre: string
  /** Nombre completo, si está disponible */
  nombreCompleto?: string
  telefono: string | null
  avatarUrl: string | null
  emailVerificado: boolean
  activo: boolean
  createdAt: string
  rol: {
    id: number
    nombre: string
  }
}

export interface CreateUserPayload {
  email: string
  password?: string
  rol: string
  perfil: {
    nombres: string
    apellidos: string
    telefono?: string
  }
  cliente?: {
    canal_id?: string | number | null
    nombre_comercial?: string | null
    ruc?: string | null
    zona_id?: string | number | null
    direccion?: string | null
    latitud?: number | null
    longitud?: number | null
    vendedor_asignado_id?: string | null
    condiciones?: {
      permite_negociacion?: boolean
      porcentaje_descuento_max?: number
      requiere_aprobacion_supervisor?: boolean
      observaciones?: string | null
    }
  }
  vendedor?: {
    codigo_empleado: string
  }
  bodeguero?: {
    codigo_empleado: string
  }
  transportista?: {
    codigo_empleado: string
    numero_licencia: string
  }
}

export async function createUsuario(data: CreateUserPayload) {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  // Use Auth Service Register endpoint (matching mobile app logic)
  const url = `${env.api.auth}/api/auth/register`

  // Construct payload with nested structure (matching CreateUserDto / Mobile App)
  const payload: any = {
    email: data.email,
    password: data.password,
    rol: data.rol.toLowerCase(),
    perfil: {
      nombres: data.perfil.nombres,
      apellidos: data.perfil.apellidos,
      telefono: data.perfil.telefono,
    },
    // Add creator ID if available in token, but backend usually extracts it from token
  }

  // Add role-specific nested objects
  if (data.vendedor) {
    payload.vendedor = { codigo_empleado: data.vendedor.codigo_empleado }
  }
  if (data.bodeguero) {
    payload.bodeguero = { codigo_empleado: data.bodeguero.codigo_empleado }
  }
  if (data.transportista) {
    payload.transportista = {
      codigo_empleado: data.transportista.codigo_empleado,
      numero_licencia: data.transportista.numero_licencia,
    }
  }
  if (data.cliente) {
    payload.cliente = data.cliente
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al crear el usuario')
  }

  return await res.json()
}

export async function updateUsuario(
  userId: string,
  data: Partial<{
    nombres: string
    apellidos: string
    telefono: string
  }>,
) {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const url = `${env.api.usuarios}/api/usuarios/${userId}`
  const payload: any = {}
  if (data.nombres || data.apellidos || data.telefono) {
    payload.perfil = {
      ...(data.nombres ? { nombres: data.nombres } : {}),
      ...(data.apellidos ? { apellidos: data.apellidos } : {}),
      ...(data.telefono ? { telefono: data.telefono } : {}),
    }
  }

  if (Object.keys(payload).length === 0) return

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al actualizar el usuario')
  }

  return await res.json().catch(() => null)
}

export async function updateEstadoUsuario(userId: string, estado: 'activo' | 'inactivo') {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const url = `${env.api.usuarios}/api/usuarios/${userId}`
  const body = { estado }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al actualizar estado del usuario')
  }

  return await res.json().catch(() => null)
}


// --- Tipos internos para mapeo (copiados de mobile) ---
// --- Tipos internos para mapeo (copiados de mobile) ---
interface StaffEntry {
  usuario_id: string
  codigo_empleado?: string
  supervisor_id?: string | null
  numero_licencia?: string
  licencia_vence_en?: string
  activo?: boolean
  rol?: string
  usuario?: {
    email: string
    rol: string
    estado?: string // 'activo' | 'inactivo' | ...
    creado_en?: string
    perfil?: {
      nombres: string
      apellidos: string
      telefono?: string
      url_avatar?: string
    }
  }
}

// Compatibilidad para useZonas.ts
export interface Vendedor {
  id: string
  nombre: string
  // Añadir campos extra si es necesario
}

export async function obtenerVendedores(): Promise<Vendedor[]> {
  const users = await getUsers()
  return users
    .filter(u => u.rol.nombre.toLowerCase().includes('vendedor'))
    .map(u => ({
      id: u.id,
      nombre: u.nombreCompleto || u.nombre // Prefiere nombre completo(codigo) o email
    }))
}

const roleIdMap: Record<number, string> = {
  1: 'admin',
  2: 'supervisor',
  3: 'bodeguero',
  4: 'vendedor',
  5: 'transportista',
  6: 'cliente',
}

// Invert map for looking up IDs by name if needed, but here we need to map string role to ID for UI?
// The UI expects `rol: { id: number, nombre: string }`.
const roleNameMap: Record<string, number> = {
  'admin': 1,
  'supervisor': 2,
  'bodeguero': 3,
  'vendedor': 4,
  'transportista': 5,
  'cliente': 6
}

export async function getUsers(): Promise<Usuario[]> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const headers = { Authorization: `Bearer ${token}` }
  const createUrl = (path: string) => `${env.api.usuarios}/api${path}`

  try {
    // 1. Fetch staff lists
    const [vendedores, bodegueros, transportistas] = await Promise.all([
      fetch(createUrl('/staff/vendedores'), { headers }).then(r => r.ok ? r.json() : [] as StaffEntry[]),
      fetch(createUrl('/staff/bodegueros'), { headers }).then(r => r.ok ? r.json() : [] as StaffEntry[]),
      fetch(createUrl('/staff/transportistas'), { headers }).then(r => r.ok ? r.json() : [] as StaffEntry[]),
    ])

    const staff: StaffEntry[] = [
      ...vendedores.map((item: StaffEntry) => ({ ...item, rol: 'vendedor' })),
      ...bodegueros.map((item: StaffEntry) => ({ ...item, rol: 'bodeguero' })),
      ...transportistas.map((item: StaffEntry) => ({ ...item, rol: 'transportista' })),
    ]

    // 2. Fetch user details for each staff member
    // The backend staff endpoints do NOT return nested user objects, so we must fetch them.
    const userFetches = await Promise.all(
      staff.map(async (member) => {
        try {
          const res = await fetch(createUrl(`/usuarios/${member.usuario_id}`), { headers })
          // We expect the user object directly or maybe inside a data wrapper?
          // Looking at getUserById line 407, it returns res.json().
          const user = res.ok ? await res.json() : null
          return { id: member.usuario_id, user }
        } catch (error) {
          console.error(`Error fetching user ${member.usuario_id}`, error)
          return { id: member.usuario_id, user: null }
        }
      })
    )

    const userMap = new Map(userFetches.map((entry) => [entry.id, entry.user]))

    // 3. Map to Usuario interface
    return staff.map((member) => {
      const user = userMap.get(member.usuario_id)
      const perfil = user?.perfil
      const email = user?.email || ''

      // Determine role safely
      const roleName = (user?.rol?.nombre || user?.rol || member.rol || 'Usuario').toLowerCase()

      // Determine active status
      // Prefer explicit user.estado if available
      const active = (user?.estado ? user.estado === 'activo' : undefined) ?? (member.activo ?? true)

      // Construct Name: "Luis Leon"
      let realName = email
      if (perfil?.nombres) {
        realName = `${perfil.nombres} ${perfil.apellidos}`.trim()
      }

      // Construct Display Name: "VEN-01 - Luis Leon"
      const displayName = member.codigo_empleado
        ? `${member.codigo_empleado} - ${realName}`
        : realName

      const roleId = roleNameMap[roleName] || 0

      return {
        id: member.usuario_id,
        email: email,
        nombre: realName,
        nombreCompleto: displayName,
        telefono: perfil?.telefono || null,
        avatarUrl: perfil?.url_avatar || null,
        emailVerificado: true,
        activo: active,
        createdAt: user?.creado_en || user?.createdAt || new Date().toISOString(),
        rol: {
          id: roleId,
          nombre: roleName.charAt(0).toUpperCase() + roleName.slice(1)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

/**
 * Get list of transportistas (drivers) for logistics routes
 */
export async function obtenerTransportistas(): Promise<Usuario[]> {
  const users = await getUsers()
  return users.filter(u => u.rol.nombre.toLowerCase() === 'transportista' && u.activo)
}

// ========================================
// USER EDIT FUNCTIONALITY
// ========================================

export interface UserProfile {
  nombres: string
  apellidos: string
  telefono?: string
}

export interface UpdateUserPayload {
  email?: string
  estado?: 'activo' | 'inactivo'
  rol?: string
  perfil?: {
    nombres?: string
    apellidos?: string
    telefono?: string
  }
  vendedor?: { codigo_empleado: string; supervisor_id?: string }
  bodeguero?: { codigo_empleado: string }
  transportista?: {
    codigo_empleado: string
    numero_licencia: string
    licencia_vence_en?: string
  }
  supervisor?: { codigo_empleado: string }
}

/**
 * Get user profile data
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const url = `${env.api.usuarios}/api/usuarios/${userId}/perfil`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al obtener perfil del usuario')
  }

  return await res.json()
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<any> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const url = `${env.api.usuarios}/api/usuarios/${userId}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al obtener usuario')
  }

  return await res.json()
}

/**
 * Update user with complete data including role-specific fields
 */
export async function updateUsuarioCompleto(
  userId: string,
  data: UpdateUserPayload
): Promise<any> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const url = `${env.api.usuarios}/api/usuarios/${userId}`

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al actualizar el usuario')
  }

  return await res.json()
}

/**
 * Update user password
 */
export async function updateUsuarioPassword(
  userId: string,
  password: string
): Promise<void> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const url = `${env.api.auth}/api/auth/usuarios/${userId}/password`

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al actualizar la contraseña')
  }
}

/**
 * Update user email in auth service
 */
export async function updateUsuarioEmail(
  userId: string,
  email: string
): Promise<void> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const url = `${env.api.auth}/api/auth/usuarios/${userId}/email`

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al actualizar el email')
  }
}
