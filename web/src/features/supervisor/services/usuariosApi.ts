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
interface StaffEntry {
  usuario_id: string
  codigo_empleado?: string
  supervisor_id?: string | null
  numero_licencia?: string
  licencia_vence_en?: string
  activo?: boolean
}

interface UserApiUser {
  id?: string
  email?: string
  rol?: string
  estado?: 'activo' | 'inactivo' | 'suspendido'
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

    const staff = [
      ...vendedores.map((item: StaffEntry) => ({ ...item, rol: 'vendedor' })),
      ...bodegueros.map((item: StaffEntry) => ({ ...item, rol: 'bodeguero' })),
      ...transportistas.map((item: StaffEntry) => ({ ...item, rol: 'transportista' })),
    ]

    // 2. Fetch user details for each staff member
    const userFetches = await Promise.all(
      staff.map(async (member) => {
        try {
          const res = await fetch(createUrl(`/usuarios/${member.usuario_id}`), { headers })
          const user = res.ok ? await res.json() as UserApiUser : null
          return { id: member.usuario_id, user }
        } catch (error) {
          return { id: member.usuario_id, user: null }
        }
      })
    )

    const userMap = new Map(userFetches.map((entry) => [entry.id, entry.user]))

    // 3. Map to Usuario interface
    return staff.map((member) => {
      const user = userMap.get(member.usuario_id)
      const email = user?.email || ''
      // Prefer api user role, fallback to list role
      const roleName = (user?.rol || member.rol || 'Usuario').toLowerCase()
      const active = member.activo ?? (user?.estado ? user.estado === 'activo' : true)
      // Mobile logic: "name = email || code || 'Sin nombre'" if no explicit name?
      // Actually mobile fetches profile too? 
      // Mobile `normalizeUser` does: `name: fullName || user.email || 'Sin nombre'`
      // But `fetchStaffEmployees` in mobile DOES NOT fetch profile separately for each user in the list loop?
      // Wait, mobile `fetchStaffEmployees` calls `ApiService.get.../usuarios/${member.usuario_id}` which returns `UserApiUser`.
      // `UserApiUser` generally contains basic info. Does it contain profile names?
      // Looking at mobile code: `type UserApiUser = { id, email, rol, estado }`.
      // It seems mobile relies on `user` object.
      // Mobile `fetchStaffEmployees` constructs name: `const name = email || member.codigo_empleado || 'Sin nombre'`.
      // It seems mobile LIST implementation allows name to be email if profile isn't fetched?
      // However, `normalizeUser` is used in `getProfile` but NOT in `fetchStaffEmployees` return map.
      // Wait, let's re-read `fetchStaffEmployees` in mobile.
      /*
      return staff.map((member) => {
          const user = userMap.get(member.usuario_id)
          const email = user?.email || ''
          ...
          const name = email || member.codigo_empleado || 'Sin nombre'
          ...
      })
      */
      // Logic: Name IS email or code.

      // FOR WEB: We probably want the real name if available?
      // The web `Usuario` interface has `nombre` and `nombreCompleto`.
      // `EquipoList` displays `usuario.nombre`.
      // If we only have email, that's what we show.

      const roleId = roleNameMap[roleName] || 0

      return {
        id: member.usuario_id,
        email: email,
        nombre: email, // As per mobile logic
        nombreCompleto: member.codigo_empleado, // Storing code here for now or maybe just leave undefined
        telefono: null,
        avatarUrl: null,
        emailVerificado: true,
        activo: active,
        createdAt: new Date().toISOString(), // Mock, not available in listing
        rol: {
          id: roleId,
          nombre: roleName.charAt(0).toUpperCase() + roleName.slice(1) // Capitalize
        }
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}
