import { webEnv } from '../../config/env'

type SignInResponse = {
  user: {
    role?: string
  }
}

export async function signIn(email: string, password: string): Promise<SignInResponse> {
  const response = await fetch(webEnv.authLoginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error('INVALID_CREDENTIALS')
  }

  const payload = await response.json()
  return {
    user: {
      role: payload?.user?.role ?? 'Vendedor',
    },
  }
}
