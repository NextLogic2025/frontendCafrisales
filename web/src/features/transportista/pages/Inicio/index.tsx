import { Truck, Package, MapPin, CheckCircle, AlertCircle, RefreshCw } from 'components/ui/Icons'
import { SectionHeader } from 'components/ui/SectionHeader'
import { MetricCard, SectionCard, QuickActionButton, EmptyState } from 'components/ui/Cards'
import { PageHero } from 'components/ui/PageHero'
import { useTransportistaDashboard } from './hooks/useTransportistaDashboard'

export default function InicioPage() {
  const { stats, loading, refresh } = useTransportistaDashboard()

  return (
    <div className="space-y-5">
      <PageHero
        title="Sistema de Distribución Comercial (Logística)"
        subtitle="Gestiona entregas, rutas y devoluciones. Registra evidencia y garantiza la última milla del proceso comercial."
        chips={[
          { label: 'Pedidos asignados y entregas', variant: 'blue' },
          { label: 'Rutas optimizadas', variant: 'green' },
          { label: 'Evidencia trazable', variant: 'gold' },
        ]}
      />

      <div className="flex items-center justify-between">
        <SectionHeader title="Dashboard Logístico" subtitle="Control operativo de entregas y rutas" />
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-red bg-white border border-brand-red rounded-xl hover:bg-brand-red hover:text-white transition-all duration-200 disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Sincronizando...' : 'Sincronizar ahora'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Pedidos Asignados Hoy"
          value={stats?.pedidosHoy?.toString() || '0'}
          subtitle="Listos para retiro"
          icon={<Package className="h-5 w-5" />}
          tone="blue"
          loading={loading && !stats}
        />
        <MetricCard
          title="Entregas Pendientes"
          value={stats?.entregasPendientes?.toString() || '0'}
          subtitle="En ruta o sin iniciar"
          icon={<Truck className="h-5 w-5" />}
          tone="gold"
          loading={loading && !stats}
        />
        <MetricCard
          title="Entregas Completadas"
          value={stats?.entregasCompletadas?.toString() || '0'}
          subtitle="Entregadas hoy"
          icon={<CheckCircle className="h-5 w-5" />}
          tone="green"
          loading={loading && !stats}
        />
        <MetricCard
          title="Devoluciones Asignadas"
          value={stats?.devolucionesAsignadas?.toString() || '0'}
          subtitle="Por retirar"
          icon={<RefreshCw className="h-5 w-5" />}
          tone="gold"
          loading={loading && !stats}
        />
        <MetricCard
          title="Rutas Activas"
          value={stats?.rutasEnCurso?.toString() || '0'}
          subtitle="En curso"
          icon={<MapPin className="h-5 w-5" />}
          tone="blue"
          loading={loading && !stats}
        />
        <MetricCard
          title="Alertas"
          value={stats?.alertas?.toString() || '0'}
          subtitle="Requiere atención"
          icon={<AlertCircle className="h-5 w-5" />}
          tone="red"
          loading={loading && !stats}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Alertas Operativas">
          <EmptyState text="Sin alertas pendientes" />
        </SectionCard>

        <SectionCard title="Accesos Rápidos">
          <div className="flex flex-wrap gap-2">
            <QuickActionButton
              label="Ver Pedidos Asignados"
              icon={<Package className="h-4 w-4" />}
              onClick={() => window.location.href = '/transportista/rutas'}
            />
            <QuickActionButton
              label="Mis Rutas"
              icon={<MapPin className="h-4 w-4" />}
              onClick={() => window.location.href = '/transportista/rutas'}
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Actividad Reciente">
        <EmptyState text="Sin actividad registrada" />
      </SectionCard>
    </div>
  )
}
