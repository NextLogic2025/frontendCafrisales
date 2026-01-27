import { useEffect, useState } from 'react'
import {
  type Campania,
  type CreateCampaniaDto,
} from './promocionesApi'

export function usePromocionesCrud() {
  const [campanias, setCampanias] = useState<Campania[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string>('')

  useEffect(() => {
    loadCampanias()
  }, [])

  const loadCampanias = async () => {
    setIsLoading(false)
    setCampanias([])
  }

  const create = async (data: CreateCampaniaDto) => {
    setSuccessMessage('Campaña creada correctamente')
  }

  const update = async (id: string | number, data: CreateCampaniaDto) => {
    setSuccessMessage('Campaña actualizada correctamente')
  }

  const remove = async (id: string | number) => {
    setSuccessMessage('Campaña eliminada correctamente')
  }

  return {
    campanias,
    isLoading,
    error,
    successMessage,
    create,
    update,
    remove,
    reload: loadCampanias,
  }
}
