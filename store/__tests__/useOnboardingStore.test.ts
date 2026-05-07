import { describe, it, expect, beforeEach } from "vitest";
import { useOnboardingStore } from "@/store/useOnboardingStore";

describe("useOnboardingStore", () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it("has correct initial state", () => {
    const state = useOnboardingStore.getState();
    expect(state.step).toBe("plan");
    expect(state.selectedPlan).toBeNull();
    expect(state.billingCycle).toBe("monthly");
    expect(state.error).toBeNull();
  });

  it("sets selectedPlan", () => {
    useOnboardingStore.getState().setSelectedPlan("pro");
    expect(useOnboardingStore.getState().selectedPlan).toBe("pro");
  });

  it("sets billingCycle", () => {
    useOnboardingStore.getState().setBillingCycle("annual");
    expect(useOnboardingStore.getState().billingCycle).toBe("annual");
  });

  it("sets error", () => {
    useOnboardingStore.getState().setError("Pago rechazado");
    expect(useOnboardingStore.getState().error).toBe("Pago rechazado");
  });

  it("nextStep advances from plan to redirecting", () => {
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().setBillingCycle("annual");
    useOnboardingStore.getState().nextStep();
    expect(useOnboardingStore.getState().step).toBe("redirecting");
    expect(useOnboardingStore.getState().selectedPlan).toBe("pro");
    expect(useOnboardingStore.getState().billingCycle).toBe("annual");
  });

  it("prevStep from redirecting returns to plan preserving state", () => {
    useOnboardingStore.getState().setSelectedPlan("basic");
    useOnboardingStore.getState().setBillingCycle("monthly");
    useOnboardingStore.getState().nextStep();
    expect(useOnboardingStore.getState().step).toBe("redirecting");
    useOnboardingStore.getState().prevStep();
    expect(useOnboardingStore.getState().step).toBe("plan");
    expect(useOnboardingStore.getState().selectedPlan).toBe("basic");
    expect(useOnboardingStore.getState().billingCycle).toBe("monthly");
  });

  it("reset clears all state to initial values", () => {
    useOnboardingStore.getState().setSelectedPlan("pro");
    useOnboardingStore.getState().setBillingCycle("annual");
    useOnboardingStore.getState().nextStep();
    useOnboardingStore.getState().setError("Error");
    useOnboardingStore.getState().reset();
    const state = useOnboardingStore.getState();
    expect(state.step).toBe("plan");
    expect(state.selectedPlan).toBeNull();
    expect(state.billingCycle).toBe("monthly");
    expect(state.error).toBeNull();
  });

  it("nextStep does nothing from success step", () => {
    useOnboardingStore.getState().nextStep();
    useOnboardingStore.getState().nextStep();
    expect(useOnboardingStore.getState().step).toBe("success");
    useOnboardingStore.getState().nextStep();
    expect(useOnboardingStore.getState().step).toBe("success");
  });

  it("prevStep does nothing from plan step", () => {
    expect(useOnboardingStore.getState().step).toBe("plan");
    useOnboardingStore.getState().prevStep();
    expect(useOnboardingStore.getState().step).toBe("plan");
  });

  it("goToStep sets any step directly", () => {
    useOnboardingStore.getState().goToStep("error");
    expect(useOnboardingStore.getState().step).toBe("error");
    useOnboardingStore.getState().goToStep("success");
    expect(useOnboardingStore.getState().step).toBe("success");
  });
});
