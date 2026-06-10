// src/services/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { OrderStatus } from "@/domain/order/order.valueObjects";
import { Order } from "@/domain/order/order.entity";

// Exported env helpers (unchanged)
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key-xyz123";

// ---------- Typed Database definition ----------
export type Database = {
  orders: {
    Row: {
      id: string;
      created_at: string;
      status: OrderStatus;
      customer_name: string;
      customer_phone: string;
      customer_address?: string | null;
      delivery_method: "delivery" | "pickup";
      items: any; // JSONB payload, validated by domain layer
      subtotal: number;
      total: number;
      currency: string;
    };
    Insert: {
      id?: string; // optional – DB can generate
      created_at?: string;
      status: OrderStatus;
      customer_name: string;
      customer_phone: string;
      customer_address?: string | null;
      delivery_method: "delivery" | "pickup";
      items: any;
      subtotal: number;
      total: number;
      currency: string;
    };
    Update: Partial<{
      status: OrderStatus;
      customer_name: string;
      customer_phone: string;
      customer_address?: string | null;
      delivery_method: "delivery" | "pickup";
      items: any;
      subtotal: number;
      total: number;
      currency: string;
    }>;
  };
  // Other tables keep loosely typed to avoid exhaustive definitions for now
  [key: string]: any;
};

export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder-url.supabase.co"
  );
}
