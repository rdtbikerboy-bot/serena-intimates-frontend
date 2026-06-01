// =====================================================================
// SUPABASESERVICE.TS — CAPA DE SERVICIO RESILIENTE OFFLINE-FIRST
// =====================================================================
// Administra las consultas y mutaciones de datos del servidor con Supabase.
// Si no hay red o no está configurado, conmuta de forma fluida a la caché
// local (localStorage) inicializada con mocks enriquecidos.
// =====================================================================

import { supabase, isSupabaseConfigured } from "./supabase";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";
import { Product, ProductVariant, WaitlistRecord, OrderStatus, CRMOrder } from "@/core/types";
import { PRODUCTS } from "@/mocks/products";
import { SERENA_CONFIG } from "@/core/config";
import { serenaLogger } from "@/core/logger";
import { networkSimulator } from "@/core/networkSimulator";

import { CRMClient, CRMInteraction, CRMClientStatus, CRMInteractionType } from "@/core/types";
import { BoutiqueReservation, ReservationStatus, MessageTemplate } from "@/core/types";

// Mapeo preventivo de mocks locales en caso de desconexión o configuración pendiente
function getLocalCatalog(): Product[] {
  if (typeof window === "undefined") return PRODUCTS as unknown as Product[];
  try {
    const saved = localStorage.getItem(SERENA_CONFIG.keys.customCatalog);
    if (saved) {
      return JSON.parse(saved);
    } else {
      // Enriquecer y guardar mocks iniciales con variables de importación
      const enriched: Product[] = (PRODUCTS as any[]).map((p) => ({
        ...p,
        supportLevel: p.supportLevel || "medio",
        transparency: p.transparency || "baja",
        collections: p.collections || [],
        badges: p.badges || [],
        provider: SERENA_CONFIG.pricing.defaultProvider,
        countryOrigin: SERENA_CONFIG.pricing.defaultCountry,
        costUsd: Math.round((p.price / SERENA_CONFIG.pricing.defaultExchangeRate / SERENA_CONFIG.pricing.defaultMargin) * 10) / 10,
        referenceExchangeRate: SERENA_CONFIG.pricing.defaultExchangeRate,
        gainMargin: SERENA_CONFIG.pricing.defaultMargin,
        autoSuggestedPrice: p.price,
      }));
      localStorage.setItem(SERENA_CONFIG.keys.customCatalog, JSON.stringify(enriched));
      return enriched;
    }
  } catch (e) {
    return PRODUCTS as unknown as Product[];
  }
}

function saveLocalCatalog(catalog: Product[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SERENA_CONFIG.keys.customCatalog, JSON.stringify(catalog));
  } catch (e) {
    serenaLogger.error("Error al guardar catálogo local.", e);
  }
}

// =====================================================================
// SECCIÓN DE PRODUCTOS & INVENTARIO (QUERIES & MUTATIONS)
// =====================================================================

export const productsService = {
  /**
   * Carga el catálogo completo de productos de Serena.
   */
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured()) {
      serenaLogger.info("Supabase sin configurar. Cargando catálogo local offline.");
      return getLocalCatalog();
    }
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          drops (campaign_name),
          product_images (
            id, image_url, blur_data_url, display_order, is_cover, color_reference, skin_tone_reference, width, height
          )
        `)
        .is('deleted_at', null) // exclude soft‑deleted
        .order("display_order", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Mapear el formato relacional de Postgres a la interfaz frontend Product
        const mapped: Product[] = data.map((row: any) => {
          // Si tiene product_images reales, usarlas. Sino, mapear fallback legacy desde galleryUrls.
          const dbImages = row.product_images && row.product_images.length > 0 
            ? row.product_images.sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => ({
                id: img.id,
                productId: row.id,
                imageUrl: img.image_url,
                blurDataUrl: img.blur_data_url,
                displayOrder: img.display_order,
                isCover: img.is_cover,
                colorReference: img.color_reference,
                skinToneReference: img.skin_tone_reference,
                width: img.width,
                height: img.height
              }))
            : undefined;

          // Híbrido: Generar array legacy desde images si galleryUrls está vacío pero images no (para compatibilidad dual)
          const legacyGallery = row.gallery_urls || [];
          
          let hybridImages = dbImages;
          if (!hybridImages && legacyGallery.length > 0) {
            hybridImages = legacyGallery.map((url: string, index: number) => ({
              id: `legacy-img-${index}`,
              productId: row.id,
              imageUrl: url,
              displayOrder: index,
              isCover: index === 0
            }));
          }

          return {
          id: row.id,
          title: row.title,
          description: row.description,
          price: parseFloat(row.price),
          category: row.category,
          imageUrl: row.image_url,
          matchTitle: row.match_title,
          matchPrice: row.match_price ? parseFloat(row.match_price) : undefined,
          dropId: row.drop_id,
          drop: row.drops?.campaign_name || undefined,
          brand: row.brand,
          color: row.color,
          supportLevel: row.support_level,
          transparency: row.transparency,
          immediateAvailability: row.immediate_availability,
          mood: row.mood,
          collections: row.collections || [],
          badges: row.badges || [],
          galleryUrls: legacyGallery,
          images: hybridImages,
          provider: row.provider,
          countryOrigin: row.country_origin,
          costUsd: row.cost_usd ? parseFloat(row.cost_usd) : undefined,
          referenceExchangeRate: row.reference_exchange_rate ? parseFloat(row.reference_exchange_rate) : undefined,
          gainMargin: row.gain_margin ? parseFloat(row.gain_margin) : undefined,
          autoSuggestedPrice: row.cost_usd && row.reference_exchange_rate && row.gain_margin 
            ? Math.round(row.cost_usd * row.reference_exchange_rate * row.gain_margin) 
            : undefined,
          estimatedReplenishmentDate: row.estimated_replenishment_date,
          display_order: row.display_order || 0,
        };
        });
        saveLocalCatalog(mapped);
        return mapped;
      }
      return getLocalCatalog();
    } catch (err) {
      serenaLogger.warn("Falla en Supabase. Conmutando a catálogo local offline.", err);
      return getLocalCatalog();
    }
  },

  /**
   * Crea o actualiza un producto en el sistema (Carga Rápida).
   */
  async saveProduct(product: Omit<Product, "id"> & { id?: string }): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: product.id || Math.random().toString(36).substring(2, 9),
    };

    // 1. Guardar en local storage (Offline First)
    const local = getLocalCatalog();
    const existingIdx = local.findIndex((p) => p.id === newProduct.id);
    if (existingIdx >= 0) {
      local[existingIdx] = newProduct;
    } else {
      local.unshift(newProduct);
    }
    saveLocalCatalog(local);

    // 2. Intentar guardar en Supabase si está disponible
    if (isSupabaseConfigured()) {
      try {
        const dbRow = {
          id: newProduct.id.includes("-") ? newProduct.id : undefined, // Solo uuid para Supabase
          title: newProduct.title,
          description: newProduct.description,
          price: newProduct.price,
          category: newProduct.category,
          image_url: newProduct.imageUrl,
          match_title: newProduct.matchTitle,
          match_price: newProduct.matchPrice,
          brand: newProduct.brand,
          color: newProduct.color,
          support_level: newProduct.supportLevel,
          transparency: newProduct.transparency,
          immediate_availability: newProduct.immediateAvailability,
          mood: newProduct.mood,
          collections: newProduct.collections,
          badges: newProduct.badges,
          gallery_urls: newProduct.galleryUrls || [],
          provider: newProduct.provider,
          country_origin: newProduct.countryOrigin,
          cost_usd: newProduct.costUsd,
          reference_exchange_rate: newProduct.referenceExchangeRate,
          gain_margin: newProduct.gainMargin,
          estimated_replenishment_date: newProduct.estimatedReplenishmentDate,
          display_order: newProduct.display_order || 0
        };

        const { data: savedDbRecord, error } = await supabase
          .from("products")
          .upsert(dbRow)
          .select()
          .single();

        if (error) throw error;
        
        const finalId = savedDbRecord.id;
        newProduct.id = finalId; // Ensure we use the true UUID returned from DB
        
        // 3. Sincronizar variantes (Mejora 6)
        if (newProduct.stockMap) {
          const variantRows = Object.entries(newProduct.stockMap).map(([size, stock]) => ({
            product_id: finalId,
            size,
            stock,
            sku: `SRN-${finalId.substring(0,6)}-${size}`
          }));
          
          if (variantRows.length > 0) {
            // Eliminar variantes anteriores si es actualización
            await supabase.from("product_variants").delete().eq("product_id", finalId);
            
            // Insertar nuevas
            const { error: varError } = await supabase.from("product_variants").insert(variantRows);
            if (varError) {
              serenaLogger.error("Fallo al insertar variantes de producto en Supabase", varError);
            } else {
              serenaLogger.info(`Variantes sincronizadas para producto ${finalId}`);
            }
          }
        }

        if (savedDbRecord) {
          serenaLogger.info(`Look '${newProduct.title}' sincronizado exitosamente en Supabase.`);
        }
      } catch (err) {
        serenaLogger.warn(`Sincronización diferida: Look '${newProduct.title}' guardado localmente (offline).`);
      }
    }

    return newProduct;
  },

  /**
   * Sube una imagen WebP al bucket de Supabase y retorna su URL pública.
   */
  async uploadImage(file: Blob, fileName: string): Promise<string> {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase no está configurado. Storage requiere conexión cloud.");
    }
    
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(`gallery/${fileName}`, file, {
        cacheControl: "31536000", // 1 año de caché
        upsert: false,
        contentType: "image/webp"
      });
      
    if (error) {
      serenaLogger.error("Error al subir imagen a Supabase Storage", error);
      throw error;
    }
    
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);
      
    return urlData.publicUrl;
  },

  /**
   * Modifica el precio minorista final en ARS de una prenda.
   */
  async updatePrice(productId: string, newPrice: number): Promise<void> {
    const local = getLocalCatalog();
    const product = local.find((p) => p.id === productId);
    if (product) {
      product.price = newPrice;
      saveLocalCatalog(local);
      serenaLogger.info(`Precio de look ID=${productId} modificado a $${newPrice} en caché local.`);
    }

    if (isSupabaseConfigured() && productId.includes("-")) {
      try {
        const { error } = await supabase
          .from("products")
          .update({ price: newPrice })
          .eq("id", productId);
        if (error) throw error;
      } catch (err) {
        serenaLogger.warn("Fallo al actualizar precio en Supabase. Cambios guardados localmente.");
      }
    }
  },

  /**
   * Alterna la disponibilidad inmediata de un producto.
   */
  async toggleAvailability(productId: string, immediate: boolean): Promise<void> {
    const local = getLocalCatalog();
    const product = local.find((p) => p.id === productId);
    if (product) {
      product.immediateAvailability = immediate;
      saveLocalCatalog(local);
      serenaLogger.info(`Disponibilidad de look ID=${productId} toggled a immediate=${immediate}.`);
    }

    if (isSupabaseConfigured() && productId.includes("-")) {
      try {
        const { error } = await supabase
          .from("products")
          .update({ immediate_availability: immediate })
          .eq("id", productId);
        if (error) throw error;
      } catch (err) {
        serenaLogger.warn("Fallo al actualizar disponibilidad en Supabase.");
      }
    }
  },

  /**
   * Elimina un producto tanto de Supabase como de la caché local (Mejora 6).
   */
async deleteProduct(productId: string): Promise<void> {
  // 1. Eliminar de caché local
  const local = getLocalCatalog();
  const updated = local.filter((p) => p.id !== productId);
  saveLocalCatalog(updated);
  serenaLogger.info(`Look ID=${productId} eliminado de la caché local.`);

  // 2. Soft‑delete en Supabase
  if (isSupabaseConfigured() && productId.includes('-')) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', productId);
      if (error) throw error;
      serenaLogger.info(`Look ID=${productId} marcado como eliminado en Supabase.`);
      // Invalidate queries so UI refreshes without the soft‑deleted item
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err) {
      serenaLogger.error('Fallo al soft‑delete en Supabase', err);
    }
  }
}
}; // end of productsService
// New real CRUD helpers
export const realProductsService = {

  /** Insert a new product */
  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const payload = {
      id,
      ...product,
      created_at: now,
      updated_at: now,
    };
    try {
      const { data, error } = await supabase.from('products').insert(payload).select().single();
      if (error) throw error;
      // Invalidate product list cache
      queryClient.invalidateQueries({ queryKey: ['products'] });
      return data as Product;
    } catch (err) {
      toast.error('No se pudo crear el producto');
      serenaLogger.error('createProduct error', err);
      throw err;
    }
  },

  /** Update an existing product */
  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const now = new Date().toISOString();
    try {
      const { error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: now })
        .eq('id', productId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err) {
      toast.error('No se pudo actualizar el producto');
      serenaLogger.error('updateProduct error', err);
      throw err;
    }
  }
};


// =====================================================================
// SECCIÓN DE MARCAS DINÁMICAS (Fase 13)
// =====================================================================

export const brandsService = {
  /**
   * Obtiene la lista de marcas activas.
   */
  async getBrands(): Promise<{ id: string; name: string }[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("brands")
          .select("id, name")
          .eq("active", true)
          .order("name", { ascending: true });
        if (error) throw error;
        return data || [];
      } catch (err) {
        serenaLogger.warn("Fallo al obtener marcas de Supabase. Conmutando a fallback local.", err);
      }
    }
    // Fallback offline
    return [
      { id: "1", name: "Valisere" },
      { id: "2", name: "Darling" },
      { id: "3", name: "Hope" },
      { id: "4", name: "Liz" },
      { id: "5", name: "Sedução" },
    ];
  },

  /**
   * Crea una nueva marca y retorna su nombre.
   */
  async addBrand(name: string): Promise<{ id: string; name: string }> {
    if (!isSupabaseConfigured()) {
      // Mock local persistido temporalmente
      const mock = { id: Math.random().toString(36).substring(7), name };
      return mock;
    }
    
    const { data, error } = await supabase
      .from("brands")
      .insert({ name })
      .select("id, name")
      .single();
      
    if (error) {
      serenaLogger.error("Fallo al crear nueva marca.", error);
      throw error;
    }
    
    return data;
  }
};

// =====================================================================
// SECCIÓN DE WAITING LISTS & CRM COMERCIAL (RESERVAS & CLIENTES)
// =====================================================================

export const waitlistService = {
  /**
   * Recupera la lista de notificaciones / waitlists activas.
   */
  async getWaitlistRecords(): Promise<WaitlistRecord[]> {
    if (typeof window === "undefined") return [];
    
    // Obtener cola local en localstorage
    const localSaved = localStorage.getItem("serena_waitlist_records");
    let localList: WaitlistRecord[] = localSaved ? JSON.parse(localSaved) : [];

    if (!isSupabaseConfigured()) {
      return localList;
    }

    try {
      const { data, error } = await supabase
        .from("stock_notifications")
        .select(`
          id,
          variant_id,
          whatsapp_number,
          is_notified,
          created_at,
          product_variants (
            size,
            products (title)
          )
        `)
        .eq("is_notified", false);

      if (error) throw error;

      if (data) {
        const dbList: WaitlistRecord[] = data.map((row: any) => ({
          id: row.id,
          variantId: row.variant_id,
          productTitle: row.product_variants?.products?.title || "Look Serena",
          size: row.product_variants?.size || "M",
          clientName: "Clienta en Espera",
          whatsappNumber: row.whatsapp_number,
          isNotified: row.is_notified,
          createdAt: row.created_at,
        }));
        
        // Unificar con local
        const unificadas = [...dbList, ...localList.filter(l => !l.id.includes("-"))];
        return unificadas;
      }
      return localList;
    } catch (e) {
      return localList;
    }
  },

  /**
   * Suscribe a una clienta a la lista de espera por talle sin stock.
   */
  async subscribe(input: { variantId: string; clientName: string; whatsappNumber: string; productTitle: string; size: string }): Promise<WaitlistRecord> {
    const newRecord: WaitlistRecord = {
      id: Math.random().toString(36).substring(2, 9),
      variantId: input.variantId,
      productTitle: input.productTitle,
      size: input.size,
      clientName: input.clientName,
      whatsappNumber: input.whatsappNumber,
      isNotified: false,
      createdAt: new Date().toISOString(),
    };

    // Guardar local
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_waitlist_records");
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(newRecord);
      localStorage.setItem("serena_waitlist_records", JSON.stringify(list));
    }

    // Guardar Supabase
    if (isSupabaseConfigured() && input.variantId.includes("-")) {
      try {
        const { error } = await supabase.from("stock_notifications").insert({
          variant_id: input.variantId,
          whatsapp_number: input.whatsappNumber,
          is_notified: false
        });
        if (error) throw error;
      } catch (err) {
        systemEventsService.reportSystemEvent(
          "sync_error",
          `Error al suscribir clienta '${input.clientName}' a lista de espera en Supabase.`,
          { variantId: input.variantId, error: String(err) }
        );
      }
    }

    serenaLogger.info(`Waitlist: ${input.clientName} suscrita al talle ${input.size} de ${input.productTitle}.`);
    return newRecord;
  },

  /**
   * Remueve una clienta de la lista de espera tras notificarla.
   */
  async markAsNotified(id: string): Promise<void> {
    // 1. Quitar en local
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_waitlist_records");
      if (saved) {
        let list: WaitlistRecord[] = JSON.parse(saved);
        list = list.filter((r) => r.id !== id);
        localStorage.setItem("serena_waitlist_records", JSON.stringify(list));
      }
    }

    // 2. Quitar o actualizar en Supabase
    if (isSupabaseConfigured() && id.includes("-")) {
      try {
        const { error } = await supabase
          .from("stock_notifications")
          .update({ is_notified: true })
          .eq("id", id);
        if (error) throw error;
      } catch (e) {}
    }
    serenaLogger.info(`Waitlist: Notificación ID=${id} marcada como enviada.`);
  }
};

// =====================================================================
// SECCIÓN DE OBSERVABILIDAD & LOGS DE SISTEMA (CLOUD OBSERVABILITY)
// =====================================================================

export const systemEventsService = {
  /**
   * Registra un evento de observabilidad técnica de forma anónima en Supabase y localmente.
   */
  async reportSystemEvent(
    eventType: "sync_error" | "reservation_fail" | "checkout_error" | "critical_js_error",
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    serenaLogger.info(`[SYSTEM EVENT] [${eventType.toUpperCase()}]: ${description}`, metadata);

    // Guardar en log de fallos locales por seguridad
    if (typeof window !== "undefined") {
      try {
        const key = "serena_system_events_log";
        const saved = localStorage.getItem(key);
        const list = saved ? JSON.parse(saved) : [];
        list.unshift({
          eventType,
          description,
          metadata,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(list.slice(0, 50))); // Límite de 50 logs locales
      } catch (e) {}
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("system_events")
          .insert({
            event_type: eventType,
            description,
            metadata
          });
        if (error) throw error;
      } catch (err) {
        serenaLogger.warn("No se pudo subir el evento del sistema a Supabase (offline o bloqueado).", err);
      }
    }
  }
};

// =====================================================================
// SECCIÓN DE GESTIÓN CRM (FASE 13 - CRM COMERCIAL)
// =====================================================================



export const crmService = {
  /**
   * Obtiene todos los clientes del CRM (con caché local).
   */
  async getClients(): Promise<CRMClient[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("crm_clients")
          .select("*")
          .order("last_contact_at", { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          const mapped: CRMClient[] = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            whatsapp: row.whatsapp,
            city: row.city,
            preferredSizes: row.preferred_sizes || [],
            preferredBrands: row.preferred_brands || [],
            preferredMoods: row.preferred_moods || [],
            tags: row.tags || [],
            notes: row.notes,
            status: row.status as CRMClientStatus,
            lastContactAt: row.last_contact_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
          
          if (typeof window !== "undefined") {
            localStorage.setItem("serena_crm_clients", JSON.stringify(mapped));
          }
          return mapped;
        }
      } catch (err) {
        serenaLogger.warn("Falla en Supabase CRM. Cargando offline.", err);
      }
    }
    
    // Offline fallback
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_crm_clients");
      if (saved) return JSON.parse(saved);
    }
    return [];
  },

  /**
   * Guarda o actualiza un cliente (usado por Turnos de Showroom)
   */
  async saveClient(data: Partial<CRMClient>): Promise<CRMClient> {
    const newClient: CRMClient = {
      id: `client-${Math.random().toString(36).substring(2, 9)}`,
      name: data.name || "",
      whatsapp: data.whatsapp || "",
      city: data.city || "",
      preferredSizes: data.preferredSizes || [],
      preferredBrands: data.preferredBrands || [],
      preferredMoods: data.preferredMoods || [],
      tags: data.tags || [],
      notes: data.notes,
      status: data.status || "nueva_consulta",
      lastContactAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_crm_clients");
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(newClient);
      localStorage.setItem("serena_crm_clients", JSON.stringify(list));
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("crm_clients").insert([{
          name: newClient.name,
          whatsapp: newClient.whatsapp,
          city: newClient.city,
          preferred_sizes: newClient.preferredSizes,
          preferred_brands: newClient.preferredBrands,
          preferred_moods: newClient.preferredMoods,
          tags: newClient.tags,
          notes: newClient.notes,
          status: newClient.status
        }]);
        if (error) throw error;
      } catch (err) {
        serenaLogger.warn("Supabase CRM Insert Falló", err);
      }
    }

    return newClient;
  },

  /**
   * Actualiza el estado de una clienta.
   */
  async updateClientStatus(id: string, status: CRMClientStatus): Promise<void> {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_crm_clients");
      if (saved) {
        let list: CRMClient[] = JSON.parse(saved);
        list = list.map(c => c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c);
        localStorage.setItem("serena_crm_clients", JSON.stringify(list));
      }
    }

    if (isSupabaseConfigured() && id.includes("-")) {
      try {
        const { error } = await supabase
          .from("crm_clients")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
      } catch (e) {
        serenaLogger.error("Fallo al actualizar estado CRM", e);
      }
    }
  },

  /**
   * Obtiene la línea de tiempo de una clienta.
   */
  async getClientInteractions(clientId: string): Promise<CRMInteraction[]> {
    if (isSupabaseConfigured() && clientId.includes("-")) {
      try {
        const { data, error } = await supabase
          .from("crm_interactions")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        if (data) {
          return data.map((row: any) => ({
            id: row.id,
            clientId: row.client_id,
            type: row.type as CRMInteractionType,
            description: row.description,
            metadata: row.metadata,
            createdAt: row.created_at
          }));
        }
      } catch (e) {
        serenaLogger.error("Error obteniendo interactions", e);
      }
    }
    return [];
  },

  /**
   * Agrega una interacción al timeline de la clienta.
   */
  async addInteraction(clientId: string, type: CRMInteractionType, description: string, metadata: Record<string, any> = {}): Promise<void> {
    const now = new Date().toISOString();
    // 1. Update last contact
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_crm_clients");
      if (saved) {
        let list: CRMClient[] = JSON.parse(saved);
        list = list.map(c => c.id === clientId ? { ...c, lastContactAt: now } : c);
        localStorage.setItem("serena_crm_clients", JSON.stringify(list));
      }
    }

    if (isSupabaseConfigured() && clientId.includes("-")) {
      try {
        await supabase.from("crm_clients").update({ last_contact_at: now }).eq("id", clientId);
        
        const { error } = await supabase.from("crm_interactions").insert({
          client_id: clientId,
          type,
          description,
          metadata,
          created_at: now
        });
        if (error) throw error;
      } catch (e) {
        serenaLogger.error("Error agregando interaction CRM", e);
      }
    }
  }
};

// =====================================================================
// SECCIÓN DE ANÁLISIS UX & VISTA PRIVADA (FASE 15)
// =====================================================================

export const uxService = {
  /**
   * Obtiene todos los feedbacks cualitativos.
   */
  async getFeedback(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("editorial_feedback")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        serenaLogger.error("Error cargando feedback", err);
      }
    }
    
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_feedback_temp");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  },

  /**
   * Obtiene los eventos de telemetría UX anónimos.
   */
  async getUXEvents(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("ux_events")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        serenaLogger.error("Error cargando ux_events", err);
      }
    }
    
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_ux_events_temp");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  }
};

// =====================================================================
// SECCIÓN DE RESERVAS PREMIUM Y TEMPLATES (FASE 17 BLOQUE 3)
// =====================================================================



// Seeding de datos mock del modo DEMO para showroom Salta
const MOCK_RESERVATIONS: BoutiqueReservation[] = [
  {
    id: "res-demo-1",
    clientName: "Sofia Belgrano",
    whatsappNumber: "+5493874556677",
    productTitle: "Bustier Hope Satin",
    size: "95",
    status: "reserved",
    notes: "Clienta VIP, le encanta el color Moka Satin. Seña del 50% abonada.",
    createdAt: new Date(Date.now() - 1000 * 3600 * 4).toISOString(), // 4h ago
    expiresAt: new Date(Date.now() + 1000 * 3600 * 20).toISOString(), // 20h left
    updatedAt: new Date(Date.now() - 1000 * 3600 * 4).toISOString(),
    historyLogs: [
      { status: "draft", timestamp: new Date(Date.now() - 1000 * 3600 * 5).toISOString() },
      { status: "reserved", timestamp: new Date(Date.now() - 1000 * 3600 * 4).toISOString() }
    ]
  },
  {
    id: "res-demo-2",
    clientName: "Milagros Ortiz",
    whatsappNumber: "+5493874112233",
    productTitle: "Set Valisere Bridal Rose",
    size: "90",
    status: "contacted",
    notes: "Interesada en probador Bridal para Junio. Pendiente confirmar talle.",
    createdAt: new Date(Date.now() - 1000 * 3600 * 24).toISOString(), // 24h ago
    expiresAt: new Date(Date.now() - 1000 * 3600 * 12).toISOString(), // expired
    updatedAt: new Date(Date.now() - 1000 * 3600 * 18).toISOString(),
    historyLogs: [
      { status: "draft", timestamp: new Date(Date.now() - 1000 * 3600 * 25).toISOString() },
      { status: "reserved", timestamp: new Date(Date.now() - 1000 * 3600 * 24).toISOString() },
      { status: "contacted", timestamp: new Date(Date.now() - 1000 * 3600 * 18).toISOString() }
    ]
  },
  {
    id: "res-demo-3",
    clientName: "Camila Figueroa",
    whatsappNumber: "+5493875889900",
    productTitle: "Body Darling Noir",
    size: "95",
    status: "confirmed",
    notes: "Confirmó retiro para hoy por la tarde en Showroom.",
    createdAt: new Date(Date.now() - 1000 * 3600 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 3600 * 46).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 3600 * 1).toISOString(),
    historyLogs: [
      { status: "draft", timestamp: new Date(Date.now() - 1000 * 3600 * 3).toISOString() },
      { status: "reserved", timestamp: new Date(Date.now() - 1000 * 3600 * 2).toISOString() },
      { status: "confirmed", timestamp: new Date(Date.now() - 1000 * 3600 * 1).toISOString() }
    ]
  }
];

export const showroomReservationsService = {
  /**
   * Obtiene todas las reservas de boutique
   */
  async getReservations(mode: "DEMO" | "SHOWROOM" | "OPERATIVO"): Promise<BoutiqueReservation[]> {
    if (mode === "DEMO") {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("serena_demo_reservations");
        if (stored) return JSON.parse(stored);
        localStorage.setItem("serena_demo_reservations", JSON.stringify(MOCK_RESERVATIONS));
      }
      return MOCK_RESERVATIONS;
    }

    // Cargar de Local
    let localList: BoutiqueReservation[] = [];
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_showroom_reservations");
      if (saved) localList = JSON.parse(saved);
    }

    // Cargar de Supabase stock_reservations
    if (isSupabaseConfigured() && mode === "OPERATIVO") {
      try {
        const { data, error } = await supabase
          .from("stock_reservations")
          .select(`
            id,
            expires_at,
            created_at,
            quantity,
            product_variants (
              size,
              products (title)
            )
          `);

        if (error) throw error;
        
        if (data) {
          const dbMapped: BoutiqueReservation[] = data.map((row: any) => ({
            id: row.id,
            clientName: "Clienta Showroom",
            whatsappNumber: "+549387000000",
            productTitle: row.product_variants?.products?.title || "Look Serena",
            size: row.product_variants?.size || "95",
            status: new Date(row.expires_at) < new Date() ? "expired" : "reserved",
            createdAt: row.created_at,
            expiresAt: row.expires_at,
            updatedAt: row.created_at,
            notes: `Cantidad reservada: ${row.quantity}`,
            historyLogs: [{ status: "reserved", timestamp: row.created_at }]
          }));

          // Sincronizar unificando
          const unificadas = [...dbMapped, ...localList.filter(l => !l.id.includes("-"))];
          return unificadas;
        }
      } catch (err) {
        serenaLogger.warn("Error cargando reservas de Supabase, utilizando local fallback.");
      }
    }

    return localList;
  },

  /**
   * Crea una nueva reserva
   */
  async createReservation(
    input: { clientName: string; whatsappNumber: string; productTitle: string; size: string; notes?: string },
    mode: "DEMO" | "SHOWROOM" | "OPERATIVO"
  ): Promise<BoutiqueReservation> {
    const now = new Date().toISOString();
    const expires = new Date(Date.now() + 1000 * 3600 * 24).toISOString(); // 24 horas default

    const newRes: BoutiqueReservation = {
      id: `res-${Math.random().toString(36).substring(2, 9)}`,
      clientName: input.clientName,
      whatsappNumber: input.whatsappNumber,
      productTitle: input.productTitle,
      size: input.size,
      status: "reserved",
      notes: input.notes || "",
      createdAt: now,
      expiresAt: expires,
      updatedAt: now,
      historyLogs: [
        { status: "draft", timestamp: now },
        { status: "reserved", timestamp: now }
      ]
    };

    const key = mode === "DEMO" ? "serena_demo_reservations" : "serena_showroom_reservations";
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(key);
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(newRes);
      localStorage.setItem(key, JSON.stringify(list));
    }

    return newRes;
  },

  /**
   * Modifica el estado de una reserva
   */
  async updateReservationStatus(
    id: string,
    status: ReservationStatus,
    mode: "DEMO" | "SHOWROOM" | "OPERATIVO"
  ): Promise<void> {
    const key = mode === "DEMO" ? "serena_demo_reservations" : "serena_showroom_reservations";
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(key);
      if (saved) {
        let list: BoutiqueReservation[] = JSON.parse(saved);
        list = list.map(r => {
          if (r.id === id) {
            const logs = r.historyLogs || [];
            return {
              ...r,
              status,
              updatedAt: new Date().toISOString(),
              historyLogs: [...logs, { status, timestamp: new Date().toISOString() }]
            };
          }
          return r;
        });
        localStorage.setItem(key, JSON.stringify(list));
      }
    }
  }
};

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: "temp-1",
    category: "reserva",
    title: "Reserva Confirmada 🩰",
    content: "Hola {{name}} ✨ Guardamos tu selección de Serena por aquí. Reservamos el look *{{product}}* en talle *{{size}}* especialmente para vos. Cuando desees coordinamos tu visita para probártelas 🤍"
  },
  {
    id: "temp-2",
    category: "reingreso",
    title: "Aviso de Reingreso 🌸",
    content: "Hola {{name}} ✨ Te escribo con una hermosa noticia: el look *{{product}}* en talle *{{size}}* que tanto te gustó ya está disponible en nuestro showroom. Avisame si querés que te guardemos una prenda de tu talle antes de que se agote 🩰"
  },
  {
    id: "temp-3",
    category: "seguimiento",
    title: "Seguimiento Calce 🤍",
    content: "Hola {{name}} 🌸 ¿Cómo estás? Te escribo para saber si pudiste probarte las prendas que te llevaste. Si necesitas asesoramiento con el calce o algún ajuste, podemos ayudarte personalmente. ¡Que los disfrutes! ✨"
  },
  {
    id: "temp-4",
    category: "agradecimiento",
    title: "Gracias por visitarnos ✨",
    content: "Gracias por visitarnos hoy en Serena Intimates {{name}} 🤍 Fue un absoluto placer guiarte a elegir tus prendas. ¡Espero que disfrutes muchísimo de tus nuevos looks premium! 🩰"
  },
  {
    id: "temp-5",
    category: "showroom",
    title: "Invitación Showroom 🩰",
    content: "Hola {{name}} ✨ Quería contarte que ya abrimos las puertas del showroom en Salta. Tenemos prendas hermosas listas para probadores. ¿Te gustaría agendar una cita para recibir atención privada hoy? 🌸"
  },
  {
    id: "temp-6",
    category: "wishlist",
    title: "Wishlist Guardada 💖",
    content: "Hola {{name}} ✨ Vi que guardaste el look *{{product}}* en tu wishlist. Es un diseño delicado con detalles textiles increíbles. Si gustas, coordinamos una prueba privada en el showroom para vos 🤍"
  },
  {
    id: "temp-7",
    category: "novias",
    title: "Línea Bridal Soft 🤍",
    content: "Hola {{name}} 🤍 Te escribo para presentarte nuestra línea Bridal Soft exclusiva de Serena. Diseños delicados creados para acompañarte en tu día más especial. Si deseás, te brindo asesoramiento privado hoy ✨"
  },
  {
    id: "temp-8",
    category: "premium brasil",
    title: "Selección Brasilera 🇧🇷",
    content: "Hola {{name}} 🇧🇷 Te comparto la curaduría exclusiva directa de Brasil de esta semana. Quedan muy pocos diseños en stock. Avisame si te reservamos este look para vos antes de tu visita al Showroom 🩰"
  }
];

export const templatesService = {
  /**
   * Obtiene todas las plantillas editables
   */
  async getTemplates(): Promise<MessageTemplate[]> {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_message_templates");
      if (saved) return JSON.parse(saved);
      localStorage.setItem("serena_message_templates", JSON.stringify(DEFAULT_TEMPLATES));
    }
    return DEFAULT_TEMPLATES;
  },

  /**
   * Actualiza el contenido de una plantilla
   */
  async updateTemplate(id: string, content: string): Promise<void> {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("serena_message_templates");
      const list: MessageTemplate[] = saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
      const updated = list.map(t => t.id === id ? { ...t, content } : t);
      localStorage.setItem("serena_message_templates", JSON.stringify(updated));
    }
  }
};
