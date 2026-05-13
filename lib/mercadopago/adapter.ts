import { MercadoPagoConfig, PreApproval } from "mercadopago";
import type { IMPClient } from "./types";
import type {
  CreatePreapprovalRequest,
  CreatePreapprovalResponse,
  GetPreapprovalResponse,
} from "./types";
import { getMPEnv } from "./env";

export class MercadoPagoAdapter implements IMPClient {
  private preApproval: PreApproval;

  constructor(accessToken: string, sandbox = false) {
    const isTestToken = accessToken.startsWith("TEST-");
    if (!sandbox && isTestToken) {
      throw new Error("Invalid Mercado Pago config: TEST token cannot be used with sandbox=false.");
    }
    const client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 10000,
        testToken: sandbox || isTestToken,
      },
    });
    this.preApproval = new PreApproval(client);
  }

  async createPreapproval(
    params: CreatePreapprovalRequest,
    idempotencyKey?: string,
  ): Promise<CreatePreapprovalResponse> {
    const result = await this.preApproval.create({
      body: {
        reason: params.reason,
        external_reference: params.external_reference,
        payer_email: params.payer_email,
        auto_recurring: params.auto_recurring
          ? {
              frequency: params.auto_recurring.frequency,
              frequency_type: params.auto_recurring.frequency_type,
              transaction_amount: params.auto_recurring.transaction_amount,
              currency_id: params.auto_recurring.currency_id,
            }
          : undefined,
        back_url: params.back_url,
        status: params.status,
      },
      requestOptions: idempotencyKey ? { idempotencyKey } : undefined,
    });

    const raw = result as unknown as Record<string, unknown>;

    return {
      id: result.id ?? "",
      status: (result.status as import("./types").MpPreapprovalStatus) ?? "pending",
      init_point: result.init_point ?? "",
      sandbox_init_point: (raw.sandbox_init_point as string | undefined) ?? undefined,
      payer_email: result.payer_email ?? "",
      external_reference: result.external_reference ?? "",
    };
  }

  async getPreapproval(id: string): Promise<GetPreapprovalResponse> {
    const result = await this.preApproval.get({ id });

    return {
      id: result.id ?? "",
      status: (result.status as import("./types").MpPreapprovalStatus) ?? "pending",
      payer_email: result.payer_email ?? "",
      external_reference: result.external_reference ? String(result.external_reference) : "",
      auto_recurring: {
        frequency: result.auto_recurring?.frequency ?? 1,
        frequency_type: (result.auto_recurring?.frequency_type as "days" | "months") ?? "months",
        transaction_amount: result.auto_recurring?.transaction_amount ?? 0,
        currency_id: result.auto_recurring?.currency_id ?? getMPEnv().MP_CURRENCY_ID,
      },
    };
  }

  async cancelPreapproval(id: string, idempotencyKey?: string): Promise<void> {
    await this.preApproval.update({
      id,
      body: { status: "cancelled" },
      requestOptions: idempotencyKey ? { idempotencyKey } : undefined,
    });
  }
}
