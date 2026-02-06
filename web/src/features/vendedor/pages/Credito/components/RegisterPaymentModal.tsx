interface RegisterPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: string
  setAmount: (v: string) => void
  date: string
  setDate: (v: string) => void
  reference: string
  setReference: (v: string) => void
  notes: string
  setNotes: (v: string) => void
  onConfirm: () => void
  loading: boolean
  error: string | null
}

export function RegisterPaymentModal({
  isOpen,
  onClose,
  amount,
  setAmount,
  date,
  setDate,
  reference,
  setReference,
  notes,
  setNotes,
  onConfirm,
  loading,
  error,
}: RegisterPaymentModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-60 flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-bottom duration-200">
        <div className="p-4 border-b border-red-700/20 flex items-center justify-between bg-brand-red text-white">
          <h3 className="text-lg font-bold">Registrar pago</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-neutral-500">Monto</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              step="0.01"
              className="w-full mt-2 p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Fecha de pago</label>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              className="w-full mt-2 p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Referencia (opcional)</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full mt-2 p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-2 p-3 border rounded-lg"
              rows={3}
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white border">
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-green-600 text-white"
            >
              {loading ? 'Registrando...' : 'Confirmar pago'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
