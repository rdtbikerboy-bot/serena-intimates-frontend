// src/domain/order/order.valueObjects.ts

/**
 * Enum representando el ciclo de vida estandarizado y tipado de una Orden en Serena Intimates.
 */
export enum OrderStatus {
  PendingWhatsapp = "PENDING_WHATSAPP",
  WhatsappOpened = "WHATSAPP_OPENED",
  Confirmed = "CONFIRMED",
  Preparing = "PREPARING",
  ReadyForPickup = "READY_FOR_PICKUP",
  Shipped = "SHIPPED",
  Delivered = "DELIVERED",
  Cancelled = "CANCELLED"
}

/** Perfil embebido del Cliente dentro del contexto de Órdenes */
export interface Customer {
  name: string;
  phone: string;
  address?: string;
  deliveryMethod: "delivery" | "pickup";
}

/** Item individual de una compra */
export interface OrderItem {
  id: string; // ID del producto
  title: string;
  imageUrl: string;
  size: string;
  price: number;
  quantity: number;
}

/** Estructura inmutable para el Timeline de auditoría */
export interface OrderEvent {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
  origin?: string; // Origen del cambio: 'WEB', 'WHATSAPP', 'ADMIN', 'SYSTEM'
}

export interface PaymentInfo {
  provider?: string;
  reference?: string;
  status?: string;
  date?: Date;
  transactionId?: string;
}

export interface DeliveryInfo {
  method?: "delivery" | "pickup";
  address?: string;
  shippingStatus?: string;
  estimatedDelivery?: Date;
}

export interface StockReservation {
  reservedStock?: number;
  reservationExpiration?: Date;
  inventoryValidated?: boolean;
}

export interface Metadata {
  origin?: string;
  campaign?: string;
  seller?: string;
  notes?: string;
  extra?: Record<string, any>;
}

export interface CommercialInfo {
  commercialCode?: string;
}

/** Eventos de Dominio oficiales para integraciones asíncronas (IA, CRM, Notificaciones) */
export type DomainEvent =
  | { type: "OrderCreated"; payload: { orderId: string; commercialCode: string } }
  | { type: "OrderWhatsappOpened"; payload: { orderId: string } }
  | { type: "OrderConfirmed"; payload: { orderId: string } }
  | { type: "OrderPreparing"; payload: { orderId: string } }
  | { type: "OrderReadyForPickup"; payload: { orderId: string } }
  | { type: "OrderShipped"; payload: { orderId: string } }
  | { type: "OrderDelivered"; payload: { orderId: string } }
  | { type: "OrderCancelled"; payload: { orderId: string; reason?: string } };