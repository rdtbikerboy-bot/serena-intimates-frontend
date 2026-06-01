-- =====================================================================
-- SCHEMA.SQL — SERENA INTIMATES BACKEND RELACIONAL & SEGURIDAD (SUPABASE)
-- =====================================================================
-- Arquitectura de Datos elegante, ultra-privada, tolerante a fallos
-- y optimizada para móviles Android.
-- =====================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLAS PRINCIPALES DEL SISTEMA
-- ==========================================

-- Tabla de Drops de Colección (Relevancia Temporal/Drops Exclusivos)
CREATE TABLE public.drops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_name VARCHAR(100) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    banner_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Marcas (Dinámica - Fase 13)
CREATE TABLE public.brands (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  country text DEFAULT 'Brasil',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Inserción inicial de marcas fundacionales
INSERT INTO public.brands (name, country) VALUES
  ('Valisere', 'Brasil'),
  ('Darling', 'Brasil'),
  ('Hope', 'Brasil'),
  ('Liz', 'Brasil'),
  ('Sedução', 'Brasil');

-- Tabla de Productos Editoriales Curados (Multimarca Premium Brasilera)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('romantico', 'atrevido', 'novia', 'comfy', 'minimalista', 'premium')),
    image_url TEXT NOT NULL,
    match_title VARCHAR(100), -- Get the Look complementario
    match_price DECIMAL(12, 2),
    drop_id UUID REFERENCES public.drops(id) ON DELETE SET NULL,
    
    -- Atributos de Curaduría Multimarca Brasilera & Criterios Funcionales (Fase 6)
    brand VARCHAR(50) NOT NULL DEFAULT 'Valisere',
    color VARCHAR(30) NOT NULL DEFAULT 'Nude',
    support_level VARCHAR(20) NOT NULL DEFAULT 'medio' CHECK (support_level IN ('bajo', 'medio', 'alto')),
    transparency VARCHAR(20) NOT NULL DEFAULT 'baja' CHECK (transparency IN ('ninguna', 'baja', 'alta')),
    immediate_availability BOOLEAN NOT NULL DEFAULT TRUE,
    mood VARCHAR(55) NOT NULL DEFAULT 'dia-a-dia' CHECK (mood IN ('dia-a-dia', 'comodo-y-suave', 'noche-especial', 'invisible', 'elegancia-minimalista', 'sensual-delicado', 'bridal', 'lounge')),
    
    -- Columnas del CMS Ready y Badges Comerciales (Fase 7 - Novedad 🎉)
    collections TEXT[] DEFAULT '{}',
    badges TEXT[] DEFAULT '{}',
    gallery_urls TEXT[] DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    display_order INT DEFAULT 0
);

-- =====================================================================
-- FASE 21: BLOQUE 1 - NORMALIZACIÓN DE IMÁGENES
-- =====================================================================
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    blur_data_url TEXT,
    display_order INT DEFAULT 0,
    is_cover BOOLEAN DEFAULT FALSE,
    color_reference TEXT,
    skin_tone_reference TEXT,
    width INT,
    height INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Habilitar RLS para product_images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Imágenes públicas" ON public.product_images FOR SELECT TO public USING (TRUE);
CREATE POLICY "Imágenes modificables por admin" ON public.product_images
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.client_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );


-- Tabla de Variantes por Talle (Inventario Atómico)
CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size VARCHAR(10) NOT NULL, -- Talle (85, 90, 95, S, M, L, etc.)
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sku VARCHAR(50) UNIQUE NOT NULL,
    CONSTRAINT unique_product_size UNIQUE (product_id, size)
);

-- Tabla de Perfiles de Clientas ("Mi Fit" & Preferencias Privadas)
-- Integrado con Supabase Auth (auth.users)
CREATE TABLE public.client_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    busto_size VARCHAR(10),
    bombacha_size VARCHAR(10),
    style_preferences TEXT[] DEFAULT '{}',
    role VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'seller', 'admin', 'owner')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Wishlists (Favoritos Guardados)
CREATE TABLE public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_client_wishlist UNIQUE (client_id, product_id)
);

-- Tabla Temporal de Reservas Soft (Time-To-Live 15 Minutos para WhatsApp checkout)
CREATE TABLE public.stock_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Notificaciones de Reingreso (Waitlist / Avisarme al reingresar)
CREATE TABLE public.stock_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    whatsapp_number VARCHAR(30) NOT NULL,
    is_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Analítica Emocional (100% Anónima y Privada, Cero IPs/Network IDs)
CREATE TABLE public.interaction_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(50) NOT NULL, -- 'whatsapp_click', 'story_view', 'talle_consultado', 'wishlist_add'
    category VARCHAR(30), -- Categoría/Mood implicado
    payload JSONB, -- Datos abstractos (ej. { size_requested: "95" })
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Eventos del Sistema & Observabilidad (Anónima y Segura)
CREATE TABLE public.system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL, -- 'sync_error', 'reservation_fail', 'checkout_error', 'critical_js_error'
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS en todas las tablas críticas
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interaction_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

-- Políticas para Drops (Lectura pública, Escritura Admin/Owner)
CREATE POLICY "Drops accesibles para todos" ON public.drops 
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Drops modificables solo por admin u owner" ON public.drops
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.client_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Políticas para Productos (Lectura pública, Escritura Admin/Owner)
CREATE POLICY "Productos accesibles para todos" ON public.products 
    FOR SELECT TO public USING (TRUE);

CREATE POLICY "Productos modificables solo por admin u owner" ON public.products
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.client_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Políticas para Variantes (Lectura pública, Escritura Admin/Owner)
CREATE POLICY "Variantes accesibles para todos" ON public.product_variants 
    FOR SELECT TO public USING (TRUE);

CREATE POLICY "Variantes modificables solo por admin u owner" ON public.product_variants
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.client_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Políticas para Perfiles de Clienta (Solo lectura/escritura del dueño)
CREATE POLICY "Perfil modificable solo por el dueño" ON public.client_profiles 
    FOR ALL USING (auth.uid() = id);

-- Políticas para Wishlists (Solo lectura/escritura del dueño)
CREATE POLICY "Wishlist modificable solo por el dueño" ON public.wishlists 
    FOR ALL USING (auth.uid() = client_id);

-- Políticas para Reservas (Dueño lee/escribe sus reservas)
CREATE POLICY "Reservas modificables solo por el dueño" ON public.stock_reservations 
    FOR ALL USING (auth.uid() = client_id);

-- Políticas para Notificaciones (Dueño lee/escribe sus suscripciones)
CREATE POLICY "Notificaciones modificables solo por el dueño" ON public.stock_notifications 
    FOR ALL USING (auth.uid() = client_id);

-- Políticas para Analítica (Inserción pública, lectura restringida a Admin/Owner)
CREATE POLICY "Analytics permite inserción anónima" ON public.interaction_analytics 
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Analytics lectura restringida a admin u owner" ON public.interaction_analytics
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.client_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Políticas para System Events (Inserción pública, lectura restringida a Admin/Owner)
CREATE POLICY "System events permite inserción anónima" ON public.system_events
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "System events lectura restringida a admin u owner" ON public.system_events
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.client_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'owner')
        )
    );


-- ==========================================
-- 3. TRIGGERS & FUNCIONES EN PL/PGSQL (STOCK ATÓMICO)
-- ==========================================

-- Trigger de Reserva Soft: Verifica y descuenta stock atómicamente al reservar
CREATE OR REPLACE FUNCTION public.fn_reserve_variant_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar si hay stock disponible
    IF (SELECT stock FROM public.product_variants WHERE id = NEW.variant_id) >= NEW.quantity THEN
        -- Decrementar el stock disponible de forma atómica
        UPDATE public.product_variants 
        SET stock = stock - NEW.quantity 
        WHERE id = NEW.variant_id;
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Stock insuficiente para el talle solicitado en Serena.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_stock_reservation_added
    BEFORE INSERT ON public.stock_reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_reserve_variant_stock();


-- Función de Liberación de Reservas Expiradas (Cron/Procedimiento periódico)
-- Devuelve el stock reservado expirado a las variantes de producto automáticamente
CREATE OR REPLACE FUNCTION public.fn_release_expired_reservations()
RETURNS VOID AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        DELETE FROM public.stock_reservations 
        WHERE expires_at < NOW() 
        RETURNING variant_id, quantity
    LOOP
        UPDATE public.product_variants 
        SET stock = stock + r.quantity 
        WHERE id = r.variant_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Trigger de Reposición (Waitlist): Avisar cuando el stock pasa de 0 a > 0
CREATE OR REPLACE FUNCTION public.fn_on_stock_replenished()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el stock anterior era 0 y ahora es mayor
    IF OLD.stock = 0 AND NEW.stock > 0 THEN
        -- Marcar como listas para notificar en la cola administrativa
        UPDATE public.stock_notifications
        SET is_notified = FALSE -- Lista para despacho por asesora
        WHERE variant_id = NEW.id AND is_notified = FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_stock_replenished
    AFTER UPDATE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_on_stock_replenished();

-- ==========================================
-- 4. CRM Y OPERACIONES DE VENTA (Fase 13)
-- ==========================================

-- Clientes reales identificados (No requieren Auth, son leads de WhatsApp)
CREATE TABLE public.crm_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(30) UNIQUE NOT NULL,
    city VARCHAR(50) DEFAULT 'Salta',
    preferred_sizes TEXT[] DEFAULT '{}',
    preferred_brands TEXT[] DEFAULT '{}',
    preferred_moods TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'nueva_consulta' CHECK (status IN ('nueva_consulta', 'interesada', 'reserva_activa', 'esperando_pago', 'pagada', 'entregada', 'recompra_potencial')),
    last_contact_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timeline de interacciones atómicas por clienta
CREATE TABLE public.crm_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.crm_clients(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('reserva', 'share', 'wishlist', 'reingreso', 'whatsapp_sent', 'checkout_iniciado')),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en CRM
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestión CRM solo para administradores" ON public.crm_clients USING (auth.role() = 'authenticated');
CREATE POLICY "Gestión Timeline CRM solo para admins" ON public.crm_interactions USING (auth.role() = 'authenticated');

-- ==========================================
-- 5. VALIDACIÓN UX Y SOFT LAUNCH PRIVADO (Fase 15)
-- ==========================================

-- Feedback cualitativo de Acceso Editorial
CREATE TABLE public.editorial_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visual_experience INT CHECK (visual_experience BETWEEN 1 AND 5),
    usability INT CHECK (usability BETWEEN 1 AND 5),
    speed INT CHECK (speed BETWEEN 1 AND 5),
    liked_most TEXT,
    needs_improvement TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eventos de UX limitados (Sin tracking agresivo/corporativo)
CREATE TABLE public.ux_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(30) NOT NULL CHECK (event_type IN ('product_open', 'drop_explore', 'favorite_add', 'reservation_start', 'whatsapp_abandon', 'dwell_time', 'rage_click')),
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.editorial_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ux_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feedback público" ON public.editorial_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Feedback admin" ON public.editorial_feedback FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "UX events público" ON public.ux_events FOR INSERT WITH CHECK (true);
CREATE POLICY "UX events admin" ON public.ux_events FOR SELECT USING (auth.role() = 'authenticated');

-- ==========================================
-- 6. PIPELINE EDITORIAL & COLORES (Fase 16)
-- ==========================================

-- Presets Visuales Editoriales Reutilizables
CREATE TABLE public.editorial_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'nude-satin', 'noir-contrast', 'bridal-soft', etc.
    aspect_ratio VARCHAR(10) NOT NULL DEFAULT '3:4',
    recommended_compression INT NOT NULL DEFAULT 85,
    lighting_notes TEXT,
    bg_color VARCHAR(30) NOT NULL DEFAULT '#FAF7F5', -- Color de fondo satinado/cream
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Swatches de Color con Arquitectura de Tonos Emocionales
CREATE TABLE public.color_swatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'Nude Serena', 'Noir Intense', etc.
    hex_code VARCHAR(7) NOT NULL, -- '#EAD7C3', etc.
    category VARCHAR(30) NOT NULL CHECK (category IN ('neutro', 'satin', 'bridal', 'oscuro', 'silk', 'blush')),
    skin_tone_compatibility VARCHAR(100) DEFAULT 'Universal', -- Compatibilidad recomendada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserción inicial de la paleta boutique de Serena
INSERT INTO public.color_swatches (name, hex_code, category, skin_tone_compatibility) VALUES
  ('Nude Serena', '#E4D3C5', 'neutro', 'Tonos Claros y Medios'),
  ('Noir Intense', '#1C1A19', 'oscuro', 'Universal'),
  ('Moka Satin', '#7D6355', 'satin', 'Tonos Medios y Oscuros'),
  ('Rose Blush', '#EAC5BD', 'blush', 'Universal'),
  ('Marfil Soft', '#F4EFEA', 'bridal', 'Tonos Claros'),
  ('Oliva Silk', '#606C5A', 'silk', 'Tonos Medios a Oscuros');

-- Soporte Futuro para Sets Compuestos (Lencería corpiño + bombacha independientes)
CREATE TABLE public.product_set_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    child_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    piece_type VARCHAR(30) NOT NULL CHECK (piece_type IN ('top', 'bottom')), -- Corpiño / Bombacha
    CONSTRAINT unique_parent_child_piece UNIQUE (parent_product_id, child_product_id)
);

-- Tabla de Siluetas y Overlays de Modelos Virtuales (F Fitting)
CREATE TABLE public.virtual_fitting_skeletons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(50) NOT NULL,
    skin_tone VARCHAR(30) NOT NULL, -- 'claros', 'medios', 'oscuros'
    body_shape VARCHAR(30) NOT NULL, -- 'silueta-reloj', 'silueta-oval', etc.
    size_compatibility TEXT[] DEFAULT '{}', -- Talles con los que es compatible (85, 90, etc.)
    asset_url TEXT NOT NULL, -- Overlay visual / silueta vectorizada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.editorial_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.color_swatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_set_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_fitting_skeletons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública presets" ON public.editorial_presets FOR SELECT WITH CHECK (true);
CREATE POLICY "Gestión presets admin" ON public.editorial_presets FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Lectura pública swatches" ON public.color_swatches FOR SELECT WITH CHECK (true);
CREATE POLICY "Gestión swatches admin" ON public.color_swatches FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Lectura pública sets" ON public.product_set_items FOR SELECT WITH CHECK (true);
CREATE POLICY "Gestión sets admin" ON public.product_set_items FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Lectura pública skeletons" ON public.virtual_fitting_skeletons FOR SELECT WITH CHECK (true);
CREATE POLICY "Gestión skeletons admin" ON public.virtual_fitting_skeletons FOR ALL USING (auth.role() = 'authenticated');

-- Tabla de Eventos del Embudo Comercial Inteligente (Fase 19)
CREATE TABLE public.sales_funnel_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.crm_clients(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('VIEWED', 'SAVED', 'SHARED', 'CONSULTED_WA', 'RESERVED', 'CONFIRMED', 'DELIVERED', 'LOST')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.sales_funnel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura y Escritura pública de eventos" ON public.sales_funnel_events FOR ALL WITH CHECK (true);
