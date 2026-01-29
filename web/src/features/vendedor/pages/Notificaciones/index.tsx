import { Bell, Map, Loader2, Package, CheckCircle, XCircle, Truck, AlertTriangle, Tag } from 'lucide-react'
import { PageHero } from 'components/ui/PageHero'
import { EmptyContent } from 'components/ui/EmptyContent'
import { useNotificationsContext } from '../../../../context/notifications/NotificationsProvider'
import { Alert as AlertComponent } from 'components/ui/Alert'
import { Button } from 'components/ui/Button'

// Helper function to get icon based on notification type
function getNotificationIcon(type: string) {
  const typeStr = String(type).toLowerCase()
  if (typeStr.includes('route') || typeStr.includes('ruta')) return Map
  if (typeStr.includes('pedido_creado') || typeStr.includes('pedido')) return Package
  if (typeStr.includes('aprobado') || typeStr.includes('entregado')) return CheckCircle
  if (typeStr.includes('cancelado') || typeStr.includes('rechazado')) return XCircle
  if (typeStr.includes('camino')) return Truck
  if (typeStr.includes('ajustado')) return AlertTriangle
  return Bell
}

// Helper function to get color based on notification type
function getNotificationColor(type: string) {
  const typeStr = String(type).toLowerCase()
  if (typeStr.includes('route') || typeStr.includes('ruta')) return { bg: 'bg-blue-50', text: 'text-blue-600' }
  if (typeStr.includes('aprobado') || typeStr.includes('entregado')) return { bg: 'bg-green-50', text: 'text-green-600' }
  if (typeStr.includes('cancelado') || typeStr.includes('rechazado')) return { bg: 'bg-red-50', text: 'text-red-600' }
  if (typeStr.includes('ajustado')) return { bg: 'bg-orange-50', text: 'text-orange-600' }
  if (typeStr.includes('pedido')) return { bg: 'bg-purple-50', text: 'text-purple-600' }
  return { bg: 'bg-neutral-50', text: 'text-neutral-600' }
}

export default function VendedorNotificaciones() {
  const { notifications, isConnected, clearNotifications } = useNotificationsContext()

  // Mostrar TODAS las notificaciones
  const allNotifications = notifications

  return (
    <div className="space-y-6">
      <PageHero
        title="Notificaciones"
        subtitle="Todas tus alertas y notificaciones"
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
            title="Sin notificaciones nuevas"
            subtitle="Te notificaremos cuando haya una actualización importante."
          />
        </div>
      )}
    </div>
  )
}
