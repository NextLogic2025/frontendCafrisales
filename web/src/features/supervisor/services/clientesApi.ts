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
  created_at: string
  updated_at: string
  deleted_at: string | null
  zona_comercial?: { id: number; nombre: string }
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

import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'

export async function obtenerClientes(): Promise<Cliente[]> {
  try {
    const token = await getValidToken()
    const base = env.api.usuarios
    const url = `${base}/api/clientes?estado=activo`
    const headers: any = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(url, { headers })
    if (!res.ok) return []
    const data = await res.json().catch(() => [])
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching clientes:', error)
    return []
  }
}

export async function obtenerClientePorId(id: string): Promise<Cliente | null> {
  try {
    const token = await getValidToken()
    const base = env.api.usuarios
    const url = `${base}/api/clientes/${id}`
    const headers: any = {}
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(url, { headers })
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    return data as Cliente | null
  } catch (error) {
    console.error('Error fetching cliente by id:', error)
    return null
  }
}

export async function crearCliente(data: CreateClienteDto): Promise<Cliente> {
  // Map local DTO to user-service API payload and call users API
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const base = env.api.usuarios
  const url = `${base}/api/clientes`

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
  return {
    id: created.id ?? String(Math.random()),
    usuario_principal_id: created.usuario_id ?? created.usuario_principal_id ?? null,
    identificacion: data.identificacion,
    tipo_identificacion: data.tipo_identificacion ?? 'RUC',
    nombres: data.nombres ?? null,
    apellidos: data.apellidos ?? null,
    razon_social: data.razon_social,
    nombre_comercial: created.nombre_comercial ?? data.nombre_comercial ?? null,
    telefono: data.telefono ?? null,
    canal_id: created.canal_id ?? data.canal_id ?? null,
    vendedor_asignado_id: created.vendedor_asignado_id ?? data.vendedor_asignado_id ?? null,
    zona_comercial_id: created.zona_id ?? data.zona_comercial_id ?? null,
    direccion_texto: created.direccion ?? data.direccion_texto ?? null,
    ubicacion_gps: data.ubicacion_gps ?? null,
    latitud: (created.latitud ?? data.latitud) ?? null,
    longitud: (created.longitud ?? data.longitud) ?? null,
    created_at: created.created_at ?? new Date().toISOString(),
    updated_at: created.updated_at ?? new Date().toISOString(),
    deleted_at: created.deleted_at ?? null,
  }
}

export async function actualizarCliente(id: string, data: Partial<CreateClienteDto>): Promise<Cliente> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')
  const base = env.api.usuarios
  const url = `${base}/api/clientes/${id}`

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
  const base = env.api.usuarios
  const url = `${base}/api/clientes/${id}`

  await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
}

// Zonas
export async function obtenerZonas(): Promise<ZonaComercial[]> {
  try {
    const token = await getValidToken()
    const base = env.api.usuarios
    const url = `${base}/api/zonas?estado=activo`
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


