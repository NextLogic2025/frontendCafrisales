import React, { useState } from 'react'
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

type Session = SignedInUser

export function AppRoot() {
  const [splashVisible, setSplashVisible] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [showRecovery, setShowRecovery] = useState(false)

  const handleLogout = () => {
    setSession(null)
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
  const routeProps = {
    user: {
      id: session.userId,
      nombre: session.email.split('@')[0],
      email: session.email,
    },
    onLogout: handleLogout,
  }

  // Renderizar ruta según el rol del usuario
  const role = session.role.toLowerCase()

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
