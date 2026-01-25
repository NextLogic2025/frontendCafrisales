export function getUserFriendlyMessage(error: unknown, fallback: string) {
  const message = (error as Error)?.message
  if (message === 'INVALID_CREDENTIALS') {
    return 'Credenciales incorrectas, revisa tu correo y contraseña.'
  }
  if (typeof message === 'string' && message.length > 0) {
    return message
  }
  return fallback
}
