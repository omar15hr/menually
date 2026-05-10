import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  logWebhookResult,
  logWebhookSuccess,
  logWebhookIgnored,
  logWebhookError,
} from "@/lib/mercadopago/webhook-logger";

describe("webhook-logger", () => {
  const consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("logWebhookResult", () => {
    it("logs success with console.info", () => {
      logWebhookResult({
        status: "success",
        preapprovalId: "pre-123",
        topic: "subscription_preapproval",
      });

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        "[Webhook]",
        expect.objectContaining({
          status: "success",
          preapprovalId: "pre-123",
          topic: "subscription_preapproval",
        }),
      );
    });

    it("logs ignored with console.warn", () => {
      logWebhookResult({
        status: "ignored",
        reason: "User not found",
        preapprovalId: "pre-456",
      });

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[Webhook]",
        expect.objectContaining({
          status: "ignored",
          reason: "User not found",
          preapprovalId: "pre-456",
        }),
      );
    });

    it("logs error with console.error", () => {
      logWebhookResult({
        status: "error",
        error: "DB upsert failed",
        preapprovalId: "pre-789",
      });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Webhook]",
        expect.objectContaining({
          status: "error",
          error: "DB upsert failed",
          preapprovalId: "pre-789",
        }),
      );
    });
  });

  describe("convenience helpers", () => {
    it("logWebhookSuccess logs structured success", () => {
      logWebhookSuccess("subscription_preapproval", "pre-123", "created", "active");

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        "[Webhook]",
        expect.objectContaining({
          level: "info",
          topic: "subscription_preapproval",
          preapproval_id: "pre-123",
          action: "created",
          db_status: "active",
        }),
      );
    });

    it("logWebhookIgnored logs structured warning", () => {
      logWebhookIgnored("subscription_preapproval", "pre-456", "User not found");

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[Webhook]",
        expect.objectContaining({
          level: "warn",
          topic: "subscription_preapproval",
          preapproval_id: "pre-456",
          reason: "User not found",
        }),
      );
    });

    it("logWebhookError logs structured error", () => {
      logWebhookError("subscription_preapproval", "pre-789", "created", "DB timeout");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Webhook]",
        expect.objectContaining({
          level: "error",
          topic: "subscription_preapproval",
          preapproval_id: "pre-789",
          action: "created",
          error: "DB timeout",
        }),
      );
    });
  });
});
