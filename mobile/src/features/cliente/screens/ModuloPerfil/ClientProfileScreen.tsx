import React, { useState, useCallback } from 'react'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { UserService, type UserProfile } from '../../../../services/api/UserService'
import { UserClientService } from '../../../../services/api/UserClientService'
import { signOut } from '../../../../services/auth/authClient'
import { useToast } from '../../../../context/ToastContext'
import { UserProfileTemplate, type CommercialData } from '../../../../components/profile/UserProfileTemplate'

export function ClientProfileScreen() {
    const navigation = useNavigation()
    const { showToast } = useToast()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [commercialData, setCommercialData] = useState<CommercialData | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)

    const loadProfile = async () => {
        try {
            setIsLoading(true)
            const user = await UserService.getProfile()
            setProfile(user)

            if (user?.id) {
                const myClient = await UserClientService.getClient(user.id)

                if (myClient) {
                    const zoneName = myClient.zona_id ? `Zona #${myClient.zona_id}` : 'General'
                    const vendorName = myClient.vendedor_asignado_id ? 'Asignado' : 'No asignado'

                    setCommercialData({
                        identificacion: myClient.ruc ?? undefined,
                        tipo_identificacion: myClient.ruc ? 'RUC' : undefined,
                        razon_social: myClient.nombre_comercial ?? undefined,
                        nombre_comercial: myClient.nombre_comercial ?? undefined,
                        lista_precios: 'General',
                        vendedor_asignado: vendorName,
                        zona_comercial: zoneName,
                        tiene_credito: false,
                        limite_credito: 0,
                        saldo_actual: 0,
                        dias_plazo: undefined,
                        direccion: myClient.direccion ?? undefined
                    })
                }
            }

        } catch (error) {
            console.error('Error loading profile', error)
            showToast('Error al cargar perfil', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    useFocusEffect(useCallback(() => { loadProfile() }, []))

    const handleUpdateProfile = async (data: { nombre: string; telefono: string }): Promise<boolean> => {
        if (!profile) return false

        try {
            const success = await UserService.updateProfile(profile.id, data)
            if (success) {
                await loadProfile()
                return true
            }
            return false
        } catch (error) {
            console.error('Error updating profile', error)
            return false
        }
    }

    const handleLogout = async () => {
        try {
            await signOut()
            showToast('Sesión cerrada exitosamente', 'success')
            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' as never }],
                })
            }, 300)
        } catch (error) {
            showToast('Error al cerrar sesión', 'error')
        }
    }

    return (
        <>
            <Header title="Mi Perfil" variant="standard" showNotification={false} />
            <UserProfileTemplate
                user={profile ? {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone,
                    role: profile.role,
                    photoUrl: profile.photoUrl,
                    lastLogin: profile.lastLogin
                } : {
                    id: '', name: '', email: '', phone: '', role: 'Cargando...'
                }}
                commercialInfo={commercialData}
                isClient={true}
                isLoading={isLoading}
                onLogout={handleLogout}
                onUpdateProfile={handleUpdateProfile}
            />
        </>
    )
}
