import { View, Text } from 'react-native'
import { PrimaryButton } from '../../components/ui/PrimaryButton'

type RecoveryScreenProps = {
  onCancel: () => void
}

export function RecoveryScreen({ onCancel }: RecoveryScreenProps) {
  return (
    <View className="flex-1 bg-white px-6 pt-24">
      <View className="mb-6">
        <Text className="text-xs font-semibold uppercase tracking-[0.4em] text-[#C52C1B]">Recuperar</Text>
        <Text className="text-3xl font-semibold text-[#F0412D]">Restablecer contraseña</Text>
        <Text className="text-sm text-neutral-500">
          Te enviaremos un enlace seguro para recuperar tu cuenta en segundos.
        </Text>
      </View>
      <View className="space-y-4">
        <PrimaryButton title="Enviar enlace de recuperación" />
        <PrimaryButton title="Volver a iniciar sesión" variant="ghost" onPress={onCancel} />
      </View>
    </View>
  )
}
