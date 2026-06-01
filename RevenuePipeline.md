# Revenue Analytics Pipeline – Serena Intimates

**Objetivo**: estructurar el flujo de generación de ingresos a partir del checkout asistido, pasando de un simple *lead* a una venta confirmada.

## Etapas del pipeline

1. **Lead / Checkout Intent** (`checkout_intent`)
   - Se dispara cuando la validación del checkout es exitosa.
   - Marca que el cliente mostró interés serio (datos de contacto completos).
2. **WhatsApp Open** (`whatsapp_opened`)
   - El enlace de WhatsApp se abre en una nueva pestaña.
   - Este evento indica que el lead está tomando la acción de contactar al asesor.
3. **WhatsApp Engaged** (`whatsapp_engaged`)
   - Se deberá invocar desde la UI cuando se detecte que el usuario envió un mensaje o respondió al mensaje pre‑llenado.
   - Representa el primer punto de interacción humana.
4. **Sale Confirmed** (`sale_confirmed`)
   - Evento futuro que se disparará cuando el asesor registre la venta (por transferencia bancaria) en el CRM o mediante una integración manual.

## Modelos de abandono (abandonment)

- **checkout_abandoned**
  - El drawer de checkout se abrió pero el usuario nunca hizo clic en el enlace de WhatsApp.
- **whatsapp_abandoned**
  - El enlace de WhatsApp se abrió pero no hubo interacción posterior (ningún mensaje enviado).

## Uso en código

- Cada etapa se registra mediante `trackCheckoutEvent(eventName, payload?)` del módulo `checkoutEvents.ts`.
- Los eventos de abandono y engagement están expuestos como funciones auxiliares (`trackCheckoutAbandoned`, `trackWhatsAppAbandoned`, `trackWhatsAppEngaged`, `trackSaleConfirmed`). La UI deberá llamarlas en los momentos apropiados.

## Futuras integraciones

- **Dashboard de analítica**: consumir los logs de `serenaLogger` (JSON) o conectar `checkoutEvents` a una herramienta de análisis (Mixpanel, Amplitude, etc.).
- **Alertas de conversión**: generar notificaciones cuando la razón de abandono supere un umbral.
- **Optimización**: A/B‑test de textos del mensaje de WhatsApp y del flujo de checkout usando los eventos como métrica de éxito.
