import { useEffect, useState } from 'react'
import logo from '../../assets/logo.png'
import { BRAND_COLORS } from '../shared/types'

type Props = {
  onDone: () => void
}

export function SplashScreen({ onDone }: Props) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
    const timer = setTimeout(onDone, 2000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div
      className="flex min-h-screen items-center justify-center overflow-hidden"
      style={{ backgroundColor: BRAND_COLORS.red }}
    >
      {/* Decorative shapes */}
      <div
        className="absolute -top-32 -left-32 h-125 w-125 rounded-full opacity-20"
        style={{
          backgroundColor: 'rgba(0,0,0,0.18)',
          animation: 'pulse 1.8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 h-112.5 w-112.5 rounded-full opacity-30"
        style={{
          backgroundColor: BRAND_COLORS.gold,
          animation: 'pulse 1.8s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute top-1/4 right-1/4 h-32 w-32 rounded-full opacity-15"
        style={{ backgroundColor: BRAND_COLORS.cream }}
      />

      {/* Logo */}
      <img
        src={logo}
        alt="Cafrisales"
        className="relative z-10 w-72 object-contain"
        style={{
          filter: 'drop-shadow(0 15px 50px rgba(0,0,0,0.3))',
          opacity: animate ? 1 : 0,
          transform: animate ? 'scale(1)' : 'scale(0.9)',
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.05); opacity: 0.35; }
        }
      `}</style>
    </div>
  )
}
