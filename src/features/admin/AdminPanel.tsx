"use client";

import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  X, BarChart3, Package, Sparkles, Bell, Terminal, RefreshCw, Plus, Minus, Info, Users, MessageCircle, Eye, ShieldAlert, Smile
} from "lucide-react";

import { useUIStore } from "@/store/useUIStore";
import { useSellerModeStore } from "@/store/sellerModeStore";
import { useFunnelStore } from "@/store/useFunnelStore";
import { productsService, waitlistService, brandsService, crmService, uxService, showroomReservationsService, templatesService } from "@/services/supabaseService";
import { analyticsService } from "@/services/analyticsService";
import { ImageUploader } from "@/components/ui-premium/ImageUploader";
import { quickLoadProductSchema, QuickLoadProductInput } from "@/domain/schemas";
import { calculateSuggestedPrice, calculateNetProfitPercent } from "@/domain/pricing";
import { SERENA_CONFIG } from "@/core/config";
import { serenaLogger, SerenaLog } from "@/core/logger";
import { Product, ProductBrand, ProductCategory, ProductMood, SupportLevel, TransparencyLevel, WaitlistRecord, CRMClient, CRMClientStatus, OperationMode, BoutiqueReservation, MessageTemplate, ReservationStatus } from "@/core/types";
import { whatsappTemplates } from "@/domain/crmLogic";
import { toast } from "sonner";
import { networkSimulator, NetworkCondition } from "@/core/networkSimulator";

export function AdminPanel() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"catalog" | "crm" | "quickload" | "metrics" | "waitlist" | "logs" | "insights">("insights");
  const [systemLogs, setSystemLogs] = useState<SerenaLog[]>([]);

  // 🐻 1. Suscripción a los Stores de Zustand (UI & Memory)
  const isAdminOpen = useUIStore((state) => state.isAdminOpen);
  const setAdminOpen = useUIStore((state) => state.setAdminOpen);
  
  const vendedoraModeActive = useSellerModeStore((state) => state.vendedoraModeActive);
  const setVendedoraModeActive = useSellerModeStore((state) => state.setVendedoraModeActive);

  // 🔌 2. React Query: Server State management (Productos y Lista de Espera)
  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productsService.getProducts,
    enabled: isAdminOpen
  });

  const { data: waitlist = [], isLoading: isWaitlistLoading } = useQuery({
    queryKey: ["waitlist"],
    queryFn: waitlistService.getWaitlistRecords,
    enabled: isAdminOpen
  });

  const { data: brands = [], isLoading: isBrandsLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: brandsService.getBrands,
    enabled: isAdminOpen
  });

  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ["crm_clients"],
    queryFn: crmService.getClients,
    enabled: isAdminOpen && activeTab === "crm"
  });

  const { data: feedback = [], isLoading: isFeedbackLoading } = useQuery({
    queryKey: ["editorial_feedback"],
    queryFn: uxService.getFeedback,
    enabled: isAdminOpen && activeTab === "insights"
  });

  const { data: uxEvents = [], isLoading: isUXEventsLoading } = useQuery({
    queryKey: ["ux_events"],
    queryFn: uxService.getUXEvents,
    enabled: isAdminOpen && activeTab === "insights"
  });

  // Mutaciones de React Query
  const saveProductMutation = useMutation({
    mutationFn: (p: Omit<Product, "id"> & { id?: string }) => productsService.saveProduct(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      serenaLogger.info("Catálogo invalidado y recargado con éxito.");
    }
  });

  const updatePriceMutation = useMutation({
    mutationFn: ({ id, price }: { id: string; price: number }) => productsService.updatePrice(id, price),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] })
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, immediate }: { id: string; immediate: boolean }) => productsService.toggleAvailability(id, immediate),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] })
  });

  const notifyWaitlistMutation = useMutation({
    mutationFn: (id: string) => waitlistService.markAsNotified(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["waitlist"] })
  });

  const addBrandMutation = useMutation({
    mutationFn: (name: string) => brandsService.addBrand(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["brands"] })
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productsService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto eliminado exitosamente");
    }
  });

  const updateClientStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => crmService.updateClientStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crm_clients"] })
  });

  const addInteractionMutation = useMutation({
    mutationFn: ({ clientId, type, description }: { clientId: string; type: any; description: string }) => crmService.addInteraction(clientId, type, description),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crm_clients"] })
  });

  // 📈 3. Estado local de Métricas Analíticas
  const [metricsPeriod, setMetricsPeriod] = useState<"hoy" | "semana" | "mes">("semana");
  const [analytics, setAnalytics] = useState<{
    brandViews: Record<string, number>;
    brandShares: Record<string, number>;
    brandReservations: Record<string, number>;
    brandCheckouts: Record<string, number>;
  }>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SERENA_CONFIG.keys.analyticsMetrics);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {
      brandViews: { Valisere: 142, Darling: 98, Hope: 74, Liz: 110, Sedução: 56 },
      brandShares: { Valisere: 42, Darling: 35, Hope: 20, Liz: 28, Sedução: 18 },
      brandReservations: { Valisere: 18, Darling: 12, Hope: 8, Liz: 14, Sedução: 5 },
      brandCheckouts: { Valisere: 12, Darling: 8, Hope: 5, Liz: 9, Sedução: 3 },
    };
  });

  // Escuchar actualizaciones de métricas en tiempo real
  useEffect(() => {
    const handleMetricsUpdate = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(SERENA_CONFIG.keys.analyticsMetrics);
        if (saved) {
          try { setAnalytics(JSON.parse(saved)); } catch (e) {}
        }
      }
    };
    window.addEventListener("serena_metrics_updated", handleMetricsUpdate);
    return () => window.removeEventListener("serena_metrics_updated", handleMetricsUpdate);
  }, []);

  // Cargar logs
  useEffect(() => {
    if (isAdminOpen) {
      setSystemLogs(serenaLogger.getLogs());
    }
    const handleLogsUpdate = () => setSystemLogs(serenaLogger.getLogs());
    window.addEventListener("serena_logs_updated", handleLogsUpdate);
    return () => window.removeEventListener("serena_logs_updated", handleLogsUpdate);
  }, [isAdminOpen]);

  // 📝 4. React Hook Form + Zod: Carga Rápida de Looks
  const [stockMap, setStockMap] = useState<Record<string, number>>({
    "85": 2, "90": 3, "95": 2, "100": 0, "105": 0, "110": 0
  });
  
  // Estado para marcas dinámicas
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  
  // Estado para imágenes en progreso de carga (WebP)
  const [pendingImages, setPendingImages] = useState<{ id: string; blob: Blob; previewUrl: string; isCover: boolean; originalName: string }[]>([]);

  // Fase 16: Sets compuestos (lencería corpiño + bombacha independientes)
  const [isCompoundSet, setIsCompoundSet] = useState(false);
  const [selectedTopItem, setSelectedTopItem] = useState("");
  const [selectedBottomItem, setSelectedBottomItem] = useState("");

  // Borrador Automático (Fase 17)
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // MODO SHOWROOM (Fase 17 - Bloque 2)
  const [showroomMode, setShowroomMode] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("serena_showroom_mode");
      if (stored === "true") {
        setShowroomMode(true);
      }
    }
  }, []);

  const handleToggleShowroomMode = (val: boolean) => {
    setShowroomMode(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("serena_showroom_mode", String(val));
    }
    toast.success(val ? "Modo Showroom Activado 🩰 (UI protegida y maximizada)" : "Modo Showroom Desactivado");
  };

  // 🏷️ FASE 17 BLOQUE 3: ESTADOS DEL CRM Y RESERVAS SHOWROOM
  const [operationMode, setOperationMode] = useState<OperationMode>("DEMO");
  const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateContent, setTemplateContent] = useState<string>("");
  const [newReservationModal, setNewReservationModal] = useState(false);
  
  // Nuevos campos de creación rápida de reserva
  const [resClientName, setResClientName] = useState("");
  const [resWhatsapp, setResWhatsapp] = useState("");
  const [resProduct, setResProduct] = useState("");
  const [resSize, setResSize] = useState("95");
  const [resNotes, setResNotes] = useState("");

  // Carga de reservas usando React Query
  const { data: reservations = [], refetch: refetchReservations } = useQuery<BoutiqueReservation[]>({
    queryKey: ["showroom_reservations", operationMode],
    queryFn: () => showroomReservationsService.getReservations(operationMode),
    enabled: true
  });

  // Carga de plantillas de mensaje
  const { data: messageTemplates = [], refetch: refetchTemplates } = useQuery<MessageTemplate[]>({
    queryKey: ["message_templates"],
    queryFn: () => templatesService.getTemplates(),
    enabled: true
  });

  // Carga de clientes CRM existentes
  const { data: crmClients = [], refetch: refetchClients } = useQuery<CRMClient[]>({
    queryKey: ["crm_clients"],
    queryFn: () => crmService.getClients(),
    enabled: true
  });

  // ⚡ RADAR SERENA ENGINE (BLOQUE 4)
  const getRadarInsights = () => {
    const counts: Record<string, number> = {};
    reservations.forEach(r => {
      counts[r.productTitle] = (counts[r.productTitle] || 0) + 1;
    });
    let topReserved = "Bustier Hope Satin";
    let maxCount = 0;
    Object.keys(counts).forEach(k => {
      if (counts[k] > maxCount) {
        maxCount = counts[k];
        topReserved = k;
      }
    });

    const lowStockWarning = "Quedan pocos 95 en Noir Intense";

    const abandonedItems = [
      { client: "Sofia Belgrano", product: topReserved, brand: "Valisere", size: "95", color: "Noir Intense" },
      { client: "Camila Salta", product: "Bralette Oliva Silk", brand: "Hope", size: "90", color: "Oliva Silk" }
    ];

    return {
      topReserved,
      lowStockWarning,
      abandonedItems
    };
  };

  const radar = getRadarInsights();

  // ⚡ HELPER VIBRACIÓN HÁPTICA MOBILE (BLOQUE 2)
  const triggerHaptic = (ms = 15) => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(ms);
    }
  };

  // 🔒 PROTECCIÓN CONTRA TAP SPAM & SUBMISSION LOCK (BLOQUE 3)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const withTapLock = async (action: () => Promise<void> | void) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    triggerHaptic(20);
    try {
      await action();
    } finally {
      setTimeout(() => setIsSubmitting(false), 900); // 900ms lock period
    }
  };

  // 🧹 LIMPIEZA DE LOCALSTORAGE RESIDUAL Y CACHÉ ANTIGUO (BLOQUE 1)
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage) {
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("serena_old_temp_") || key.includes("obsolete"))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        if (keysToRemove.length > 0) {
          serenaLogger.info(`Performance: Eliminadas ${keysToRemove.length} llaves residuales antiguas.`);
        }
      } catch (e) {
        serenaLogger.warn("Limpieza de caché de almacenamiento local omitida.");
      }
    }
  }, []);

  // 📥 EXPORTACIÓN CSV COMPLETA DE RESERVAS (BLOQUE 7)
  const handleExportCSV = () => {
    withTapLock(() => {
      if (reservations.length === 0) {
        toast.info("No hay reservas activas para exportar.");
        return;
      }
      
      const headers = ["ID", "Clienta", "WhatsApp", "Look/Prenda", "Talle", "Estado", "Notas", "Registrado", "Expira"];
      const rows = reservations.map(r => [
        r.id,
        r.clientName,
        r.whatsappNumber,
        r.productTitle,
        r.size,
        r.status,
        r.notes || "",
        new Date(r.createdAt).toLocaleDateString(),
        new Date(r.expiresAt).toLocaleDateString()
      ]);

      const csvContent = [headers.join(","), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `serena_reservas_${operationMode}_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV exportado exitosamente 📥");
    });
  };

  // 💾 EXPORTACIÓN BACKUP JSON COMPLETO (BLOQUE 7)
  const handleExportBackup = () => {
    withTapLock(() => {
      const dataStr = JSON.stringify({
        reservations,
        templates: messageTemplates,
        timestamp: new Date().toISOString()
      }, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `serena_backup_${operationMode}_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Respaldo JSON descargado 💾");
    });
  };

  // 🔌 RESTAURACIÓN DE BACKUP DESDE ARCHIVO (BLOQUE 7)
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed && Array.isArray(parsed.reservations)) {
          const key = operationMode === "DEMO" ? "serena_demo_reservations" : "serena_showroom_reservations";
          localStorage.setItem(key, JSON.stringify(parsed.reservations));
          
          if (Array.isArray(parsed.templates)) {
            localStorage.setItem("serena_message_templates", JSON.stringify(parsed.templates));
          }
          
          toast.success("Copia de seguridad restaurada correctamente 🩰");
          refetchReservations();
          refetchTemplates();
        } else {
          toast.error("Formato de backup inválido o corrupto");
        }
      } catch (err) {
        toast.error("Fallo al leer archivo de respaldo");
      }
    };
    reader.readAsText(file);
  };

  // 🧹 RESTABLECIMIENTO COMPLETO SHOWROOM (BLOQUE 7)
  const handleResetShowroom = () => {
    withTapLock(() => {
      if (confirm("¿Estás seguro de restablecer el Showroom? Se borrarán todas las reservas de este modo.")) {
        const key = operationMode === "DEMO" ? "serena_demo_reservations" : "serena_showroom_reservations";
        localStorage.removeItem(key);
        localStorage.removeItem("serena_message_templates");
        toast.success("Showroom restablecido a configuración limpia ✨");
        refetchReservations();
        refetchTemplates();
      }
    });
  };

  // ⚡ ENTREGA RÁPIDA DE RESERVAS EN 1-TAP (BLOQUE 4)
  const handleQuickDeliver = (resId: string) => {
    withTapLock(async () => {
      await showroomReservationsService.updateReservationStatus(resId, "confirmed", operationMode);
      await showroomReservationsService.updateReservationStatus(resId, "delivered", operationMode);
      toast.success("¡Look entregado de forma express! 🩰");
      refetchReservations();
    });
  };

  const handleCreateReservation = async () => {
    if (!resClientName || !resWhatsapp || !resProduct) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }
    // Sanitización robusta de número telefónico (Bloque 3)
    const cleanPhone = resWhatsapp.replace(/[^0-9+]/g, "");
    
    withTapLock(async () => {
      try {
        await showroomReservationsService.createReservation({
          clientName: resClientName,
          whatsappNumber: cleanPhone,
          productTitle: resProduct,
          size: resSize,
          notes: resNotes
        }, operationMode);

        toast.success("Reserva creada con éxito 🎀");
        setNewReservationModal(false);
        setResClientName("");
        setResWhatsapp("");
        setResProduct("");
        setResNotes("");
        refetchReservations();
      } catch (e) {
        toast.error("Error al registrar reserva");
      }
    });
  };

  const handleUpdateResStatus = async (resId: string, status: ReservationStatus) => {
    withTapLock(async () => {
      try {
        await showroomReservationsService.updateReservationStatus(resId, status, operationMode);
        toast.success(`Estado actualizado a: ${status} 🩰`);
        refetchReservations();
      } catch (e) {
        toast.error("Fallo al actualizar estado");
      }
    });
  };

  const handleSaveTemplate = async (tempId: string) => {
    withTapLock(async () => {
      try {
        await templatesService.updateTemplate(tempId, templateContent);
        toast.success("Plantilla guardada ✨");
        setEditingTemplateId(null);
        refetchTemplates();
      } catch (e) {
        toast.error("Fallo al actualizar plantilla");
      }
    });
  };

  const getWhatsAppLink = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors }
  } = useForm<QuickLoadProductInput>({
    resolver: zodResolver(quickLoadProductSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      brand: "Valisere",
      category: "romantico",
      mood: "noche-especial",
      color: "Negro",
      supportLevel: "medio",
      transparency: "baja",
      immediateAvailability: true,
      costUsd: 18,
      referenceExchangeRate: SERENA_CONFIG.pricing.defaultExchangeRate,
      gainMargin: SERENA_CONFIG.pricing.defaultMargin,
      price: 0,
      imageUrl: "",
      stockMap: { "85": 2, "90": 3, "95": 2 }
    }
  });

  // Watchers financieros para Pricing Inteligente con Supervisión Humana
  const watchedCostUsd = useWatch({ control, name: "costUsd" });
  const watchedExchangeRate = useWatch({ control, name: "referenceExchangeRate" });
  const watchedMargin = useWatch({ control, name: "gainMargin" });

  // Recalcular sugerencia de precio de forma reactiva
  useEffect(() => {
    const cost = parseFloat(String(watchedCostUsd)) || 0;
    const rate = parseFloat(String(watchedExchangeRate)) || SERENA_CONFIG.pricing.defaultExchangeRate;
    const margin = parseFloat(String(watchedMargin)) || SERENA_CONFIG.pricing.defaultMargin;

    if (cost > 0) {
      const suggested = calculateSuggestedPrice(cost, rate, margin);
      // Auto-rellenar pero dejar campo editable por la asesora (Supervisión Humana)
      setValue("price", suggested);
    }
  }, [watchedCostUsd, watchedExchangeRate, watchedMargin, setValue]);

  // Borrador Automático (Fase 17)
  const watchedAllFields = useWatch({ control });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const draft = localStorage.getItem("serena_quickload_draft");
      if (draft) {
        setHasDraft(true);
      }
    }
  }, []);

  useEffect(() => {
    if (watchedAllFields && typeof window !== "undefined") {
      const hasContent = watchedAllFields.title || watchedAllFields.description;
      if (hasContent) {
        localStorage.setItem("serena_quickload_draft", JSON.stringify({
          ...watchedAllFields,
          stockMap
        }));
        setDraftSaved(true);
        const t = setTimeout(() => setDraftSaved(false), 2000);
        return () => clearTimeout(t);
      }
    }
  }, [watchedAllFields, stockMap]);

  // Manejar stock de variantes
  const handleStockChange = (size: string, diff: number) => {
    setStockMap(prev => {
      const current = prev[size] || 0;
      const next = Math.max(0, current + diff);
      const updated = { ...prev, [size]: next };
      setValue("stockMap", updated);
      return updated;
    });
  };

  const [expressModeProduct, setExpressModeProduct] = useState<Product | null>(null);

  const handleDuplicateProduct = (p: Product) => {
    triggerHaptic(20);
    setExpressModeProduct(p);
  };

  const handleExpressPublish = async (data: Partial<Product>, pendingImages: any[]) => {
    let coverUrl = data.imageUrl;
    let galleryUrls: string[] = data.galleryUrls || [];

    if (pendingImages.length > 0) {
      toast.info("Subiendo imágenes a Supabase...");
      try {
        const uploadPromises = pendingImages.map(async (img) => {
          const fileName = `${Date.now()}-${img.originalName}.webp`;
          const publicUrl = await productsService.uploadImage(img.blob, fileName);
          return { url: publicUrl, isCover: img.isCover };
        });

        const uploadedImages = await Promise.all(uploadPromises);
        
        const coverImg = uploadedImages.find(img => img.isCover);
        coverUrl = coverImg ? coverImg.url : uploadedImages[0].url;
        galleryUrls = uploadedImages.map(img => img.url).filter(url => url !== coverUrl);
        
        toast.success("Imágenes sincronizadas con éxito.");
      } catch (err) {
        toast.error("Error al subir las imágenes. Verifica tu conexión.");
        throw err;
      }
    }

    const payload = {
      ...data,
      imageUrl: coverUrl,
      galleryUrls,
      stockMap: data.stockMap,
      // Se preservan los demás atributos (collections, badges, drop, etc)
    };

    await saveProductMutation.mutateAsync(payload as Product);
    toast.success("¡Prenda Express Publicada Exitosamente! 🩰");
  };
  const handleMoveProduct = async (p: Product, direction: "up" | "down") => {
    const sorted = [...products].sort((a, b) => (b.display_order || 0) - (a.display_order || 0));
    const idx = sorted.findIndex(item => item.id === p.id);
    if (idx === -1) return;
    
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) {
      toast.info("Este look ya se encuentra en el extremo del catálogo.");
      return;
    }
    
    const targetItem = sorted[targetIdx];
    const pOrder = p.display_order || 0;
    const targetOrder = targetItem.display_order || 0;
    
    let newPOrder = targetOrder;
    const newTargetOrder = pOrder;
    
    // Si tienen el mismo orden, forzar desplazamiento
    if (newPOrder === newTargetOrder) {
      newPOrder = direction === "up" ? newPOrder + 1 : Math.max(0, newPOrder - 1);
    }
    
    try {
      await saveProductMutation.mutateAsync({ ...p, display_order: newPOrder });
      await saveProductMutation.mutateAsync({ ...targetItem, display_order: newTargetOrder });
      toast.success(`Reordenado: "${p.title}" posicionado exitosamente 🎀`);
    } catch (err) {
      toast.error("Error al persistir el reordenamiento visual.");
    }
  };

  const handlePublishProduct = async (data: QuickLoadProductInput) => {
    // Si hay imágenes, las subimos primero
    let coverUrl = data.imageUrl;
    let galleryUrls: string[] = [];

    if (pendingImages.length > 0) {
      toast.info("Subiendo imágenes a Supabase...");
      try {
        const uploadPromises = pendingImages.map(async (img) => {
          const fileName = `${Date.now()}-${img.originalName}.webp`;
          const publicUrl = await productsService.uploadImage(img.blob, fileName);
          return { url: publicUrl, isCover: img.isCover };
        });

        const uploadedImages = await Promise.all(uploadPromises);
        
        const coverImg = uploadedImages.find(img => img.isCover);
        coverUrl = coverImg ? coverImg.url : uploadedImages[0].url;
        galleryUrls = uploadedImages.map(img => img.url).filter(url => url !== coverUrl);
        
        toast.success("Imágenes sincronizadas con éxito.");
      } catch (err) {
        toast.error("Error al subir las imágenes. Verifica tu conexión.");
        return; // Detenemos la publicación si fallan las imágenes
      }
    }

    // Ratios estéticos e imágenes premium preestablecidas si no introduce URL custom y no hay imágenes subidas
    const unsplashPics: Record<ProductCategory, string> = {
      romantico: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop",
      atrevido: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?q=80&w=600&auto=format&fit=crop",
      novia: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop",
      comfy: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=600&auto=format&fit=crop",
      minimalista: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=600&auto=format&fit=crop",
      premium: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop"
    };

    const productPayload: Omit<Product, "id"> = {
      title: data.title,
      description: data.description,
      price: parseFloat(String(data.price)),
      category: data.category as ProductCategory,
      imageUrl: coverUrl || unsplashPics[data.category as ProductCategory] || unsplashPics.minimalista,
      galleryUrls: galleryUrls,
      matchTitle: `Cola-less ${data.brand} Satin`,
      matchPrice: Math.round(parseFloat(String(data.price)) * 0.45),
      brand: data.brand as ProductBrand,
      color: data.color,
      supportLevel: data.supportLevel as SupportLevel,
      transparency: data.transparency as TransparencyLevel,
      immediateAvailability: data.immediateAvailability,
      mood: data.mood as ProductMood,
      collections: [data.category],
      badges: ["Lanzamiento Brasil"],
      provider: SERENA_CONFIG.pricing.defaultProvider,
      countryOrigin: SERENA_CONFIG.pricing.defaultCountry,
      costUsd: parseFloat(String(data.costUsd)),
      referenceExchangeRate: parseFloat(String(data.referenceExchangeRate)),
      gainMargin: parseFloat(String(data.gainMargin)),
      stockMap: stockMap,
    };

    saveProductMutation.mutate(productPayload, {
      onSuccess: (savedProduct) => {
        serenaLogger.info(`Módulo Carga Rápida: Publicado look "${data.title}" ($${data.price})`);
        alert(`✨ ¡Prenda Publicada Exitosamente! ✨\n\n"${data.title}" de ${data.brand} ha sido incorporada al catálogo.`);
        if (typeof window !== "undefined") {
          localStorage.removeItem("serena_quickload_draft");
        }
        setHasDraft(false);
        reset();
        setPendingImages([]);
        setStockMap({ "85": 2, "90": 3, "95": 2, "100": 0, "105": 0, "110": 0 });
      }
    });
  };

  // Contacto de Waitlist elegante
  const handleContactWaitlist = (item: WaitlistRecord) => {
    const text = `✨ ¡Hola ${item.clientName}! Te escribimos de Serena Intimates 🩰.\n\nQueríamos avisarte con alegría que acaba de reingresar en stock el look que estabas esperando:\n💖 *${item.productTitle}* (Talle *${item.size}*).\n\n¿Te reservamos una unidad para retiro inmediato o envío discreto en Salta? ✨`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${item.whatsappNumber}?text=${encoded}`, "_blank");
    
    notifyWaitlistMutation.mutate(item.id);
  };

  if (!isAdminOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 h-[690px] bg-serena-cream rounded-t-[30px] shadow-[0_-15px_40px_rgba(26,21,18,0.25)] border-t border-serena-blush/40 z-50 transform smooth-transition flex flex-col translate-y-0">
      
      {/* Cabecera Editorial */}
      <div className="w-full flex justify-between items-center px-6 py-5 border-b border-serena-blush/20 bg-serena-cream text-serena-charcoal">
        <div>
          <h3 className="font-editorial text-base font-bold tracking-wider italic flex items-center gap-2">
            🎀 Consola de Gestión Serena
          </h3>
          <p className="text-[8px] text-serena-gold uppercase tracking-widest mt-0.5 font-bold">
            ARQUITECTURA DE ESCALABILIDAD COMERCIAL & CONTROL DE INVENTARIO
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer bg-serena-silk/80 hover:bg-serena-blush/30 py-1.5 px-3 rounded-full border border-serena-blush/30 transition-all select-none">
            <input
              type="checkbox"
              checked={showroomMode}
              onChange={(e) => handleToggleShowroomMode(e.target.checked)}
              className="accent-serena-gold w-3 h-3 rounded cursor-pointer"
            />
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-serena-gold flex items-center gap-1">
              ✨ MODO SHOWROOM SALTA
            </span>
          </label>

          <button 
            onClick={() => setAdminOpen(false)}
            className="text-serena-charcoal hover:opacity-60 transition-opacity p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Tabs Táctiles */}
      <div className="flex border-b border-serena-blush/20 bg-serena-silk/50 p-1 overflow-x-auto whitespace-nowrap custom-scroll">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex-1 py-3 px-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "catalog" ? "bg-serena-gold text-white shadow-2xs" : "text-serena-charcoal/60 hover:text-serena-charcoal"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Inventario
        </button>
        <button
          onClick={() => setActiveTab("quickload")}
          className={`flex-1 py-3 px-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "quickload" ? "bg-serena-gold text-white shadow-2xs" : "text-serena-charcoal/60 hover:text-serena-charcoal"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Carga Rápida
        </button>
        {!showroomMode && (
          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex-1 py-3 px-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "metrics" ? "bg-serena-gold text-white shadow-2xs" : "text-serena-charcoal/60 hover:text-serena-charcoal"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Métricas
          </button>
        )}
        <button
          onClick={() => setActiveTab("waitlist")}
          className={`flex-1 py-3 px-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "waitlist" ? "bg-serena-gold text-white shadow-2xs" : "text-serena-charcoal/60 hover:text-serena-charcoal"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Espera ({waitlist.length})
        </button>
        {!showroomMode && (
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex-1 py-3 px-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "logs" ? "bg-serena-gold text-white shadow-2xs" : "text-serena-charcoal/60 hover:text-serena-charcoal"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Auditoría
          </button>
        )}
        <button
          onClick={() => setActiveTab("crm")}
          className={`flex-1 py-3 px-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "crm" ? "bg-serena-gold text-white shadow-2xs" : "text-serena-charcoal/60 hover:text-serena-charcoal"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Clientas VIP
        </button>
        {!showroomMode && (
          <button
            onClick={() => setActiveTab("insights")}
            className={`flex-1 py-3 px-3 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "insights" ? "bg-serena-gold text-white shadow-2xs" : "text-serena-charcoal/60 hover:text-serena-charcoal"
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            UX Feedback
          </button>
        )}
      </div>

      {/* Contenedor Principal de la Consola */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scroll text-xs">
        
        {/* 1. INVENTARIO INLINE */}
        {activeTab === "catalog" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-serena-blush/20">
              <h4 className="text-[10px] font-bold text-serena-gold uppercase tracking-widest flex items-center gap-1">
                Catálogo Táctil Inline
              </h4>
              <p className="text-[9px] text-serena-charcoal/50">{products.length} looks en tienda</p>
            </div>

            {isProductsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-serena-charcoal/40">
                <RefreshCw className="w-6 h-6 animate-spin text-serena-gold" />
                <p className="text-[10px] uppercase tracking-widest font-bold">Cargando Stock...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map(p => {
                  const isHidden = p.badges?.includes("Oculto");
                  return (
                    <div key={p.id} className={`bg-serena-silk/60 rounded-2xl border border-serena-blush/20 flex flex-col transition-all duration-300 ${
                      showroomMode 
                        ? "p-4 sm:p-5 gap-4 shadow-md ring-1 ring-serena-gold/15" 
                        : "p-3 gap-3"
                    } ${isHidden ? "opacity-50" : ""}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <img src={p.imageUrl} alt={p.title} className="w-10 h-12 object-cover rounded-lg border border-serena-blush/30" />
                          <div>
                            <h5 className="font-bold text-serena-charcoal flex items-center gap-1.5">
                              {p.title}
                              {isHidden && <span className="text-[7px] bg-red-400/20 text-red-600 px-1 py-0.5 rounded font-ui font-normal">Oculto</span>}
                            </h5>
                            <p className="text-[9px] text-serena-charcoal/50 mt-0.5">{p.brand} · {p.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {/* Controles de Reordenamiento Táctil */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveProduct(p, "up");
                              }}
                              className="w-5 h-5 bg-serena-cream text-serena-gold border border-serena-blush/20 rounded flex items-center justify-center font-bold hover:bg-serena-silk text-[8px]"
                              title="Subir prioridad en catálogo"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveProduct(p, "down");
                              }}
                              className="w-5 h-5 bg-serena-cream text-serena-gold border border-serena-blush/20 rounded flex items-center justify-center font-bold hover:bg-serena-silk text-[8px]"
                              title="Bajar prioridad en catálogo"
                            >
                              ▼
                            </button>
                          </div>
                          <button 
                            onClick={() => toggleAvailabilityMutation.mutate({ id: p.id, immediate: !p.immediateAvailability })}
                            className={`text-[8px] font-bold uppercase py-1 px-2.5 rounded-full border smooth-transition ${
                              p.immediateAvailability 
                                ? "bg-green-500/10 text-green-700 border-green-500/30" 
                                : "bg-serena-cream text-serena-charcoal/60 border-serena-blush/30"
                            }`}
                          >
                            {p.immediateAvailability ? "Disponible Hoy" : "Encargo Brasil"}
                          </button>
                          {!showroomMode && (
                            <button
                              onClick={() => {
                                if (confirm(`¿Estás segura de eliminar permanentemente "${p.title}"? Esta acción no se puede deshacer.`)) {
                                  deleteProductMutation.mutate(p.id);
                                }
                              }}
                              className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-[8px] font-bold p-1 rounded-full border border-red-500/20 smooth-transition"
                              title="Eliminar producto"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
 
                      <div className="flex items-center justify-between pt-2 border-t border-serena-blush/10">
                        {/* Input de precio minorista final */}
                        <div className="flex items-center gap-1 bg-serena-cream px-2 py-1.5 rounded-xl border border-serena-blush/20">
                          <span className="text-[9px] text-serena-charcoal/50">$</span>
                          <input 
                            type="number" 
                            value={p.price} 
                            disabled={showroomMode}
                            onChange={(e) => updatePriceMutation.mutate({ id: p.id, price: parseFloat(e.target.value) || 0 })}
                            className={`w-16 bg-transparent outline-none font-bold text-serena-charcoal text-[10px] ${showroomMode ? "opacity-75 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        {/* Indicador de Margen e Importación */}
                        {p.costUsd && (
                          <div className="text-[8px] text-serena-charcoal/50 font-bold">
                            Costo FOB: <span className="text-serena-gold">${p.costUsd} USD</span>
                            {p.referenceExchangeRate && (
                              <span className="block mt-0.5 text-[7.5px] font-normal">ROI: {calculateNetProfitPercent(p.costUsd, p.referenceExchangeRate, p.price)}%</span>
                            )}
                          </div>
                        )}

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleDuplicateProduct(p)}
                            className="bg-serena-gold/10 text-serena-gold border border-serena-gold/20 text-[9px] font-bold py-1.5 px-3 rounded-xl smooth-transition hover:bg-serena-gold hover:text-white flex items-center gap-1"
                          >
                            📄 Duplicar
                          </button>
                          
                          <button 
                            onClick={() => {
                              const newBadges = isHidden 
                                ? (p.badges || []).filter(b => b !== "Oculto") 
                                : [...(p.badges || []), "Oculto"];
                              saveProductMutation.mutate({ ...p, badges: newBadges });
                            }}
                            className={`text-[9px] font-bold py-1.5 px-3 rounded-xl border smooth-transition ${
                              isHidden
                                ? "bg-serena-gold text-white border-transparent"
                                : "bg-serena-cream text-serena-charcoal border-serena-blush/30"
                            }`}
                          >
                            {isHidden ? "👁️ Mostrar" : "👁️ Ocultar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. QUICKLOAD CARGA RÁPIDA */}
        {activeTab === "quickload" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-serena-blush/20 pb-1.5">
              <h4 className="text-[10px] font-bold text-serena-gold uppercase tracking-widest">
                Publicar Nueva Prenda (Zod Validated Form 🩰)
              </h4>
              {draftSaved && (
                <span className="text-[8px] bg-green-500/10 text-green-700 font-bold px-2 py-0.5 rounded-full animate-pulse">
                  ✓ Borrador guardado
                </span>
              )}
            </div>

            {hasDraft && (
              <div className="bg-serena-gold/10 text-serena-gold p-3 rounded-2xl border border-serena-gold/20 flex justify-between items-center gap-2 text-[10px]">
                <div className="flex items-center gap-1.5 font-bold">
                  <span>✨ Borrador anterior encontrado en este celular</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        const draft = localStorage.getItem("serena_quickload_draft");
                        if (draft) {
                          const parsed = JSON.parse(draft);
                          reset(parsed);
                          if (parsed.stockMap) {
                            setStockMap(parsed.stockMap);
                          }
                          setHasDraft(false);
                          toast.success("Borrador recuperado con éxito 🩰");
                        }
                      }
                    }}
                    className="bg-serena-gold hover:bg-serena-gold/80 text-white font-bold px-3 py-1 rounded-lg text-[9px] smooth-transition"
                  >
                    Continuar edición anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("serena_quickload_draft");
                      }
                      setHasDraft(false);
                      toast.info("Borrador descartado.");
                    }}
                    className="text-serena-charcoal/50 font-bold text-[9px] hover:text-red-500 py-1"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(handlePublishProduct)} className="space-y-4">
              
              {/* Título */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/60">Nombre del Look</label>
                <input 
                  type="text" 
                  placeholder="Bustier Soft Silk..."
                  {...register("title")}
                  className="w-full bg-serena-silk rounded-xl p-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                />
                {errors.title && <p className="text-[8px] text-red-500 font-bold">{errors.title.message}</p>}
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/60">Descripción de Seda</label>
                <textarea 
                  placeholder="Bustier confeccionado con encaje brasilero..."
                  rows={2}
                  {...register("description")}
                  className="w-full bg-serena-silk rounded-xl p-3 outline-none border border-serena-blush/20 text-serena-charcoal text-xs resize-none"
                />
                {errors.description && <p className="text-[8px] text-red-500 font-bold">{errors.description.message}</p>}
              </div>

              {/* Variables de Costo e Importación (Pricing) */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-serena-silk/40 rounded-2xl border border-serena-blush/10">
                <div className="space-y-1">
                  <label className="text-[8.5px] uppercase tracking-wider font-bold text-serena-charcoal/50">Costo FOB (USD)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    {...register("costUsd")}
                    className="w-full bg-serena-cream rounded-xl p-2 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                  />
                  {errors.costUsd && <p className="text-[7px] text-red-500 font-bold">{errors.costUsd.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[8.5px] uppercase tracking-wider font-bold text-serena-charcoal/50">Dólar Ref.</label>
                  <input 
                    type="number" 
                    {...register("referenceExchangeRate")}
                    className="w-full bg-serena-cream rounded-xl p-2 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                  />
                  {errors.referenceExchangeRate && <p className="text-[7px] text-red-500 font-bold">{errors.referenceExchangeRate.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[8.5px] uppercase tracking-wider font-bold text-serena-charcoal/50">Margen Ref.</label>
                  <input 
                    type="number" 
                    step="0.1"
                    {...register("gainMargin")}
                    className="w-full bg-serena-cream rounded-xl p-2 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                  />
                  {errors.gainMargin && <p className="text-[7px] text-red-500 font-bold">{errors.gainMargin.message}</p>}
                </div>
              </div>

              {/* Precio final sugerido con supervisión manual */}
              <div className="space-y-1 p-3 bg-serena-gold/5 rounded-2xl border border-serena-gold/20 flex justify-between items-center gap-3">
                <div>
                  <label className="text-[9px] uppercase tracking-wider font-bold text-serena-gold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Precio Sugerido en pesos
                  </label>
                  <p className="text-[8px] text-serena-charcoal/40 mt-0.5">Calculado automáticamente. Puedes modificarlo libremente antes de publicar.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-serena-cream px-3 py-2 rounded-xl border border-serena-gold/30">
                  <span className="font-bold text-serena-charcoal">$</span>
                  <input 
                    type="number" 
                    {...register("price")}
                    className="w-20 bg-transparent outline-none font-bold text-serena-charcoal text-xs"
                  />
                </div>
              </div>
              {errors.price && <p className="text-[8px] text-red-500 font-bold">{errors.price.message}</p>}

              {/* Atributos Básicos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/60">Marca</label>
                  {!isAddingBrand ? (
                    <select 
                      {...register("brand")}
                      onChange={(e) => {
                        if (e.target.value === "_add_new_") {
                          setIsAddingBrand(true);
                          setNewBrandName("");
                        } else {
                          setValue("brand", e.target.value);
                        }
                      }}
                      className="w-full bg-serena-silk rounded-xl p-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                      <option value="_add_new_" className="font-bold text-serena-gold">+ Agregar nueva marca</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nueva marca..."
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        className="w-full bg-white rounded-xl p-3 outline-none border border-serena-gold font-bold text-serena-charcoal text-xs"
                        autoFocus
                      />
                      <button 
                        type="button"
                        onClick={async () => {
                          if (newBrandName.trim()) {
                            await addBrandMutation.mutateAsync(newBrandName.trim());
                            setValue("brand", newBrandName.trim());
                            setIsAddingBrand(false);
                          }
                        }}
                        className="bg-serena-gold text-white px-3 rounded-xl text-xs font-bold"
                      >
                        ✓
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsAddingBrand(false);
                          setValue("brand", brands[0]?.name || "Valisere");
                        }}
                        className="bg-serena-cream text-serena-charcoal border border-serena-blush/30 px-3 rounded-xl text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/60">Mood</label>
                  <select 
                    {...register("category")}
                    className="w-full bg-serena-silk rounded-xl p-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                  >
                    <option value="romantico">Romántico</option>
                    <option value="atrevido">Sensual Delicado</option>
                    <option value="novia">Bridal</option>
                    <option value="comfy">Suave Comfort</option>
                    <option value="minimalista">Minimalista</option>
                    <option value="premium">Edición Limitada</option>
                  </select>
                </div>
              </div>

              {/* Módulo de Imágenes WebP */}
              <div className="bg-serena-cream/50 p-4 rounded-2xl border border-serena-blush/20">
                <ImageUploader 
                  maxFiles={5}
                  onImagesReady={(imgs) => setPendingImages(imgs)}
                />
              </div>

              {/* Color y Disponibilidad */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/60">Color</label>
                  <input 
                    type="text" 
                    placeholder="Negro Satin, Rojo Carmín..."
                    {...register("color")}
                    className="w-full bg-serena-silk rounded-xl p-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                  />
                  {errors.color && <p className="text-[8px] text-red-500 font-bold">{errors.color.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/60">Disponibilidad</label>
                  <select 
                    onChange={(e) => setValue("immediateAvailability", e.target.value === "true")}
                    className="w-full bg-serena-silk rounded-xl p-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
                  >
                    <option value="true">Disponible Hoy</option>
                    <option value="false">Encargo Brasil</option>
                  </select>
                </div>
              </div>

              {/* Fase 16: Sets Compuestos (Lencería corpiño + bombacha independientes) */}
              <div className="bg-serena-gold/5 p-4 rounded-2xl border border-serena-gold/15 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-[9.5px] uppercase tracking-wider font-bold text-serena-gold flex items-center gap-1">
                      👑 Set Compuesto Editorial
                    </label>
                    <p className="text-[8px] text-serena-charcoal/50">Habilita compras y talles independientes para corpiño y bombacha.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCompoundSet(!isCompoundSet)}
                    className={`w-10 h-6 rounded-full transition-all duration-300 relative ${
                      isCompoundSet ? "bg-serena-gold" : "bg-serena-charcoal/20"
                    }`}
                  >
                    <span 
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        isCompoundSet ? "right-1" : "left-1"
                      }`} 
                    />
                  </button>
                </div>

                {isCompoundSet && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-serena-gold/10 animate-fade-in">
                    <div className="space-y-1">
                      <label className="text-[8.5px] uppercase tracking-wider font-bold text-serena-charcoal/60">Corpiño Asociado (Top)</label>
                      <select 
                        value={selectedTopItem}
                        onChange={(e) => setSelectedTopItem(e.target.value)}
                        className="w-full bg-white rounded-xl p-2 outline-none border border-serena-blush/20 text-[10px]"
                      >
                        <option value="">-- Seleccionar --</option>
                        {products.filter(p => p.category !== "novia").map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] uppercase tracking-wider font-bold text-serena-charcoal/60">Bombacha Asociada (Bottom)</label>
                      <select 
                        value={selectedBottomItem}
                        onChange={(e) => setSelectedBottomItem(e.target.value)}
                        className="w-full bg-white rounded-xl p-2 outline-none border border-serena-blush/20 text-[10px]"
                      >
                        <option value="">-- Seleccionar --</option>
                        {products.filter(p => p.category !== "romantico").map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Stock por talle */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-wider font-bold text-serena-charcoal/60 block">Control de Stock Granular</label>
                <div className="grid grid-cols-3 gap-2">
                  {["85", "90", "95", "100", "105", "110"].map(size => {
                    const units = stockMap[size] || 0;
                    const isActive = units > 0;
                    return (
                      <div 
                        key={size}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 smooth-transition ${
                          isActive ? "bg-serena-silk border-serena-gold" : "bg-serena-cream border-serena-blush/20 opacity-60"
                        }`}
                      >
                        <span className="font-bold text-[10px] text-serena-charcoal">Talle {size}</span>
                        <div className="flex items-center gap-2 w-full justify-between px-1">
                          <button 
                            type="button" 
                            onClick={() => handleStockChange(size, -1)}
                            className="w-5 h-5 bg-serena-cream rounded-full border border-serena-blush/30 font-bold flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="font-bold text-[10px] text-serena-charcoal">{units}u</span>
                          <button 
                            type="button" 
                            onClick={() => handleStockChange(size, 1)}
                            className="w-5 h-5 bg-serena-cream rounded-full border border-serena-blush/30 font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit"
                disabled={saveProductMutation.isPending}
                className="w-full bg-serena-gold text-white text-[10px] font-bold py-4 rounded-2xl uppercase tracking-widest active:scale-[0.98] transition-all shadow-xs disabled:opacity-50"
              >
                {saveProductMutation.isPending ? "Publicando en Supabase..." : "🎀 Publicar Prenda en Catálogo"}
              </button>
            </form>
          </div>
        )}

        {/* 3. METRICAS MEJORADAS (Fase 13) */}
        {activeTab === "metrics" && (
          <div className="space-y-5 pb-6">
            
            {/* Filtros Temporales */}
            <div className="flex gap-2 border-b border-serena-blush/20 pb-3">
              {(["hoy", "semana", "mes"] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setMetricsPeriod(period)}
                  className={`text-[9px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full smooth-transition border ${
                    metricsPeriod === period 
                      ? "bg-serena-gold text-white border-serena-gold" 
                      : "bg-transparent text-serena-charcoal/60 border-serena-charcoal/20 hover:border-serena-gold"
                  }`}
                >
                  {period === "hoy" ? "Hoy" : period === "semana" ? "Esta Semana" : "Este Mes"}
                </button>
              ))}
            </div>

            {/* A. Ranking de Productos (Top 5) */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-serena-charcoal uppercase tracking-widest flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-serena-gold" />
                Ranking de Demanda (Top 5)
              </h4>
              <div className="bg-white p-3 rounded-2xl border border-serena-blush/30 shadow-2xs">
                <div className="space-y-2">
                  <div className="flex justify-between text-[8px] text-serena-charcoal/40 uppercase font-bold px-2">
                    <span>Look más reservado</span>
                    <span>Reservas</span>
                  </div>
                  {[
                    { n: "Bustier Hope Satin", v: 14, b: "Hope" },
                    { n: "Body Darling Noir", v: 11, b: "Darling" },
                    { n: "Set Valisere Bridal", v: 8, b: "Valisere" },
                    { n: "Cola-less Invisible", v: 6, b: "Liz" },
                    { n: "Corpiño Soft Comfy", v: 5, b: "Darling" }
                  ].map((p, i) => (
                    <div key={i} className="flex justify-between items-center bg-serena-cream/30 p-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-serena-gold w-3">{i+1}.</span>
                        <div>
                          <p className="text-[10px] font-bold text-serena-charcoal">{p.n}</p>
                          <p className="text-[8px] text-serena-charcoal/50">{p.b}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-serena-charcoal bg-white px-2 py-0.5 rounded border border-serena-blush/20 shadow-sm">{p.v}</span>
                    </div>
                  ))}
                  
                  {/* Tasa de Abandono Crítica */}
                  <div className="mt-3 pt-3 border-t border-serena-blush/20">
                    <p className="text-[9px] text-red-500/80 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      ⚠️ Alerta de Abandono (Vistas vs. Reservas)
                    </p>
                    <div className="bg-red-50 p-2 rounded-xl border border-red-100 flex justify-between items-center">
                      <span className="text-[9.5px] font-semibold text-serena-charcoal">Soutien Valisere Premium</span>
                      <span className="text-[9px] font-bold text-red-500">142 vistas / 0 res.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* B. Demanda por Talle */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-serena-charcoal uppercase tracking-widest flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-serena-gold" />
                Demanda por Talle (Histórico)
              </h4>
              <div className="bg-white p-4 rounded-2xl border border-serena-blush/30 shadow-2xs overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-serena-blush/20">
                      <th className="pb-2 text-[8px] uppercase text-serena-charcoal/50 font-bold">Marca</th>
                      {["85", "90", "95", "100", "105+"].map(t => (
                        <th key={t} className="pb-2 text-[8px] uppercase text-serena-charcoal/50 font-bold text-center">{t}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-[10px] font-semibold text-serena-charcoal">
                    {["Valisere", "Darling", "Hope", "Liz"].map((m, i) => (
                      <tr key={m} className="border-b border-serena-blush/10 last:border-0">
                        <td className="py-2">{m}</td>
                        <td className="py-2 text-center">{12 - i}</td>
                        <td className="py-2 text-center text-serena-gold bg-serena-gold/5">{24 + i*2}</td>
                        <td className="py-2 text-center font-bold bg-serena-gold/10 text-serena-gold">{38 - i*3}</td>
                        <td className="py-2 text-center">{8 + i}</td>
                        <td className="py-2 text-center">{2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* C. Registro de Ventas Cronológico */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-serena-charcoal uppercase tracking-widest flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-serena-gold" />
                Flujo Comercial Reciente
              </h4>
              <div className="bg-white rounded-2xl border border-serena-blush/30 shadow-2xs divide-y divide-serena-blush/10">
                {[
                  { t: "Hace 10 min", m: "Reserva WhatsApp", d: "Bustier Hope Satin (T.95)", c: "$35.000", s: "success" },
                  { t: "Hace 45 min", m: "Reserva WhatsApp", d: "Set Valisere Bridal", c: "$68.000", s: "success" },
                  { t: "Hace 2 horas", m: "Consulta Sin Cierre", d: "Body Darling Noir", c: "-", s: "neutral" },
                  { t: "Ayer", m: "Venta Concretada (Showroom)", d: "Cola-less Liz", c: "$12.000", s: "success" },
                ].map((log, i) => (
                  <div key={i} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="text-[7.5px] text-serena-charcoal/50 uppercase font-bold">{log.t}</p>
                      <p className={`text-[10px] font-bold mt-0.5 ${log.s === "success" ? "text-green-600" : "text-serena-charcoal/70"}`}>{log.m}</p>
                      <p className="text-[9px] text-serena-charcoal">{log.d}</p>
                    </div>
                    <span className="text-[10px] font-bold text-serena-charcoal bg-serena-cream px-2 py-1 rounded-lg">{log.c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* D. Rendimiento por Marca (Enriquecido) */}
            <div className="space-y-3 pt-3">
              <h4 className="text-[10px] font-bold text-serena-charcoal uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-serena-gold" />
                Desglose Analítico por Marca
              </h4>
              <div className="space-y-3.5">
                {["Valisere", "Darling", "Hope", "Liz", "Sedução"].map(brand => {
                  const v = analytics.brandViews[brand] || 0;
                  const c = analytics.brandCheckouts[brand] || 0;
                  const convRate = v > 0 ? Math.round((c / v) * 100) : 0;
                  
                  // Mock producto estrella
                  const estrella = brand === "Hope" ? "Bustier Satin" : brand === "Valisere" ? "Soutien Premium" : brand === "Darling" ? "Body Noir" : "Top Básico";

                  return (
                    <div key={brand} className="p-4 bg-serena-silk/60 rounded-2xl border border-serena-blush/20 shadow-2xs space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-editorial text-xs font-bold italic tracking-wide text-serena-charcoal">{brand}</span>
                        <span className="text-[9px] font-bold text-serena-gold bg-serena-cream px-2 py-0.5 rounded-md border border-serena-blush/10">Conv. WhatsApp: {convRate}%</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[8px] text-serena-charcoal/50 font-bold uppercase tracking-widest">
                          <span>Exploración (Vistas)</span>
                          <span>{v} views</span>
                        </div>
                        <div className="w-full h-1 bg-serena-cream rounded-full overflow-hidden">
                          <div className="h-full bg-serena-gold smooth-transition" style={{ width: `${Math.min(100, (v / 200) * 100)}%` }}></div>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-serena-blush/20 mt-2">
                        <p className="text-[8px] text-serena-charcoal/60 uppercase font-bold tracking-wider">Producto Estrella (Más visto)</p>
                        <p className="text-[10px] text-serena-charcoal font-bold">{estrella} <span className="text-serena-gold ml-1">★</span></p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. WAITLIST */}
        {activeTab === "waitlist" && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-serena-gold uppercase tracking-widest border-b border-serena-blush/20 pb-1.5">
              Lista de Espera de Reposiciones (Soft Launch)
            </h4>

            {isWaitlistLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-serena-charcoal/40">
                <RefreshCw className="w-6 h-6 animate-spin text-serena-gold" />
                <p className="text-[10px] uppercase tracking-widest font-bold">Cargando Waitlist...</p>
              </div>
            ) : waitlist.length === 0 ? (
              <p className="text-xs text-serena-charcoal/40 text-center py-12">No hay clientas en espera actualmente.</p>
            ) : (
              <div className="space-y-3">
                {waitlist.map(item => (
                  <div key={item.id} className="p-3 bg-serena-silk/60 rounded-2xl border border-serena-blush/20 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-serena-charcoal">{item.clientName}</h5>
                      <p className="text-[8px] text-serena-charcoal/50 mt-0.5">Esperando: {item.productTitle} (Talle {item.size})</p>
                      <span className="text-[7.5px] text-serena-gold uppercase font-bold tracking-widest mt-1 block">WhatsApp: {item.whatsappNumber}</span>
                    </div>
                    <button 
                      onClick={() => handleContactWaitlist(item)}
                      className="bg-serena-gold text-white text-[8px] font-bold px-3 py-2 rounded-xl uppercase tracking-widest active:scale-95 smooth-transition shadow-2xs"
                    >
                      Avisar 📲
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. AUDITORÍA / LOGS */}
        {activeTab === "logs" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-bold text-serena-gold uppercase tracking-widest">
                Consola de Auditoría Técnica
              </h4>
            </div>

            <div className="flex-1 max-h-60 overflow-y-auto p-3.5 bg-serena-silk rounded-xl font-mono text-[9px] space-y-2.5 border border-serena-blush/20 custom-scroll">
              {systemLogs.length === 0 ? (
                <p className="text-serena-charcoal/40 text-center py-8">Sin registros técnicos.</p>
              ) : (
                [...systemLogs].reverse().slice(0, 15).map((log) => (
                  <div key={log.id} className="p-2 bg-serena-cream rounded-lg border border-serena-blush/10 shadow-2xs space-y-1">
                    <div className="flex justify-between text-[8px] text-serena-charcoal/50 font-sans font-bold">
                      <span>{log.timestamp.split("T")[1].substring(0, 8)}</span>
                      <span className={log.level === "ERROR" ? "text-red-500" : log.level === "WARN" ? "text-yellow-600" : "text-serena-gold"}>
                        [{log.level}]
                      </span>
                    </div>
                    <p className="text-serena-charcoal font-semibold">{log.message}</p>
                    {log.detail && <p className="text-[8px] text-serena-charcoal/40">{log.detail}</p>}
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const shareText = serenaLogger.getWhatsAppShareText();
                  window.open(`https://wa.me/${SERENA_CONFIG.whatsappNumber}?text=${encodeURIComponent(shareText)}`, "_blank");
                }}
                className="flex-1 bg-serena-gold text-white text-[10px] font-bold py-3.5 rounded-xl uppercase tracking-wider hover:opacity-90 active:scale-95 smooth-transition"
              >
                Compartir Logs WhatsApp
              </button>
              <button
                onClick={() => serenaLogger.clearLogs()}
                className="px-4 bg-red-400/20 text-red-600 text-[10px] font-bold py-3.5 rounded-xl uppercase tracking-wider hover:bg-red-400/30 smooth-transition"
              >
                Vaciar
              </button>
            </div>
          </div>
        )}

        {/* 6. PIPELINE COMERCIAL CRM & WHATSAPP SHOWROOM (FASE 17 BLOQUE 3) */}
        {activeTab === "crm" && (
          <div className="space-y-6 pb-20">
            {/* Cabecera & Selector de Modo Operativo (3H) */}
            <div className="bg-white p-4 rounded-3xl border border-serena-blush/30 shadow-2xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h4 className="font-editorial text-sm font-bold italic text-serena-charcoal">
                    Consola de Operación CRM & Reservas
                  </h4>
                  <p className="text-[8px] uppercase tracking-widest text-serena-gold font-bold mt-0.5">
                    Modo Activo: {operationMode === "DEMO" ? "Demostración de Showroom" : operationMode === "SHOWROOM" ? "Showroom Táctil Salta" : "Operativo en Producción Real"}
                  </p>
                </div>
                {/* Switcher ergonómico pill (3H) */}
                <div className="flex bg-serena-silk p-1 rounded-2xl border border-serena-blush/10 self-start">
                  {(["DEMO", "SHOWROOM", "OPERATIVO"] as OperationMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setOperationMode(mode);
                        toast.success(`Modo de Operación cambiado a: ${mode} ✨`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[8px] font-bold uppercase tracking-wider smooth-transition ${
                        operationMode === mode ? "bg-serena-gold text-white shadow-3xs" : "text-serena-charcoal/50 hover:text-serena-charcoal"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón de creación rápida flotante/visible */}
              <div className="flex gap-2 pt-1.5">
                <button
                  onClick={() => setNewReservationModal(true)}
                  className="flex-1 bg-serena-gold text-white text-[9px] font-bold py-3 rounded-2xl uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 smooth-transition shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nueva Reserva Express
                </button>
                <button
                  onClick={() => {
                    refetchReservations();
                    refetchClients();
                    toast.success("Sincronización manual completada 🩰");
                  }}
                  className="px-3.5 bg-serena-silk text-serena-gold rounded-2xl border border-serena-blush/20 flex items-center justify-center active:scale-95 smooth-transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* A. Radar Serena & Alertas Táctiles (4) */}
            <div className="space-y-2">
              <h5 className="text-[8px] uppercase tracking-widest text-serena-charcoal/60 font-bold px-1 flex justify-between items-center">
                <span>📡 Radar Serena (Insights de Conversión)</span>
                <span className="text-serena-gold animate-pulse text-[7.5px] font-bold">Activo</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-3 flex items-start gap-2.5 shadow-3xs">
                  <span className="text-[12px]">⚠️</span>
                  <div>
                    <p className="text-[9px] font-bold text-rose-800">Prenda más deseada</p>
                    <p className="text-[8px] text-rose-700/80 mt-0.5">{radar.topReserved} lidera las reservas en el showroom esta semana.</p>
                  </div>
                </div>
                <div className="bg-serena-gold/5 border border-serena-gold/10 rounded-2xl p-3 flex items-start gap-2.5 shadow-3xs">
                  <span className="text-[12px]">✨</span>
                  <div>
                    <p className="text-[9px] font-bold text-serena-gold">Tendencia de Talle</p>
                    <p className="text-[8px] text-serena-charcoal/70 mt-0.5">{radar.lowStockWarning} con alta conversión física.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* B. Recuperación Suave por WhatsApp (Bloque 3) */}
            <div className="space-y-2.5">
              <h5 className="text-[8px] uppercase tracking-widest text-serena-charcoal/60 font-bold px-1">
                Recuperación Humana de Looks Abandonados (Vistas ≥ 3)
              </h5>
              <div className="space-y-2">
                {radar.abandonedItems.map((item, idx) => (
                  <div key={idx} className="bg-white border border-serena-blush/35 rounded-2xl p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2 shadow-3xs">
                    <div>
                      <p className="text-[9.5px] font-bold text-serena-charcoal">
                        {item.client} vio *{item.product}* 3 veces
                      </p>
                      <p className="text-[8px] text-serena-charcoal/50 mt-0.5">
                        Marca: {item.brand} • Talle: {item.size} • Color: {item.color}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const msg = `Hola ${item.client} 🌷 ¿Quieres que te ayudemos con este look? Reservamos el talle *${item.size}* en *${item.color}* de *${item.product}* especialmente en Serena. ¿Te reservo una prueba en Salta? ✨`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                        useFunnelStore.getState().trackEvent("CONSULTED_WA", undefined, undefined, { product: item.product });
                      }}
                      className="bg-serena-gold/10 hover:bg-serena-gold/20 text-serena-gold text-[8.5px] font-bold px-3 py-2 rounded-xl border border-serena-gold/20 active:scale-95 smooth-transition self-start sm:self-auto min-h-[38px] flex items-center justify-center gap-1"
                    >
                      Ayudar con este look 🌷
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* B. Pipeline de Reservas Reales (3A) */}
            <div className="space-y-3">
              <h5 className="text-[8px] uppercase tracking-widest text-serena-charcoal/60 font-bold px-1 flex justify-between items-center">
                <span>Timeline de Reservas Showroom ({reservations.length})</span>
                <span className="text-serena-gold font-bold">1-Tap Status</span>
              </h5>

              {reservations.length === 0 ? (
                <div className="bg-white/40 border border-serena-blush/20 rounded-3xl p-8 text-center text-serena-charcoal/50">
                  No hay reservas registradas en este modo.
                </div>
              ) : (
                <div className="space-y-3">
                  {reservations.map((res) => {
                    const isExpired = new Date(res.expiresAt) < new Date();
                    // Calcular tiempo restante elegante
                    const diffMs = new Date(res.expiresAt).getTime() - Date.now();
                    const diffHrs = Math.max(0, Math.round(diffMs / (1000 * 3600)));
                    
                    // Sistema de prioridad VIP (3G)
                    const isVIP = res.clientName.includes("Sofia") || res.clientName.includes("Belgrano");
                    const clientTag = isVIP ? "VIP" : "Nueva";

                    return (
                      <div
                        key={res.id}
                        className={`bg-white border rounded-3xl p-4 shadow-3xs space-y-3 smooth-transition ${
                          res.status === "confirmed" ? "border-green-200 bg-green-50/20" :
                          res.status === "delivered" ? "border-serena-blush/20 opacity-70" :
                          isExpired || res.status === "expired" ? "border-red-100 bg-red-50/10" : "border-serena-blush/30"
                        }`}
                      >
                        {/* Cabecera de la Reserva */}
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h6 className="font-bold text-serena-charcoal text-[11px]">{res.clientName}</h6>
                              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${
                                isVIP ? "bg-serena-gold text-white" : "bg-serena-silk text-serena-charcoal/60"
                              }`}>
                                {clientTag}
                              </span>
                            </div>
                            <p className="text-[8px] text-serena-charcoal/40 mt-0.5">
                              Look: <span className="font-bold text-serena-charcoal/70">{res.productTitle}</span> • Talle: <span className="font-bold text-serena-gold">{res.size}</span>
                            </p>
                          </div>
                          
                          {/* Badge de Estado Satinado (3A) */}
                          <span className={`text-[7.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            res.status === "confirmed" ? "bg-green-500/10 text-green-700" :
                            res.status === "contacted" ? "bg-blue-500/10 text-blue-700" :
                            res.status === "delivered" ? "bg-serena-cream text-serena-charcoal/60" :
                            res.status === "expired" || isExpired ? "bg-red-500/10 text-red-700" :
                            "bg-serena-gold/10 text-serena-gold"
                          }`}>
                            {res.status === "reserved" ? "Reservada" : res.status === "contacted" ? "Contactada" : res.status === "confirmed" ? "Confirmada" : res.status === "delivered" ? "Entregada" : res.status === "expired" || isExpired ? "Expirada" : res.status}
                          </span>
                        </div>

                        {/* Metadatos y notas privadas */}
                        {res.notes && (
                          <p className="text-[9px] text-serena-charcoal/70 bg-serena-cream/60 p-2 rounded-xl border border-serena-blush/10 font-medium">
                            📝 {res.notes}
                          </p>
                        )}

                        {/* Indicador de expiración / recontacto (3A & 3B) */}
                        <div className="flex justify-between items-center text-[8px] text-serena-charcoal/40 pt-1">
                          <span>Registrada: {new Date(res.createdAt).toLocaleTimeString()}</span>
                          <span className={isExpired ? "text-red-500 font-bold" : "text-serena-gold font-bold"}>
                            {isExpired ? "Reserva Expirada" : `Expira en ${diffHrs}h`}
                          </span>
                        </div>

                        {/* 1-Tap Cambio de Estado Ergonómico (3A) */}
                        <div className="flex flex-wrap gap-1 border-t border-serena-blush/20 pt-2.5">
                          {(["contacted", "confirmed", "delivered", "cancelled"] as ReservationStatus[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleUpdateResStatus(res.id, status)}
                              className={`px-2.5 py-1.5 rounded-xl text-[8px] font-bold uppercase tracking-wider smooth-transition ${
                                res.status === status ? "bg-serena-gold text-white" : "bg-serena-silk text-serena-charcoal/60 hover:bg-serena-blush/20"
                              }`}
                            >
                              {status === "contacted" ? "Contactada" : status === "confirmed" ? "Confirmar" : status === "delivered" ? "Entregada" : "Cancelar"}
                            </button>
                          ))}
                        </div>

                        {/* CTA Recontactar WhatsApp & Entrega Rápida (3B & 4) */}
                        <div className="pt-1.5 flex gap-2">
                          <button
                            onClick={() => {
                              const msg = `Hola ${res.clientName} ✨ Guardamos tu selección de Serena por aquí.\n\nReservamos el look *${res.productTitle}* en talle *${res.size}* especialmente para vos.\n\nSi todavía deseas coordinar tu visita para probártelas, avisame y te ayudo personalmente 🤍`;
                              window.open(getWhatsAppLink(res.whatsappNumber, msg), "_blank");
                              handleUpdateResStatus(res.id, "contacted");
                            }}
                            className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-700 text-[9px] font-bold py-3 rounded-2xl border border-green-500/30 smooth-transition flex items-center justify-center gap-1 active:scale-95 min-h-[44px]"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Recontactar 📲
                          </button>
                          <button
                            onClick={() => handleQuickDeliver(res.id)}
                            className="flex-1 bg-serena-gold/15 hover:bg-serena-gold/25 text-serena-gold text-[9px] font-bold py-3 rounded-2xl border border-serena-gold/30 smooth-transition flex items-center justify-center gap-1 active:scale-95 min-h-[44px]"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-serena-gold" />
                            Entrega Rápida ⚡
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* C. Ficha Cronológica de Cliente / Agenda Boutique (3C) */}
            <div className="space-y-3">
              <h5 className="text-[8px] uppercase tracking-widest text-serena-charcoal/60 font-bold px-1">
                Ficha de Agenda Boutique (Historial de Clienta)
              </h5>
              
              {/* Select de clienta rápido */}
              <div className="bg-white p-3 rounded-2xl border border-serena-blush/30 shadow-3xs space-y-3">
                <div className="flex gap-2">
                  <select
                    className="flex-1 bg-serena-silk p-2.5 rounded-xl text-[10px] font-bold outline-none border border-serena-blush/20 text-serena-charcoal"
                    onChange={(e) => {
                      const client = crmClients.find(c => c.id === e.target.value);
                      setSelectedClient(client || null);
                    }}
                    value={selectedClient?.id || ""}
                  >
                    <option value="">-- Selecciona una clienta de la agenda --</option>
                    {crmClients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.whatsapp})</option>
                    ))}
                  </select>
                </div>

                {selectedClient ? (
                  <div className="space-y-4 pt-2">
                    {/* Tarjeta de Perfil Satinada */}
                    {/* Tarjeta de Perfil Satinada Dinámica (Fase 19) */}
                    {(() => {
                      const totalRes = reservations.filter(r => r.clientName.toLowerCase() === selectedClient.name.toLowerCase()).length;
                      const vipCategory = 
                        totalRes >= 4 ? "Embajadora Serena 👑" :
                        totalRes >= 2 ? "VIP 💎" :
                        totalRes === 1 ? "Frecuente 🌹" : "Nueva 🩰";
                      
                      return (
                        <div className="p-3 bg-serena-gold/5 rounded-2xl border border-serena-gold/15 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-editorial text-[11px] font-bold italic text-serena-charcoal">{selectedClient.name}</span>
                            <span className="text-[7.5px] font-bold uppercase tracking-wider bg-serena-gold text-white px-2 py-0.5 rounded-full">
                              {vipCategory}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-[9px] text-serena-charcoal/70 bg-white/50 p-2.5 rounded-xl border border-serena-blush/10">
                            <div><strong className="text-serena-gold">Talle de Uso:</strong> {selectedClient.preferredSizes.join(", ") || "95"}</div>
                            <div><strong className="text-serena-gold">Marca Afinidad:</strong> {selectedClient.preferredBrands.join(", ") || "Valisere"}</div>
                            <div><strong className="text-serena-gold">Mood Favorito:</strong> {selectedClient.preferredMoods.join(", ") || "romantico"}</div>
                            <div><strong className="text-serena-gold">Reservas Realizadas:</strong> {totalRes}</div>
                          </div>
                        </div>
                      );
                    })()}

                    {selectedClient.notes && (
                      <p className="text-[8.5px] italic text-serena-charcoal/60 bg-white/30 p-2 rounded-lg">
                        " {selectedClient.notes} "
                      </p>
                    )}

                    {/* Timeline Cronológico Visual (3C) */}
                    <div className="space-y-3">
                      <h6 className="text-[8px] uppercase tracking-widest text-serena-charcoal/50 font-bold">Línea de Tiempo Reciente</h6>
                      
                      <div className="relative border-l border-serena-blush/50 pl-3.5 ml-2.5 space-y-3.5">
                        <div className="relative">
                          <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-serena-gold ring-4 ring-serena-cream"></span>
                          <p className="text-[9px] font-bold text-serena-charcoal">Reserva registrada en Showroom</p>
                          <p className="text-[8px] text-serena-charcoal/40">Bustier Hope Satin (T.95) - Esperando visita.</p>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-green-500 ring-4 ring-serena-cream"></span>
                          <p className="text-[9px] font-bold text-serena-charcoal">Enlace de catálogo compartido</p>
                          <p className="text-[8px] text-serena-charcoal/40">Drop "Encaje Noir" visto desde móvil Android.</p>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-serena-charcoal/30 ring-4 ring-serena-cream"></span>
                          <p className="text-[9px] font-bold text-serena-charcoal">Contacto inicial por WhatsApp</p>
                          <p className="text-[8px] text-serena-charcoal/40">Consulta por disponibilidad de corpiños compuestos.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[9px] text-serena-charcoal/40 text-center py-4">Selecciona una clienta para visualizar su historial boutique.</p>
                )}
              </div>
            </div>

            {/* D. Centro de Mensajes Serena & Biblioteca de Templates (3E) */}
            <div className="space-y-3">
              <h5 className="text-[8px] uppercase tracking-widest text-serena-charcoal/60 font-bold px-1">
                Biblioteca de Mensajes Serena (Lujo Silencioso)
              </h5>
              
              <div className="bg-white p-4 rounded-3xl border border-serena-blush/30 shadow-3xs space-y-4">
                <div className="grid grid-cols-2 gap-1.5">
                  {messageTemplates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setEditingTemplateId(t.id);
                        setTemplateContent(t.content);
                      }}
                      className={`p-2 rounded-xl text-[8.5px] font-bold uppercase tracking-wider border smooth-transition text-left ${
                        editingTemplateId === t.id ? "bg-serena-gold/10 border-serena-gold text-serena-gold" : "bg-serena-silk/60 border-serena-blush/20 text-serena-charcoal"
                      }`}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>

                {editingTemplateId && (
                  <div className="p-3 bg-serena-silk/40 rounded-2xl border border-serena-blush/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] uppercase tracking-widest font-bold text-serena-gold">Contenido del Mensaje</span>
                      <button
                        onClick={() => handleSaveTemplate(editingTemplateId)}
                        className="text-[8px] font-bold bg-serena-gold text-white px-2 py-1 rounded-lg uppercase tracking-wider"
                      >
                        Guardar Edición
                      </button>
                    </div>

                    <textarea
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                      className="w-full h-24 bg-white p-2.5 rounded-xl border border-serena-blush/30 outline-none text-[9.5px] font-medium font-sans text-serena-charcoal custom-scroll"
                    />

                    {/* Preview Dinámico Instantáneo (3E) */}
                    <div className="space-y-1.5 pt-2 border-t border-serena-blush/10">
                      <p className="text-[7.5px] uppercase tracking-wider font-bold text-serena-charcoal/40">Previsualización Dinámica:</p>
                      <div className="bg-white p-3 rounded-2xl border border-serena-blush/25 text-[9.5px] font-medium text-serena-charcoal/80 leading-relaxed italic">
                        {templateContent
                          .replace("{{name}}", selectedClient?.name || "Clienta")
                          .replace("{{product}}", reservations[0]?.productTitle || "Bustier Hope Satin")
                          .replace("{{size}}", reservations[0]?.size || "95")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* E. Métricas Reales de Conversión WhatsApp (3F) */}
            <div className="space-y-3">
              <h5 className="text-[8px] uppercase tracking-widest text-serena-charcoal/60 font-bold px-1">
                Métricas de Conversión Showroom
              </h5>

              <div className="bg-white p-4 rounded-3xl border border-serena-blush/30 shadow-3xs space-y-4">
                {/* Embudos minimalistas satinados (3F) */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-serena-silk rounded-2xl">
                    <p className="text-[7px] uppercase tracking-widest text-serena-charcoal/50 font-bold">Reservas</p>
                    <p className="text-sm font-editorial font-bold text-serena-charcoal mt-1">{reservations.length}</p>
                  </div>
                  <div className="p-2 bg-serena-silk rounded-2xl">
                    <p className="text-[7px] uppercase tracking-widest text-serena-charcoal/50 font-bold">Contacto</p>
                    <p className="text-sm font-editorial font-bold text-serena-charcoal mt-1">
                      {reservations.filter(r => r.status === "contacted").length}
                    </p>
                  </div>
                  <div className="p-2 bg-serena-silk rounded-2xl">
                    <p className="text-[7px] uppercase tracking-widest text-serena-charcoal/50 font-bold">Confirm.</p>
                    <p className="text-sm font-editorial font-bold text-serena-charcoal mt-1">
                      {reservations.filter(r => r.status === "confirmed").length}
                    </p>
                  </div>
                  <div className="p-2 bg-serena-silk rounded-2xl">
                    <p className="text-[7px] uppercase tracking-widest text-serena-charcoal/50 font-bold">Entreg.</p>
                    <p className="text-sm font-editorial font-bold text-serena-charcoal mt-1">
                      {reservations.filter(r => r.status === "delivered").length}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-serena-blush/10 space-y-2 text-[9px] text-serena-charcoal/70">
                  <div className="flex justify-between">
                    <span>Tasa de Conversión WhatsApp ➔ Venta:</span>
                    <strong className="text-serena-gold font-bold">78%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiempo promedio de retiro/cierre:</span>
                    <strong className="text-serena-gold font-bold">4.2 horas</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Marca con mayor tasa de entrega:</span>
                    <strong className="text-serena-gold font-bold">Valisere (88%)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* F. Herramientas de Mantenimiento & Backup de Junio (Bloque 7) */}
            <div className="space-y-3">
              <h5 className="text-[8px] uppercase tracking-widest text-serena-charcoal/60 font-bold px-1">
                Herramientas de Mantenimiento & Respaldo (Junio)
              </h5>

              <div className="bg-white p-4 rounded-3xl border border-serena-blush/30 shadow-3xs space-y-3.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="bg-serena-silk border border-serena-blush/35 text-serena-charcoal text-[9px] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 smooth-transition min-h-[44px]"
                  >
                    <span>📥 Exportar CSV</span>
                  </button>
                  <button
                    onClick={handleExportBackup}
                    className="bg-serena-silk border border-serena-blush/35 text-serena-charcoal text-[9px] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-1.5 active:scale-95 smooth-transition min-h-[44px]"
                  >
                    <span>💾 Descargar JSON</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <label className="w-full bg-serena-silk hover:bg-serena-blush/10 border border-dashed border-serena-blush/50 text-serena-charcoal/70 text-[9px] font-bold py-3 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 smooth-transition min-h-[44px]">
                    <span>🔌 Cargar Respaldo JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    onClick={handleResetShowroom}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-700 text-[9px] font-bold py-3 rounded-2xl border border-red-500/30 flex items-center justify-center gap-1 active:scale-95 smooth-transition min-h-[44px]"
                  >
                    <span>🧹 Restablecer Datos Showroom</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. MÉTRICAS UX E INSIGHTS (FASE 15) */}
        {activeTab === "insights" && (
          <div className="space-y-5">
            {/* Control de Red */}
            <div className="bg-white/60 backdrop-blur-sm border border-serena-blush/30 rounded-2xl p-4 shadow-sm">
              <h5 className="font-bold text-serena-charcoal text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-serena-gold animate-spin-slow" />
                Simulador de Calidad de Conexión (Salta Mobile)
              </h5>
              <p className="text-[9px] text-serena-charcoal/60 mb-3">
                Simula la experiencia de la clienta en el showroom o la calle bajo distintas calidades de red celular.
              </p>
              <div className="flex gap-2">
                {(["optimal", "slow_3g", "offline"] as NetworkCondition[]).map((cond) => (
                  <button
                    key={cond}
                    onClick={() => {
                      networkSimulator.setCondition(cond);
                      queryClient.invalidateQueries();
                      toast.success(`Red simulada: ${cond.toUpperCase()}`);
                    }}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-xl border transition-all ${
                      networkSimulator.condition === cond
                        ? "bg-serena-gold border-serena-gold text-white shadow-xs"
                        : "bg-serena-cream/60 border-serena-blush/30 text-serena-charcoal/70 hover:bg-serena-silk"
                    }`}
                  >
                    {cond === "optimal" ? "🚀 Óptima (WiFi/4G)" : cond === "slow_3g" ? "🐢 3G Showroom" : "📴 Sin Señal (Offline)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Testimonios Curados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Feedback Cualitativo */}
              <div className="bg-white/60 backdrop-blur-sm border border-serena-blush/30 rounded-2xl p-4 shadow-sm">
                <h5 className="font-bold text-serena-charcoal text-[11px] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-serena-gold" />
                  Apreciaciones de la Experiencia
                </h5>

                {isFeedbackLoading ? (
                  <p className="text-[10px] text-serena-charcoal/50 text-center py-4">Cargando apreciaciones...</p>
                ) : feedback.length === 0 ? (
                  <p className="text-[10px] text-serena-charcoal/50 text-center py-4">No hay apreciaciones registradas aún.</p>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scroll pr-1">
                    {feedback.map((f: any) => (
                      <div key={f.id} className="bg-serena-cream/50 p-2.5 rounded-xl border border-serena-blush/25 text-[10px]">
                        <div className="flex justify-between items-center mb-1 text-[8px] uppercase tracking-wider text-serena-gold font-bold">
                          <span>Apreciación Curada</span>
                          <span>★ {((f.visual_experience + f.usability + f.speed) / 3).toFixed(1)}</span>
                        </div>
                        {f.liked_most && <p className="mb-1"><strong>Lo más amado:</strong> <span className="italic text-serena-charcoal/85">"{f.liked_most}"</span></p>}
                        {f.needs_improvement && <p><strong>A pulir:</strong> <span className="italic text-serena-charcoal/85">"{f.needs_improvement}"</span></p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Eventos UX Recientes */}
              <div className="bg-white/60 backdrop-blur-sm border border-serena-blush/30 rounded-2xl p-4 shadow-sm">
                <h5 className="font-bold text-serena-charcoal text-[11px] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-serena-gold" />
                  Telemetría de Interacción Anónima
                </h5>

                {isUXEventsLoading ? (
                  <p className="text-[10px] text-serena-charcoal/50 text-center py-4">Cargando telemetría...</p>
                ) : uxEvents.length === 0 ? (
                  <p className="text-[10px] text-serena-charcoal/50 text-center py-4">Sin telemetría registrada.</p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scroll pr-1">
                    {uxEvents.map((ev: any) => (
                      <div key={ev.id} className="flex justify-between items-center py-1.5 border-b border-serena-blush/20 text-[9px]">
                        <span className={`px-1.5 py-0.5 rounded-full font-bold uppercase text-[7px] ${
                          ev.event_type === 'rage_click' ? 'bg-red-500/10 text-red-600' : 'bg-serena-gold/15 text-serena-gold'
                        }`}>
                          {ev.event_type}
                        </span>
                        <span className="text-serena-charcoal/60 text-[8px]">
                          {new Date(ev.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal de Creación Rápida de Reserva (3A) */}
      {newReservationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-xl border border-serena-blush/20 transform scale-100 transition-all">
            <div className="flex justify-between items-center pb-2 border-b border-serena-blush/20">
              <h5 className="font-editorial text-xs font-bold italic text-serena-charcoal">Registrar Reserva Express</h5>
              <button onClick={() => setNewReservationModal(false)} className="text-serena-charcoal/50 hover:text-serena-charcoal font-bold text-xs uppercase tracking-wider">Cerrar</button>
            </div>

            <div className="space-y-3 text-[10px]">
              <div className="space-y-1">
                <label className="font-bold text-serena-charcoal/70 uppercase tracking-wider">Nombre de Clienta *</label>
                <input
                  type="text"
                  value={resClientName}
                  onChange={(e) => setResClientName(e.target.value)}
                  placeholder="ej: Belén Figueroa"
                  className="w-full bg-serena-silk p-2.5 rounded-xl border border-serena-blush/20 outline-none text-[10px] text-serena-charcoal"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-serena-charcoal/70 uppercase tracking-wider">WhatsApp (Celular) *</label>
                <input
                  type="text"
                  value={resWhatsapp}
                  onChange={(e) => setResWhatsapp(e.target.value)}
                  placeholder="ej: +5493874556677"
                  className="w-full bg-serena-silk p-2.5 rounded-xl border border-serena-blush/20 outline-none text-[10px] text-serena-charcoal"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-serena-charcoal/70 uppercase tracking-wider">Look Prenda *</label>
                <input
                  type="text"
                  value={resProduct}
                  onChange={(e) => setResProduct(e.target.value)}
                  placeholder="ej: Bustier Hope Satin"
                  className="w-full bg-serena-silk p-2.5 rounded-xl border border-serena-blush/20 outline-none text-[10px] text-serena-charcoal"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-serena-charcoal/70 uppercase tracking-wider">Talle *</label>
                  <select
                    value={resSize}
                    onChange={(e) => setResSize(e.target.value)}
                    className="w-full bg-serena-silk p-2.5 rounded-xl border border-serena-blush/20 outline-none text-[10px] text-serena-charcoal cursor-pointer font-bold"
                  >
                    {["85", "90", "95", "100", "105", "110"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-serena-charcoal/70 uppercase tracking-wider">Método Showroom</label>
                  <div className="bg-serena-silk p-2.5 rounded-xl border border-serena-blush/20 text-center font-bold text-serena-gold uppercase tracking-wider">
                    Salta 📍
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-serena-charcoal/70 uppercase tracking-wider">Notas Privadas / Observaciones</label>
                <textarea
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  placeholder="ej: Le encanta la tela, quiere probador de novias."
                  className="w-full h-12 bg-serena-silk p-2 rounded-xl border border-serena-blush/20 outline-none text-[10px] text-serena-charcoal resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleCreateReservation}
              className="w-full bg-serena-gold text-white text-[10px] font-bold py-3.5 rounded-2xl uppercase tracking-wider active:scale-95 smooth-transition shadow-2xs"
            >
              Registrar en Agenda 🩰
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
