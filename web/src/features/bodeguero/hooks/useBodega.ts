import { useState, useCallback } from 'react'


export function useBodega() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((err: any) => {
    const message = err?.message || 'Error en la operación'
    setError(message)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    setLoading,
    handleError,
    clearError,
    // bodegaApi removed
  }
}
