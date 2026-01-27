import React from 'react'
import { View, Text } from 'react-native'
import { Header } from '../../../../components/ui/Header'
import { ClientHeaderMenu } from '../../../../components/ui/ClientHeaderMenu'
import { getUserName } from '../../../../storage/authStorage'

export function ClientHomeScreen() {
    const [userName, setUserName] = React.useState('Cliente')

    React.useEffect(() => {
        getUserName().then(name => {
            if (name) setUserName(name)
        })
    }, [])

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                userName={userName}
                role="CLIENTE"
                variant="home"
                showNotification={false}
                rightElement={<ClientHeaderMenu />}
            />

            <View className="flex-1 items-center justify-center px-6">
                <Text className="text-xl font-bold text-neutral-900 mb-2">Inicio Cliente</Text>
                <Text className="text-neutral-500 text-center">Pantalla basica para Expo Go.</Text>
            </View>
        </View>
    )
}
