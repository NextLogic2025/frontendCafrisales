import React, { useDeferredValue } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { jwtDecode } from 'jwt-decode'
import { Header } from '../../../../components/ui/Header'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { BRAND_COLORS } from '../../../../shared/types'
import { getValidToken } from '../../../../services/auth/authClient'
import { UserClient, UserClientService } from '../../../../services/api/UserClientService'

export function SellerClientsScreen() {
  const navigation = useNavigation<any>()
  const [clients, setClients] = React.useState<UserClient[]>([])
  const [loading, setLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  // useDeferredValue para búsqueda sin bloquear UI
  const deferredSearch = useDeferredValue(searchQuery.trim().toLowerCase())

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const token = await getValidToken()
      if (!token) {
        setClients([])
        return
      }
      const decoded = jwtDecode<{ sub?: string; userId?: string }>(token)
      const vendedorId = decoded.sub || decoded.userId
      if (!vendedorId) {
        setClients([])
        return
      }
      const data = await UserClientService.getClientsByVendedor(vendedorId)
      setClients(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchData()
    }, [fetchData]),
  )

  const filteredClients = React.useMemo(() => {
    if (!deferredSearch) return clients
    return clients.filter((client) => {
      const fullName = [client.nombres, client.apellidos].filter(Boolean).join(' ')
      return (
        client.nombre_comercial.toLowerCase().includes(deferredSearch) ||
        fullName.toLowerCase().includes(deferredSearch) ||
        (client.ruc || '').toLowerCase().includes(deferredSearch) ||
        (client.email || '').toLowerCase().includes(deferredSearch)
      )
    })
  }, [clients, deferredSearch])

  const renderItem = ({ item }: { item: UserClient }) => {
    const contactName = [item.nombres, item.apellidos].filter(Boolean).join(' ').trim()
    const isInactive = item.estado === 'inactivo'

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('SellerClientDetail', { client: item })}
        style={[styles.card, isInactive && styles.cardDisabled]}
      >
        <View style={[styles.accent, isInactive && styles.accentDisabled]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, isInactive && styles.avatarDisabled]}>
                <Ionicons name="business" size={22} color={isInactive ? '#9CA3AF' : BRAND_COLORS.red} />
              </View>
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.clientName, isInactive && styles.textDisabled]} numberOfLines={1}>
                {item.nombre_comercial}
              </Text>
              <Text style={styles.clientMeta} numberOfLines={1}>
                {contactName || item.email || 'Sin contacto'}
              </Text>
              <View style={styles.idRow}>
                <Ionicons name="card-outline" size={12} color="#9CA3AF" />
                <Text style={styles.clientId}>{item.ruc || 'Sin RUC'}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, isInactive ? styles.statusBadgeBlocked : styles.statusBadgeActive]}>
              <View style={[styles.statusDot, isInactive ? styles.statusDotBlocked : styles.statusDotActive]} />
              <Text style={[styles.statusText, isInactive ? styles.statusTextBlocked : styles.statusTextActive]}>
                {isInactive ? 'Inactivo' : 'Activo'}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.badgeBlue]}>
              <Ionicons name="pricetag" size={13} color="#2563EB" />
              <Text style={[styles.badgeText, styles.badgeTextBlue]}>
                Canal: {item.canal_nombre || item.canal_codigo || 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Clientes" variant="standard" rightElement={<SellerHeaderMenu />} />

      <View className="px-5 py-4 bg-white shadow-sm z-10">
        <View className="mb-3">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar cliente..."
            onClear={() => setSearchQuery('')}
          />
        </View>
      </View>

      <View className="flex-1 px-5 mt-2">
        {loading && clients.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={BRAND_COLORS.red} />
          </View>
        ) : (
          <FlatList
            data={filteredClients}
            keyExtractor={(item) => item.usuario_id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={BRAND_COLORS.red} />}
            ListEmptyComponent={
              <View className="items-center justify-center py-10">
                <View className="p-4 rounded-full mb-4 bg-red-50">
                  <Ionicons name="people-outline" size={40} color={BRAND_COLORS.red} />
                </View>
                <Text className="text-lg font-bold text-neutral-900 mb-2">Sin Clientes</Text>
                <Text className="text-neutral-500 text-sm text-center">
                  No se encontraron clientes con los filtros seleccionados.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
  },
  cardDisabled: {
    opacity: 0.7,
    backgroundColor: '#FAFAFA',
  },
  accent: {
    width: 5,
    backgroundColor: BRAND_COLORS.red,
  },
  accentDisabled: {
    backgroundColor: '#D1D5DB',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDisabled: {
    backgroundColor: '#F3F4F6',
  },
  headerInfo: {
    flex: 1,
    marginRight: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  textDisabled: {
    color: '#6B7280',
  },
  clientMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientId: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusBadgeActive: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeBlocked: {
    backgroundColor: '#FEF2F2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotBlocked: {
    backgroundColor: BRAND_COLORS.red,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#059669',
  },
  statusTextBlocked: {
    color: BRAND_COLORS.red,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  badgeBlue: {
    backgroundColor: '#EFF6FF',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
  },
  badgeTextBlue: {
    color: '#1D4ED8',
  },
})
