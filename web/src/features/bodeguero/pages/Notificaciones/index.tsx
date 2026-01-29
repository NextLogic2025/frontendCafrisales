import { SectionHeader } from 'components/ui/SectionHeader'
import { EmptyContent } from 'components/ui/EmptyContent'
import { Bell } from 'lucide-react'
import { PageHero } from 'components/ui/PageHero'

export default function NotificacionesBodegaPage() {
  return (
    <div className="space-y-5">
      <PageHero
        title="Notificaciones"
        subtitle="Alertas operacionales de bodega, pedidos y devoluciones"
        chips={[
          'Alertas de stock bajo',
          'Vencimientos próximos',
          'Pedidos listos',
        ]}
      />

      <SectionHeader title="Notificaciones" subtitle="Alertas operativas y avisos de bodega" />
      <EmptyContent icon={Bell} title="Sin notificaciones" subtitle="Aquí verás nuevos pedidos, aprobaciones/rechazos y lotes por vencer." />
    </div>
  )
}
import { Bell, Package, CheckCircle, XCircle, Truck, AlertTriangle, Box } from 'lucide-react'
import { PageHero } from 'components/ui/PageHero'
import { EmptyContent } from 'components/ui/EmptyContent'
import { useNotificationsContext } from '../../../../context/notifications/NotificationsProvider'
import { Alert as AlertComponent } from 'components/ui/Alert'
import { Button } from 'components/ui/Button'

// Helper function to get icon based on notification type
function getNotificationIcon(type: string) {
  const typeStr = String(type).toLowerCase()
  if (typeStr.includes('pedido')) return Package
  if (typeStr.includes('aprobado') || typeStr.includes('entregado')) return CheckCircle
  if (typeStr.includes('cancelado') || typeStr.includes('rechazado')) return XCircle
  if (typeStr.includes('stock') || typeStr.includes('inventory')) return Box
  if (typeStr.includes('ajustado')) return AlertTriangle
  return Bell
}

// Helper function to get color based on notification type
function getNotificationColor(type: string) {
  const typeStr = String(type).toLowerCase()
  if (typeStr.includes('aprobado') || typeStr.includes('entregado')) return { bg: 'bg-green-50', text: 'text-green-600' }
  if (typeStr.includes('cancelado') || typeStr.includes('rechazado')) return { bg: 'bg-red-50', text: 'text-red-600' }
  if (typeStr.includes('ajustado')) return { bg: 'bg-orange-50', text: 'text-orange-600' }
  if (typeStr.includes('pedido')) return { bg: 'bg-purple-50', text: 'text-purple-600' }
  if (typeStr.includes('stock')) return { bg: 'bg-yellow-50', text: 'text-yellow-600' }
  return { bg: 'bg-neutral-50', text: 'text-neutral-600' }
}

export default function NotificacionesBodegaPage() {
  const { notifications, isConnected, clearNotifications } = useNotificationsContext()

  // Mostrar TODAS las notificaciones
  const allNotifications = notifications

  return (
    <div className="space-y-6">
      <PageHero
        title="Notificaciones"
        subtitle="Alertas operacionales de bodega, pedidos y devoluciones"
        chips={[
          isConnected ? 'Conectado' : 'Desconectado',
          `${allNotifications.length} Nuevas`,
        ]}
      />

      {!isConnected && (
        <AlertComponent
          type="info"
          title="Desconectado"
          message="Conectando con el servidor de notificaciones..."
        />
      )}

      {allNotifications.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearNotifications}>
              Limpiar todo
            </Button>
          </div>
          {allNotifications.map((notif, index) => {
            const Icon = getNotificationIcon(notif.type)
            const colors = getNotificationColor(notif.type)
            return (
              <div key={notif.id ?? index} className="flex items-start gap-4 p-4 bg-white border border-neutral-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className={`p-2 rounded-full ${colors.bg} ${colors.text}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-900">{notif.title || 'Sin título'}</h4>
                  <p className="text-sm text-neutral-600 mt-1">{notif.message}</p>
                  <span className="text-xs text-neutral-400 mt-2 block">
                    {notif.timestamp
                      ? new Date(notif.timestamp).toLocaleString('es-ES', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })
                      : 'Recién recibido'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 p-8">
          <EmptyContent
            icon={Bell}
            title="Sin notificaciones"
            subtitle="Aquí verás nuevos pedidos, aprobaciones/rechazos y alertas de stock."
          />
        </div>
      )}
    </div>
  )
}
