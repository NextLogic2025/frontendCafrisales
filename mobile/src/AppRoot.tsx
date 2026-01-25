import React, { useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SplashScreen } from './features/auth/SplashScreen'
import { LoginScreen } from './features/auth/LoginScreen'
import { RecoveryScreen } from './features/auth/RecoveryScreen'
import { getRoleEndpoint, ROLE_ROUTES } from './navigation'

type Session = {
  role: string
  email: string
}

export function AppRoot() {
  const [splashVisible, setSplashVisible] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [showRecovery, setShowRecovery] = useState(false)

  const featureCards = useMemo(() => ROLE_ROUTES, [])

  if (splashVisible) {
    return <SplashScreen onDone={() => setSplashVisible(false)} />
  }

  if (!session) {
    return showRecovery ? (
      <RecoveryScreen onCancel={() => setShowRecovery(false)} />
    ) : (
      <LoginScreen
        onSignedIn={(role, email) => {
          setSession({ email, role })
        }}
        onForgotPassword={() => setShowRecovery(true)}
      />
    )
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
      <Text className="text-3xl font-semibold text-red mb-2">Bienvenido, {session.role}</Text>
      <Text className="text-sm text-neutral-500 mb-6">Ha iniciado sesión como {session.email}</Text>

      <View className="space-y-5">
        {featureCards.map((feature) => (
          <View
            key={feature.key}
            className="rounded-3xl border border-red700/30 bg-white/90 p-5 shadow-[0_25px_60px_rgba(192,44,27,0.2)]"
          >
            <Text className="mb-2 text-xl font-semibold text-red700">{feature.name}</Text>
            <Text className="mb-3 text-sm text-neutral-500">{feature.description}</Text>
            {feature.component}
            <Text className="mt-4 text-xs font-semibold text-red700">{getRoleEndpoint(feature)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
