import { useState } from 'react'
import { Modal } from 'components/ui/Modal'
import { Button } from 'components/ui/Button'
import { TextField } from 'components/ui/TextField'
import { Truck, Check } from 'components/ui/Icons'
import { Alert } from 'components/ui/Alert'
import { createVehicle, type CreateVehiclePayload } from '../../services/vehiclesApi'

interface CrearVehiculoModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CrearVehiculoModal({ isOpen, onClose, onSuccess }: CrearVehiculoModalProps) {
    const [form, setForm] = useState<CreateVehiclePayload>({ placa: '', modelo: '', capacidad_kg: undefined })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const reset = () => {
        setForm({ placa: '', modelo: '', capacidad_kg: undefined })
        setErrors({})
        setMessage(null)
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.placa || !form.placa.trim()) e.placa = 'La placa es obligatoria'
        if (form.capacidad_kg != null && form.capacidad_kg < 0) e.capacidad_kg = 'Capacidad inválida'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setSubmitting(true)
        setMessage(null)
        try {
            await createVehicle(form)
            setMessage({ type: 'success', message: 'Vehículo creado correctamente' })
            setTimeout(() => {
                handleClose()
                onSuccess()
            }, 800)
        } catch (err: any) {
            setMessage({ type: 'error', message: err.message || 'Error al crear vehículo' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Vehículo" headerGradient="red" maxWidth="md">
            {message && <Alert type={message.type} message={message.message} onClose={() => setMessage(null)} />}

            <form onSubmit={handleSubmit} className="space-y-4">
                <TextField
                    label="Placa"
                    placeholder="ABC-1234"
                    tone="light"
                    value={form.placa}
                    onChange={e => setForm({ ...form, placa: e.target.value })}
                    error={errors.placa}
                    disabled={submitting}
                />

                <TextField
                    label="Modelo"
                    placeholder="Marca / Modelo"
                    tone="light"
                    value={form.modelo || ''}
                    onChange={e => setForm({ ...form, modelo: e.target.value })}
                    disabled={submitting}
                />

                <TextField
                    label="Capacidad (kg)"
                    type="number"
                    placeholder="Ej. 1500"
                    tone="light"
                    value={form.capacidad_kg != null ? String(form.capacidad_kg) : ''}
                    onChange={e => setForm({ ...form, capacidad_kg: e.target.value ? Number(e.target.value) : undefined })}
                    error={errors.capacidad_kg}
                    disabled={submitting}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" className="bg-brand-red text-white hover:bg-brand-red/90 min-w-[120px]" disabled={submitting}>
                        {submitting ? 'Creando...' : (
                            <span className="flex items-center gap-2">Crear Vehículo <Check size={14} /></span>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
