import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as ExpoSplashScreen from 'expo-splash-screen'
import * as React from 'react'
import { Platform } from 'react-native'
import * as NavigationBar from 'expo-navigation-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { jwtDecode } from 'jwt-decode'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'

import '../global.css'

import { ForgotPasswordScreen } from './features/auth/screens/ForgotPasswordScreen'
import { LoginScreen } from './features/auth/screens/LoginScreen'
import { SplashScreen } from './features/auth/screens/SplashScreen'
import { ClientNavigator } from './navigation/ClientNavigator'
import { SupervisorNavigator } from './navigation/SupervisorNavigator'
import { SellerNavigator } from './navigation/SellerNavigator'
import { TransportistaNavigator } from './navigation/TransportistaNavigator'
import { WarehouseNavigator } from './navigation/WarehouseNavigator'
import { navigationRef } from './navigation/navigationRef'
import type { RootStackParamList } from './navigation/types'
import { getSessionTimeLeftMs, getValidToken, refreshSession, signOut } from './services/auth/authClient'
import { getToken, subscribeToTokenChanges } from './storage/authStorage'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { NotificationProvider } from './context/NotificationContext'
import { FeedbackModal } from './components/ui/FeedbackModal'
import { resetToLogin } from './navigation/navigationRef'
import { showGlobalToast } from './utils/toastService'

ExpoSplashScreen.preventAutoHideAsync().catch(() => {})

const Stack = createNativeStackNavigator<RootStackParamList>()
const SESSION_WARNING_WINDOW_MS = 2 * 60 * 1000
const SESSION_CHECK_INTERVAL_MS = 15000

type DecodedAccessToken = {
    role?: string
    rol?: string
}

type AuthStartRoute = 'Login' | 'Cliente' | 'Supervisor' | 'Vendedor' | 'Transportista' | 'Bodeguero'

const ROLE_ROUTES: Record<string, AuthStartRoute> = {
    cliente: 'Cliente',
    supervisor: 'Supervisor',
    admin: 'Supervisor',
    staff: 'Supervisor',
    vendedor: 'Vendedor',
    transportista: 'Transportista',
    bodeguero: 'Bodeguero'
}

const getRouteForRole = (role?: string | null): AuthStartRoute => {
    if (!role) return 'Login'
    return ROLE_ROUTES[role.toLowerCase()] || 'Login'
}

export default function App() {
    const [sessionWarningVisible, setSessionWarningVisible] = React.useState(false)
    const [secondsLeft, setSecondsLeft] = React.useState<number | null>(null)
    const [refreshingSession, setRefreshingSession] = React.useState(false)
    const warnedTokenRef = React.useRef<string | null>(null)

    React.useEffect(() => {
        if (!__DEV__) {
            console.log = () => {}
            console.info = () => {}
            console.warn = () => {}
            console.debug = () => {}
        }

        ExpoSplashScreen.hideAsync().catch(() => {})

        if (Platform.OS === 'android') {
            NavigationBar.setBackgroundColorAsync('#f3f4f6').catch(() => {})
            NavigationBar.setButtonStyleAsync('dark').catch(() => {})
        }
    }, [])

    const checkSessionExpiry = React.useCallback(async () => {
        const token = await getToken()
        if (!token) {
            setSessionWarningVisible(false)
            setSecondsLeft(null)
            warnedTokenRef.current = null
            return
        }

        const timeLeftMs = await getSessionTimeLeftMs()
        if (timeLeftMs == null || timeLeftMs <= 0) {
            setSessionWarningVisible(false)
            setSecondsLeft(null)
            warnedTokenRef.current = null
            return
        }

        const roundedSeconds = Math.max(1, Math.ceil(timeLeftMs / 1000))
        setSecondsLeft(roundedSeconds)

        if (timeLeftMs <= SESSION_WARNING_WINDOW_MS && warnedTokenRef.current !== token) {
            warnedTokenRef.current = token
            setSessionWarningVisible(true)
        }

        if (timeLeftMs > SESSION_WARNING_WINDOW_MS && warnedTokenRef.current === token) {
            warnedTokenRef.current = null
            setSessionWarningVisible(false)
        }
    }, [])

    React.useEffect(() => {
        checkSessionExpiry()
        const interval = setInterval(() => {
            checkSessionExpiry()
        }, SESSION_CHECK_INTERVAL_MS)
        const unsubscribe = subscribeToTokenChanges(() => {
            warnedTokenRef.current = null
            checkSessionExpiry()
        })

        return () => {
            clearInterval(interval)
            unsubscribe()
        }
    }, [checkSessionExpiry])

    const handleExtendSession = React.useCallback(async () => {
        if (refreshingSession) return
        setRefreshingSession(true)
        try {
            const ok = await refreshSession()
            if (ok) {
                setSessionWarningVisible(false)
                warnedTokenRef.current = null
                showGlobalToast('Tu sesion se extendio correctamente.', 'success')
                await checkSessionExpiry()
                return
            }
            await signOut()
            resetToLogin()
        } finally {
            setRefreshingSession(false)
        }
    }, [checkSessionExpiry, refreshingSession])

    const handleLogoutNow = React.useCallback(async () => {
        await signOut()
        setSessionWarningVisible(false)
        warnedTokenRef.current = null
        resetToLogin()
    }, [])

    const handleSplashDone = async (navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>) => {
        const token = await getValidToken()
        if (token) {
            try {
                const decoded = jwtDecode<DecodedAccessToken>(token)
                navigation.replace(getRouteForRole(decoded.role || decoded.rol))
            } catch (e) {
                console.error('Error decoding token:', e)
                navigation.replace('Login')
            }
        } else {
            navigation.replace('Login')
        }
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <CartProvider>
                <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                    <NotificationProvider>
                        <ToastProvider>
                            <NavigationContainer ref={navigationRef}>
                                <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
                                    <Stack.Screen name="Splash">
                                        {({ navigation }) => (
                                            <SplashScreen onDone={() => handleSplashDone(navigation)} />
                                        )}
                                    </Stack.Screen>

                                    <Stack.Screen name="Login">
                                        {({ navigation }) => (
                                            <LoginScreen
                                                onSignedIn={(role) => navigation.replace(getRouteForRole(role))}
                                                onForgotPassword={() => navigation.navigate('ForgotPassword')}
                                            />
                                        )}
                                    </Stack.Screen>

                                    <Stack.Screen name="ForgotPassword">
                                        {({ navigation }) => (
                                            <ForgotPasswordScreen onBack={() => navigation.goBack()} />
                                        )}
                                    </Stack.Screen>

                                    <Stack.Screen name="Cliente" component={ClientNavigator} />
                                    <Stack.Screen name="Supervisor" component={SupervisorNavigator} />
                                    <Stack.Screen name="Vendedor" component={SellerNavigator} />
                                    <Stack.Screen name="Transportista" component={TransportistaNavigator} />
                                    <Stack.Screen name="Bodeguero" component={WarehouseNavigator} />
                                </Stack.Navigator>
                            </NavigationContainer>
                            <FeedbackModal
                                visible={sessionWarningVisible}
                                type="warning"
                                title="Tu sesion caducara pronto"
                                message={
                                    secondsLeft
                                        ? `Tu sesion vence en ${secondsLeft} segundos. Quieres continuar?`
                                        : 'Tu sesion esta por vencer. Quieres continuar?'
                                }
                                confirmText={refreshingSession ? 'Continuando...' : 'Continuar'}
                                cancelText="Salir"
                                onClose={() => setSessionWarningVisible(false)}
                                onConfirm={handleExtendSession}
                                onCancel={handleLogoutNow}
                                showCancel
                            />
                        </ToastProvider>
                    </NotificationProvider>
                </SafeAreaProvider>
            </CartProvider>
        </GestureHandlerRootView>
    )
}
