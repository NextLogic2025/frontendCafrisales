import type { ToastType } from '../components/ui/ToastNotification'

type ToastHandler = (message: string, type?: ToastType, duration?: number) => void

let globalHandler: ToastHandler | null = null

export function setGlobalToastHandler(handler: ToastHandler | null) {
    globalHandler = handler
}

export function showGlobalToast(message: string, type: ToastType = 'info', duration = 2500) {
    if (globalHandler) {
        globalHandler(message, type, duration)
    } else if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('Toast:', message)
    }
}
