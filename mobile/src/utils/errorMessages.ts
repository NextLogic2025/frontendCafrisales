export function getUserFriendlyMessage(error: unknown, fallback: string) {
  const message = (error as Error)?.message
  if (message === 'INVALID_CREDENTIALS') {
    return 'Credenciales incorrectas, revisa tu correo y contraseña.'
  }
  if (message === 'ACCOUNT_DISABLED') {
    return 'Tu cuenta está desactivada o bloqueada. Contacta al equipo de soporte.'
  }
  if (message === 'NETWORK_ERROR') {
    return 'No hay conexión a internet. Revisa tu red e inténtalo de nuevo.'
  }
  if (message === 'AUTH_URL_MISSING') {
    return 'La configuración del servidor de autenticación no está completa.'
  }
  if (message === 'AUTH_SERVICE_ERROR') {
    return 'El servidor de autenticación no respondió correctamente. Intenta más tarde.'
  }
  if (typeof message === 'string' && message.length > 0) {
    return message
  }
  return fallback
}
