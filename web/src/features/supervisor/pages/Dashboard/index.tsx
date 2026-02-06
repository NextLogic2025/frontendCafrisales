import { useEffect, useState } from 'react'
import { BarChart3, Activity, AlertTriangle, AlertCircle, TrendingUp } from 'lucide-react'
import { SectionHeader } from 'components/ui/SectionHeader'
import { MetricCard, SectionCard } from 'components/ui/Cards'
import { PageHero } from 'components/ui/PageHero'
import { dashboardService, DashboardStats, RiskIndicators } from '../../services/dashboard.service'
import { LoadingSpinner } from 'components/ui/LoadingSpinner'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [riskIndicators, setRiskIndicators] = useState<RiskIndicators | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, riskData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRiskIndicators(),
        ])
        setStats(statsData)
        setRiskIndicators(riskData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

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

      <SectionHeader title="Dashboard Supervisión" subtitle="Métricas clave y estado operativo" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Pedidos Hoy"
          value={stats?.pedidosHoy.toString() || '0'}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <MetricCard
          title="En Validación"
          value={stats?.enValidacion.toString() || '0'}
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          title="Entregas Pendientes"
          value={stats?.entregasPendientes.toString() || '0'}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="Alertas Activas"
          value={stats?.alertasActivas.toString() || '0'}
          icon={<AlertCircle className="h-5 w-5" />}
        />
      </div>

      <SectionCard title="Indicadores de Riesgo">
        <div className="space-y-3">
          {riskIndicators?.clientesBloqueados ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {riskIndicators.clientesBloqueados} clientes con cartera vencida (Riesgo Alto)
            </div>
          ) : null}

          {riskIndicators?.pedidosRetrasados ? (
            <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {riskIndicators.pedidosRetrasados} pedidos con retraso en entrega
            </div>
          ) : null}

          {riskIndicators?.devolucionesPendientes ? (
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {riskIndicators.devolucionesPendientes} promociones pendientes de aprobación
            </div>
          ) : null}

          {!riskIndicators?.clientesBloqueados && !riskIndicators?.pedidosRetrasados && !riskIndicators?.devolucionesPendientes && (
            <div className="p-4 text-sm text-gray-500 italic text-center">
              No hay indicadores de riesgo activos en este momento.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
