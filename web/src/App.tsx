import { BrowserRouter } from 'react-router-dom'

import { AuthProvider } from './context/auth/AuthContext'
import AppRouter from './routes/AppRouter'
import NotificationsProvider from './context/notifications/NotificationsProvider'

export function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRouter />
        </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  )
}
