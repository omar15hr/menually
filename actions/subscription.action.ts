"use server";

import { createClient } from "@/lib/supabase/server";
import { createMPClient } from "@/lib/mercadopago/factory";
import { generateIdempotencyKey } from "@/lib/mercadopago/idempotency";
import { calculateTrialEnd, getPlanAmount, isTrialExpired, calculatePeriodDates } from "@/lib/subscription";
import { getMPEnv } from "@/lib/mercadopago/env";
import type { PlanId, BillingCycle } from "@/types/onboarding.types";

export async function createSubscription(
  planId: PlanId,
  billingCycle: BillingCycle,
): Promise<{
  success: boolean;
  message: string;
  errors: Record<string, string>;
  checkoutUrl?: string;
  subscription?: {
    id: string;
    planId: PlanId;
    billingCycle: BillingCycle;
    amount: number;
    current_period_start: string;
    current_period_end: string;
    next_billing_date: string;
  };
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      return {
        success: false,
        message: "Configuración del servidor incompleta",
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

    const amount = getPlanAmount(planId, billingCycle);

    const frequency = billingCycle === "annual" ? 12 : 1;

    const mpEnv = getMPEnv();

    const mpClient = createMPClient();
    const preapproval = await mpClient.createPreapproval(
      {
        reason: `Menually ${planId} ${billingCycle}`,
        external_reference: user.id,
        payer_email: user.email,
        auto_recurring: {
          frequency,
          frequency_type: "months",
          transaction_amount: amount,
          currency_id: mpEnv.MP_CURRENCY_ID,
        },
        back_url: `${siteUrl}/onboarding?status=success&plan=${planId}&cycle=${billingCycle}`,
        status: "pending",
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      },
      generateIdempotencyKey(`preapproval_create_${user.id}_${planId}_${billingCycle}`),
    );

    const trialEndsAt = calculateTrialEnd();
    const { current_period_start, current_period_end, next_billing_date } = calculatePeriodDates(billingCycle);

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
          current_period_start: current_period_start.toISOString(),
          current_period_end: current_period_end.toISOString(),
          next_billing_date: next_billing_date.toISOString(),
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
      checkoutUrl: preapproval.sandbox_init_point ?? preapproval.init_point,
      subscription: {
        id: preapproval.id,
        planId,
        billingCycle,
        amount,
        current_period_start: current_period_start.toISOString(),
        current_period_end: current_period_end.toISOString(),
        next_billing_date: next_billing_date.toISOString(),
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
        const mpClient = createMPClient();
        await mpClient.cancelPreapproval(
          existingSub.mp_preapproval_id,
          generateIdempotencyKey(`preapproval_cancel_${existingSub.mp_preapproval_id}`),
        );
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

/**
 * Handles the return from Mercado Pago checkout (back_url callback).
 * Verifies the preapproval status with MP and optimistically updates the DB.
 *
 * Called when the user is redirected back to /onboarding?status=success&preapproval_id=xxx
 */
export async function handlePreapprovalCallback(
  preapprovalId: string,
): Promise<{
  success: boolean;
  message: string;
  errors: Record<string, string>;
  status?: string;
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

    // Verify preapproval status with MP
    const mpClient = createMPClient();
    const preapproval = await mpClient.getPreapproval(preapprovalId);

    // Optimistic update: update subscription status before webhook arrives
    const mpStatus = preapproval.status;

    if (mpStatus === "authorized") {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          mp_preapproval_id: preapprovalId,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        return {
          success: false,
          message: error.message,
          errors: {},
        };
      }

      return {
        success: true,
        message: "Pago confirmado",
        errors: {},
        status: "active",
      };
    }

    if (mpStatus === "pending") {
      // Payment still processing — stay on trial
      return {
        success: true,
        message: "Pago en proceso",
        errors: {},
        status: "pending",
      };
    }

    // Rejected or other
    return {
      success: false,
      message: `Pago no completado (${mpStatus})`,
      errors: {},
      status: mpStatus,
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

export async function upgradePlan(
  newPlanId: PlanId,
  newBillingCycle: BillingCycle,
): Promise<{
  success: boolean;
  message: string;
  errors: Record<string, string>;
  checkoutUrl?: string;
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

    if (existingSub.status !== "active") {
      return {
        success: false,
        message: "No tienes una suscripción activa para cambiar",
        errors: {},
      };
    }

    if (!existingSub.mp_preapproval_id) {
      return {
        success: false,
        message: "No tienes una suscripción activa para cambiar",
        errors: {},
      };
    }

    if (existingSub.plan_type === newPlanId && existingSub.billing_cycle === newBillingCycle) {
      return {
        success: false,
        message: "Ya estás en este plan",
        errors: {},
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      return {
        success: false,
        message: "Configuración del servidor incompleta",
        errors: {},
      };
    }

    // Cancel old preapproval (best effort)
    try {
      const mpClient = createMPClient();
      await mpClient.cancelPreapproval(
        existingSub.mp_preapproval_id,
        generateIdempotencyKey(`preapproval_cancel_${existingSub.mp_preapproval_id}`),
      );
    } catch (mpError) {
      console.error("MP cancel failed:", mpError);
    }

    const amount = getPlanAmount(newPlanId, newBillingCycle);
    const frequency = newBillingCycle === "annual" ? 12 : 1;
    const mpEnv = getMPEnv();

    const mpClient = createMPClient();
    const preapproval = await mpClient.createPreapproval(
      {
        reason: `Menually ${newPlanId} ${newBillingCycle}`,
        external_reference: user.id,
        payer_email: user.email,
        auto_recurring: {
          frequency,
          frequency_type: "months",
          transaction_amount: amount,
          currency_id: mpEnv.MP_CURRENCY_ID,
        },
        back_url: `${siteUrl}/dashboard?status=success&plan=${newPlanId}&cycle=${newBillingCycle}`,
        status: "pending",
        notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      },
      generateIdempotencyKey(`preapproval_create_${user.id}_${newPlanId}_${newBillingCycle}`),
    );

    const { current_period_start, current_period_end, next_billing_date } = calculatePeriodDates(newBillingCycle);

    const hasValidTrial = existingSub?.trial_ends_at && !isTrialExpired(existingSub);

    const { error: upsertError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          mp_preapproval_id: preapproval.id,
          status: "trial",
          plan_type: newPlanId,
          billing_cycle: newBillingCycle,
          trial_ends_at: hasValidTrial ? existingSub.trial_ends_at : null,
          amount,
          current_period_start: current_period_start.toISOString(),
          current_period_end: current_period_end.toISOString(),
          next_billing_date: next_billing_date.toISOString(),
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
      message: "Plan actualizado",
      errors: {},
      checkoutUrl: preapproval.sandbox_init_point ?? preapproval.init_point,
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

export async function initiateRefund(): Promise<{
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

    if (existingSub.status !== "active") {
      return {
        success: false,
        message: "No tienes una suscripción activa",
        errors: {},
      };
    }

    if (!existingSub.mp_preapproval_id) {
      return {
        success: false,
        message: "No se encontró el identificador de suscripción en Mercado Pago",
        errors: {},
      };
    }

    try {
      const mpClient = createMPClient();
      await mpClient.cancelPreapproval(
        existingSub.mp_preapproval_id,
        generateIdempotencyKey(`preapproval_refund_cancel_${existingSub.mp_preapproval_id}`),
      );
    } catch (mpError) {
      const message = mpError instanceof Error
        ? mpError.message
        : "No se pudo cancelar la suscripción en Mercado Pago";
      return {
        success: false,
        message,
        errors: {},
      };
    }

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "pending_refund",
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
      message: "Solicitud de reembolso registrada y suscripción cancelada en Mercado Pago. Nuestro equipo revisará el reembolso.",
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
