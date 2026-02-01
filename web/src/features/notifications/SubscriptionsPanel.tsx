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
      ; (async () => {
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
      error('No se pudo actualizar la suscripción')
    }
  }

  if (loading) return <div className="p-4">Cargando preferencias...</div>


}

export default SubscriptionsPanel
