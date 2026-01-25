# Guía de Componentes UI Web - Cafrisales

Sistema completo de componentes profesionales con React, Tailwind CSS, Lucide Icons, Framer Motion y Sonner.

## 🎨 Paleta de Colores

```css
red: #F0412D        /* Principal (Header, botones primarios) */
red700: #C52C1B     /* Hover/Active */
gold: #F4D46A       /* Secundario */
cream: #FFF5D9      /* Fondos suaves */
```

## 📦 Importación

```typescript
// Importar todo
import * as UI from '@/components/ui'

// O importar específicos
import { Button, DataTable, DashboardLayout } from '@/components/ui'
```

---

## 🧱 ATOMS (Componentes Básicos)

### Button

```tsx
import { Button } from '@/components/ui'

<Button variant="primary" loading={isLoading} leftIcon={<Plus />}>
  Crear Pedido
</Button>

<Button variant="secondary" size="lg" fullWidth>
  Guardar
</Button>
```

**Variantes:** `primary`, `secondary`, `ghost`, `danger`, `outline`
**Tamaños:** `sm`, `md`, `lg`

---

### Typography

```tsx
import { Heading, Text } from '@/components/ui'

<Heading level="h1">Título Principal</Heading>
<Heading level="h3">Subtítulo</Heading>
<Text variant="body">Texto normal</Text>
<Text variant="muted">Texto secundario</Text>
<Text variant="label" as="label">Etiqueta</Text>
```

---

### Input & Textarea

```tsx
import { Input, Textarea } from '@/components/ui'

<Input
  label="Email"
  placeholder="tu@email.com"
  error={errors.email}
  leftIcon={<Mail />}
  fullWidth
/>

<Textarea
  label="Descripción"
  rows={4}
  helper="Máximo 500 caracteres"
/>
```

---

### Badge

```tsx
import { Badge } from '@/components/ui'

<Badge variant="success">Aprobado</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="danger" icon={<AlertCircle />}>Rechazado</Badge>
```

---

### Avatar

```tsx
import { Avatar } from '@/components/ui'

<Avatar src="https://..." alt="Juan Pérez" size="lg" />
<Avatar name="María García" size="md" />
```

---

### Spinner & Skeleton

```tsx
import { Spinner, Skeleton, SkeletonCard } from '@/components/ui'

<Spinner size="lg" text="Cargando..." />
<Skeleton variant="line" width="80%" />
<SkeletonCard />
```

---

### CopyToClipboard

```tsx
import { CopyToClipboard } from '@/components/ui'

<CopyToClipboard text="PED-12345" successMessage="Pedido copiado">
  Copiar #
</CopyToClipboard>
```

---

## 📝 FORMS (Formularios)

### FormField

```tsx
import { FormField, Input } from '@/components/ui'

<FormField label="Nombre completo" error={errors.name} required>
  <Input placeholder="Ingresa tu nombre" />
</FormField>
```

---

### Select

```tsx
import { Select } from '@/components/ui'

<Select
  label="Zona"
  options={[
    { label: 'Zona Norte', value: 'norte' },
    { label: 'Zona Sur', value: 'sur' }
  ]}
  value={selectedZone}
  onChange={setSelectedZone}
  placeholder="Seleccionar zona"
/>
```

---

### Checkbox & RadioGroup

```tsx
import { Checkbox, RadioGroup } from '@/components/ui'

<Checkbox
  label="Acepto términos y condiciones"
  checked={accepted}
  onChange={setAccepted}
/>

<RadioGroup
  label="Método de pago"
  name="payment"
  options={[
    { label: 'Efectivo', value: 'cash' },
    { label: 'Tarjeta', value: 'card' }
  ]}
  value={paymentMethod}
  onChange={setPaymentMethod}
/>
```

---

### Switch

```tsx
import { Switch } from '@/components/ui'

<Switch label="Notificaciones" checked={enabled} onChange={setEnabled} />
```

---

## 🏗️ LAYOUT (Estructura)

### DashboardLayout (Layout Maestro)

```tsx
import { DashboardLayout } from '@/components/layouts'

export function DashboardPage() {
  const user = {
    name: 'Juan Pérez',
    email: 'juan@cafrisales.com',
    role: 'Administrador',
  }

  return (
    <DashboardLayout
      user={user}
      currentPath="/dashboard"
      onLogout={() => logout()}
      onProfile={() => navigate('/profile')}
    >
      <PageHeader title="Dashboard" />
      {/* Tu contenido */}
    </DashboardLayout>
  )
}
```

---

### Sidebar & Header (Componentes individuales)

```tsx
import { Sidebar, SidebarItem, SidebarSection, Header, UserMenu } from '@/components/ui'

<Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)}>
  <SidebarSection title="Navegación">
    <SidebarItem icon={<Home />} label="Inicio" href="/" active />
    <SidebarItem icon={<ShoppingCart />} label="Pedidos" badge={5} />
  </SidebarSection>
</Sidebar>

<Header>
  <HeaderLeft>
    <Logo />
  </HeaderLeft>
  <HeaderRight>
    <UserMenu user={user} onLogout={logout} />
  </HeaderRight>
</Header>
```

---

### Container & PageHeader

```tsx
import { Container, PageHeader } from '@/components/ui'

<Container size="xl">
  <PageHeader
    title="Mis Pedidos"
    description="Gestiona todos tus pedidos"
    breadcrumbs={[
      { label: 'Inicio', href: '/' },
      { label: 'Pedidos' }
    ]}
    actions={
      <Button variant="primary">Nuevo Pedido</Button>
    }
  />
</Container>
```

---

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui'

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Pedido #1234</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Contenido del pedido</p>
  </CardContent>
  <CardFooter>
    <Button>Ver detalles</Button>
  </CardFooter>
</Card>
```

---

### Stack & Grid

```tsx
import { HStack, VStack, Grid } from '@/components/ui'

<VStack gap="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</VStack>

<HStack gap="sm" justify="between">
  <Text>Left</Text>
  <Text>Right</Text>
</HStack>

<Grid cols={3} gap="lg" responsive>
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
</Grid>
```

---

## 💬 FEEDBACK (Notificaciones y Estados)

### Toast (usando Sonner)

```tsx
import { Toaster, toast } from '@/components/ui'

// En tu App.tsx
<Toaster />

// En cualquier componente
toast.success('Pedido creado exitosamente')
toast.error('Error al procesar')
toast.loading('Procesando...')
toast.info('Nueva actualización disponible')
```

---

### Modal

```tsx
import { Modal, ModalFooter } from '@/components/ui'

<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmar acción"
  description="¿Estás seguro?"
  size="md"
>
  <p>Contenido del modal</p>

  <ModalFooter>
    <Button variant="ghost" onClick={() => setIsOpen(false)}>
      Cancelar
    </Button>
    <Button variant="primary">Confirmar</Button>
  </ModalFooter>
</Modal>
```

---

### Drawer (Formularios laterales)

```tsx
import { Drawer, DrawerFooter } from '@/components/ui'

<Drawer
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Editar Producto"
  side="right"
  size="lg"
>
  <ProductForm />

  <DrawerFooter>
    <Button variant="ghost">Cancelar</Button>
    <Button variant="primary">Guardar</Button>
  </DrawerFooter>
</Drawer>
```

---

### AlertDialog

```tsx
import { AlertDialog } from '@/components/ui'

<AlertDialog
  open={showAlert}
  onClose={() => setShowAlert(false)}
  title="Eliminar pedido"
  description="Esta acción no se puede deshacer"
  variant="danger"
  confirmLabel="Sí, eliminar"
  onConfirm={handleDelete}
  loading={isDeleting}
/>
```

---

### EmptyState & ErrorState

```tsx
import { EmptyState, ErrorState } from '@/components/ui'

<EmptyState
  icon={ShoppingCart}
  title="No hay pedidos"
  description="Crea tu primer pedido"
  actionLabel="Crear Pedido"
  onAction={() => navigate('/orders/new')}
/>

<ErrorState
  title="Error al cargar"
  message="No pudimos cargar los pedidos"
  onRetry={refetch}
/>
```

---

## 📊 DATA (Tablas y Datos)

### DataTable (Con sorting)

```tsx
import { DataTable } from '@/components/ui'

const columns = [
  { key: 'id', label: '#', sortable: true },
  { key: 'cliente', label: 'Cliente', sortable: true },
  {
    key: 'estado',
    label: 'Estado',
    render: (row) => <Badge variant="success">{row.estado}</Badge>
  },
  {
    key: 'acciones',
    label: '',
    render: (row) => (
      <Button size="sm" onClick={() => viewOrder(row.id)}>
        Ver
      </Button>
    )
  }
]

<DataTable
  data={orders}
  columns={columns}
  loading={isLoading}
  sortBy={sortBy}
  sortDirection={sortDirection}
  onSort={handleSort}
  onRowClick={(row) => navigate(`/orders/${row.id}`)}
/>
```

---

### Pagination

```tsx
import { Pagination } from '@/components/ui'

<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
  showFirstLast
/>
```

---

### Tabs

```tsx
import { Tabs } from '@/components/ui'

const tabs = [
  { id: 'all', label: 'Todos', badge: 25 },
  { id: 'pending', label: 'Pendientes', badge: 5 },
  { id: 'completed', label: 'Completados' }
]

<Tabs
  tabs={tabs}
  activeTab={activeTab}
  onChange={setActiveTab}
  variant="pills"
/>
```

---

### FilterBar

```tsx
import { FilterBar } from '@/components/ui'

<FilterBar
  searchValue={search}
  onSearchChange={setSearch}
  searchPlaceholder="Buscar pedidos..."
  filters={[
    {
      id: 'zone',
      type: 'select',
      label: 'Zona',
      options: zoneOptions,
      value: selectedZone,
      onChange: setSelectedZone
    }
  ]}
  onClearFilters={clearFilters}
/>
```

---

### Breadcrumbs

```tsx
import { Breadcrumbs } from '@/components/ui'

<Breadcrumbs
  items={[
    { label: 'Pedidos', href: '/orders' },
    { label: 'Detalles' }
  ]}
  showHome
/>
```

---

## 🎨 EJEMPLO COMPLETO: Página de Pedidos

```tsx
import React, { useState } from 'react'
import {
  DashboardLayout,
  PageHeader,
  FilterBar,
  DataTable,
  Pagination,
  Badge,
  Button,
  Drawer,
  toast
} from '@/components/ui'
import { Plus } from 'lucide-react'

export function OrdersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data, isLoading } = useOrders({ page, search })

  const columns = [
    { key: 'id', label: '#', sortable: true },
    { key: 'cliente', label: 'Cliente', sortable: true },
    { key: 'zona', label: 'Zona' },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => (
        <Badge variant={row.estado === 'completado' ? 'success' : 'warning'}>
          {row.estadoLabel}
        </Badge>
      )
    }
  ]

  return (
    <DashboardLayout user={currentUser} currentPath="/orders">
      <PageHeader
        title="Pedidos"
        description={`${data?.total || 0} pedidos en total`}
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus />}
            onClick={() => setDrawerOpen(true)}
          >
            Nuevo Pedido
          </Button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por cliente, ID..."
      />

      <DataTable
        data={data?.orders || []}
        columns={columns}
        loading={isLoading}
        onRowClick={(row) => navigate(`/orders/${row.id}`)}
      />

      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Nuevo Pedido"
      >
        <OrderForm onSuccess={() => {
          setDrawerOpen(false)
          toast.success('Pedido creado')
        }} />
      </Drawer>
    </DashboardLayout>
  )
}
```

---

## 🚀 Configuración Inicial

### 1. Agregar Toaster en App.tsx

```tsx
import { Toaster } from '@/components/ui'

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        {/* tus rutas */}
      </Routes>
    </>
  )
}
```

### 2. Configurar Path Alias (@/components/ui)

En `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

En `vite.config.ts`:

```ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

---

## 📚 Componentes Creados

### ✅ Atoms (10)
Button, LinkButton, Heading, Text, Input, Textarea, Badge, Avatar, Spinner, Skeleton, Divider, CopyToClipboard

### ✅ Forms (5)
FormField, Select, Checkbox, RadioGroup, Switch

### ✅ Layout (15)
Sidebar, SidebarItem, Header, UserMenu, Container, PageHeader, Card, Stack, Grid, DashboardLayout

### ✅ Feedback (6)
Toast, Modal, Drawer, AlertDialog, EmptyState, ErrorState

### ✅ Data (5)
DataTable, Pagination, Tabs, FilterBar, Breadcrumbs

### ✅ Total: **41+ componentes profesionales** 🎉

---

¡Sistema completo listo para construir tu aplicación web! 🚀
