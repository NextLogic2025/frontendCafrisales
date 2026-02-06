import { Package, Clock, Boxes, ListChecks, RefreshCw, AlertTriangle, Info, XCircle, Archive } from 'components/ui/Icons'
import { SectionHeader } from 'components/ui/SectionHeader'
import { MetricCard, SectionCard, QuickActionButton, EmptyState } from 'components/ui/Cards'
import { PageHero } from 'components/ui/PageHero'
import { useBodegueroDashboard } from './hooks/useBodegueroDashboard'

export default function DashboardPage() {
  const { stats, loading, refresh } = useBodegueroDashboard()

  const alertIcons = {
    reporte: <Info className="h-4 w-4 text-blue-500" />,
    alerta: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />
  }

  const alertColors = {
    reporte: 'bg-blue-50 text-blue-700 border-blue-100',
    alerta: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-red-50 text-red-700 border-red-100'
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHero
        title="Operación de Bodega"
        subtitle="Valida stock, gestiona FEFO, prepara y despacha pedidos con trazabilidad completa."
        chips={[
          { label: 'Lotes y vencimientos', variant: 'blue' },
          { label: 'Pedidos pendientes', variant: 'green' },
          { label: 'Control de inventario', variant: 'gold' },
        ]}
      />

      <div className="flex items-center justify-between">
        <SectionHeader title="Dashboard Bodega" subtitle="Control general de inventario y operaciones" />
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-red bg-white border border-brand-red rounded-xl hover:bg-brand-red hover:text-white transition-all duration-200 disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Sincronizando...' : 'Sincronizar ahora'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Por Validar"
          value={stats?.pedidosValidacion?.toString() || '0'}
          subtitle="Esperando stock"
          icon={<ListChecks className="h-5 w-5" />}
          tone="red"
          loading={loading && !stats}
        />
        <MetricCard
          title="Por Preparar"
          value={stats?.pedidosPendientes?.toString() || '0'}
          subtitle="Listos para picking"
          icon={<Package className="h-5 w-5" />}
          tone="blue"
          loading={loading && !stats}
        />
        <MetricCard
          title="Productos Activos"
          value={stats?.productosActivos?.toString() || '0'}
          subtitle="En catálogo"
          icon={<Boxes className="h-5 w-5" />}
          tone="green"
          loading={loading && !stats}
        />
        <MetricCard
          title="Rutas en Curso"
          value={stats?.rutasEnCurso?.toString() || '0'}
          subtitle="Despachando ahora"
          icon={<Clock className="h-5 w-5" />}
          tone="gold"
          loading={loading && !stats}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Alertas Críticas">
          <div className="space-y-3">
            {!stats?.alertas?.length ? (
              <EmptyState text="Todo bajo control. Sin alertas pendientes." />
            ) : (
              stats.alertas.map((alerta: { tipo: 'reporte' | 'alerta' | 'error', mensaje: string }, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${alertColors[alerta.tipo]}`}
                >
                  <div className="mt-0.5">{alertIcons[alerta.tipo]}</div>
                  <p className="text-sm font-medium">{alerta.mensaje}</p>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Accesos Rápidos">
          <div className="flex flex-wrap gap-3">
            <QuickActionButton
              label="Ver Inventario"
              icon={<Archive className="h-4 w-4" />}
              onClick={() => window.location.href = '/bodeguero/pedidos'}
            />
            <QuickActionButton
              label="Nueva Recepción"
              icon={<Boxes className="h-4 w-4" />}
              onClick={() => window.location.href = '/bodeguero/preparacion'}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
