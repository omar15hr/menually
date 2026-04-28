import { create } from "zustand";
import type {
  ImportedMenu,
  ImportStep,
  ImportResult,
} from "@/lib/types/ai-import.types";

interface ImportState {
  // Current step in the wizard
  step: ImportStep;

  // File being processed
  file: File | null;

  // Data returned from AI
  importedData: ImportedMenu | null;

  // Warning flag if AI confidence is low
  confidenceWarning: boolean;

  // Loading state
  loading: boolean;
  loadingMessage: string;

  // Error state
  error: string | null;

  // Result from import action
  importResult: ImportResult | null;

  // Actions
  setStep: (step: ImportStep) => void;
  setFile: (file: File | null) => void;
  setImportedData: (data: ImportedMenu) => void;
  setConfidenceWarning: (warning: boolean) => void;
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  setImportResult: (result: ImportResult) => void;
  reset: () => void;
}

const initialState = {
  step: "upload" as ImportStep,
  file: null,
  importedData: null,
  confidenceWarning: false,
  loading: false,
  loadingMessage: "",
  error: null,
  importResult: null,
};

export const useImportStore = create<ImportState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setFile: (file) => set({ file }),

  setImportedData: (importedData) => set({ importedData }),

  setConfidenceWarning: (confidenceWarning) => set({ confidenceWarning }),

  setLoading: (loading, message = "") =>
    set({ loading, loadingMessage: message }),

  setError: (error) => set({ error }),

  setImportResult: (importResult) => set({ importResult }),

  reset: () => set(initialState),
}));
