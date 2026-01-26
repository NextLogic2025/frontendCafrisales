export function validatePassword(password: string) {
    const errors: string[] = []

    if (password.length < 6) {
        errors.push('Minimo 6 caracteres')
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Debe incluir una mayuscula')
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Debe incluir un numero')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}
