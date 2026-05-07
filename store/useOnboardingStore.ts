import { create } from "zustand";
import type { OnboardingStep, PlanId, BillingCycle } from "@/types/onboarding.types";

interface OnboardingState {
  step: OnboardingStep;
  selectedPlan: PlanId | null;
  billingCycle: BillingCycle;
  error: string | null;

  setSelectedPlan: (plan: PlanId | null) => void;
  setBillingCycle: (cycle: BillingCycle) => void;
  setError: (error: string | null) => void;
  goToStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  step: "plan" as OnboardingStep,
  selectedPlan: null as PlanId | null,
  billingCycle: "monthly" as BillingCycle,
  error: null as string | null,
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,

  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  setBillingCycle: (cycle) => set({ billingCycle: cycle }),
  setError: (error) => set({ error }),
  goToStep: (step) => set({ step }),

  nextStep: () => {
    const { step } = get();
    if (step === "plan") {
      set({ step: "redirecting" });
    } else if (step === "redirecting") {
      set({ step: "success" });
    }
  },

  prevStep: () => {
    const { step } = get();
    if (step === "redirecting") {
      set({ step: "plan" });
    }
  },

  reset: () => set({ ...initialState }),
}));
