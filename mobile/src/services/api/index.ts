/**
 * @deprecated Barrel exports impact bundle size. Import services directly:
 * import { OrderService } from '../services/api/OrderService'
 * 
 * This file is kept for backwards compatibility but should not be used
 * for new imports. Tree shaking works best with direct imports.
 */

// Core utilities
export { apiRequest } from './client'
export { ApiService } from './ApiService'
export { createService } from './createService'

// Services that exist - prefer direct imports for tree shaking
export { CatalogCategoryService } from './CatalogCategoryService'
export { CatalogProductService } from './CatalogProductService'
export { CatalogSkuService } from './CatalogSkuService'
export { CatalogPriceService } from './CatalogPriceService'
export { ChannelService } from './ChannelService'
export { ClientService } from './ClientService'
export { CreditService } from './CreditService'
export { DeliveryService } from './DeliveryService'
export { OrderService } from './OrderService'
export { RouteService } from './RouteService'
export { UserService } from './UserService'
export { ZoneService, ZoneHelpers, ZoneEditState } from './ZoneService'

// Type exports from existing services
export type { CatalogCategory } from './CatalogCategoryService'
export type { CatalogProduct } from './CatalogProductService'
export type { CatalogSku } from './CatalogSkuService'
export type { CatalogSkuPrice as CatalogPrice } from './CatalogPriceService'
export type {
    CreateOrderPayload,
    OrderItemPayload,
    OrderResponse,
    OrderDetail,
    OrderListItem,
    OrderItemDetail,
    OrderHistoryItem,
    OrderValidation,
    OrderValidationItem
} from './OrderService'
export type { ApproveCreditPayload, CreditResponse, CreditListItem } from './CreditService'
export type {
    Client,
    PriceList as ClientPriceList,
    CommercialZone,
    ClientBranch,
    CreateClientPayload
} from './ClientService'
export type { Delivery, DeliveryStatus, DeliveryEvidence, EvidencePayload } from './DeliveryService'
export type { RoutePlan, ScheduledVisit } from './RouteService'
export type { UserProfile, CreateUserPayload } from './UserService'
export type { Zone, LatLng, CreateZonePayload, UpdateZonePayload } from './ZoneService'
