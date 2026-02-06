import { PageHero } from '../../../../components/ui/PageHero'
import { AlertCircle, TrendingUp, Users, Package, Calendar, MapPin, ChevronRight } from 'components/ui/Icons'
import { useVendedorDashboard } from './hooks/useVendedorDashboard'

export default function VendedorDashboard() {
  const { stats, loading, refresh } = useVendedorDashboard()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="space-y-6 w-full pb-10">
      <PageHero
        title="Panel de Vendedor"
        subtitle="Gestiona tu cartera de clientes y ventas"
        chips={[
          { label: 'Gestión comercial', variant: 'blue' },
          { label: 'Seguimiento de ventas', variant: 'green' },
        ]}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">Resumen Operativo</h2>
        <button
          onClick={refresh}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-brand-red bg-white border border-brand-red rounded-xl hover:bg-brand-red hover:text-white transition-all duration-200 disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Sincronizando...' : 'Sincronizar ahora'}
        </button>
      </div>

      {/* KPIs Comerciales */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Pedidos del Día', value: loading ? '...' : stats?.pedidosDia, icon: Package, color: 'blue' },
          { title: 'Ventas Acumuladas', value: loading ? '...' : formatCurrency(stats?.ventasAcumuladas || 0), icon: TrendingUp, color: 'green' },
          { title: 'Clientes Activos', value: loading ? '...' : stats?.clientesActivos, icon: Users, color: 'purple' },
          { title: 'Visitas Programadas', value: loading ? '...' : stats?.visitasHoy, icon: Calendar, color: 'orange' },
        ].map((kpi, idx) => (
          <div key={idx} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <div className={`rounded-xl bg-${kpi.color}-50 p-3`}>
                <kpi.icon className={`h-6 w-6 text-${kpi.color}-600`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{kpi.title}</p>
                <p className="text-2xl font-bold text-neutral-900">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Alertas */}
      {(stats?.alertasComerciales.rechazados || 0) > 0 || (stats?.alertasComerciales.vencidos || 0) > 0 ? (
        <section className="rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-orange-100 p-2">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-900">Alertas Comerciales</h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats?.alertasComerciales.rechazados ? (
                  <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg border border-orange-200">
                    <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                    <p className="text-sm text-orange-800">
                      Tienes <span className="font-bold">{stats.alertasComerciales.rechazados}</span> pedidos rechazados/anulados.
                    </p>
                  </div>
                ) : null}
                {stats?.alertasComerciales.vencidos ? (
                  <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg border border-orange-200">
                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    <p className="text-sm text-orange-800">
                      Hay <span className="font-bold">{stats.alertasComerciales.vencidos}</span> facturas vencidas en tu cartera.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Agenda */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-red" />
            Agenda de Hoy
          </h3>
          <span className="text-sm text-neutral-500 font-medium bg-neutral-100 px-3 py-1 rounded-full">
            {new Intl.DateTimeFormat('es-EC', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
          </span>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-neutral-100 rounded-xl" />)}
          </div>
        ) : stats?.agenda && stats.agenda.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.agenda.map((ruta: any) => (
              ruta.paradas?.map((parada: any, pIdx: number) => (
                <div key={`${ruta.id}-${pIdx}`} className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 bg-neutral-50 hover:bg-white hover:border-brand-red/20 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Orden</span>
                      <span className="text-xl font-black text-brand-red">{parada.orden_visita}</span>
                    </div>
                    <div className="h-10 w-[1px] bg-neutral-200 mx-2" />
                    <div>
                      <p className="font-bold text-neutral-900 line-clamp-1">{parada.cliente?.razon_social || 'Cliente'}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-neutral-500">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs line-clamp-1 italic">{parada.cliente?.direccion || 'Sin dirección'}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-brand-red group-hover:translate-x-1 transition-all" />
                </div>
              ))
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-neutral-100 rounded-2xl">
            <Calendar className="h-14 w-14 mx-auto mb-4 text-neutral-200" />
            <p className="text-neutral-600 font-medium">No hay visitas programadas para hoy</p>
            <p className="text-xs text-neutral-400 mt-1 max-w-[240px] mx-auto line-clamp-2 italic">
              Todo está bajo control. Puedes aprovechar para prospectar nuevos clientes o revisar tus pendientes.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
