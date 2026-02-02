import { CheckCircle, Clock, Package, ChevronLeft, User, Calendar } from 'components/ui/Icons'
import type { RuteroLogistico } from '../../../../supervisor/services/types'

interface RouteDetailsProps {
    rutero: RuteroLogistico
    onBack: () => void
    onPreparar: (pedidoId: string) => void
}

export function RouteDetails({ rutero, onBack, onPreparar }: RouteDetailsProps) {
    return (
        <div className="space-y-6">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
                <ChevronLeft className="h-4 w-4" />
                Volver al listado
            </button>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Package className="h-6 w-6 text-blue-600" />
                            Preparación de Carga - Zona {rutero.zona?.nombre}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Vehículo: <span className="font-medium">{rutero.vehiculo?.placa}</span> |
                            Transportista: <span className="font-medium">{rutero.transportista?.nombre} {rutero.transportista?.apellido}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            Publicado
                        </span>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Paradas y Pedidos</h3>
                        <div className="space-y-4">
                            {rutero.paradas?.length === 0 ? (
                                <p className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                                    No hay paradas asignadas a este rutero.
                                </p>
                            ) : (
                                rutero.paradas?.sort((a, b) => a.orden_entrega - b.orden_entrega).map((parada) => (
                                    <div
                                        key={parada.id}
                                        className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg border transition-all ${parada.preparado_en
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-white border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${parada.preparado_en ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {parada.orden_entrega}
                                                </div>
                                                <div className="w-0.5 h-full bg-gray-100 mt-2"></div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-900">Pedido #{parada.pedido?.numero_pedido}</h4>
                                                    {parada.preparado_en && (
                                                        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Preparado
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 font-medium mt-0.5">{parada.pedido?.cliente_nombre}</p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{parada.pedido?.direccion_entrega}</p>

                                                {parada.preparado_en && (
                                                    <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(parada.preparado_en).toLocaleString()}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {parada.preparado_por}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 md:mt-0 ml-12 md:ml-0">
                                            {parada.preparado_en ? (
                                                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                                                    <CheckCircle className="h-5 w-5" />
                                                    Listo para despacho
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => onPreparar(parada.pedido_id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                                                >
                                                    <Package className="h-4 w-4" />
                                                    Marcar como Preparado
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
