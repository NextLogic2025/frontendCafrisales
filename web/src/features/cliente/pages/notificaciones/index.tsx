import { Bell, Tag, Sparkles, Package, CheckCircle, XCircle, Truck, AlertTriangle } from 'components/ui/Icons'
import { PageHero } from 'components/ui/PageHero'
import { EmptyContent } from 'components/ui/EmptyContent'
import { useNotificationsContext } from '../../../../context/notifications/NotificationsProvider'
import { Alert } from 'components/ui/Alert'
import { Button } from 'components/ui/Button'
import SubscriptionsPanel from '../../../notifications/SubscriptionsPanel'

// Helper function to get icon based on notification type
function getNotificationIcon(type: string) {
  const typeStr = String(type).toLowerCase()
  if (typeStr.includes('promo')) return Sparkles
  if (typeStr.includes('pedido_creado') || typeStr.includes('pedido')) return Package
  if (typeStr.includes('aprobado') || typeStr.includes('entregado')) return CheckCircle
  if (typeStr.includes('cancelado') || typeStr.includes('rechazado')) return XCircle
  if (typeStr.includes('ruta') || typeStr.includes('camino')) return Truck
  if (typeStr.includes('ajustado')) return AlertTriangle
  return Tag
}

// Helper function to get color based on notification type
function getNotificationColor(type: string) {
  const typeStr = String(type).toLowerCase()
  if (typeStr.includes('promo_personal')) return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'bg-purple-500' }
  if (typeStr.includes('promo')) return { bg: 'bg-red-50', text: 'text-brand-red', border: 'bg-brand-red' }
  if (typeStr.includes('aprobado') || typeStr.includes('entregado')) return { bg: 'bg-green-50', text: 'text-green-600', border: 'bg-green-500' }
  if (typeStr.includes('cancelado') || typeStr.includes('rechazado')) return { bg: 'bg-red-50', text: 'text-red-600', border: 'bg-red-500' }
  if (typeStr.includes('ajustado')) return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'bg-orange-500' }
  if (typeStr.includes('ruta')) return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'bg-blue-500' }
  return { bg: 'bg-neutral-50', text: 'text-neutral-600', border: 'bg-neutral-400' }
}

export default function NotificacionesClientePage() {
  const { notifications, isConnected, clearNotifications } = useNotificationsContext()

  // Mostrar TODAS las notificaciones, no solo promociones
  const allNotifications = notifications

  return (
    <div className="space-y-6">
      <PageHero
        title="Mis Notificaciones"
        subtitle="Todas tus notificaciones y avisos importantes"
        chips={[
          isConnected ? 'Conectado' : 'Desconectado',
          `${allNotifications.length} Nuevas`,
        ]}
      />

      {!isConnected && (
        <Alert
          type="info"
          title="Desconectado"
          message="Conectando con el servidor..."
        />
      )}

      {allNotifications.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              {/* notifications list will appear below */}
            </div>
            <div className="w-full lg:w-96">
              <SubscriptionsPanel />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearNotifications}>
              Limpiar todo
            </Button>
          </div>
          {allNotifications.map((notif, index) => {
            const Icon = getNotificationIcon(notif.type)
            const colors = getNotificationColor(notif.type)
            return (
              <div key={notif.id ?? index} className="relative overflow-hidden bg-white border border-neutral-200 rounded-xl shadow-sm p-4 animate-in fade-in slide-in-from-top-2 hover:shadow-md transition-shadow">
                <div className={`absolute top-0 left-0 w-1 h-full ${colors.border}`} />
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${colors.bg} ${colors.text}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-neutral-900">{notif.title || 'Sin título'}</h4>
                      {notif.type === 'PROMO_PERSONAL' && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">Exclusivo</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600">{notif.message}</p>
                    <span className="text-xs text-neutral-400 mt-2 block">
                      {notif.timestamp
                        ? new Date(notif.timestamp).toLocaleString('es-ES', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })
                        : 'Recién recibido'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 p-8">
          <EmptyContent
            icon={Bell}
            title="Estás al día"
            subtitle="Te avisaremos cuando tengamos nuevas notificaciones o actualizaciones para ti."
          />
        </div>
      )}
    </div>
  )
}
