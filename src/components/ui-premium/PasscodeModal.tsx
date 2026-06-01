"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useUIStore } from "@/store/useUIStore";
import { supabase } from "@/services/supabase";
import { logSecurityEvent } from "@/utils/securityLogger";

/**
 * Simple modal that prompts the user for a passcode.
 * It reads `isPasscodeOpen` from the UI store and closes on successful entry or when the user clicks the close icon.
 */
export function PasscodeModal({
  onValidate,
}: {
  /**
   * Called when the user submits a passcode.
   * Return `true` if the passcode is accepted, otherwise `false`.
   */
  onValidate: (code: string) => boolean;
}) {
  const isOpen = useUIStore(state => state.isPasscodeOpen);
  const setPasscodeOpen = useUIStore(state => state.setPasscodeOpen);
  const setAdminOpen = useUIStore(state => state.setAdminOpen);

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === "") {
      toast.error("Ingresa un código.");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("verify_passcode", {
        p_code: code.trim(),
      });
      if (error) {
        toast.error("Error de conexión.");
        logSecurityEvent("rpc_error", { error: error.message });
      } else if (data === true) {
        // Successful authentication
        setAdminOpen(true);
        setPasscodeOpen(false);
        toast.success("Código aceptado.");
        logSecurityEvent("login_success", {});
        setCode("");
      } else {
        toast.error("PIN inválido.");
        logSecurityEvent("invalid_pin", {});
      }
    } catch (e) {
      toast.error("Error inesperado.");
      logSecurityEvent("login_fail", { error: String(e) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="bg-serena-cream w-full max-w-[340px] rounded-[24px] p-6 border border-serena-blush/40 shadow-2xl">
        <div className="flex justify-between items-center pb-2 border-b border-serena-blush/20 mb-4">
          <h4 className="font-editorial text-sm font-bold italic text-serena-gold">Ingrese Código</h4>
          <button
            onClick={() => setPasscodeOpen(false)}
            className="text-serena-charcoal/50 hover:text-serena-charcoal"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Código de acceso"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full bg-serena-silk rounded-xl p-3 outline-none border border-serena-blush/20 font-bold text-serena-charcoal text-xs"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-serena-gold text-white font-bold py-3 rounded-xl text-sm uppercase tracking-wider hover:bg-serena-gold/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Validando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
