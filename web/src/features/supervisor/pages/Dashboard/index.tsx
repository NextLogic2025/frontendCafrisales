import { BarChart3, Activity, AlertTriangle, Info } from 'components/ui/Icons'
import { SectionHeader } from 'components/ui/SectionHeader'
import { MetricCard, SectionCard } from 'components/ui/Cards'
import { PageHero } from 'components/ui/PageHero'
import { useDashboardStats } from './hooks/useDashboardStats'

export default function DashboardPage() {
  const { stats, loading, refresh } = useDashboardStats()

  return (
    <div className="space-y-6">
      <PageHero
        title="Control General"
        subtitle="Supervisa el desempeño operativo de toda la distribución comercial"
        chips={[
          'KPIs en tiempo real',
          'Alertas críticas',
          'Auditoría completa',
        ]}
      />

      <div className="flex items-center justify-between">
        <SectionHeader title="Dashboard Supervisión" subtitle="Métricas clave y estado operativo" />
        <button
          onClick={refresh}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium text-brand-red bg-white border border-brand-red rounded-lg hover:bg-brand-red hover:text-white transition-all duration-150 disabled:opacity-50"
        >
          {loading ? 'Actualizando...' : 'Actualizar ahora'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Pedidos Hoy"
          value={loading ? '...' : (stats?.pedidosHoy || 0).toString()}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <MetricCard
          title="En Validación"
          value={loading ? '...' : (stats?.enValidacion || 0).toString()}
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          title="Entregas Pendientes"
          value={loading ? '...' : (stats?.entregasPendientes || 0).toString()}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <MetricCard
          title="Alertas Activas"
          value={loading ? '...' : (stats?.alertasActivas || 0).toString()}
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      <SectionCard title="Indicadores de Riesgo">
        <div className="space-y-3">
          {loading ? (
            <div className="animate-pulse flex space-y-3 flex-col">
              <div className="h-10 bg-neutral-100 rounded"></div>
              <div className="h-10 bg-neutral-100 rounded"></div>
            </div>
          ) : stats?.indicadoresRiesgo && stats.indicadoresRiesgo.length > 0 ? (
            stats.indicadoresRiesgo.map((item: any, idx: number) => {
              const bgColor =
                item.tipo === 'peligro' ? 'bg-red-50 text-red-800 border-red-100' :
                  item.tipo === 'advertencia' ? 'bg-yellow-50 text-yellow-800 border-yellow-100' :
                    'bg-blue-50 text-blue-800 border-blue-100'

              return (
                <div key={idx} className={`flex items-center gap-3 rounded-lg border p-4 text-sm ${bgColor}`}>
                  {item.tipo === 'peligro' && <AlertTriangle className="h-5 w-5" />}
                  {item.tipo === 'advertencia' && <AlertTriangle className="h-5 w-5" />}
                  {item.tipo === 'info' && <Info className="h-5 w-5" />}
                  <p className="font-medium">{item.mensaje}</p>
                </div>
              )
            })
          ) : (
            <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-6 text-center">
              <p className="text-neutral-500 italic">No hay alertas de riesgo críticas en este momento.</p>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
