import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { BRAND_COLORS } from '../../../../shared/types'

export function SupervisorClientFormScreen() {
    const navigation = useNavigation<any>()
    const route = useRoute<any>()
    const isEditing = !!route.params?.client

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
                variant="standard"
                onBackPress={() => navigation.goBack()}
            />

            <View className="flex-1 items-center justify-center px-6">
                <View className="bg-white rounded-2xl border border-neutral-200 p-6 w-full items-center">
                    <Text className="text-xl font-bold text-neutral-900 mb-2">
                        Formulario en limpieza
                    </Text>
                    <Text className="text-neutral-500 text-center mb-6">
                        Esta vista quedo como placeholder para evitar errores mientras se limpia el flujo de clientes.
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="px-6 py-3 rounded-xl"
                        style={{ backgroundColor: BRAND_COLORS.red }}
                    >
                        <Text className="text-white font-semibold">Volver</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}
