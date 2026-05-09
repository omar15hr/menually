export type MpPreapprovalStatus = "authorized" | "cancelled" | "paused";

export type WebhookTopic =
  | "subscription_preapproval"
  | "subscription_authorized_payment";

export interface AutoRecurring {
  frequency: number;
  frequency_type: "months" | "years";
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
  preapproval_plan_id: string;
  reason: string;
  external_reference: string;
  payer_email?: string;
  auto_recurring?: AutoRecurring;
  back_url: string;
  status: "pending" | "authorized";
  notification_url?: string;
}

export interface CreatePreapprovalResponse {
  id: string;
  status: MpPreapprovalStatus;
  init_point: string;
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
