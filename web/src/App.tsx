import { useMemo, useState } from 'react'
import { BRAND_COLORS } from './features/shared/types'
import { LoginScreen } from './features/auth/LoginScreen'
import { RecoveryScreen } from './features/auth/RecoveryScreen'
import { SplashScreen } from './features/auth/SplashScreen'
import { getRoleEndpoint, ROLE_ROUTES } from './routes'

type Session = {
  role: string
  email: string
}

function App() {
  const [splashVisible, setSplashVisible] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [recoveryMode, setRecoveryMode] = useState(false)

  const features = useMemo(() => ROLE_ROUTES, [])

  if (splashVisible) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(240,65,45,0.15),_transparent_40%),_#FFF4E6]">
        <SplashScreen onDone={() => setSplashVisible(false)} />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-10">
        {recoveryMode ? (
          <RecoveryScreen onCancel={() => setRecoveryMode(false)} />
        ) : (
          <LoginScreen
            onForgotPassword={() => setRecoveryMode(true)}
            onSignedIn={(credentials) =>
              setSession({ role: credentials.role ?? 'Vendedor', email: credentials.email })
            }
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-4xl border border-red700/30 bg-white/80 p-10 shadow-[0_25px_60px_rgba(192,44,27,0.2)]">
        <header className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.45em] text-red700">Cafrisales</p>
          <h1 className="text-3xl font-semibold text-red">Bienvenido de vuelta</h1>
          <p className="text-neutral-500">
            Sesión iniciada como <strong className="text-red700">{session.role}</strong> –{' '}
            {session.email}
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.key}
              className="rounded-3xl border border-red/30 bg-red/5 p-6 shadow-[0_10px_30px_rgba(208,44,27,0.12)]"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-red700">{feature.name}</h2>
                <span
                  className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-gold shadow-[0_4px_15px_rgba(244,212,106,0.25)]"
                  style={{ border: `1px solid ${BRAND_COLORS.red700}` }}
                >
                  Nuevo
                </span>
              </div>
              <p className="mt-4 text-sm text-neutral-500">{feature.description}</p>
              <div className="mt-4 text-sm text-neutral-600">{feature.component}</div>
              <p className="mt-3 text-xs font-semibold text-red700">{getRoleEndpoint(feature)}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

export default App
