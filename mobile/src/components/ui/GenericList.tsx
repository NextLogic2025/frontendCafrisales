import { BRAND_COLORS } from '../../services/shared/types'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { View, Text, FlatList, RefreshControl, ListRenderItemInfo } from 'react-native'

export interface EmptyStateConfig {
    icon: keyof typeof Ionicons.glyphMap
    title: string
    message: string
}

export interface GenericListProps<T> {
    items: T[]
    isLoading: boolean
    onRefresh: () => void
    renderItem: (item: T) => React.ReactNode
    keyExtractor?: (item: T, index: number) => string
    emptyState: EmptyStateConfig
}

/**
 * Generic List Component
 * Reusable virtualized list view with loading, empty states, and refresh functionality.
 * Uses FlatList for performance optimization (virtualization).
 */
export function GenericList<T>({
    items,
    isLoading,
    onRefresh,
    renderItem,
    keyExtractor,
    emptyState
}: GenericListProps<T>) {
    const renderFlatListItem = React.useCallback(
        ({ item }: ListRenderItemInfo<T>) => <>{renderItem(item)}</>,
        [renderItem]
    )

    const defaultKeyExtractor = React.useCallback(
        (_item: T, index: number) => index.toString(),
        []
    )

    if (isLoading && items.length === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-neutral-50">
                <Ionicons
                    name="hourglass-outline"
                    size={48}
                    color={BRAND_COLORS.red}
                    style={{ opacity: 0.5 }}
                />
            </View>
        )
    }

    if (items.length === 0) {
        return (
            <FlatList
                data={[]}
                renderItem={null}
                className="flex-1 bg-neutral-50"
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={onRefresh}
                        tintColor={BRAND_COLORS.red}
                    />
                }
                ListEmptyComponent={
                    <View className="items-center">
                        <View className="p-4 rounded-full mb-4" style={{ backgroundColor: `${BRAND_COLORS.red}15` }}>
                            <Ionicons
                                name={emptyState.icon}
                                size={40}
                                color={BRAND_COLORS.red}
                            />
                        </View>
                        <Text className="text-lg font-bold text-neutral-900 text-center mb-2">
                            {emptyState.title}
                        </Text>
                        <Text className="text-center text-neutral-500 text-sm">
                            {emptyState.message}
                        </Text>
                    </View>
                }
            />
        )
    }

    return (
        <FlatList
            data={items}
            renderItem={renderFlatListItem}
            keyExtractor={keyExtractor ?? defaultKeyExtractor}
            className="flex-1 bg-neutral-50 px-5 pt-5"
            refreshControl={
                <RefreshControl
                    refreshing={isLoading}
                    onRefresh={onRefresh}
                    tintColor={BRAND_COLORS.red}
                />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
            // Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={10}
        />
    )
}
