import {
  MP_API_BASE_URL,
  MP_SANDBOX_BASE_URL,
} from "@/lib/mercadopago/constants";
import type {
  CreatePreapprovalRequest,
  CreatePreapprovalResponse,
  GetPreapprovalResponse,
} from "@/lib/mercadopago/types";

export class MercadoPagoError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "MercadoPagoError";
    this.statusCode = statusCode;
  }
}

export class MercadoPagoClient {
  private accessToken: string;
  private baseUrl: string;
  private maxRetries = 3;
  private timeoutMs = 10000;

  constructor(accessToken: string, sandbox = false) {
    this.accessToken = accessToken;
    this.baseUrl = sandbox ? MP_SANDBOX_BASE_URL : MP_API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const fetchOptions: RequestInit = {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
        signal: controller.signal,
      };

      try {
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: "Unknown error",
          }));
          throw new MercadoPagoError(
            errorData.message || `HTTP ${response.status}`,
            response.status,
          );
        }

        return (await response.json()) as T;
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof MercadoPagoError) {
          if (error.statusCode >= 500 && attempt < this.maxRetries) {
            lastError = error;
            continue;
          }
          throw error;
        }

        if (error instanceof Error) {
          throw new MercadoPagoError(error.message, 0);
        }

        throw new MercadoPagoError("Unknown error", 0);
      }
    }

    if (lastError) {
      throw lastError;
    }

    throw new MercadoPagoError("Request failed after retries", 0);
  }

  async createPreapproval(
    params: CreatePreapprovalRequest,
    idempotencyKey?: string,
  ): Promise<CreatePreapprovalResponse> {
    return this.request<CreatePreapprovalResponse>("/preapproval", {
      method: "POST",
      body: JSON.stringify(params),
      headers: idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : undefined,
    });
  }

  async getPreapproval(id: string): Promise<GetPreapprovalResponse> {
    return this.request<GetPreapprovalResponse>(`/preapproval/${id}`, {
      method: "GET",
    });
  }

  async cancelPreapproval(id: string, idempotencyKey?: string): Promise<void> {
    await this.request<void>(`/preapproval/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "cancelled" }),
      headers: idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : undefined,
    });
  }
}
