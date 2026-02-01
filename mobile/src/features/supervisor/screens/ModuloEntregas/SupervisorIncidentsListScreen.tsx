import React from 'react'
import { View, Text, Pressable, StyleSheet, RefreshControl, ScrollView, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'

import { Header } from '../../../../components/ui/Header'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { FeedbackModal } from '../../../../components/ui/FeedbackModal'
import { TextField } from '../../../../components/ui/TextField'
import { BRAND_COLORS } from '../../../../shared/types'
import { DeliveryIncident, DeliveryService } from '../../../../services/api/DeliveryService'
import { showGlobalToast } from '../../../../utils/toastService'

type SeverityFilter = 'todas' | 'critica' | 'alta' | 'media' | 'baja'

const formatLabel = (value?: string | null) => {
    if (!value) return ''
    return value.replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
}

const severityBadge = (severidad: string) => {
    switch (severidad) {
        case 'critica':
            return { bg: '#FEE2E2', text: '#991B1B', label: 'Critica', icon: 'warning' }
        case 'alta':
            return { bg: '#FEF3C7', text: '#92400E', label: 'Alta', icon: 'alert-circle' }
        case 'media':
            return { bg: '#E0E7FF', text: '#4338CA', label: 'Media', icon: 'information-circle' }
        case 'baja':
            return { bg: '#E5E7EB', text: '#4B5563', label: 'Baja', icon: 'help-circle' }
        default:
            return { bg: '#E5E7EB', text: '#4B5563', label: severidad, icon: 'help-circle-outline' }
    }
}

export function SupervisorIncidentsListScreen() {
    const navigation = useNavigation<any>()
    const [incidents, setIncidents] = React.useState<DeliveryIncident[]>([])
    const [loading, setLoading] = React.useState(false)
    const [severityFilter, setSeverityFilter] = React.useState<SeverityFilter>('todas')
    const [showPendingOnly, setShowPendingOnly] = React.useState(true)

    // Resolve modal
    const [selectedIncident, setSelectedIncident] = React.useState<DeliveryIncident | null>(null)
    const [showResolveModal, setShowResolveModal] = React.useState(false)
    const [resolucion, setResolucion] = React.useState('')
    const [resolving, setResolving] = React.useState(false)

    const fetchIncidents = React.useCallback(async () => {
        setLoading(true)
        try {
            const deliveriesForScan = await DeliveryService.getDeliveries({ page: 1, limit: 200 })
            const incidentLists = await Promise.all(
                deliveriesForScan.map(async (delivery) => {
                    const items = await DeliveryService.getIncidents({ deliveryId: delivery.id })
                    return items ?? []
                }),
            )

            let allIncidents = incidentLists.flat()
            if (showPendingOnly) {
                allIncidents = allIncidents.filter((i) => !i.resuelto_en)
            }
            if (severityFilter !== 'todas') {
                allIncidents = allIncidents.filter((i) => i.severidad === severityFilter)
            }

            setIncidents(allIncidents)
        } finally {
            setLoading(false)
        }
    }, [showPendingOnly, severityFilter])

    useFocusEffect(
        React.useCallback(() => {
            fetchIncidents()
        }, [fetchIncidents]),
    )

    const handleResolve = async () => {
        if (!selectedIncident || !resolucion.trim()) return
        setResolving(true)
        try {
            const deliveryId = selectedIncident.entrega_id
            if (!deliveryId) {
                showGlobalToast('No se pudo resolver la incidencia', 'error')
                return
            }
            const updated = await DeliveryService.resolveIncident(deliveryId, selectedIncident.id, resolucion.trim())
            if (!updated) {
                showGlobalToast('No se pudo resolver la incidencia', 'error')
                return
            }
            setIncidents((prev) =>
                prev.map((i) => (i.id === selectedIncident.id ? { ...i, ...updated } : i)),
            )
            setShowResolveModal(false)
            setSelectedIncident(null)
            setResolucion('')
            showGlobalToast('Incidencia resuelta', 'success')
        } finally {
            setResolving(false)
        }
    }

    const openResolveModal = (incident: DeliveryIncident) => {
        setSelectedIncident(incident)
        setResolucion('')
        setShowResolveModal(true)
    }

    // KPIs
    const kpis = React.useMemo(() => {
        const pendientes = incidents.filter(i => !i.resuelto_en).length
        const criticas = incidents.filter(i => i.severidad === 'critica' && !i.resuelto_en).length
        const altas = incidents.filter(i => i.severidad === 'alta' && !i.resuelto_en).length
        return { pendientes, criticas, altas }
    }, [incidents])

    const severityOptions = [
        { id: 'todas', name: 'Todas' },
        { id: 'critica', name: 'Criticas' },
        { id: 'alta', name: 'Altas' },
        { id: 'media', name: 'Medias' },
        { id: 'baja', name: 'Bajas' },
    ]

    return (
        <View className="flex-1 bg-neutral-50">
            <Header title="Incidencias" variant="standard" onBackPress={() => navigation.goBack()} />

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchIncidents} colors={[BRAND_COLORS.red]} />}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Alert Banner */}
                {kpis.criticas > 0 && (
                    <View className="mx-4 mt-4 p-4 rounded-2xl bg-red-50 border border-red-200">
                        <View className="flex-row items-center">
                            <Ionicons name="warning" size={24} color="#991B1B" />
                            <Text className="ml-2 text-base font-bold text-red-800">
                                {kpis.criticas} incidencia(s) critica(s) pendiente(s)
                            </Text>
                        </View>
                    </View>
                )}

                {/* Toggle */}
                <View className="px-4 mt-4">
                    <Pressable
                        onPress={() => setShowPendingOnly(!showPendingOnly)}
                        className="flex-row items-center"
                    >
                        <View
                            className={`w-5 h-5 rounded border mr-2 items-center justify-center ${showPendingOnly ? 'bg-red-600 border-red-600' : 'border-neutral-300'
                                }`}
                        >
                            {showPendingOnly && <Ionicons name="checkmark" size={14} color="white" />}
                        </View>
                        <Text className="text-sm text-neutral-700">Solo pendientes</Text>
                    </Pressable>
                </View>

                {/* Filter */}
                <View className="px-4 py-3">
                    <CategoryFilter
                        categories={severityOptions}
                        selectedId={severityFilter}
                        onSelect={(value) => setSeverityFilter(value as SeverityFilter)}
                    />
                </View>

                {/* List */}
                <View className="px-4">
                    {incidents.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center border border-neutral-200">
                            <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
                            <Text className="text-neutral-500 mt-2">No hay incidencias</Text>
                        </View>
                    ) : (
                        incidents.map((incident) => {
                            const badge = severityBadge(incident.severidad)
                            const isPending = !incident.resuelto_en
                            return (
                                <View
                                    key={incident.id}
                                    className="bg-white rounded-2xl border border-neutral-200 px-4 py-4 mb-3"
                                    style={styles.card}
                                >
                                    <View style={styles.cardRow}>
                                        <View style={[styles.iconWrap, { backgroundColor: badge.bg }]}>
                                            <Ionicons name={badge.icon as any} size={20} color={badge.text} />
                                        </View>
                                        <View style={styles.cardContent}>
                                            <Text style={styles.title}>{formatLabel(incident.tipo_incidencia)}</Text>
                                            <Text style={styles.subtitle} numberOfLines={2}>
                                                {incident.descripcion}
                                            </Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                                            <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                                        </View>
                                    </View>

                                    <View className="mt-3 pt-3 border-t border-neutral-100 flex-row items-center justify-between">
                                        <Text className="text-xs text-neutral-500">
                                            {incident.reportado_en
                                                ? new Date(incident.reportado_en).toLocaleDateString()
                                                : '---'}
                                        </Text>
                                        {isPending ? (
                                            <Pressable
                                                onPress={() => openResolveModal(incident)}
                                                className="flex-row items-center px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200"
                                            >
                                                <Ionicons name="checkmark-circle-outline" size={14} color="#059669" />
                                                <Text className="ml-1 text-xs font-semibold text-emerald-700">Resolver</Text>
                                            </Pressable>
                                        ) : (
                                            <View className="flex-row items-center px-3 py-1.5 rounded-full bg-neutral-100">
                                                <Ionicons name="checkmark" size={14} color="#6B7280" />
                                                <Text className="ml-1 text-xs font-semibold text-neutral-500">Resuelta</Text>
                                            </View>
                                        )}
                                    </View>

                                    {incident.resolucion && (
                                        <View className="mt-2 p-3 rounded-xl bg-emerald-50">
                                            <Text className="text-xs font-semibold text-emerald-700">Resolucion:</Text>
                                            <Text className="text-sm text-emerald-800 mt-1">{incident.resolucion}</Text>
                                        </View>
                                    )}
                                </View>
                            )
                        })
                    )}
                </View>
            </ScrollView>

            {/* Resolve Modal */}
            <FeedbackModal
                visible={showResolveModal}
                type="success"
                title="Resolver Incidencia"
                message={`Como se resolvio "${formatLabel(selectedIncident?.tipo_incidencia)}"?`}
                onClose={() => setShowResolveModal(false)}
                showCancel
                cancelText="Cancelar"
                confirmText={resolving ? 'Guardando...' : 'Confirmar resolucion'}
                onConfirm={handleResolve}
            >
                <View className="w-full mb-4">
                    <TextField
                        label="Descripcion de la resolucion"
                        value={resolucion}
                        onChangeText={setResolucion}
                        placeholder="Ingresa como se resolvio la incidencia..."
                    />
                </View>
            </FeedbackModal>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
        marginRight: 10,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
        lineHeight: 16,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
})
