# Guía de Componentes UI - Cafrisales Mobile

Sistema de componentes profesionales con NativeWind, React Native Reanimated y @expo/vector-icons.

## 🎨 Paleta de Colores

```typescript
// Colores principales (definidos en tailwind.config.js)
red: '#F0412D'       // Color principal (Header, botones primarios)
red700: '#C52C1B'    // Rojo oscuro (hover, estados activos)
gold: '#F4D46A'      // Dorado (botones secundarios)
cream: '#FFF5D9'     // Crema (fondos suaves)
```

## 📦 Importación

```typescript
// Importar todo
import * from '@/components/ui'

// O importar específicos
import { Button, Text, Header } from '@/components/ui'
```

---

## 🧱 ATOMS (Componentes Básicos)

### Button
Botón con animaciones y múltiples variantes.

```tsx
import { Button } from '@/components/ui'

<Button variant="primary" onPress={() => {}}>
  Confirmar
</Button>

<Button
  variant="secondary"
  size="lg"
  icon={<Ionicons name="cart" size={18} color="#374151" />}
  loading={isLoading}
  loadingText="Procesando..."
>
  Agregar al Carrito
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `icon`: ReactNode
- `iconPosition`: 'left' | 'right'
- `fullWidth`: boolean

---

### IconButton
Botón circular solo con icono.

```tsx
import { IconButton } from '@/components/ui'

<IconButton
  icon={<Ionicons name="notifications" size={20} color="#F0412D" />}
  variant="primary"
  onPress={() => {}}
/>
```

---

### Text
Componente de texto con variantes tipográficas.

```tsx
import { Text } from '@/components/ui'

<Text variant="h1" weight="bold">Título Principal</Text>
<Text variant="body" color="text-neutral-600">Descripción normal</Text>
<Text variant="caption">Texto pequeño</Text>
<Text variant="label">ETIQUETA</Text>
```

**Variantes disponibles:**
- `h1`, `h2`, `h3`, `h4` - Encabezados
- `title`, `subtitle` - Títulos
- `body`, `bodyLarge`, `bodySmall` - Cuerpo
- `caption` - Texto pequeño
- `label`, `overline` - Etiquetas

---

### TextInput, PasswordInput, SearchInput
Inputs con animaciones y estados.

```tsx
import { TextInput, PasswordInput, SearchInput } from '@/components/ui'

<TextInput
  label="Email"
  placeholder="tu@email.com"
  error={errors.email}
  leftIcon={<Ionicons name="mail-outline" size={20} color="#9CA3AF" />}
/>

<PasswordInput
  label="Contraseña"
  placeholder="••••••••"
/>

<SearchInput
  placeholder="Buscar productos..."
  value={searchQuery}
  onChangeText={setSearchQuery}
  onClear={() => setSearchQuery('')}
/>
```

---

### Badge
Insignias para estados.

```tsx
import { Badge } from '@/components/ui'

<Badge variant="primary">Nuevo</Badge>
<Badge variant="success">Aprobado</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="danger">Rechazado</Badge>
```

---

### Avatar
Avatar de usuario con iniciales o imagen.

```tsx
import { Avatar } from '@/components/ui'

<Avatar name="Juan Pérez" size="md" />
<Avatar source={{ uri: 'https://...' }} size="lg" />
```

---

### Chip
Chips para filtros y selección.

```tsx
import { Chip } from '@/components/ui'

<Chip
  variant="outlined"
  selected={selectedCategory === 'bebidas'}
  onPress={() => setSelectedCategory('bebidas')}
>
  Bebidas
</Chip>
```

---

### Skeleton
Loading placeholders animados.

```tsx
import { Skeleton, SkeletonCard } from '@/components/ui'

<Skeleton variant="line" width="80%" />
<Skeleton variant="circle" width={48} height={48} />
<SkeletonCard /> // Card completa con skeleton
```

---

### Divider, Spacer
Separadores y espaciado.

```tsx
import { Divider, Spacer } from '@/components/ui'

<Divider />
<Divider label="O continúa con" />
<Spacer size="lg" />
```

---

## 📝 FORMS (Formularios)

### Checkbox

```tsx
import { Checkbox } from '@/components/ui'

<Checkbox
  checked={accepted}
  onChange={setAccepted}
  label="Acepto términos y condiciones"
/>
```

---

### RadioGroup

```tsx
import { RadioGroup } from '@/components/ui'

<RadioGroup
  options={[
    { label: 'Efectivo', value: 'cash' },
    { label: 'Tarjeta', value: 'card' },
    { label: 'Transferencia', value: 'transfer' }
  ]}
  value={paymentMethod}
  onChange={setPaymentMethod}
  label="Método de pago"
/>
```

---

### Switch

```tsx
import { Switch } from '@/components/ui'

<Switch
  value={notifications}
  onChange={setNotifications}
  label="Notificaciones"
/>
```

---

### Stepper

```tsx
import { Stepper } from '@/components/ui'

<Stepper
  value={quantity}
  onChange={setQuantity}
  min={1}
  max={99}
  label="Cantidad"
/>
```

---

### FormField
Wrapper para formularios con label y error.

```tsx
import { FormField, TextInput } from '@/components/ui'

<FormField
  label="Nombre completo"
  error={errors.name}
  required
>
  <TextInput placeholder="Ingresa tu nombre" />
</FormField>
```

---

## 🏗️ LAYOUT (Estructura)

### ScreenLayout
Layout base con SafeArea.

```tsx
import { ScreenLayout } from '@/components/ui'

<ScreenLayout variant="default">
  {/* Contenido con padding horizontal */}
</ScreenLayout>

<ScreenLayout variant="withTabs">
  {/* Incluye espacio para TabBar */}
</ScreenLayout>

<ScreenLayout variant="fullScreen" noPadding>
  {/* Sin safe area ni padding */}
</ScreenLayout>
```

---

### ScrollScreen
ScrollView con SafeArea y pull-to-refresh.

```tsx
import { ScrollScreen } from '@/components/ui'

<ScrollScreen
  variant="withTabs"
  onRefresh={handleRefresh}
  refreshing={isRefreshing}
>
  {/* Contenido scrolleable */}
</ScrollScreen>
```

---

### KeyboardShift
Evita que el teclado tape inputs.

```tsx
import { KeyboardShift } from '@/components/ui'

<KeyboardShift>
  <TextInput label="Email" />
  <TextInput label="Contraseña" />
</KeyboardShift>
```

---

### Card
Tarjetas con variantes y animación al presionar.

```tsx
import { Card } from '@/components/ui'

<Card variant="elevated">
  <Text variant="title">Pedido #1234</Text>
</Card>

<Card variant="outlined" onPress={() => navigate('Details')}>
  {/* Card clickeable */}
</Card>
```

---

### Stack, HStack, VStack
Layouts flexibles con gap.

```tsx
import { VStack, HStack } from '@/components/ui'

<VStack gap="md">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</VStack>

<HStack gap="sm" align="center" justify="between">
  <Text>Left</Text>
  <Text>Right</Text>
</HStack>
```

---

### StickyFooter
Barra inferior fija con SafeArea.

```tsx
import { StickyFooter, Button } from '@/components/ui'

<StickyFooter>
  <Button fullWidth>Confirmar Pedido</Button>
</StickyFooter>
```

---

## 🎯 NAVIGATION

### Header
Header rojo principal (SE USA EN TODAS LAS PANTALLAS).

```tsx
import { Header } from '@/components/ui'

<Header
  title="Mis Pedidos"
  showBackButton
  onBackPress={() => navigation.goBack()}
/>

<Header
  title="Catálogo"
  subtitle="200 productos"
  variant="large"
  rightAction={
    <IconButton
      icon={<Ionicons name="cart" size={24} color="#FFF" />}
      onPress={() => {}}
    />
  }
/>
```

---

## 💬 FEEDBACK (Notificaciones y Estados)

### EmptyState

```tsx
import { EmptyState } from '@/components/ui'

<EmptyState
  icon="cart-outline"
  title="Carrito vacío"
  description="Agrega productos para continuar"
  actionLabel="Ver Catálogo"
  onAction={() => navigate('Catalog')}
/>
```

---

### ErrorState

```tsx
import { ErrorState } from '@/components/ui'

<ErrorState
  title="Error al cargar pedidos"
  message="No pudimos cargar tus pedidos. Verifica tu conexión."
  onRetry={refetch}
/>
```

---

### FullScreenLoader

```tsx
import { FullScreenLoader } from '@/components/ui'

<FullScreenLoader visible={isLoading} text="Procesando pedido..." />
```

---

### OfflineBanner

```tsx
import { OfflineBanner } from '@/components/ui'

<OfflineBanner visible={!isOnline} />
```

---

### AlertDialog

```tsx
import { AlertDialog } from '@/components/ui'

<AlertDialog
  visible={showAlert}
  onClose={() => setShowAlert(false)}
  title="Cancelar Pedido"
  description="¿Estás seguro de cancelar este pedido?"
  variant="danger"
  confirmLabel="Sí, cancelar"
  cancelLabel="No"
  onConfirm={handleCancelOrder}
/>
```

---

### Modal

```tsx
import { Modal } from '@/components/ui'

<Modal
  visible={showModal}
  onClose={() => setShowModal(false)}
  title="Detalles del Producto"
  size="lg"
>
  <VStack gap="md">
    <Text>Contenido del modal</Text>
  </VStack>
</Modal>
```

---

## 📊 DATA (Presentación de Datos)

### ListItem

```tsx
import { ListItem } from '@/components/ui'

<ListItem
  title="Pedido #1234"
  subtitle="Zona Norte - 12 productos"
  description="Entrega programada para mañana"
  leftIcon={<Ionicons name="receipt-outline" size={24} color="#F0412D" />}
  showChevron
  onPress={() => navigate('OrderDetails')}
/>
```

---

### KeyValueRow

```tsx
import { KeyValueRow } from '@/components/ui'

<KeyValueRow
  label="Total"
  value="$1,250.00"
  icon={<Ionicons name="cash-outline" size={20} color="#9CA3AF" />}
/>
```

---

### Timeline

```tsx
import { Timeline } from '@/components/ui'

<Timeline
  items={[
    {
      id: '1',
      title: 'Pedido creado',
      timestamp: '10:30 AM',
      isCompleted: true
    },
    {
      id: '2',
      title: 'En bodega',
      subtitle: 'Revisando disponibilidad',
      isActive: true
    },
    { id: '3', title: 'En ruta' },
    { id: '4', title: 'Entregado' }
  ]}
/>
```

---

## 🎨 EJEMPLO COMPLETO: Pantalla de Pedidos

```tsx
import React from 'react'
import {
  ScrollScreen, Header, Card, ListItem, Badge,
  EmptyState, ErrorState, SkeletonCard
} from '@/components/ui'

export function OrdersScreen() {
  const { data, isLoading, error, refetch } = useOrders()

  return (
    <>
      <Header
        title="Mis Pedidos"
        subtitle={`${data?.length || 0} pedidos`}
        showBackButton
      />

      <ScrollScreen
        variant="withTabs"
        onRefresh={refetch}
        refreshing={isLoading}
      >
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : data?.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No tienes pedidos"
            actionLabel="Crear Pedido"
            onAction={() => navigate('NewOrder')}
          />
        ) : (
          data?.map((order) => (
            <Card key={order.id} variant="elevated" className="mb-3">
              <ListItem
                title={`Pedido #${order.id}`}
                subtitle={order.zone}
                rightAccessory={
                  <Badge variant={order.status === 'delivered' ? 'success' : 'warning'}>
                    {order.statusLabel}
                  </Badge>
                }
                onPress={() => navigate('OrderDetails', { id: order.id })}
              />
            </Card>
          ))
        )}
      </ScrollScreen>
    </>
  )
}
```

---

## 🚀 Tips de Uso

1. **Header Rojo**: Usa `<Header />` en TODAS las pantallas con `bg-red`
2. **SafeArea**: Usa `ScreenLayout` o `ScrollScreen` para manejar safe areas automáticamente
3. **TabBar**: Usa `variant="withTabs"` en screens con bottom tabs
4. **Animaciones**: Todos los componentes interactivos tienen animaciones con Reanimated
5. **Iconos**: Usa `@expo/vector-icons` con Ionicons
6. **Colores**: Usa las clases de Tailwind: `bg-red`, `text-red700`, `bg-gold`, `bg-cream`

---

## 📱 Librerías Usadas

- **NativeWind**: Tailwind CSS para React Native
- **React Native Reanimated**: Animaciones fluidas
- **@expo/vector-icons**: Iconos (Ionicons)
- **react-native-safe-area-context**: Safe areas

---

¡Todos los componentes están listos para usar! 🎉
