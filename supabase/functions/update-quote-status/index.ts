// supabase/functions/update-quote-status/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Define el tipo de dato que espera el cuerpo (body) de la petición
interface QuoteDecision {
  orderId: string;
  decision: 'approved' | 'rejected';
}

Deno.serve(async (req) => {
  // Manejo de la petición pre-vuelo (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Valida y extrae los datos del cuerpo de la petición
    const { orderId, decision }: QuoteDecision = await req.json();
    if (!orderId || !decision || !['approved', 'rejected'].includes(decision)) {
      throw new Error("Faltan parámetros requeridos: 'orderId' y 'decision' ('approved'/'rejected').");
    }

    // 2. Crea un cliente de Supabase con privilegios de administrador (service_role)
    // Esto es crucial para poder modificar la base de datos sin que el usuario esté logueado.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Prepara la actualización de la base de datos
    const updates: { [key: string]: any } = {
      updated_at: new Date().toISOString(),
    };

    if (decision === 'approved') {
      updates.approved_at = new Date().toISOString();
      // Opcional y recomendado: Cambia el estado para que el taller sepa que debe continuar.
      updates.status = 'in_progress'; 
      updates.notes = `Presupuesto aprobado por el cliente vía web.`;
    } else { // decision === 'rejected'
      updates.rejected_at = new Date().toISOString();
      // Opcional y recomendado: Cancela la orden.
      updates.status = 'cancelled';
      updates.notes = `Presupuesto rechazado por el cliente vía web.`;
    }

    // 4. Ejecuta la actualización en la tabla 'service_orders'
    const { data, error } = await supabaseAdmin
      .from('service_orders')
      .update(updates)
      .eq('id', orderId)
      .select('id')
      .single();

    if (error) {
      // Si la orden no se encuentra, Supabase devuelve un error que podemos capturar.
      if (error.code === 'PGRST116') {
         throw new Error(`La orden con ID ${orderId} no fue encontrada.`);
      }
      throw error;
    }

    // 5. Devuelve una respuesta exitosa
    return new Response(JSON.stringify({ message: `Decisión '${decision}' registrada para la orden ${data.id}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    // Manejo de errores
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});