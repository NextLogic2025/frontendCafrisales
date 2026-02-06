export const formatShortId = (value?: string, length = 8) => {
  if (!value) return '---'
  return value.slice(0, length)
}

export const formatOrderLabel = (numeroPedido?: string | null, pedidoId?: string | null) => {
  if (numeroPedido && numeroPedido.trim().length > 0) return numeroPedido
  if (pedidoId) return formatShortId(pedidoId)
  return '---'
}

export const formatNameOrId = (name?: string | null, id?: string | null) => {
  if (name && name.trim().length > 0) return name
  if (id) return formatShortId(id)
  return '---'
}

export const formatStatusLabel = (status?: string | null) => {
  if (!status) return '---'
  return status.replace(/_/g, ' ')
}
