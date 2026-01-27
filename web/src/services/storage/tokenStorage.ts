const TOKEN_KEY = 'cafrilosa.token'
const REFRESH_TOKEN_KEY = 'cafrilosa.refresh_token'
const USER_NAME_KEY = 'cafrilosa.user_name'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string, opts?: { persist?: boolean }) {
  const persist = opts?.persist ?? true
  if (persist) localStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.setItem(TOKEN_KEY, token)
}

export function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setRefreshToken(token: string, opts?: { persist?: boolean }) {
  const persist = opts?.persist ?? true
  if (persist) localStorage.setItem(REFRESH_TOKEN_KEY, token)
  else sessionStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function getUserName() {
  try {
    return localStorage.getItem(USER_NAME_KEY) ?? sessionStorage.getItem(USER_NAME_KEY)
  } catch {
    return null
  }
}

export function setUserName(name: string, opts?: { persist?: boolean }) {
  const persist = opts?.persist ?? true
  if (persist) localStorage.setItem(USER_NAME_KEY, name)
  else sessionStorage.setItem(USER_NAME_KEY, name)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_NAME_KEY)
  sessionStorage.removeItem(USER_NAME_KEY)
}
