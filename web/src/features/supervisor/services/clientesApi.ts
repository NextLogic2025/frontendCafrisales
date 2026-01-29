export interface ListaPrecio {
  id: string | number
  nombre: string
}

export interface Cliente {
  id: string
  usuario_principal_id: string | null
  identificacion: string
  tipo_identificacion: string
  nombres: string | null
  apellidos: string | null
  razon_social: string
  nombre_comercial: string | null
  telefono: string | null
  canal_id: string | number | null
  vendedor_asignado_id: string | null
  zona_comercial_id: string | number | null
  direccion_texto: string | null
  ubicacion_gps?: { type: 'Point'; coordinates: [number, number] } | null
  latitud?: number | null
  longitud?: number | null
  estado?: 'activo' | 'inactivo' | 'suspendido' | string | null
  email?: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  zona_comercial?: { id: number; nombre: string }
  canal_nombre?: string | null
  canal_codigo?: string | null
  bloqueado?: boolean
  tiene_credito?: boolean
  limite_credito?: string
  saldo_actual?: string
  dias_plazo?: number
  lista_precios?: { id: string | number; nombre: string } | null
  lista_precios_id?: string | number | null
}

export interface CreateClienteDto {
  identificacion: string
  tipo_identificacion?: string
  nombres?: string
  apellidos?: string
  razon_social: string
  nombre_comercial?: string
  telefono?: string
  usuario_principal_id?: string | null
  canal_id?: string | number | null
  vendedor_asignado_id?: string | null
  zona_comercial_id?: string | number | null
  direccion_texto?: string
  ubicacion_gps?: { type: 'Point'; coordinates: [number, number] } | null
  latitud?: number | null
  longitud?: number | null
}

export interface ZonaComercial {
  id: string | number
  nombre: string
  descripcion?: string
  vendedor_asignado?: {
    id: number
    vendedor_usuario_id: string
    nombre_vendedor_cache: string | null
  } | null
}

import { jwtDecode } from 'jwt-decode'
import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'

// Use users service for vendor-client relationship, matching mobile implementation
const USERS_BASE_URL = env.api.usuarios
const USERS_API_URL = USERS_BASE_URL.endsWith('/api') ? USERS_BASE_URL : `${USERS_BASE_URL}/api`

async function getVendedorId(): Promise<string | null> {
  const token = await getValidToken()
  if (!token) return null
  try {
    const decoded = jwtDecode<{ sub?: string; userId?: string }>(token)
    return decoded.sub || decoded.userId || null
  } catch {
    return null
  }
}

// Use catalog service for client data, matching mobile implementation
const CATALOG_BASE_URL = env.api.catalogo
const CATALOG_API_URL = CATALOG_BASE_URL.endsWith('/api') ? CATALOG_BASE_URL : `${CATALOG_BASE_URL}/api`

type BackendCliente = {
  usuario_id?: string
  canal_id?: string | number | null
  nombre_comercial?: string | null
  ruc?: string | null
  zona_id?: string | number | null
  direccion?: string | null
  latitud?: number | null
  longitud?: number | null
  vendedor_asignado_id?: string | null
  creado_en?: string
  actualizado_en?: string
  email?: string | null
  estado?: string | null
  nombres?: string | null
  apellidos?: string | null
  telefono?: string | null
  canal_nombre?: string | null
  canal_codigo?: string | null
}

function mapCliente(raw: BackendCliente | Cliente): Cliente {
  const usuarioId = (raw as any).usuario_id || (raw as any).usuario_principal_id || (raw as any).id
  const nombres = (raw as any).nombres ?? null
  const apellidos = (raw as any).apellidos ?? null
  const nombreComercial = (raw as any).nombre_comercial ?? null
  const ruc = (raw as any).ruc ?? (raw as any).identificacion ?? ''
  const direccion = (raw as any).direccion ?? (raw as any).direccion_texto ?? null

  return {
    id: String(usuarioId || ''),
    usuario_principal_id: usuarioId || null,
    identificacion: String(ruc || ''),
    tipo_identificacion: (raw as any).tipo_identificacion || 'RUC',
    nombres,
    apellidos,
    razon_social: (raw as any).razon_social || nombreComercial || [nombres, apellidos].filter(Boolean).join(' ') || (raw as any).email || 'Cliente',
    nombre_comercial: nombreComercial,
    telefono: (raw as any).telefono ?? null,
    canal_id: (raw as any).canal_id ?? null,
    vendedor_asignado_id: (raw as any).vendedor_asignado_id ?? null,
    zona_comercial_id: (raw as any).zona_id ?? (raw as any).zona_comercial_id ?? null,
    direccion_texto: direccion,
    ubicacion_gps: (raw as any).ubicacion_gps ?? null,
    latitud: (raw as any).latitud !== null && (raw as any).latitud !== undefined ? Number((raw as any).latitud) : null,
    longitud: (raw as any).longitud !== null && (raw as any).longitud !== undefined ? Number((raw as any).longitud) : null,
    estado: (raw as any).estado ?? null,
    email: (raw as any).email ?? null,
    created_at: (raw as any).created_at || (raw as any).creado_en || new Date().toISOString(),
    updated_at: (raw as any).updated_at || (raw as any).actualizado_en || new Date().toISOString(),
    deleted_at: (raw as any).deleted_at ?? null,
    zona_comercial: (raw as any).zona_comercial ?? undefined,
    canal_nombre: (raw as any).canal_nombre ?? null,
    canal_codigo: (raw as any).canal_codigo ?? null,
    bloqueado: (raw as any).bloqueado ?? false,
    tiene_credito: (raw as any).tiene_credito ?? false,
    limite_credito: (raw as any).limite_credito ?? '0.00',
    saldo_actual: (raw as any).saldo_actual ?? '0.00',
    dias_plazo: (raw as any).dias_plazo ?? 0,
    lista_precios: (raw as any).lista_precios ?? null,
    lista_precios_id: (raw as any).lista_precios_id ?? null,
  }
}

export async function obtenerClientes(estado: 'activo' | 'inactivo' | 'todos' = 'activo'): Promise<Cliente[]> {
  try {
    const token = await getValidToken()
    const query = estado !== 'todos' ? `?estado=${estado}` : ''
    const url = `${USERS_API_URL}/clientes${query}`
    const headers: any = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(url, { headers })
    if (!res.ok) {
      console.error('obtenerClientes error:', res.status, res.statusText)
      return []
    }
    const data = await res.json().catch(() => [])
    const list = Array.isArray(data) ? data : []
    return list.map(mapCliente)
  } catch (error) {
    console.error('Error fetching clientes:', error)
    return []
  }
}

/**
 * Obtiene los clientes asignados al vendedor autenticado (Legacy or Mobile-like)
 */
export async function obtenerMisClientes(): Promise<Cliente[]> {
  const vendedorId = await getVendedorId()
  if (!vendedorId) return []
  return obtenerClientesPorVendedor(vendedorId)
}

/**
 * Obtiene los clientes de un vendedor específico (Matches Mobile UserClientService.ts)
 */
export async function obtenerClientesPorVendedor(vendedorId: string): Promise<Cliente[]> {
  try {
    const token = await getValidToken()
    // Matches mobile: `${USERS_API_URL}/vendedores/${vendedorId}/clientes`
    const url = `${USERS_API_URL}/vendedores/${vendedorId}/clientes`
    const headers: any = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(url, { headers })
    if (!res.ok) {
      console.error('obtenerClientesPorVendedor error:', res.status, res.statusText)
      return []
    }
    const data = await res.json().catch(() => [])
    const list = Array.isArray(data) ? data : []
    return list.map(mapCliente)
  } catch (error) {
    console.error('Error fetching clientes by vendedor:', error)
    return []
  }
}

export async function obtenerClientePorId(id: string): Promise<Cliente | null> {
  try {
    const token = await getValidToken()
    const url = `${USERS_API_URL}/clientes/${id}`
    const headers: any = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(url, { headers })
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    return data ? mapCliente(data as BackendCliente) : null
  } catch (error) {
    console.error('Error fetching cliente by id:', error)
    return null
  }
}

export async function crearCliente(data: CreateClienteDto): Promise<Cliente> {
  // Map local DTO to user-service API payload and call users API
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const url = `${USERS_API_URL}/clientes`

  const payload: any = {
    usuario_id: data.usuario_principal_id ?? null,
    canal_id: data.canal_id ?? null,
    nombre_comercial: data.nombre_comercial ?? data.razon_social,
    zona_id: data.zona_comercial_id ?? null,
    direccion: data.direccion_texto ?? undefined,
    latitud: data.latitud ?? undefined,
    longitud: data.longitud ?? undefined,
    vendedor_asignado_id: data.vendedor_asignado_id ?? undefined,
  }

  if (data.ubicacion_gps && Array.isArray(data.ubicacion_gps.coordinates)) {
    payload.longitud = data.ubicacion_gps.coordinates[0]
    payload.latitud = data.ubicacion_gps.coordinates[1]
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
    const err = await res.json().catch(() => null)
    throw new Error(err?.message || 'Error al crear cliente')
  }

  const created = await res.json()
  return mapCliente({
    ...created,
    usuario_id: created.usuario_id ?? created.usuario_principal_id ?? created.id,
    nombre_comercial: created.nombre_comercial ?? data.nombre_comercial ?? data.razon_social,
    ruc: data.identificacion ?? created.ruc,
    canal_id: created.canal_id ?? data.canal_id ?? null,
    zona_id: created.zona_id ?? data.zona_comercial_id ?? null,
    direccion: created.direccion ?? data.direccion_texto ?? null,
    latitud: created.latitud ?? data.latitud ?? null,
    longitud: created.longitud ?? data.longitud ?? null,
    vendedor_asignado_id: created.vendedor_asignado_id ?? data.vendedor_asignado_id ?? null,
  } as BackendCliente)
}

export async function actualizarCliente(id: string, data: Partial<CreateClienteDto>): Promise<Cliente> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')
  const url = `${USERS_API_URL}/clientes/${id}`

  const payload: any = {}
  if (data.nombre_comercial !== undefined) payload.nombre_comercial = data.nombre_comercial
  if (data.canal_id !== undefined) payload.canal_id = data.canal_id
  if (data.vendedor_asignado_id !== undefined) payload.vendedor_asignado_id = data.vendedor_asignado_id
  if (data.zona_comercial_id !== undefined) payload.zona_id = data.zona_comercial_id
  if (data.direccion_texto !== undefined) payload.direccion = data.direccion_texto
  if (data.ubicacion_gps) {
    payload.longitud = data.ubicacion_gps.coordinates[0]
    payload.latitud = data.ubicacion_gps.coordinates[1]
  }
  // Fallback for explicit lat/lng update if not using ubicacion_gps object
  if (data.latitud !== undefined) payload.latitud = data.latitud
  if (data.longitud !== undefined) payload.longitud = data.longitud

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.message || 'Error al actualizar cliente')
  }

  await res.json().catch(() => null)
  return (await obtenerClientePorId(id)) as Cliente
}

export async function eliminarCliente(id: string): Promise<void> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')
  const url = `${USERS_API_URL}/clientes/${id}`

  await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
}

// Zonas
export async function obtenerZonas(): Promise<ZonaComercial[]> {
  try {
    const token = await getValidToken()
    const ZONAS_BASE_URL = env.api.zonas
    const ZONAS_API_URL = ZONAS_BASE_URL.endsWith('/api') ? ZONAS_BASE_URL : `${ZONAS_BASE_URL}/api`
    const url = `${ZONAS_API_URL}/zonas?estado=activo`
    const headers: any = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(url, { headers })
    if (!res.ok) return []
    const data = await res.json().catch(() => [])
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching zonas:', error)
    return []
  }
}

