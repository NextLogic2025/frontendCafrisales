import { useEffect, useState } from 'react'
import { Modal } from 'components/ui/Modal'
import { Alert } from 'components/ui/Alert'
import { Button } from 'components/ui/Button'
import { Check } from 'lucide-react'
import {
  type ZonaComercial,
} from '../../services/clientesApi'
import {
  ClienteForm,
  CLIENTE_FORM_DEFAULT,
  validateClienteForm,
  type ClienteFormValues,
  type ZonaOption,
  type CanalOption,
} from 'components/ui/ClienteForm'
import { obtenerZonas } from '../../services/zonasApi'
import { obtenerCanales } from '../../services/catalogApi'
import { obtenerVendedores, type Vendedor } from '../../services/usuariosApi'
import { crearCliente, actualizarCliente } from '../../services/clientesApi'
import { createUsuario } from '../../services/usuariosApi'

interface CrearClienteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: Partial<ClienteFormValues> & { id?: string; usuario_principal_id?: string | null }
  mode?: 'create' | 'edit'
}

type Step = 1 | 2 | 3

export function CrearClienteModal({ isOpen, onClose, onSuccess, initialData, mode = 'create' }: CrearClienteModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [formData, setFormData] = useState<ClienteFormValues>({ ...CLIENTE_FORM_DEFAULT, ...initialData })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)
  const [zonas, setZonas] = useState<ZonaOption[]>([])
  const [canales, setCanales] = useState<CanalOption[]>([])
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setCurrentStep(1)

    // Parse names/surnames from contact name if needed, or use initialData direct fields
    // Assuming initialData comes with flattened fields or we map them. 
    // If getting from existing client (edit mode), we should ensure fields match.
    setFormData({
      ...CLIENTE_FORM_DEFAULT,
      ...initialData,
      nombres: initialData?.nombres ?? '',
      apellidos: initialData?.apellidos ?? '',
      identificacion: initialData?.identificacion ?? '',
      tipo_identificacion: initialData?.tipo_identificacion ?? 'RUC',
      razon_social: initialData?.razon_social ?? '',
      nombre_comercial: initialData?.nombre_comercial ?? '',
      direccion_texto: initialData?.direccion_texto ?? '',
      contacto_email: initialData?.contacto_email ?? '',
      contacto_telefono: initialData?.contacto_telefono ?? '',
      contacto_password: '', // Password rarely populated on edit
      canal_id: initialData?.canal_id ?? null,
      zona_comercial_id: initialData?.zona_comercial_id ?? null,
      vendedor_asignado_id: initialData?.vendedor_asignado_id ?? null,
      latitud: initialData?.latitud ?? null,
      longitud: initialData?.longitud ?? null,
    })
    setErrors({})
    setSubmitMessage(null)

    const loadCatalog = async () => {
      try {
        setIsCatalogLoading(true)
        const [zonasData, canalesData, vendedoresData] = await Promise.all([
          obtenerZonas(),
          obtenerCanales(),
          obtenerVendedores()
        ])

        setZonas(zonasData.map(z => ({
          id: z.id,
          nombre: z.nombre,
          descripcion: z.descripcion,
          vendedor_asignado: z.vendedor_asignado,
          poligono_geografico: (z as any).poligono_geografico
        } as ZonaOption)))

        setCanales(canalesData)
        setVendedores(vendedoresData)
      } catch (e) {
        console.error("Error loading catalog", e)
      } finally {
        setIsCatalogLoading(false)
      }
    }
    loadCatalog()
  }, [isOpen, initialData])

  // Auto-asignar vendedor cuando cambia la zona
  useEffect(() => {
    if (!formData.zona_comercial_id) return

    const zone = zonas.find(z => z.id === formData.zona_comercial_id)
    if (zone?.vendedor_asignado?.vendedor_usuario_id) {
      setFormData(prev => ({
        ...prev,
        vendedor_asignado_id: zone.vendedor_asignado?.vendedor_usuario_id || null
      }))
    }
  }, [formData.zona_comercial_id, zonas])

  const validateForm = (): boolean => {
    const newErrors = validateClienteForm(formData, mode)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleClose = () => {
    setCurrentStep(1)
    setErrors({})
    setSubmitMessage(null)
    onClose()
  }

  const handleNext = async () => {
    setSubmitMessage(null)
    const currentErrors: Record<string, string> = {}
    const allErrors = validateClienteForm(formData, mode)

    // Validate current step fields only
    if (currentStep === 1) {
      // Fields for step 1
      const step1Fields = ['nombres', 'apellidos', 'contacto_email', 'contacto_telefono', 'contacto_password']
      step1Fields.forEach(f => {
        if (allErrors[f]) currentErrors[f] = allErrors[f]
      })
    } else if (currentStep === 2) {
      // Fields for step 2
      const step2Fields = ['razon_social', 'nombre_comercial', 'identificacion', 'zona_comercial_id']
      // Note: canal_id might be optional or required depending on rules. Added to validation if needed.
      step2Fields.forEach(f => {
        if (allErrors[f]) currentErrors[f] = allErrors[f]
      })
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors)
      return
    }

    setErrors({})

    // Removed intermediate user creation to defer it to step 3
    if (currentStep < 3) setCurrentStep((prev) => (prev + 1) as Step)
  }

  const handleBack = () => {
    setSubmitMessage(null)
    setErrors({})
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step)
  }

  const handleSubmit = async () => {
    if (currentStep !== 3) return
    setSubmitMessage(null)
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      if (mode === 'create') {
        // Step A: Create User Account
        let usuarioId = formData.usuario_principal_id
        if (!usuarioId) {
          const userPayload = {
            email: formData.contacto_email,
            password: formData.contacto_password,
            rol: 'cliente',
            perfil: {
              nombres: formData.nombres,
              apellidos: formData.apellidos,
              telefono: formData.contacto_telefono || undefined,
            },
          }

          const created = await createUsuario(userPayload as any)
          usuarioId = created?.usuario?.id || created?.id || created?.usuario_id || null
          if (!usuarioId) {
            throw new Error('No se pudo obtener el id del usuario creado')
          }
          // Update data in case of retry
          setFormData(prev => ({ ...prev, usuario_principal_id: usuarioId }))
        }

        // Step B: Create Client Record
        const canalId = typeof formData.canal_id === 'number'
          ? canalMapping[formData.canal_id] ?? String(formData.canal_id)
          : (formData.canal_id as unknown as string) ?? undefined

        const payload: any = {
          usuario_id: usuarioId,
          canal_id: canalId,
          nombre_comercial: formData.nombre_comercial || formData.razon_social || undefined,
          zona_id: String(formData.zona_comercial_id ?? '') || undefined,
          direccion: formData.direccion_texto ?? undefined,
          latitud: formData.latitud ?? undefined,
          longitud: formData.longitud ?? undefined,
          vendedor_asignado_id: formData.vendedor_asignado_id ?? undefined,
        }

        console.log('crearCliente payload', payload)
        await crearCliente(payload)
        setSubmitMessage({ type: 'success', message: 'Cliente creado exitosamente' })
      } else {
        if (!initialData?.id) throw new Error('Falta id del cliente')
        const payload: any = {
          // For update, use the user-service patchable fields. Keep names compatible with backend partial client.
          nombre_comercial: formData.nombre_comercial || formData.razon_social || undefined,
          canal_id: formData.canal_id ?? undefined,
          vendedor_asignado_id: formData.vendedor_asignado_id ?? undefined,
          zona_id: formData.zona_comercial_id ?? undefined,
          direccion: formData.direccion_texto ?? undefined,
          latitud: formData.latitud ?? undefined,
          longitud: formData.longitud ?? undefined,
        }

        console.log('actualizarCliente payload', payload)
        await actualizarCliente(initialData.id as string, payload)
        setSubmitMessage({ type: 'success', message: 'Cliente guardado' })
      }

      // Close and notify parent
      setTimeout(() => {
        handleClose()
        onSuccess()
      }, 800)
    } catch (error: any) {
      console.error('Error creating/updating client', error)
      setSubmitMessage({ type: 'error', message: error?.message || 'Error al guardar el cliente' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  // Wrap setFormData to clear errors on change
  const handleFormChange = (newValues: ClienteFormValues) => {
    setFormData(newValues)
    // Clear errors for fields that have changed and are now valid (or just clear them to let user retry)
    // For simplicity, just finding which key changed is hard with whole object replacement without diffing.
    // But we can clear ALL errors or just assume if user interacts we give benefit of doubt for that step, 
    // OR better: we don't clear errors automatically unless we validte.
    // User complaint was "Se queda así" (red border). 
    // Let's at least clear the errors for the current step if any change happens, OR specifically for the modified field if we could know it.
    // Since ClienteForm calls `onChange({ ...value, [key]: val })`, we can't easily intercept the specific key here without changing ClienteForm signature.
    // BUT, we can just clear errors.
    if (Object.keys(errors).length > 0) setErrors({})
  }

  return (
    <Modal isOpen={isOpen} title={mode === 'create' ? 'Crear Cliente' : 'Editar Cliente'} onClose={handleClose} headerGradient="red" maxWidth="lg">
      {/* Progress Steps */}
      <div className="mb-6 flex items-center justify-between">
        {[1, 2, 3].map((step) => {
          const isCompleted = step < currentStep
          const isCurrent = step === currentStep
          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition ${isCompleted
                    ? 'border-brand-red bg-brand-red text-white'
                    : isCurrent
                      ? 'border-brand-red bg-white text-brand-red'
                      : 'border-gray-300 bg-white text-gray-400'
                    }`}
                >
                  {isCompleted ? <Check className="h-6 w-6" /> : step}
                </div>
                <span className={`mt-2 text-xs font-semibold ${isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step === 1 ? 'Cuenta' : step === 2 ? 'Comercial' : 'Ubicación'}
                </span>
              </div>
              {step < 3 && <div className={`mx-2 h-0.5 flex-1 ${step < currentStep ? 'bg-brand-red' : 'bg-gray-300'}`} />}
            </div>
          )
        })}
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {submitMessage && <Alert type={submitMessage.type} message={submitMessage.message} onClose={() => setSubmitMessage(null)} />}

        <ClienteForm
          value={formData}
          errors={errors}
          mode={mode}
          isSubmitting={isSubmitting}
          isCatalogLoading={isCatalogLoading}
          zonas={zonas}
          canales={canales}
          vendedores={vendedores}
          onChange={handleFormChange}
          step={currentStep}
        />

        <div className="flex justify-between gap-3 pt-4 border-t">
          {currentStep > 1 && (
            <Button type="button" onClick={handleBack} className="bg-neutral-200 text-neutral-700 hover:bg-neutral-300" disabled={isSubmitting}>
              Atrás
            </Button>
          )}
          <div className="flex-1" />
          {currentStep < 3 ? (
            <Button type="button" onClick={handleNext} className="bg-brand-red text-white hover:bg-brand-red/90">
              Siguiente: {currentStep === 1 ? 'Comercial' : 'Ubicación'}
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} className="bg-brand-red text-white hover:bg-brand-red/90 disabled:opacity-50" disabled={isSubmitting}>
              <Check className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Guardando...' : 'Finalizar y Guardar'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  )
}


