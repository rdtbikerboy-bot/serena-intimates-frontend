// =====================================================================
// TYPES.TS — DEFINICIÓN DE TIPOS UNIFICADOS DE SERENA INTIMATES
// =====================================================================
// Contiene las interfaces maestras que rigen el dominio del negocio,
// la interacción con la UI y la integración con la base de datos Supabase.
// =====================================================================

export type ProductBrand = string; // Dinámico desde Supabase (Fase 13)

export type ProductCategory = 
  | 'romantico' 
  | 'atrevido' 
  | 'novia' 
  | 'comfy' 
  | 'minimalista' 
  | 'premium';

export type ProductMood =
  | 'dia-a-dia'
  | 'comodo-y-suave'
  | 'noche-especial'
  | 'invisible'
  | 'elegancia-minimalista'
  | 'sensual-delicado'
  | 'bridal'
  | 'lounge';

export type SupportLevel = 'bajo' | 'medio' | 'alto';
export type TransparencyLevel = 'ninguna' | 'baja' | 'alta';

// FASE 21: NORMALIZACIÓN DE IMÁGENES
export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  blurDataUrl?: string;
  displayOrder: number;
  isCover: boolean;
  colorReference?: string;
  skinToneReference?: string;
  width?: number;
  height?: number;
}

// Modelo Maestro del Producto (Evolución Comercial)
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number; // Precio final de venta en Pesos Argentinos
  category: ProductCategory;
  imageUrl: string;
  galleryUrls?: string[]; // Legacy fallback (Fase 21 híbrido)
  images?: ProductImage[]; // Fase 21: Imágenes normalizadas
  
  // Complemento "Get the Look"
  matchTitle?: string;
  matchPrice?: number;
  
  // Campaña/Drop de Temporada
  dropId?: string;
  drop?: string; // Slug identificador (ej: 'encaje-noir', 'soft-cotton')
  
  // Atributos de Curaduría Multimarca Brasilera
  brand: ProductBrand;
  color: string;
  supportLevel: SupportLevel;
  transparency: TransparencyLevel;
  immediateAvailability: boolean; // true = Disponible Hoy (Salta) / false = Encargo Brasil
  mood: ProductMood;
  
  // CMS & Badges Comerciales
  collections: string[];
  badges: string[];
  createdAt?: string;
  display_order?: number;

  // Variantes de stock (Mejora 6)
  stockMap?: Record<string, number>;

  // Preparación Future-Ready: Virtual Fitting (Fase 15)
  colorVariants?: string[];
  virtualFittingModels?: Record<string, string>; // Ej: { "skin-tone-1": "url", "skin-tone-2": "url" }

  // Pipeline Editorial & Sets Compuestos (Fase 16)
  isCompoundSet?: boolean;
  compoundItems?: {
    topProductId?: string;
    bottomProductId?: string;
  };
  colorSwatchesList?: ColorSwatch[];
  editorialPreset?: string; // Preset visual asociado ('nude-satin', etc.)

  // =====================================================================
  // DATOS COMERCIALES Y DE IMPORTACIÓN (Novedad Fase de Consolidación 🇧🇷)
  // =====================================================================
  provider?: string;                 // Proveedor o distribuidor oficial en Brasil
  countryOrigin?: string;            // País de origen ("Brasil")
  costUsd?: number;                  // Costo neto unitario en USD
  referenceExchangeRate?: number;    // Cotización de referencia del dólar
  gainMargin?: number;               // Multiplicador de margen aplicado (ej. 2.2)
  autoSuggestedPrice?: number;       // Precio sugerido automático (costUsd * exchangeRate * margin)
  estimatedReplenishmentDate?: string; // Fecha estimada de ingreso/reposición
}

export interface ColorSwatch {
  id: string;
  name: string;
  hexCode: string;
  category: 'neutro' | 'satin' | 'bridal' | 'oscuro' | 'silk' | 'blush';
  skinToneCompatibility?: string;
}

export interface VirtualFittingSkeleton {
  id: string;
  modelName: string;
  skinTone: string;
  bodyShape: string;
  sizeCompatibility: string[];
  assetUrl: string;
}

// Modelo de Variantes de Stock por Talle
export interface ProductVariant {
  id: string;
  productId: string;
  size: string; // Talle (85, 90, 95, S, M, L, etc.)
  stock: number;
  sku: string;
}

// Modelo del Carrito de Compras
export interface CartItem {
  id: string; // ID del producto asociado
  title: string;
  imageUrl: string;
  size: string;
  price: number;
  quantity: number;
}

// Modelo de Medidas y Preferencias en Probador ("Mi Fit")
export interface ClientFit {
  busto: string;
  bombacha: string;
  stylePreferences?: string[];
}

// Modelo de Memoria Serena Local (Persistencia en el Dispositivo)
export interface SerenaMemory {
  fitState: ClientFit | null;
  favoritesList: string[]; // Lista de títulos favoritos
  viewedBrands: Record<string, number>;
  viewedCategories: Record<string, number>;
  viewedProducts: string[]; // IDs de productos explorados
  lastUpdated: string;
}

// Modelo de Analíticas de Interacción
export interface AnalyticsEvent {
  id?: string;
  eventName: string;
  category?: string;
  payload: Record<string, any>;
  createdAt?: string;
}

// Modelo de Lista de Espera (Waitlists)
export interface WaitlistRecord {
  id: string;
  variantId: string;
  productTitle: string;
  size: string;
  clientName: string;
  whatsappNumber: string;
  isNotified: boolean;
  createdAt: string;
}

// =====================================================================
// CRM COMERCIAL MINIMALISTA (Fase de Consolidación 🏷️)
// =====================================================================

export type OrderStatus =
  | 'pendiente'      // WhatsApp enviado por la clienta
  | 'reservado'      // Seña del 50% abonada
  | 'en_viaje'       // Despachado de Brasil en tránsito a Salta
  | 'listo_entrega'  // Arribado al Showroom de Salta listo para retirar
  | 'entregado'      // Compra entregada y finalizada
  | 'cancelado';     // Reserva expirada o devuelta

export interface CRMOrder {
  id: string;
  clientName: string;
  whatsappNumber: string;
  items: Omit<CartItem, 'quantity'>[]; // Lista de prendas reservadas
  totalPrice: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================================================
// FASE 13: CRM COMERCIAL Y TIMELINE DE INTERACCIONES
// =====================================================================

export type CRMClientStatus = 
  | 'nueva_consulta' 
  | 'interesada' 
  | 'reserva_activa' 
  | 'esperando_pago' 
  | 'pagada' 
  | 'entregada' 
  | 'recompra_potencial';

export interface CRMClient {
  id: string;
  name: string;
  whatsapp: string;
  city: string;
  preferredSizes: string[];
  preferredBrands: string[];
  preferredMoods: string[];
  tags: string[];
  notes?: string;
  status: CRMClientStatus;
  lastContactAt: string;
  createdAt: string;
  updatedAt: string;
}

export type CRMInteractionType = 'reserva' | 'share' | 'wishlist' | 'reingreso' | 'whatsapp_sent' | 'checkout_iniciado';

export interface CRMInteraction {
  id: string;
  clientId: string;
  type: CRMInteractionType;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// =====================================================================
// FASE 17: TYPES DE RESERVAS Y CRM PREMIUM SHOWROOM
// =====================================================================

export type ReservationStatus = 
  | 'draft' 
  | 'reserved' 
  | 'contacted' 
  | 'confirmed' 
  | 'delivered' 
  | 'cancelled' 
  | 'expired';

export interface BoutiqueReservation {
  id: string;
  clientName: string;
  whatsappNumber: string;
  productTitle: string;
  size: string;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
  historyLogs?: { status: ReservationStatus; timestamp: string }[];
}

export type OperationMode = 'DEMO' | 'SHOWROOM' | 'OPERATIVO';

export interface MessageTemplate {
  id: string;
  category: string;
  title: string;
  content: string;
}

// FASE 19: CONVERSIÓN REAL & ATRIBUCIÓN INTELIGENTE
export type FunnelEventType =
  | 'VIEWED'
  | 'SAVED'
  | 'SHARED'
  | 'CONSULTED_WA'
  | 'RESERVED'
  | 'CONFIRMED'
  | 'DELIVERED'
  | 'LOST'
  | 'CTL_IMPRESSION'
  | 'CTL_CLICK'
  | 'CTL_ADD_TO_CART'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'CLEAR_CART'
  | 'FIT_CONFIDENCE_VIEW'
  | 'FIT_CONFIDENCE_ACCEPTED';

export interface SalesFunnelEvent {
  id?: string;
  product_id?: string;
  client_id?: string;
  event_type: FunnelEventType;
  metadata: {
    brand?: string;
    mood?: string;
    size?: string;
    source?: string;
    seller?: string;
    utm_source?: string;
    utm_campaign?: string;
    qr?: string;
    [key: string]: any;
  };
  created_at?: string;
}

export interface AttributionParams {
  utm_source?: string;
  utm_campaign?: string;
  ref?: string;
  seller?: string;
  qr?: string;
}
