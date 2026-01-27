import { useState } from 'react'
import { type ClienteCampania } from './promocionesApi'
import { type Cliente } from './clientesApi'

export function usePromocionesClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clientesCampania, setClientesCampania] = useState<ClienteCampania[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadClientes = async () => {
    setIsLoading(false)
    setClientes([])
  }

  const loadClientesCampania = async (campaniaId: string | number) => {
    setIsLoading(false)
    setClientesCampania([])
  }

  const addCliente = async (campaniaId: string | number, clienteId: string) => {
    // Logic removed
  }

  const removeCliente = async (campaniaId: string | number, clienteId: string) => {
    // Logic removed
  }

  return {
    clientes,
    clientesCampania,
    isLoading,
    error,
    loadClientes,
    loadClientesCampania,
    addCliente,
    removeCliente,
  }
}
