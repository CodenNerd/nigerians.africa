export const VIEW_MODE_KEY = "nfn-view";
export const VIEW_MODE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type ViewMode = "record" | "progressive";

export function isViewMode(value: unknown): value is ViewMode {
  return value === "record" || value === "progressive";
}

export function parseViewMode(value: string | null | undefined): ViewMode {
  return isViewMode(value) ? value : "record";
}

/** Blocking script: set data-view before paint to avoid FOUC on the eyebrow. */
export const VIEW_MODE_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(VIEW_MODE_KEY)};var v=localStorage.getItem(k);if(v!=="record"&&v!=="progressive"){var m=document.cookie.match(/(?:^|; )${VIEW_MODE_KEY}=([^;]*)/);v=m?decodeURIComponent(m[1]):"record"}if(v!=="record"&&v!=="progressive")v="record";document.documentElement.dataset.view=v}catch(e){document.documentElement.dataset.view="record"}})();`;

export function persistViewMode(mode: ViewMode) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.view = mode;
  try {
    localStorage.setItem(VIEW_MODE_KEY, mode);
  } catch {
    /* ignore quota / private mode */
  }
  document.cookie = `${VIEW_MODE_KEY}=${encodeURIComponent(mode)}; path=/; max-age=${VIEW_MODE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function readStoredViewMode(): ViewMode {
  if (typeof document === "undefined") return "record";
  const fromDom = document.documentElement.dataset.view;
  if (isViewMode(fromDom)) return fromDom;
  try {
    const fromStorage = localStorage.getItem(VIEW_MODE_KEY);
    if (isViewMode(fromStorage)) return fromStorage;
  } catch {
    /* ignore */
  }
  return "record";
}
