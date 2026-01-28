import { jwtDecode } from 'jwt-decode'
import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'

export type ApproveCreditPayload = {
    pedido_id: string
    cliente_id: string
    monto_aprobado: number
    plazo_dias: number
    notas?: string
}

export type CreditListItem = {
    id: string
    pedido_id: string
    cliente_id: string
    aprobado_por_vendedor_id: string
    monto_aprobado: string | number
    moneda: string
    plazo_dias: number
    fecha_aprobacion: string
    fecha_vencimiento: string
    estado: string
    notas: string | null
    total_pagado: string | number
    saldo: string | number
}

export type CreditResponse = {
    id: string
    pedido_id: string
    cliente_id: string
    monto_aprobado: number
    estado?: string
}

const CREDIT_BASE_URL = env.api.creditos
const CREDIT_API_URL = CREDIT_BASE_URL.endsWith('/api') ? CREDIT_BASE_URL : `${CREDIT_BASE_URL}/api`

export async function approveCredit(payload: ApproveCreditPayload): Promise<CreditResponse | null> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${CREDIT_API_URL}/creditos/aprobar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        // Try to parse JSON error, otherwise read text for better debugging
        let errorMessage: string | null = null
        try {
            const errorData = await res.json()
            errorMessage = errorData?.message || JSON.stringify(errorData)
        } catch (e) {
            try {
                errorMessage = await res.text()
            } catch (_) {
                errorMessage = null
            }
        }
        const statusText = res.statusText || ''
        throw new Error(errorMessage ? `${statusText}: ${errorMessage}` : `Error al aprobar el crédito (${res.status})`)
    }

    return await res.json()
}


export async function getCredits(estados?: string[]): Promise<CreditListItem[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const decoded: any = jwtDecode(token)
    const vendedorId = decoded.userId || decoded.sub

    const params = new URLSearchParams()
    params.append('vendedor_id', vendedorId)
    if (estados && estados.length > 0) {
        params.append('estado', estados.join(','))
    }

    const res = await fetch(`${CREDIT_API_URL}/creditos?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) return []
    return await res.json()
}

export type CreditDetail = {
    credito: CreditListItem
    totales: {
        total_aprobado: string | number
        total_pagado: string | number
        saldo: string | number
    }
    pagos: Array<{
        id: string
        monto: string | number
        fecha_pago: string
        metodo_pago: string
        referencia?: string
    }>
}

export async function getCreditDetail(id: string): Promise<CreditDetail> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${CREDIT_API_URL}/creditos/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        throw new Error('Error al obtener el detalle del crédito')
    }

    return await res.json()
}
export async function rejectCredit(id: string, motivo?: string): Promise<boolean> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${CREDIT_API_URL}/creditos/${id}/rechazar`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motivo: motivo || 'Crédito rechazado por vendedor' }),
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al rechazar el crédito')
    }

    return true
}
