import { PrimaryButton } from '../../components/ui/PrimaryButton'

type RecoveryScreenProps = {
  onCancel: () => void
}

export function RecoveryScreen({ onCancel }: RecoveryScreenProps) {
  return (
    <div className="w-full max-w-xl rounded-[32px] border border-gold/60 bg-white p-10 shadow-[0_25px_45px_rgba(180,150,80,0.25)]">
      <p className="text-sm font-semibold uppercase tracking-[0.4em] text-red700">Recuperar</p>
      <h2 className="mt-3 text-3xl font-semibold text-red">Restablecer contraseña</h2>
      <p className="mt-2 text-sm text-neutral-500">
        Te enviaremos un enlace seguro para que puedas actualizar tu contraseña en segundos.
      </p>
      <div className="mt-8 space-y-4">
        <PrimaryButton title="Enviar enlace" />
        <button
          type="button"
          className="text-sm font-semibold text-red700 underline-offset-4 hover:underline"
          onClick={onCancel}
        >
          Volver a iniciar sesión
        </button>
      </div>
    </div>
  )
}
