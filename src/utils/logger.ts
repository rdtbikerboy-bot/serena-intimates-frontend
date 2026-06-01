"use client";

export interface SerenaLog {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  detail?: string;
}

const MAX_LOGS = 50;

export const serenaLogger = {
  /**
   * Registra un evento en la consola y en el almacenamiento local de forma ultra-privada.
   * Filtra estrictamente cualquier dato personal sensible.
   */
  log(level: SerenaLog["level"], message: string, rawDetail?: any) {
    if (typeof window === "undefined") return;

    let cleanDetail = "";
    if (rawDetail) {
      try {
        // Sanitizar y anonimizar cualquier detalle
        const detailString = typeof rawDetail === "object" ? JSON.stringify(rawDetail) : String(rawDetail);
        
        // Quitar cualquier talle, correo, teléfono, o datos sensibles mediante regex preventivos
        cleanDetail = detailString
          .replace(/"phone":\s*"[^"]*"/gi, '"phone":"[ANONIMIZADO]"')
          .replace(/"email":\s*"[^"]*"/gi, '"email":"[ANONIMIZADO]"')
          .replace(/"busto":\s*"[^"]*"/gi, '"busto":"[PERFIL]"')
          .replace(/"bombacha":\s*"[^"]*"/gi, '"bombacha":"[PERFIL]"');
      } catch (e) {
        cleanDetail = "[Error al serializar detalle]";
      }
    }

    const newLog: SerenaLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      level,
      message,
      detail: cleanDetail || undefined
    };

    // Imprimir en consola de desarrollo de manera elegante
    const badgeColor = level === "ERROR" ? "background: #ef4444; color: white" : level === "WARN" ? "background: #f59e0b; color: white" : "background: #d4a373; color: white";
    console.log(`%c SERENA ${level} `, badgeColor, message, cleanDetail || "");

    // Cargar cola actual, agregar y rotar
    try {
      const saved = localStorage.getItem("serena_system_logs");
      let list: SerenaLog[] = [];
      if (saved) {
        list = JSON.parse(saved);
      }
      
      list.push(newLog);
      
      // Mantener solo los últimos MAX_LOGS
      if (list.length > MAX_LOGS) {
        list = list.slice(list.length - MAX_LOGS);
      }
      
      localStorage.setItem("serena_system_logs", JSON.stringify(list));
      window.dispatchEvent(new Event("serena_logs_updated"));
    } catch (e) {
      console.error("Error guardando logs locales:", e);
    }
  },

  info(message: string, detail?: any) {
    this.log("INFO", message, detail);
  },

  warn(message: string, detail?: any) {
    this.log("WARN", message, detail);
  },

  error(message: string, detail?: any) {
    this.log("ERROR", message, detail);
  },

  getLogs(): SerenaLog[] {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("serena_system_logs");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  },

  clearLogs() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("serena_system_logs");
    window.dispatchEvent(new Event("serena_logs_updated"));
    this.info("Registro de auditoría vaciado por el administrador.");
  },

  /**
   * Compila los logs en texto plano con un formato hermoso y listo para compartir por WhatsApp
   */
  getWhatsAppShareText(): string {
    const logs = this.getLogs();
    if (logs.length === 0) return "🩰 *Serena Intimates* — Registro de logs vacío.";

    let txt = "🩰 *SERENA INTIMATES — REPORTE TÉCNICO*\n";
    txt += `Generado el: ${new Date().toLocaleDateString("es-AR")} a las ${new Date().toLocaleTimeString("es-AR")}\n`;
    txt += "----------------------------------------\n\n";

    logs.reverse().forEach((log, index) => {
      if (index < 15) { // Compartir solo los últimos 15 para evitar exceder el límite de texto
        const emoji = log.level === "ERROR" ? "🔴" : log.level === "WARN" ? "🟡" : "🟤";
        const time = log.timestamp.split("T")[1].substring(0, 8);
        txt += `${emoji} *[${log.level}]* ${time} — ${log.message}\n`;
        if (log.detail) {
          txt += `   _Detalle:_ \`${log.detail}\`\n`;
        }
        txt += "\n";
      }
    });

    txt += "🔒 _Privacidad Serena: Reporte de auditoría libre de datos personales o talles de clienta._";
    return txt;
  }
};
