import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { TextField } from './TextField'
import { Alert } from './Alert'

export interface Field {
  name: string
  label: string
  type?: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'url' | 'file'
  placeholder?: string
  options?: Array<{ value: string | number; label: string }>
  step?: string
  min?: string | number
  required?: boolean
  prefix?: string
  disabled?: boolean
}

interface EntityFormModalProps<T> {
  isOpen: boolean
  title: string
  onClose: () => void
  onSubmit: (data: T) => Promise<void>
  fields: Field[]
  initialData?: Partial<T>
  headerGradient?: 'red' | 'blue' | 'green'
  subtitle?: string
  submitLabel?: string
  isEditing?: boolean
}

export function EntityFormModal<T extends Record<string, any>>({
  isOpen,
  title,
  onClose,
  onSubmit,
  fields,
  initialData = {},
  headerGradient = 'red',
  submitLabel,
  isEditing = false,
  subtitle,
}: EntityFormModalProps<T>) {
  const [formData, setFormData] = useState<Partial<T>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} es requerido`
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitMessage(null)

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData as T)
      setSubmitMessage({
        type: 'success',
        message: isEditing ? 'Actualizado correctamente' : 'Creado correctamente',
      })
      setTimeout(() => {
        onClose()
        setFormData({})
        setSubmitMessage(null)
      }, 1500)
    } catch (error: any) {
      setSubmitMessage({
        type: 'error',
        message: error.message || 'Error al guardar',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    setFormData({})
    setErrors({})
    setSubmitMessage(null)
  }

  // Actualizar formData solo cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData)
      setErrors({})
      setSubmitMessage(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} title={title} onClose={handleClose} headerGradient={headerGradient} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {subtitle && <p className="text-xs text-neutral-500 -mt-2">{subtitle}</p>}
        {submitMessage && (
          <Alert
            type={submitMessage.type}
            message={submitMessage.message}
            onClose={() => setSubmitMessage(null)}
          />
        )}

        {fields.map((field) => {
          const value = formData[field.name] ?? ''

          if (field.type === 'textarea') {
            return (
              <div key={field.name} className="grid gap-2">
                <label className="text-xs text-neutral-600">{field.label}</label>
                <textarea
                  value={value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="min-h-[80px] w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-neutral-900 outline-none transition focus:border-brand-red/60 focus:shadow-[0_0_0_4px_rgba(240,65,45,0.18)] disabled:opacity-50"
                  disabled={isSubmitting}
                />
                {errors[field.name] && <span className="text-xs text-red-700">{errors[field.name]}</span>}
              </div>
            )
          }

          if (field.type === 'select') {
            return (
              <div key={field.name} className="grid gap-2">
                <label className="text-xs text-neutral-600">{field.label}</label>
                <select
                  value={value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-neutral-900 outline-none transition focus:border-brand-red/60 focus:shadow-[0_0_0_4px_rgba(240,65,45,0.18)] disabled:opacity-50"
                  disabled={isSubmitting || field.disabled}
                >
                  <option value="">Selecciona una opción</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors[field.name] && <span className="text-xs text-red-700">{errors[field.name]}</span>}
              </div>
            )
          }

          if (field.type === 'file') {
            const valAny = value as any
            const hasExistingImg = typeof valAny === 'string' && valAny.startsWith('http')
            const fileValue = valAny instanceof File ? URL.createObjectURL(valAny) : null
            const previewUrl = fileValue || (hasExistingImg ? valAny : null)

            return (
              <div key={field.name} className="grid gap-2">
                <label className="text-xs text-neutral-600 font-medium">{field.label}</label>
                <div className="flex flex-col gap-3">
                  {previewUrl && (
                    <div className="relative h-32 w-32 rounded-xl border border-neutral-200 bg-white p-1 overflow-hidden group">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-full w-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">CAMBIAR</span>
                      </div>
                    </div>
                  )}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleChange(field.name, file)
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={isSubmitting}
                    />
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 transition hover:border-brand-red/40 hover:bg-white">
                      <div className="flex-1 truncate">
                        {valAny instanceof File ? valAny.name : 'Seleccionar imagen...'}
                      </div>
                      <button type="button" className="text-brand-red font-bold text-xs">
                        EXPLORAR
                      </button>
                    </div>
                  </div>
                </div>
                {errors[field.name] && <span className="text-xs text-red-700">{errors[field.name]}</span>}
              </div>
            )
          }

          if (field.type === 'checkbox') {
            return (
              <div key={field.name} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={field.name}
                  checked={!!value}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                  disabled={isSubmitting || field.disabled}
                />
                <label htmlFor={field.name} className="text-sm text-neutral-700">
                  {field.label}
                </label>
              </div>
            )
          }

          return (
            <TextField
              key={field.name}
              label={field.label}
              tone="light"
              type={field.type || 'text'}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => {
                const val = field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                handleChange(field.name, val)
              }}
              error={errors[field.name]}
              disabled={isSubmitting || field.disabled}
              step={field.step}
              min={field.min}
              left={field.prefix}
            />
          )
        })}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-neutral-700 bg-neutral-200 hover:bg-neutral-300 transition disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-brand-red text-white hover:bg-brand-red/90 transition disabled:opacity-50 font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : submitLabel || (isEditing ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
