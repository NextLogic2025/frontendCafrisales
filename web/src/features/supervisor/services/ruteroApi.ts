export interface CrearRutaPayload {
  cliente_id: string;
  sucursal_id: string | null;
  zona_id: number;
  dia_semana: number;
  frecuencia: string;
  prioridad_visita: string;
  orden_sugerido: number;
  hora_estimada_arribo: string | null;
}

export async function crearRuta(payload: CrearRutaPayload): Promise<void> {
  return Promise.resolve()
}
