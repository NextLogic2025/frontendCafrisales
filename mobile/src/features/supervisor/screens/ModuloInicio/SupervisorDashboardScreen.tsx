import React from 'react'
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BRAND_COLORS } from '../../../../shared/types'

import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { getUserName } from '../../../../storage/authStorage'
import { UserService } from '../../../../services/api/UserService'
import { DashboardCard } from '../../../../components/ui/DashboardCard'
import { QuickActionsGrid } from '../../../../components/ui/QuickActionsGrid'

type KPI = {
    label: string
    value: string | number
    icon: string
    color: string
}

type AlertItem = {
    id: string
    message: string
    type: 'critical' | 'warning'
    timestamp: string
}

const DEFAULT_KPIS: KPI[] = [
    { label: 'Clientes', value: 0, icon: 'people-outline', color: BRAND_COLORS.red },
    { label: 'Activos', value: 0, icon: 'checkmark-circle-outline', color: '#10B981' },
    { label: 'Alertas', value: 0, icon: 'alert-circle-outline', color: '#F59E0B' }
]

export function SupervisorDashboardScreen() {
    const [kpis, setKpis] = React.useState<KPI[]>(DEFAULT_KPIS)
    const [alerts, setAlerts] = React.useState<AlertItem[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [userName, setUserName] = React.useState('')

    const loadData = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const storedName = await getUserName()
            if (storedName) setUserName(storedName)
            const profile = await UserService.getProfile()
            if (profile?.name) setUserName(profile.name)
        } catch (error) {
            console.error('Error loading dashboard data', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        loadData()
    }, [loadData])

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                userName={userName}
                role="SUPERVISOR"
                variant="home"
                rightElement={<SupervisorHeaderMenu />}
            />

            <ScrollView
                className="flex-1 px-4 pt-4"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={loadData} colors={[BRAND_COLORS.red]} />
                }
            >
                <View className="flex-row justify-between mb-6 -mx-1.5">
                    {kpis.map((kpi, index) => (
                        <DashboardCard
                            key={index}
                            label={kpi.label}
                            value={kpi.value}
                            icon={kpi.icon}
                            color={kpi.color}
                            columns={3}
                        />
                    ))}
                </View>

                <QuickActionsGrid />

                <View className="mb-24">
                    <Text className="text-lg font-bold text-neutral-800 mb-3 px-1">Alertas Recientes</Text>
                    {alerts.length > 0 ? (
                        alerts.map(alert => (
                            <View
                                key={alert.id}
                                className="bg-white p-4 rounded-xl border-l-4 mb-3 shadow-sm border-neutral-200"
                                style={{ borderLeftColor: alert.type === 'critical' ? BRAND_COLORS.red : BRAND_COLORS.gold }}
                            >
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1 mr-2">
                                        <Text className="font-bold text-neutral-800 text-base mb-1">
                                            {alert.type === 'critical' ? 'Atencion Requerida' : 'Advertencia'}
                                        </Text>
                                        <Text className="text-neutral-600 leading-snug text-sm">{alert.message}</Text>
                                    </View>
                                    <Text className="text-xs text-neutral-400 whitespace-nowrap">{alert.timestamp}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="bg-white p-8 rounded-xl border border-neutral-200 items-center justify-center border-dashed">
                            <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
                            <Text className="text-neutral-400 mt-2">No hay alertas activas</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}
