export function getUserFriendlyMessage(error: unknown, fallback = 'Ha ocurrido un error inesperado') {
  const message = (error as Error)?.message
  if (message === 'INVALID_CREDENTIALS') {
    return 'Credenciales inválidas. Revisa tu correo y contraseña.'
  }

  if (typeof message === 'string' && message.trim().length > 0) {
    return message
  }

  return fallback
}
