import { Building2, CheckCircle, XCircle } from 'lucide-react'
import { StatusBadge } from 'components/ui/StatusBadge'
import { QuickActionButton } from 'components/ui/Cards'
import { type Cliente, type ZonaComercial } from '../../services/clientesApi'

const ESTADO_COLORES: Record<string, string> = {
  activo: 'bg-green-100 text-green-800',
  bloqueado: 'bg-red-100 text-red-800',
  inactivo: 'bg-gray-100 text-gray-800',
}

interface ClienteCardProps {
  cliente: Cliente
  onEdit?: (cliente: Cliente) => void
  onView?: (cliente: Cliente) => void
  zonas: ZonaComercial[]
}


export function ClienteCard({ cliente, onEdit, onView, zonas }: ClienteCardProps) {
  const estado = cliente.estado || (cliente.bloqueado ? 'bloqueado' : cliente.deleted_at ? 'inactivo' : 'activo')
  const estadoColor = ESTADO_COLORES[estado] || 'bg-gray-100 text-gray-800'

  const zonaNombre = cliente.zona_comercial?.nombre || zonas.find(z => String(z.id) === String(cliente.zona_comercial_id))?.nombre

  const creditoDisponible =
    cliente.tiene_credito && cliente.limite_credito
      ? (parseFloat(cliente.limite_credito) - parseFloat(cliente.saldo_actual || '0')).toFixed(2)
      : '0.00'

  return (
    <div className="group relative flex flex-col justify-between min-h-[440px] overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div>
        {/* Encabezado */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-neutral-900">{cliente.razon_social}</h3>
            {cliente.nombre_comercial && (
              <p className="text-sm text-neutral-600">{cliente.nombre_comercial}</p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-brand-red">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        {/* Información básica */}
        <div className="space-y-2 border-b border-neutral-200 pb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 font-semibold uppercase text-xs">Identificación</span>
            <span className="font-bold text-slate-800">
              {cliente.tipo_identificacion}: {cliente.identificacion}
            </span>
          </div>

          {cliente.canal_nombre && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 font-semibold uppercase text-xs">Canal</span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold text-xs">
                {cliente.canal_nombre}
              </span>
            </div>
          )}

          {zonaNombre && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 font-semibold uppercase text-xs">Zona</span>
              <span className="font-medium text-neutral-900">{zonaNombre}</span>
            </div>
          )}
          {cliente.direccion_texto && (
            <div className="flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 text-neutral-600 font-semibold uppercase text-xs pt-0.5">Dirección</span>
              <span className="line-clamp-2 text-neutral-900">{cliente.direccion_texto}</span>
            </div>
          )}
        </div>

        {/* Estado badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge variant={estado === 'activo' ? 'success' : estado === 'bloqueado' ? 'error' : 'neutral'}>
            <span className="flex items-center gap-1 font-bold">
              {estado === 'activo' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {estado === 'bloqueado' ? 'BLOQUEADO' : estado === 'activo' ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </StatusBadge>
        </div>

        {/* Fecha de creación */}
        <div className="mt-3 text-xs text-neutral-500">
          Creado: {new Date(cliente.created_at).toLocaleDateString('es-ES')}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        {onView && (
          <QuickActionButton label="Ver detalles" icon={<Building2 className="h-4 w-4" />} onClick={() => onView(cliente)} />
        )}
        {onEdit && (
          <QuickActionButton label="Editar" icon={<CheckCircle className="h-4 w-4" />} onClick={() => onEdit(cliente)} />
        )}
      </div>
    </div>
  )
}
