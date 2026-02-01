import { getValidToken } from '../../../services/auth/authClient'
import { env } from '../../../config/env'

export type VehicleStatus = 'disponible' | 'asignado' | 'mantenimiento' | 'fuera_servicio'

export type Vehicle = {
  id: string
  placa: string
  modelo?: string | null
  capacidad_kg?: number | null
  estado: VehicleStatus
  creado_en?: string
  actualizado_en?: string
}

export type CreateVehiclePayload = {
  placa: string
  modelo?: string
  capacidad_kg?: number
}

export async function createVehicle(payload: CreateVehiclePayload): Promise<Vehicle | null> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const base = env.api.transportista || ''
  const res = await fetch(`${base}/api/v1/vehiculos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.message || 'Error al crear vehículo')
  }

  return await res.json()
}

export async function getVehicles(estado?: string): Promise<Vehicle[]> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const query = estado ? `?estado=${encodeURIComponent(estado)}` : ''
  const base = env.api.transportista || ''
  const res = await fetch(`${base}/api/v1/vehiculos${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) return []
  return await res.json()
}
