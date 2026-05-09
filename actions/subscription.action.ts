"use server";

import { createClient } from "@/lib/supabase/server";
import { MercadoPagoClient } from "@/lib/mercadopago/client";
import { getPlanEnvVar } from "@/lib/mercadopago/constants";
import { calculateTrialEnd, getPlanAmount, isTrialExpired } from "@/lib/subscription";
import type { PlanId, BillingCycle } from "@/types/onboarding.types";

export async function createSubscription(
  planId: PlanId,
  billingCycle: BillingCycle,
): Promise<{
  success: boolean;
  message: string;
  errors: Record<string, string>;
  checkoutUrl?: string;
  subscription?: { id: string; planId: PlanId; billingCycle: BillingCycle; amount: number };
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "No autenticado",
        errors: {},
      };
    }

    // Check for existing subscription
    const { data: existingSub, error: queryError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (queryError && queryError.code !== "PGRST116") {
      return {
        success: false,
        message: queryError.message,
        errors: {},
      };
    }

    if (existingSub) {
      if (existingSub.status === "active") {
        return {
          success: false,
          message: "Ya tienes una suscripción activa",
          errors: {},
        };
      }
      if (existingSub.status === "trial" && !isTrialExpired(existingSub)) {
        return {
          success: false,
          message: "Ya tienes una suscripción activa",
          errors: {},
        };
      }
    }

    const planEnvVar = getPlanEnvVar(planId, billingCycle);
    const planIdFromEnv = process.env[planEnvVar];

    if (!planIdFromEnv) {
      return {
        success: false,
        message: "Configuración de plan no encontrada",
        errors: {},
      };
    }

    const amount = getPlanAmount(planId, billingCycle);

    const mpClient = new MercadoPagoClient(process.env.MP_ACCESS_TOKEN!);
    const preapproval = await mpClient.createPreapproval({
      preapproval_plan_id: planIdFromEnv,
      reason: `Menually ${planId} ${billingCycle}`,
      external_reference: user.id,
      back_url: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?status=success&plan=${planId}&cycle=${billingCycle}`,
      status: "pending",
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
    });

    const trialEndsAt = calculateTrialEnd();
    const now = new Date().toISOString();

    const { error: upsertError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          mp_preapproval_id: preapproval.id,
          status: existingSub?.status === "trial" ? existingSub.status : "trial",
          plan_type: planId,
          billing_cycle: billingCycle,
          trial_ends_at: existingSub?.status === "trial" ? existingSub.trial_ends_at : trialEndsAt.toISOString(),
          amount,
          current_period_start: now,
          current_period_end: now,
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (upsertError) {
      return {
        success: false,
        message: upsertError.message,
        errors: {},
      };
    }

    return {
      success: true,
      message: "Suscripción creada",
      errors: {},
      checkoutUrl: preapproval.init_point,
      subscription: {
        id: preapproval.id,
        planId,
        billingCycle,
        amount,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return {
      success: false,
      message,
      errors: {},
    };
  }
}

export async function cancelSubscription(): Promise<{
  success: boolean;
  message: string;
  errors: Record<string, string>;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "No autenticado",
        errors: {},
      };
    }

    const { data: existingSub, error: queryError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (queryError || !existingSub) {
      return {
        success: false,
        message: "No tienes una suscripción activa",
        errors: {},
      };
    }

    if (existingSub.mp_preapproval_id) {
      try {
        const mpClient = new MercadoPagoClient(process.env.MP_ACCESS_TOKEN!);
        await mpClient.cancelPreapproval(existingSub.mp_preapproval_id);
      } catch (mpError) {
        // Best effort — log and continue
        console.error("MP cancel failed:", mpError);
      }
    }

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      return {
        success: false,
        message: updateError.message,
        errors: {},
      };
    }

    return {
      success: true,
      message: "Suscripción cancelada",
      errors: {},
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return {
      success: false,
      message,
      errors: {},
    };
  }
}
