// src/domain/order/order.entity.ts

import { OrderStatus, Customer, OrderItem, OrderEvent, PaymentInfo, DeliveryInfo, StockReservation, Metadata, CommercialInfo, DomainEvent } from "./order.valueObjects";
import { assertTransition } from "./order.stateMachine";

/**
 * Entidad Pura del Dominio: Agregado Raíz del Contexto de Pedidos.
 * Completamente agnóstica a Supabase, frameworks e infraestructura de persistencia.
 */
export class Order {
  public readonly id: string;
  public readonly commercialOrderCode: string;
  public readonly createdAt: Date;
  public readonly expiresAt: Date;
  public readonly reservedUntil: Date;

  public status: OrderStatus;
  public lastStatusUpdate: Date;
  public timeline: OrderEvent[] = [];

  public readonly customer: Customer;
  public readonly items: OrderItem[];
  public readonly subtotal: number;
  public readonly total: number;
  public readonly currency: string;

  public confirmationDate?: Date;
  public shippingDate?: Date;
  public deliveryDate?: Date;
  public cancelDate?: Date;
  public whatsappOpenedDate?: Date;
  public futureCancellationReason?: string;

  // Extensiones opcionales encapsuladas
  public paymentInfo?: PaymentInfo;
  public deliveryInfo?: DeliveryInfo;
  public stockReservation?: StockReservation;
  public metadata?: Metadata;
  public commercialInfo?: CommercialInfo;

  // Cola interna para eventos de dominio (Domain Events Dispatcher Pattern)
  private _domainEvents: DomainEvent[] = [];

  constructor(params: {
    id: string;
    commercialOrderCode: string;
    createdAt: Date;
    expiresAt: Date;
    reservedUntil: Date;
    status: OrderStatus;
    customer: Customer;
    items: OrderItem[];
    subtotal: number;
    total: number;
    currency: string;
    lastStatusUpdate?: Date;
    timeline?: OrderEvent[];
    confirmationDate?: Date;
    shippingDate?: Date;
    deliveryDate?: Date;
    cancelDate?: Date;
    whatsappOpenedDate?: Date;
    futureCancellationReason?: string;
    paymentInfo?: PaymentInfo;
    deliveryInfo?: DeliveryInfo;
    stockReservation?: StockReservation;
    metadata?: Metadata;
    commercialInfo?: CommercialInfo;
  }) {
    this.id = params.id;
    this.commercialOrderCode = params.commercialOrderCode;
    this.createdAt = params.createdAt;
    this.expiresAt = params.expiresAt;
    this.reservedUntil = params.reservedUntil;
    this.status = params.status;
    this.customer = params.customer;
    this.items = params.items;
    this.subtotal = params.subtotal;
    this.total = params.total;
    this.currency = params.currency;
    this.lastStatusUpdate = params.lastStatusUpdate ?? params.createdAt;
    this.timeline = params.timeline ?? [{ status: params.status, timestamp: params.createdAt, note: "Inicialización de Orden", origin: "SYSTEM" }];
    this.confirmationDate = params.confirmationDate;
    this.shippingDate = params.shippingDate;
    this.deliveryDate = params.deliveryDate;
    this.cancelDate = params.cancelDate;
    this.whatsappOpenedDate = params.whatsappOpenedDate;
    this.futureCancellationReason = params.futureCancellationReason;
    this.paymentInfo = params.paymentInfo;
    this.deliveryInfo = params.deliveryInfo;
    this.stockReservation = params.stockReservation;
    this.metadata = params.metadata;
    this.commercialInfo = params.commercialInfo;
  }

  /**
   * Ejecuta transiciones controladas por la Máquina de Estados mutando de forma segura la entidad.
   */
  public transitionTo(nextStatus: OrderStatus, note?: string, origin: string = "SYSTEM"): void {
    assertTransition(this.status, nextStatus);

    const eventTime = new Date();
    const newEvent: OrderEvent = {
      status: nextStatus,
      timestamp: eventTime,
      note,
      origin
    };

    this.timeline = [...this.timeline, newEvent];
    this.status = nextStatus;
    this.lastStatusUpdate = eventTime;

    // Seteo de marcas temporales de auditoría
    switch (nextStatus) {
      case OrderStatus.WhatsappOpened:
        this.whatsappOpenedDate = eventTime;
        this.addDomainEvent({ type: "OrderWhatsappOpened", payload: { orderId: this.id } });
        break;
      case OrderStatus.Confirmed:
        this.confirmationDate = eventTime;
        this.addDomainEvent({ type: "OrderConfirmed", payload: { orderId: this.id } });
        break;
      case OrderStatus.Preparing:
        this.addDomainEvent({ type: "OrderPreparing", payload: { orderId: this.id } });
        break;
      case OrderStatus.ReadyForPickup:
        this.addDomainEvent({ type: "OrderReadyForPickup", payload: { orderId: this.id } });
        break;
      case OrderStatus.Shipped:
        this.shippingDate = eventTime;
        this.addDomainEvent({ type: "OrderShipped", payload: { orderId: this.id } });
        break;
      case OrderStatus.Delivered:
        this.deliveryDate = eventTime;
        this.addDomainEvent({ type: "OrderDelivered", payload: { orderId: this.id } });
        break;
      case OrderStatus.Cancelled:
        this.cancelDate = eventTime;
        this.futureCancellationReason = note;
        this.addDomainEvent({ type: "OrderCancelled", payload: { orderId: this.id, reason: note } });
        break;
    }
  }

  /**
   * Recupera los eventos de dominio acumulados.
   */
  public getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * Limpia la cola de eventos tras su correcto despacho en la capa de Aplicación.
   */
  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
}