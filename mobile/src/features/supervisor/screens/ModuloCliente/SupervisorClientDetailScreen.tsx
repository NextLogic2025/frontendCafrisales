import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking, RefreshControl } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

import { Header } from '../../../../components/ui/Header'
import { BRAND_COLORS } from '../../../../shared/types'
import { ClientService, Client, ClientBranch } from '../../../../services/api/ClientService'
import { MiniMapPreview } from '../../../../components/ui/MiniMapPreview'

export function SupervisorClientDetailScreen() {
    const route = useRoute<any>()
    const navigation = useNavigation<any>()

    const clientParam: Client | undefined = route.params?.client
    const clientId: string | undefined = clientParam?.id || route.params?.clientId

    const [client, setClient] = useState<Client | null>(clientParam || null)
    const [branches, setBranches] = useState<ClientBranch[]>([])
    const [loading, setLoading] = useState(false)

    const loadData = async () => {
        if (!clientId) return
        setLoading(true)
        try {
            const [clientData, sucursales] = await Promise.all([
                ClientService.getClient(clientId),
                ClientService.getClientBranches(clientId)
            ])
            setClient(clientData)
            setBranches(sucursales)
        } catch (e) {
            console.error('Error cargando detalle del cliente:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
        const unsub = navigation.addListener('focus', loadData)
        return unsub
    }, [navigation])

    const openInGoogleMaps = (coordinates: [number, number], title: string) => {
        const [lng, lat] = coordinates
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        Linking.openURL(url).catch(err => console.error('Error abriendo Google Maps:', err))
    }

    if (loading && !client) {
        return (
            <View className="flex-1 bg-neutral-50">
                <Header title="Detalle Cliente" variant="standard" onBackPress={() => navigation.goBack()} />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={BRAND_COLORS.red} />
                    <Text className="text-neutral-500 mt-4 text-sm">Cargando informacion...</Text>
                </View>
            </View>
        )
    }

    if (!client) {
        return (
            <View className="flex-1 bg-neutral-50">
                <Header title="Detalle Cliente" variant="standard" onBackPress={() => navigation.goBack()} />
                <View className="flex-1 items-center justify-center px-6">
                    <View className="bg-neutral-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                        <Ionicons name="search-outline" size={40} color="#9CA3AF" />
                    </View>
                    <Text className="text-lg font-bold text-neutral-900 text-center mb-2">
                        Cliente no encontrado
                    </Text>
                    <Text className="text-neutral-500 text-center">
                        No se pudo cargar la informacion del cliente
                    </Text>
                </View>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-neutral-50">
            <Header title="Detalle Cliente" variant="standard" onBackPress={() => navigation.goBack()} />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadData} tintColor={BRAND_COLORS.red} />
                }
            >
                <View className="px-5 py-4">
                    <View className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
                        <Text className="text-2xl font-bold text-neutral-900 mb-1" numberOfLines={2}>
                            {client.nombre_comercial || client.razon_social}
                        </Text>
                        {client.nombre_comercial && client.razon_social !== client.nombre_comercial && (
                            <Text className="text-neutral-600 text-sm font-medium">{client.razon_social}</Text>
                        )}

                        <View className="mt-3">
                            <Text className="text-neutral-500 text-xs font-medium mb-1">Identificacion</Text>
                            <Text className="text-neutral-900 text-sm font-semibold">
                                {client.tipo_identificacion}: {client.identificacion}
                            </Text>
                        </View>

                        {client.direccion_texto && (
                            <View className="mt-3">
                                <Text className="text-neutral-500 text-xs font-medium mb-1">Direccion</Text>
                                <Text className="text-neutral-900 text-sm font-semibold">
                                    {client.direccion_texto}
                                </Text>
                            </View>
                        )}
                    </View>

                    {client.ubicacion_gps && (
                        <View className="mt-4">
                            <Text className="text-base font-bold text-neutral-900 mb-3">Ubicacion principal</Text>
                            <MiniMapPreview
                                height={240}
                                marker={{ latitude: client.ubicacion_gps.coordinates[1], longitude: client.ubicacion_gps.coordinates[0] }}
                                center={{ latitude: client.ubicacion_gps.coordinates[1], longitude: client.ubicacion_gps.coordinates[0] }}
                                onPress={() => openInGoogleMaps(client.ubicacion_gps!.coordinates, client.nombre_comercial || client.razon_social)}
                            />
                            <TouchableOpacity
                                onPress={() => openInGoogleMaps(client.ubicacion_gps!.coordinates, client.nombre_comercial || client.razon_social)}
                                className="flex-row items-center bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg mt-3"
                                activeOpacity={0.8}
                            >
                                <Ionicons name="navigate" size={16} color="#2563EB" />
                                <Text className="text-blue-700 font-semibold text-xs ml-2">
                                    Abrir en Google Maps
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={() => (navigation as any).navigate('SupervisorClientForm', { client })}
                        activeOpacity={0.7}
                        className="mt-6 flex-row items-center justify-center py-4 rounded-xl shadow-lg"
                        style={{ backgroundColor: BRAND_COLORS.red }}
                    >
                        <Ionicons name="pencil" size={20} color="white" />
                        <Text className="text-white font-bold text-base ml-2">
                            Editar Cliente
                        </Text>
                    </TouchableOpacity>

                    <View className="mt-6">
                        <Text className="text-base font-bold text-neutral-900 mb-3">Sucursales</Text>
                        {branches.length > 0 ? (
                            branches.map((branch) => (
                                <View key={branch.id} className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm mb-3">
                                    <View className="flex-row items-center mb-2">
                                        <Ionicons name="storefront" size={16} color={BRAND_COLORS.red} />
                                        <Text className="text-neutral-900 font-bold text-base ml-2 flex-1">
                                            {branch.nombre_sucursal}
                                        </Text>
                                    </View>
                                    <Text className="text-neutral-600 text-sm">{branch.direccion_entrega}</Text>
                                </View>
                            ))
                        ) : (
                            <View className="bg-white rounded-2xl border border-neutral-200 p-8 items-center">
                                <View className="bg-neutral-100 w-16 h-16 rounded-full items-center justify-center mb-3">
                                    <Ionicons name="storefront-outline" size={32} color="#9CA3AF" />
                                </View>
                                <Text className="text-neutral-700 font-semibold text-base mb-1">
                                    Sin Sucursales
                                </Text>
                                <Text className="text-neutral-500 text-sm text-center">
                                    Este cliente no tiene sucursales registradas
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="h-8" />
                </View>
            </ScrollView>
        </View>
    )
}
