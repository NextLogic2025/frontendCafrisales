import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { SplashScreen } from './features/auth/SplashScreen'
import { LoginScreen } from './features/auth/LoginScreen'
import { RecoveryScreen } from './features/auth/RecoveryScreen'
import {
  SupervisorRoute,
  VendedorRoute,
  ClienteRoute,
  BodegueroRoute,
  TransportistaRoute,
} from './navigation'
import type { SignedInUser } from './services/authService'
import { fetchMyProfile, updateMyProfile, type UserProfile } from './services/userService'

type Session = SignedInUser

export function AppRoot() {
  const [splashVisible, setSplashVisible] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [showRecovery, setShowRecovery] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    if (Platform.OS !== 'android') return

    // Asegura que la barra de navegación del sistema no tape el TabBar
    // y cambia el color de los botones. Se carga de forma dinámica para evitar
    // crashear si el módulo nativo no está presente en el cliente actual.
    (async () => {
      try {
        const NavigationBar = await import('expo-navigation-bar')
        if (!NavigationBar?.setPositionAsync) return
        await NavigationBar.setPositionAsync('relative')
        await NavigationBar.setBehaviorAsync('inset-swipe')
        await NavigationBar.setBackgroundColorAsync('#f8fafc')
        await NavigationBar.setBorderColorAsync('#e5e7eb')
        await NavigationBar.setButtonStyleAsync('dark')
      } catch {
        // Ignorar si el módulo nativo no está disponible (Expo Go o build sin plugin)
      }
    })()
  }, [])

  const handleLogout = () => {
    setSession(null)
    setProfile(null)
  }

  useEffect(() => {
    if (!session) return
    let cancelled = false

    const loadProfile = async () => {
      setProfileLoading(true)
      try {
        const data = await fetchMyProfile(session.accessToken)
        if (!cancelled) setProfile(data)
      } catch {
        if (!cancelled) setProfile(null)
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [session])

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    if (!session) return false
    try {
      const updated = await updateMyProfile(session.accessToken, data)
      setProfile(updated)
      return true
    } catch {
      return false
    }
  }

  if (splashVisible) {
    return <SplashScreen onDone={() => setSplashVisible(false)} />
  }

  if (!session) {
    return showRecovery ? (
      <RecoveryScreen onCancel={() => setShowRecovery(false)} />
    ) : (
      <LoginScreen
        onSignedIn={(user) => setSession(user)}
        onForgotPassword={() => setShowRecovery(true)}
      />
    )
  }

  // Props comunes para todas las rutas
  const displayName = profile
    ? `${profile.nombres || ''} ${profile.apellidos || ''}`.trim() || session.email.split('@')[0]
    : session.email.split('@')[0]

  const normalizedRole = session.role?.toLowerCase() || 'cliente'

  const routeProps = {
    user: {
      id: session.userId,
      nombre: displayName,
      email: session.email,
      telefono: profile?.telefono || undefined,
      avatar: profile?.url_avatar || undefined,
      rol: normalizedRole,
    },
    onLogout: handleLogout,
    onUpdateProfile: handleUpdateProfile,
    isProfileLoading: profileLoading,
  }

  // Renderizar ruta según el rol del usuario
  const role = normalizedRole

  switch (role) {
    case 'supervisor':
      return <SupervisorRoute {...routeProps} />
    case 'vendedor':
      return <VendedorRoute {...routeProps} />
    case 'bodeguero':
      return <BodegueroRoute {...routeProps} />
    case 'transportista':
      return <TransportistaRoute {...routeProps} />
    case 'cliente':
    default:
      return <ClienteRoute {...routeProps} />
  }
}
