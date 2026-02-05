import { env } from '../config/env'
import { getToken as readStoredToken } from './storage/tokenStorage'

function getToken(provided?: string) {
  if (provided) return provided.startsWith('Bearer ') ? provided : `Bearer ${provided}`
  const t = readStoredToken() ?? ''
  return t && t.startsWith('Bearer ') ? t : t ? `Bearer ${t}` : ''
}

const base = (env.api.notifications || env.api.catalogo || '').replace(/\/$/, '')

export async function getNotificationTypes(token?: string) {
  const paths = [
    `${base}/api/notifications/types`,
    `${base}/api/notifications/tipos`,
    `${base}/api/notificaciones/types`,
    `${base}/api/notificaciones/tipos`,
  ]

  let lastErr: any = null
  for (const p of paths) {
    try {
      const res = await fetch(p, { headers: { Authorization: getToken(token), 'X-Authorization': getToken(token) } })
      if (res.ok) return res.json()
      lastErr = `HTTP ${res.status} ${await res.text().catch(() => '')}`
    } catch (err) {
      lastErr = err
    }
  }
  throw new Error(`Failed to fetch types: ${String(lastErr)}`)
}

export async function getSubscriptions(token?: string) {
  const paths = [
    `${base}/api/notifications/subscriptions`,
    `${base}/api/notifications/suscripciones`,
    `${base}/api/notifications/preferencias`,
    `${base}/api/notificaciones/subscriptions`,
    `${base}/api/notificaciones/suscripciones`,
  ]

  let lastErr: any = null
  for (const p of paths) {
    try {
      const res = await fetch(p, { headers: { Authorization: getToken(token), 'X-Authorization': getToken(token) } })
      if (res.ok) return res.json()
      lastErr = `HTTP ${res.status} ${await res.text().catch(() => '')}`
    } catch (err) {
      lastErr = err
    }
  }
  throw new Error(`Failed to fetch subscriptions: ${String(lastErr)}`)
}

export async function upsertSubscription(tipoId: string, opts: { websocketEnabled?: boolean; emailEnabled?: boolean; smsEnabled?: boolean } = {}, token?: string) {
  const body = {
    tipoId,
    websocketEnabled: opts.websocketEnabled ?? true,
    emailEnabled: opts.emailEnabled ?? false,
    smsEnabled: opts.smsEnabled ?? false,
  }
  // If tipoId is not a UUID, the backend accepts `tipoCodigo` instead.
  // Accept any canonical UUID (hex groups), don't enforce RFC version nibble
  const uuidRe = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  let payload: any = { ...body }
  if (!uuidRe.test(String(tipoId))) {
    // treat provided value as codigo
    payload = {
      tipoCodigo: tipoId,
      websocketEnabled: body.websocketEnabled,
      emailEnabled: body.emailEnabled,
      smsEnabled: body.smsEnabled,
    }
  }
  // Try the canonical endpoint first, but fall back to common alternatives
  const tokenHeader = { 'Content-Type': 'application/json', Authorization: getToken(token), 'X-Authorization': getToken(token) }

  // helper to parse non-2xx
  async function tryFetch(input: string, init: RequestInit) {
    try {
      const r = await fetch(input, init)
      return r
    } catch (err) {
      // network error -> rethrow
      throw err
    }
  }

  // The backend exposes PUT /api/notifications/subscriptions for upsert (see controller).
  // Try PUT first, then fall back to POST for compatibility with older variants.
  let res = await tryFetch(`${base}/api/notifications/subscriptions`, {
    method: 'PUT', headers: tokenHeader, body: JSON.stringify(payload)
  })

  if (res.status === 404) {
    // fallback: POST /api/notifications/subscriptions
    res = await tryFetch(`${base}/api/notifications/subscriptions`, {
      method: 'POST', headers: tokenHeader, body: JSON.stringify(payload)
    })
  }

  if (!res.ok) {
    let text = ''
    try { text = await res.text() } catch (e) { /* ignore */ }
    throw new Error(`Failed to upsert subscription: ${res.status} ${text}`)
  }
  return res.json()
}

export async function deleteSubscription(tipoId: string, token?: string) {
  // The API does not expose DELETE for subscriptions; update the subscription to disable websocket.
  return upsertSubscription(tipoId, { websocketEnabled: false }, token)
}

export default { getNotificationTypes, getSubscriptions, upsertSubscription, deleteSubscription }
