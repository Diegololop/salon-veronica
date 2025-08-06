// Ubicación: src/lib/notifications.ts

import { supabase } from './supabase';

/**
 * Formatea un número de teléfono para que sea compatible con la API de WhatsApp.
 */
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('56')) {
    return cleaned;
  }
  if (cleaned.startsWith('9')) {
    return `56${cleaned}`;
  }
  return cleaned;
}

/**
 * Función principal para enviar plantillas de WhatsApp.
 */
export async function sendWhatsAppTemplateMessage(
  phone: string,
  templateName: string,
  parameters: string[]
): Promise<boolean> {
  try {
    const formattedPhone = formatPhoneNumber(phone);
    const url = `https://graph.facebook.com/v20.0/${import.meta.env.VITE_WHATSAPP_PHONE_ID}/messages`;
    
    const body = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: "es_CL" },
        components: [
          {
            type: "body",
            parameters: parameters.map(param => ({
              type: "text",
              text: param
            }))
          }
        ]
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("RESPUESTA COMPLETA DE ERROR DE WHATSAPP:", responseData);
      const errorMessage = responseData?.error?.message || JSON.stringify(responseData);
      throw new Error(`Error ${response.status}: ${errorMessage}`);
    }

    console.log(`Mensaje con plantilla '${templateName}' enviado a ${formattedPhone}`);
    return true;

  } catch (error) {
    console.error('Error detallado al enviar mensaje de WhatsApp:', error);
    return false;
  }
}

/**
 * Notifica al cliente sobre una nueva orden de servicio.
 */
export async function notifyNewOrder(phone: string, orderNumber: string): Promise<boolean> {
  console.trace("Rastreando el origen de la notificación de NUEVA ORDEN");
  const templateName = "new_order";
  const parameters = [`${orderNumber}`];
  return sendWhatsAppTemplateMessage(phone, templateName, parameters);
}

// --- 1. NUEVA FUNCIÓN ESPECÍFICA PARA PRESUPUESTOS ---
/**
 * Notifica al cliente que su presupuesto está listo.
 * @param phone - Número de teléfono del cliente.
 * @param orderNumber - Número de la orden.
 * @param description - Descripción del trabajo a realizar.
 * @param amount - Monto total del presupuesto.
 * @param decisionLink - URL para que el cliente decida (parámetro {{4}})
 */
export async function notifyQuoteReady(
    phone: string,
    orderNumber:string,
    description: string,
    amount:string, 
    decisionLink: string): Promise<boolean> {
  // ATENCIÓN: Asegúrate que tu plantilla de WhatsApp "order_quoted" espera 3 parámetros en este orden:
  // 1: Número de Orden
  // 2: Descripción del Trabajo
  // 3: Monto del Presupuesto
  const templateName = "order_quoted";
  const parameters = [orderNumber, description, amount, decisionLink];
  return sendWhatsAppTemplateMessage(phone, templateName, parameters);
}
// ----------------------------------------------------


/**
 * Notifica al cliente sobre un cambio de estado en su orden.
 */
export async function notifyStatusChange(
  phone: string,
  orderNumber: string,
  status: string,
  extraInfo?: string
): Promise<boolean> {

  console.log(`Función notifyStatusChange recibiendo estado: "${status}"`);
  let templateName = "";
  let parameters: string[] = [];

  switch (status) {
    case 'pending':
      return notifyNewOrder(phone, orderNumber);
    case 'in_progress':
      templateName = "status_update";
      parameters = [`${orderNumber}`];
      break;
    case 'completed':
      templateName = "order_completed";
      parameters = [`${orderNumber}`];
      break;
    case 'cancelled':
      templateName = "order_cancelled";
      parameters = [`${orderNumber}`, extraInfo || "No especificado"];
      break;
    case 'delivered':
      templateName = "order_delivered_v2";
      parameters = [`${orderNumber}`, extraInfo || "0"];
      break;
    default:
      console.warn(`No hay una plantilla de WhatsApp definida para el estado: "${status}"`);
      return false;
  }

  if (!templateName) {
    console.error(`Intento de enviar notificación sin nombre de plantilla para el estado: ${status}`);
    return false;
  }

  return sendWhatsAppTemplateMessage(phone, templateName, parameters);
}