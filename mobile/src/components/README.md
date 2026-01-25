# Sistema de Componentes UI - Cafrisales Mobile

Sistema completo de componentes profesionales con NativeWind, React Native Reanimated y @expo/vector-icons.

## 📁 Estructura del Proyecto

```
components/
├── ui/                          # Componentes reutilizables (UI Kit)
│   ├── atoms/                   # Componentes básicos
│   │   ├── Button/              ✅ Button, IconButton
│   │   ├── Text/                ✅ Text (12 variantes tipográficas)
│   │   ├── Input/               ✅ TextInput, PasswordInput, SearchInput
│   │   ├── Badge/               ✅ Badge (7 variantes de color)
│   │   ├── Avatar/              ✅ Avatar (con imagen o iniciales)
│   │   ├── Spinner/             ✅ Spinner
│   │   ├── Skeleton/            ✅ Skeleton, SkeletonCard
│   │   ├── Chip/                ✅ Chip (para filtros)
│   │   ├── Divider/             ✅ Divider (horizontal/vertical)
│   │   ├── Spacer/              ✅ Spacer
│   │   └── index.ts
│   │
│   ├── forms/                   # Controles de formulario
│   │   ├── Checkbox/            ✅ Checkbox
│   │   ├── RadioGroup/          ✅ RadioGroup
│   │   ├── Switch/              ✅ Switch
│   │   ├── Stepper/             ✅ Stepper (contador +/-)
│   │   ├── Select/              ✅ Select (dropdown)
│   │   ├── DatePicker/          ✅ DatePicker
│   │   ├── FormField/           ✅ FormField (wrapper)
│   │   └── index.ts
│   │
│   ├── layout/                  # Estructura y contenedores
│   │   ├── ScreenLayout/        ✅ ScreenLayout (SafeArea)
│   │   ├── ScrollScreen/        ✅ ScrollScreen (con pull-to-refresh)
│   │   ├── KeyboardShift/       ✅ KeyboardShift
│   │   ├── Card/                ✅ Card (3 variantes)
│   │   ├── Stack/               ✅ Stack, HStack, VStack
│   │   ├── StickyFooter/        ✅ StickyFooter
│   │   └── index.ts
│   │
│   ├── navigation/              # Navegación
│   │   ├── Header/              ✅ Header (ROJO - para todas las pantallas)
│   │   └── index.ts
│   │
│   ├── feedback/                # Overlays y notificaciones
│   │   ├── EmptyState/          ✅ EmptyState
│   │   ├── ErrorState/          ✅ ErrorState
│   │   ├── FullScreenLoader/    ✅ FullScreenLoader
│   │   ├── OfflineBanner/       ✅ OfflineBanner
│   │   ├── AlertDialog/         ✅ AlertDialog
│   │   ├── Modal/               ✅ Modal
│   │   └── index.ts
│   │
│   ├── data/                    # Presentación de datos
│   │   ├── ListItem/            ✅ ListItem
│   │   ├── KeyValueRow/         ✅ KeyValueRow
│   │   ├── Timeline/            ✅ Timeline
│   │   └── index.ts
│   │
│   └── index.ts                 # Barrel export principal
│
├── domain/                      # Componentes de negocio
│   └── auth/
│       ├── RoleGate/            ✅ RoleGate (renderizado condicional por rol)
│       └── index.ts
│
├── COMPONENTS_GUIDE.md          # Guía completa de todos los componentes
├── PROFILE_GUIDE.md             # Guía del ProfileScreen multi-rol
└── README.md                    # Este archivo
```

## 🎨 Paleta de Colores

```typescript
red: '#F0412D'       // Principal (Header, botones primarios)
red700: '#C52C1B'    // Rojo oscuro (hover, estados activos)
gold: '#F4D46A'      // Dorado (botones secundarios)
cream: '#FFF5D9'     // Crema (fondos suaves)
```

## 🚀 Instalación de Dependencias

Si usas el DatePicker, instala:

```bash
npm install @react-native-community/datetimepicker
```

o con Expo:

```bash
npx expo install @react-native-community/datetimepicker
```

## 📖 Guías Disponibles

### 1. [COMPONENTS_GUIDE.md](./COMPONENTS_GUIDE.md)
Guía completa de TODOS los componentes UI con ejemplos de uso.

### 2. [PROFILE_GUIDE.md](./PROFILE_GUIDE.md)
Guía del ProfileScreen multi-rol para los 5 roles del sistema.

## 💡 Quick Start

### Importar componentes

```typescript
// Importar todo
import * as UI from '@/components/ui'

// O importar específicos
import { Button, Text, Header, Card } from '@/components/ui'
```

### Ejemplo básico

```tsx
import React from 'react'
import {
  ScrollScreen,
  Header,
  Card,
  Button,
  Text,
  VStack,
} from '@/components/ui'

export function MyScreen() {
  return (
    <>
      <Header title="Mi Pantalla" showBackButton />

      <ScrollScreen variant="withTabs">
        <VStack gap="md">
          <Card variant="elevated">
            <Text variant="h3" weight="bold">
              Título
            </Text>
            <Text variant="body" color="text-neutral-600">
              Descripción
            </Text>
          </Card>

          <Button variant="primary" onPress={() => {}}>
            Confirmar
          </Button>
        </VStack>
      </ScrollScreen>
    </>
  )
}
```

## 🎯 Componentes Más Usados

### 1. Header (Rojo - obligatorio en todas las pantallas)

```tsx
<Header
  title="Mis Pedidos"
  subtitle="200 pedidos"
  showBackButton
  onBackPress={() => navigation.goBack()}
  rightAction={
    <IconButton icon={<Ionicons name="cart" size={24} color="#FFF" />} />
  }
/>
```

### 2. Button con animación

```tsx
<Button
  variant="primary"
  size="lg"
  loading={isLoading}
  icon={<Ionicons name="checkmark" size={18} color="#FFF" />}
  onPress={handleSubmit}
>
  Confirmar
</Button>
```

### 3. Card con contenido

```tsx
<Card variant="elevated" onPress={() => navigate('Details')}>
  <VStack gap="sm">
    <Text variant="title">Pedido #1234</Text>
    <Text variant="body" color="text-neutral-600">
      Descripción del pedido
    </Text>
    <Badge variant="success">Entregado</Badge>
  </VStack>
</Card>
```

### 4. Form con validación

```tsx
<VStack gap="md">
  <FormField label="Email" error={errors.email} required>
    <TextInput
      placeholder="tu@email.com"
      value={email}
      onChangeText={setEmail}
      leftIcon={<Ionicons name="mail-outline" size={20} />}
    />
  </FormField>

  <PasswordInput
    label="Contraseña"
    value={password}
    onChangeText={setPassword}
  />

  <Button variant="primary" fullWidth onPress={handleLogin}>
    Iniciar Sesión
  </Button>
</VStack>
```

### 5. Empty State

```tsx
<EmptyState
  icon="cart-outline"
  title="Carrito vacío"
  description="Agrega productos para continuar"
  actionLabel="Ver Catálogo"
  onAction={() => navigate('Catalog')}
/>
```

### 6. ProfileScreen (Multi-rol)

```tsx
import { ProfileScreen } from '@/features/shared'

<ProfileScreen
  user={{
    id: '123',
    nombre: 'Juan Pérez',
    email: 'juan@cafrisales.com',
    rol: 'VENDEDOR',
  }}
  onLogout={handleLogout}
  onNavigate={handleNavigate}
/>
```

## ✨ Características Principales

- ✅ **50+ componentes profesionales**
- ✅ **Animaciones fluidas** con React Native Reanimated
- ✅ **NativeWind** (Tailwind CSS para React Native)
- ✅ **TypeScript** completo con tipos inferidos
- ✅ **Safe Area** manejada automáticamente
- ✅ **Iconos** con @expo/vector-icons (Ionicons)
- ✅ **Paleta de colores** consistente
- ✅ **Accesibilidad** y UX optimizada
- ✅ **Documentación completa**

## 📱 Layouts Base

### ScreenLayout

Para pantallas estáticas con SafeArea.

```tsx
<ScreenLayout variant="withTabs" backgroundColor="bg-cream">
  {/* Contenido */}
</ScreenLayout>
```

### ScrollScreen

Para pantallas con scroll y pull-to-refresh.

```tsx
<ScrollScreen
  variant="withTabs"
  onRefresh={refetch}
  refreshing={isLoading}
>
  {/* Contenido scrolleable */}
</ScrollScreen>
```

### KeyboardShift

Para formularios que evitan el teclado.

```tsx
<KeyboardShift>
  <TextInput label="Email" />
  <TextInput label="Contraseña" />
</KeyboardShift>
```

## 🎨 Variantes de Componentes

### Button

- `primary` - Rojo (#F0412D)
- `secondary` - Dorado (#F4D46A)
- `ghost` - Transparente con borde
- `danger` - Rojo para acciones destructivas
- `success` - Verde para confirmaciones

### Badge

- `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `default`

### Card

- `elevated` - Con sombra
- `outlined` - Con borde
- `filled` - Con fondo gris

### Text

- `h1`, `h2`, `h3`, `h4` - Encabezados
- `title`, `subtitle` - Títulos
- `body`, `bodyLarge`, `bodySmall` - Cuerpo
- `caption` - Pequeño
- `label`, `overline` - Etiquetas

## 🔐 Control de Acceso por Rol

Usa `RoleGate` para mostrar contenido según el rol:

```tsx
import { RoleGate } from '@/components/domain/auth'

<RoleGate allowedRoles={['SUPERVISOR', 'VENDEDOR']} currentRole={user.rol}>
  <Card>
    <Text>Solo visible para Supervisor y Vendedor</Text>
  </Card>
</RoleGate>
```

## 🧪 Testing

Todos los componentes están preparados para testing con React Native Testing Library:

```tsx
import { render, fireEvent } from '@testing-library/react-native'
import { Button } from '@/components/ui'

test('button triggers onPress', () => {
  const onPress = jest.fn()
  const { getByText } = render(<Button onPress={onPress}>Click me</Button>)

  fireEvent.press(getByText('Click me'))
  expect(onPress).toHaveBeenCalled()
})
```

## 📚 Recursos

- **Iconos**: [Ionicons Directory](https://ionic.io/ionicons)
- **Animaciones**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Tailwind**: [NativeWind Docs](https://www.nativewind.dev/)

## 🎯 Próximos Pasos

1. Lee [COMPONENTS_GUIDE.md](./COMPONENTS_GUIDE.md) para ver ejemplos de TODOS los componentes
2. Lee [PROFILE_GUIDE.md](./PROFILE_GUIDE.md) para implementar el perfil multi-rol
3. Revisa `ProfileScreen.example.tsx` para ejemplos de uso del ProfileScreen
4. Empieza a usar los componentes en tus features

---

¡Todo listo para construir una app increíble! 🚀
