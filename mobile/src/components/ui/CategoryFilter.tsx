import * as React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { BRAND_COLORS } from '../../shared/types'
import { SearchBar } from './SearchBar'

type Category = {
    id: number | string
    name: string
}

type Props = {
    categories: Category[]
    selectedId: number | string | null
    onSelect: (id: number | string) => void
    searchValue?: string
    onSearchChange?: (value: string) => void
    searchPlaceholder?: string
    actionLabel?: string
    onActionPress?: () => void
}

export function CategoryFilter({
    categories,
    selectedId,
    onSelect,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    actionLabel,
    onActionPress,
}: Props) {
    return (
        <View>
            {(onSearchChange || onActionPress) ? (
                <View className="px-5 pt-4">
                    <View className="flex-row items-center">
                        <SearchBar
                            value={searchValue}
                            onChangeText={onSearchChange}
                            onClear={() => onSearchChange?.('')}
                            placeholder={searchPlaceholder || 'Buscar'}
                            style={{ flex: 1 }}
                        />
                        {onActionPress ? (
                            <Pressable
                                onPress={onActionPress}
                                className="ml-2 px-4 py-3 rounded-xl bg-brand-red border border-brand-red items-center justify-center"
                                style={{ minHeight: 52 }}
                            >
                                <Text className="text-xs font-semibold text-white" numberOfLines={1}>
                                    {actionLabel || 'Cliente'}
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>
                </View>
            ) : null}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8 }}
            >
                {categories.map((cat, index) => {
                    const isSelected = selectedId === cat.id
                    return (
                        <Pressable
                            key={cat.id}
                            onPress={() => onSelect(cat.id)}
                            className={`px-4 py-2 rounded-full border ${isSelected ? 'bg-brand-red border-brand-red' : 'bg-white border-neutral-200'}`}
                            style={[
                                isSelected ? { elevation: 2, shadowColor: BRAND_COLORS.red, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 } } : {},
                                index > 0 ? { marginLeft: 10 } : {}
                            ]}
                        >
                            <Text className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-neutral-600'}`}>
                                {cat.name}
                            </Text>
                        </Pressable>
                    )
                })}
            </ScrollView>
        </View>
    )
}
