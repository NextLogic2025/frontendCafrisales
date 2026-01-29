import React, { useEffect, useState } from 'react'
import { useNotificationsContext } from '../../context/notifications/NotificationsProvider'
import subscriptionsService from '../../services/notificationSubscriptions'
import { useNotification } from '../../hooks/useNotification'

type TipoNotificacion = {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
}

export function SubscriptionsPanel() {
  const ctx = useNotificationsContext()
  const { success, error } = useNotification()

  const [types, setTypes] = useState<TipoNotificacion[]>([])
  const [loading, setLoading] = useState(false)
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const [allTypes, subs] = await Promise.all([
          subscriptionsService.getNotificationTypes(),
          subscriptionsService.getSubscriptions(),
        ])

        if (!mounted) return
        setTypes(allTypes)

        // build map of tipoId -> enabled (websocket_enabled)
        const map: Record<string, boolean> = {}
        if (Array.isArray(subs)) {
          subs.forEach((s: any) => { map[String(s.tipo_id ?? s.tipoId ?? s.tipo)] = !!s.websocket_enabled })
        }

        // default false for missing
        allTypes.forEach((t: any) => {
          if (map[t.id] === undefined) map[t.id] = false
        })

        setEnabled(map)
      } catch (err: any) {
        console.error('SubscriptionsPanel: failed to load types/subscriptions', err)
        error('No se pudieron cargar las preferencias de notificación')
      } finally {
        setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [error])

  const toggle = async (tipoId: string) => {
    const prev = enabled[tipoId]
    // optimistic
    setEnabled(s => ({ ...s, [tipoId]: !prev }))

    try {
      if (!prev) {
        // enable
        if (ctx?.subscribeToNotificationType) {
          await ctx.subscribeToNotificationType(tipoId, { websocketEnabled: true })
        } else {
          await subscriptionsService.upsertSubscription(tipoId, { websocketEnabled: true })
        }
        success('Suscripción activada')
      } else {
        // disable
        if (ctx?.unsubscribeFromNotificationType) {
          await ctx.unsubscribeFromNotificationType(tipoId)
        } else {
          await subscriptionsService.deleteSubscription(tipoId)
        }
        success('Suscripción desactivada')
      }
    } catch (err: any) {
      // rollback
      setEnabled(s => ({ ...s, [tipoId]: prev }))
      console.error('SubscriptionsPanel: toggle failed', err)
      error('No se pudo actualizar la suscripción')
    }
  }

  if (loading) return <div className="p-4">Cargando preferencias...</div>

  return (
    <div className="bg-white border rounded-lg p-4">
      <h3 className="font-semibold mb-3">Preferencias de Notificaciones</h3>
      {types.length === 0 ? (
        <div className="text-sm text-neutral-500">No hay tipos de notificación disponibles.</div>
      ) : (
        <div className="space-y-2">
          {types.map(t => (
            <div key={t.id} className="flex items-center justify-between p-2 border rounded-md">
              <div>
                <div className="font-medium">{t.nombre ?? t.codigo}</div>
                {t.descripcion && <div className="text-xs text-neutral-500">{t.descripcion}</div>}
              </div>
              <div>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={!!enabled[t.id]} onChange={() => toggle(t.id)} />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SubscriptionsPanel
