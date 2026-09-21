"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  persistViewMode,
  readStoredViewMode,
  type ViewMode,
} from "@/lib/view-mode";

type ViewModeContextValue = {
  view: ViewMode;
  setView: (mode: ViewMode) => void;
  toggleView: () => void;
};

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [view, setViewState] = useState<ViewMode>("record");

  useEffect(() => {
    setViewState(readStoredViewMode());
  }, []);

  const setView = useCallback((mode: ViewMode) => {
    setViewState(mode);
    persistViewMode(mode);
  }, []);

  const toggleView = useCallback(() => {
    setViewState((current) => {
      const next: ViewMode = current === "progressive" ? "record" : "progressive";
      persistViewMode(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ view, setView, toggleView }),
    [view, setView, toggleView],
  );

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

export function useViewMode(): ViewModeContextValue {
  const ctx = useContext(ViewModeContext);
  if (!ctx) {
    throw new Error("useViewMode must be used within ViewModeProvider");
  }
  return ctx;
}
