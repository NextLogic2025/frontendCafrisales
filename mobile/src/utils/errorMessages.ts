export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Error de red. Verifica tu conexion.',
    SERVER_UNAVAILABLE: 'Servidor no disponible.',
    INVALID_CREDENTIALS: 'Credenciales invalidas.',
    ACCOUNT_DISABLED: 'Cuenta desactivada.',
    SESSION_EXPIRED: 'Sesion expirada. Inicia sesion nuevamente.',
    FORBIDDEN: 'No tienes permisos.',
    NOT_FOUND: 'Recurso no encontrado.',
    DUPLICATE_ENTRY: 'El registro ya existe.',
    VALIDATION_ERROR: 'Datos invalidos.',
    TIMEOUT_ERROR: 'Tiempo de espera agotado.',
    GENERIC_ERROR: 'Ocurrio un error. Intenta de nuevo.',
    PASSWORD_RESET_ERROR: 'No se pudo enviar el correo de recuperacion.',
    CREATE_ERROR: 'No se pudo crear el registro.',
    UPDATE_ERROR: 'No se pudo actualizar el registro.',
    DELETE_ERROR: 'No se pudo eliminar el registro.'
} as const

type ErrorMessageKey = keyof typeof ERROR_MESSAGES

export function getUserFriendlyMessage(error: unknown, fallbackKey?: ErrorMessageKey | string) {
    if (error instanceof Error && error.message) {
        const key = error.message as ErrorMessageKey
        if (ERROR_MESSAGES[key]) return ERROR_MESSAGES[key]
        return error.message
    }

    if (fallbackKey && ERROR_MESSAGES[fallbackKey as ErrorMessageKey]) {
        return ERROR_MESSAGES[fallbackKey as ErrorMessageKey]
    }

    return ERROR_MESSAGES.GENERIC_ERROR
}

export function logErrorForDebugging(error: unknown, scope: string, meta?: Record<string, unknown>) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error(`[${scope}]`, error, meta ?? {})
    }
}
