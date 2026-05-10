"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import AlertIcon from "@/components/icons/AlertIcon";
import { Button } from "@/components/ui/button";
import {
  cancelSubscription,
  upgradePlan,
  initiateRefund,
} from "@/actions/subscription.action";
import {
  formatAmount,
  getPlanDescription,
  getPlanAmount,
  isTrialExpired,
} from "@/lib/subscription";
import type { Database } from "@/types/database.types";
import type { PlanId, BillingCycle } from "@/types/onboarding.types";

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

interface SubscriptionSettingsProps {
  subscription: SubscriptionRow | null;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return { label: "Activo", className: "bg-[#EDFCBC] text-[#25A73A]" };
    case "trial":
      return { label: "Prueba gratis", className: "bg-[#FEFAD2] text-[#90700A]" };
    case "past_due":
      return { label: "Vencida", className: "bg-red-100 text-red-700" };
    case "cancelled":
      return { label: "Cancelada", className: "bg-gray-100 text-gray-600" };
    case "pending_refund":
      return { label: "Reembolso en progreso", className: "bg-orange-100 text-orange-700" };
    case "refunded":
      return { label: "Reembolsado", className: "bg-blue-100 text-blue-700" };
    case "chargeback":
      return { label: "Contracargo", className: "bg-red-100 text-red-800" };
    default:
      return { label: status, className: "bg-gray-100 text-gray-600" };
  }
}

async function handleUpgradeFormAction(
  _state: { success: boolean; message: string; errors: Record<string, string>; checkoutUrl?: string } | null,
  formData: FormData,
) {
  const newPlanId = formData.get("newPlanId") as PlanId;
  const newBillingCycle = formData.get("newBillingCycle") as BillingCycle;
  return upgradePlan(newPlanId, newBillingCycle);
}

async function handleRefundFormAction(
  _state: { success: boolean; message: string; errors: Record<string, string> } | null,
) {
  return initiateRefund();
}

export default function SubscriptionSettings({
  subscription,
}: SubscriptionSettingsProps) {
  const [cancelState, cancelAction, isCancelPending] = useActionState(
    cancelSubscription,
    null,
  );
  const [upgradeState, upgradeAction, isUpgradePending] = useActionState(
    handleUpgradeFormAction,
    null,
  );
  const [refundState, refundAction, isRefundPending] = useActionState(
    handleRefundFormAction,
    null,
  );

  const planType = subscription?.plan_type ?? "basic";
  const billingCycle = subscription?.billing_cycle ?? "monthly";
  const status = subscription?.status ?? "trial";
  const amount = subscription?.amount ?? getPlanAmount(planType, billingCycle);
  const trialEndsAt = subscription?.trial_ends_at;
  const currentPeriodEnd = subscription?.current_period_end;

  const isTrial = status === "trial";
  const trialExpired = isTrial && isTrialExpired(subscription);
  const badge = getStatusBadge(status);

  useEffect(() => {
    if (upgradeState?.success && upgradeState.checkoutUrl) {
      window.location.href = upgradeState.checkoutUrl;
    } else if (upgradeState?.success === false) {
      toast.error(upgradeState.message);
    }
  }, [upgradeState]);

  useEffect(() => {
    if (refundState?.success) {
      toast.success(refundState.message);
    } else if (refundState?.success === false) {
      toast.error(refundState.message);
    }
  }, [refundState]);

  const handleUpgrade = () => {
    const targetPlan = planType === "basic" ? "pro" : "basic";
    const actionLabel = planType === "basic" ? "upgrade a Pro" : "downgrade a Basic";
    if (window.confirm(`¿Confirmás que querés ${actionLabel}?`)) {
      const formData = new FormData();
      formData.append("newPlanId", targetPlan);
      formData.append("newBillingCycle", billingCycle);
      upgradeAction(formData);
    }
  };

  const handleRefund = () => {
    if (window.confirm("¿Confirmás que querés solicitar un reembolso?")) {
      refundAction();
    }
  };

  const isActive = status === "active";
  const canUpgrade = isActive;
  const canRefund = isActive;

  return (
    <div className="w-full max-w-3xl space-y-6 p-6 md:p-10">
      {/* Tarjeta: Suscripción */}
      <div className="bg-white border border-[#E4E4E6] rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-5">Suscripción</h2>

        {isTrial && trialEndsAt && !trialExpired && (
          <div className="bg-[#FEFAD2] text-[#1C1C1C] p-4 rounded-lg flex items-start gap-3 mb-6">
            <AlertIcon />
            <div className="text-sm">
              <p className="font-semibold">
                Tu mes de prueba gratuita vence el{" "}
                {new Date(trialEndsAt).toLocaleDateString("es-CL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}.
              </p>
              <p>
                A partir de esa fecha se cobrará tu plan automáticamente. Podés
                cancelar antes sin costo.
              </p>
            </div>
          </div>
        )}

        {trialExpired && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-start gap-3 mb-6">
            <AlertIcon />
            <div className="text-sm">
              <p className="font-semibold">Tu período de prueba ha vencido.</p>
              <p>Actualizá tu suscripción para seguir usando todas las funciones.</p>
            </div>
          </div>
        )}

        {status === "chargeback" && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-start gap-3 mb-6">
            <AlertIcon />
            <div className="text-sm">
              <p className="font-semibold">Se detectó un contracargo en tu cuenta.</p>
              <p>
                Contactá a{" "}
                <a href="mailto:soporte@menually.app" className="underline font-medium">
                  soporte@menually.app
                </a>{" "}
                para resolverlo.
              </p>
            </div>
          </div>
        )}

        <div className="border border-green-500 rounded-xl p-5 mb-4 bg-white relative">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-lg">
                  {getPlanDescription(planType, billingCycle)}
                </h3>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {planType === "pro"
                  ? "Full control para restaurantes en crecimiento"
                  : "Para pequeños locales o que estén iniciando"}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold">
              {formatAmount(amount)}
            </span>
            <span className="text-sm text-gray-500 font-medium">
              {" "}
              {billingCycle === "annual" ? "/año" : "/mes"}
            </span>
            {billingCycle === "annual" && (
              <p className="text-xs text-[#475569] mt-1">
                Anual — pagás una vez, usás todo el año
              </p>
            )}
          </div>
        </div>

        {currentPeriodEnd && status !== "cancelled" && (
          <p className="text-sm text-gray-500 mb-4">
            Próximo cobro:{" "}
            {new Date(currentPeriodEnd).toLocaleDateString("es-CL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}

        {canUpgrade && (
          <div className="flex gap-3 mt-2">
            <Button
              onClick={handleUpgrade}
              disabled={isUpgradePending}
              className="bg-[#114821] text-white font-medium px-5 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors hover:bg-[#0d3a1a] disabled:opacity-50"
            >
              {isUpgradePending
                ? "Procesando..."
                : planType === "basic"
                  ? "Upgrade a Pro"
                  : "Downgrade a Basic"}
            </Button>
          </div>
        )}
      </div>

      {/* Tarjeta: Reembolso */}
      {canRefund && (
        <div className="bg-white border border-[#E4E4E6] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold mb-4">Solicitar reembolso</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Si solicitás un reembolso, procesaremos la devolución de tu último
              pago. Tu menú seguirá activo hasta el final del período pagado.
            </p>
          </div>
          <form action={refundAction}>
            <Button
              type="submit"
              disabled={isRefundPending}
              onClick={(e) => {
                e.preventDefault();
                handleRefund();
              }}
              className="bg-[#B60000] text-white font-medium px-5 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors hover:bg-[#990000] disabled:opacity-50"
            >
              {isRefundPending ? "Procesando..." : "Solicitar reembolso"}
            </Button>
          </form>
        </div>
      )}

      {/* Tarjeta: Cancelar suscripción */}
      {status !== "cancelled" && status !== "chargeback" && status !== "refunded" && (
        <div className="bg-white border border-[#E4E4E6] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold mb-4">Cancelar suscripción</h2>
            {isTrial && trialEndsAt && !trialExpired ? (
              <>
                <p className="text-base font-semibold mb-1">
                  Cancelar antes del{" "}
                  {new Date(trialEndsAt).toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Si cancelás durante el período de prueba, no se realizará
                  ningún cobro y tu menú seguirá activo hasta que venza la
                  prueba. Después, pasará a solo lectura.
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500 leading-relaxed">
                Si cancelás tu suscripción, tu menú seguirá activo hasta el final
                del período pagado. Después, pasará a solo lectura.
              </p>
            )}
          </div>
          <form action={cancelAction}>
            <Button
              type="submit"
              disabled={isCancelPending}
              className="bg-[#B60000] text-white font-medium px-5 py-2.5 rounded-lg text-sm whitespace-nowrap transition-colors hover:bg-[#990000] disabled:opacity-50"
            >
              {isCancelPending ? "Cancelando..." : "Cancelar suscripción"}
            </Button>
          </form>
          {cancelState?.success === false && (
            <p className="text-sm text-red-600 mt-2">{cancelState.message}</p>
          )}
          {cancelState?.success === true && (
            <p className="text-sm text-green-600 mt-2">
              {cancelState.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
