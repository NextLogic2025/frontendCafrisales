import React from 'react'
import { ToastNotification, ToastType } from '../components/ui/ToastNotification'
import { setGlobalToastHandler } from '../utils/toastService'

type ToastContextValue = {
    showToast: (message: string, type?: ToastType, duration?: number) => void
}

type ToastState = {
    message: string
    type: ToastType
    duration: number
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = React.useState<ToastState | null>(null)

    const showToast = React.useCallback((message: string, type: ToastType = 'info', duration = 2500) => {
        setToast({ message, type, duration })
    }, [])

    React.useEffect(() => {
        setGlobalToastHandler(showToast)
        return () => setGlobalToastHandler(null)
    }, [showToast])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <ToastNotification
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onHide={() => setToast(null)}
                />
            )}
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = React.useContext(ToastContext)
    if (!ctx) {
        throw new Error('ToastContext is missing')
    }
    return ctx
}
