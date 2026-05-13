export type MpPreapprovalStatus = "pending" | "authorized" | "cancelled" | "paused";

export type WebhookTopic =
  | "subscription_preapproval"
  | "subscription_authorized_payment"
  | "chargeback"
  | "refund";

export interface AutoRecurring {
  frequency: number;
  frequency_type: "days" | "months"; // MP solo acepta days/months al crear. "years" no es válido, usar months × 12
  transaction_amount: number;
  currency_id: string;
}

export interface CreatePreapprovalPlanRequest {
  reason: string;
  auto_recurring: AutoRecurring;
}

export interface CreatePreapprovalPlanResponse {
  id: string;
  status: string;
  reason: string;
  auto_recurring: AutoRecurring;
}

export interface CreatePreapprovalRequest {
  preapproval_plan_id?: string; // Opcional: si no se usa, se envía auto_recurring inline
  reason: string;
  external_reference: string;
  payer_email?: string;
  auto_recurring?: AutoRecurring; // Requerido si no se usa preapproval_plan_id
  back_url: string;
  status: "pending" | "authorized";
  notification_url?: string;
}

export interface CreatePreapprovalResponse {
  id: string;
  status: MpPreapprovalStatus;
  init_point: string;
  sandbox_init_point?: string;
  payer_email: string;
  external_reference: string;
}

export interface GetPreapprovalResponse {
  id: string;
  status: MpPreapprovalStatus;
  payer_email: string;
  external_reference: string;
  auto_recurring: AutoRecurring;
}

export interface WebhookPayload {
  data: {
    id: string;
  };
  type: WebhookTopic;
  date_created: string;
  user_id: string;
  api_version: string;
  action: string;
}

export interface IMPClient {
  createPreapproval(params: CreatePreapprovalRequest, idempotencyKey?: string): Promise<CreatePreapprovalResponse>;
  getPreapproval(id: string): Promise<GetPreapprovalResponse>;
  cancelPreapproval(id: string, idempotencyKey?: string): Promise<void>;
}
