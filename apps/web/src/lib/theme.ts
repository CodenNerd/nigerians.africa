export const THEME_KEY = "nfn-theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
/** Legacy key from Record ↔ Progressive toggle — mapped once on bootstrap. */
const LEGACY_VIEW_KEY = "nfn-view";

export type ThemeMode = "light" | "dark";

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function parseThemeMode(value: string | null | undefined): ThemeMode {
  return isThemeMode(value) ? value : "light";
}

function legacyToTheme(value: string | null | undefined): ThemeMode | null {
  if (value === "progressive") return "dark";
  if (value === "record") return "light";
  return null;
}

/** Blocking script: set data-theme before paint to avoid FOUC. */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_KEY)};var lk=${JSON.stringify(LEGACY_VIEW_KEY)};var v=localStorage.getItem(k);if(v!=="light"&&v!=="dark"){var m=document.cookie.match(new RegExp("(?:^|; )"+k+"=([^;]*)"));v=m?decodeURIComponent(m[1]):null}if(v!=="light"&&v!=="dark"){var lv=localStorage.getItem(lk);if(lv!=="progressive"&&lv!=="record"){var cm=document.cookie.match(new RegExp("(?:^|; )"+lk+"=([^;]*)"));lv=cm?decodeURIComponent(cm[1]):null}v=lv==="progressive"?"dark":"light"}document.documentElement.dataset.theme=v;document.documentElement.style.colorScheme=v}catch(e){document.documentElement.dataset.theme="light";document.documentElement.style.colorScheme="light"}})();`;

export function persistTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* ignore quota / private mode */
  }
  document.cookie = `${THEME_KEY}=${encodeURIComponent(mode)}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function readStoredTheme(): ThemeMode {
  if (typeof document === "undefined") return "light";
  const fromDom = document.documentElement.dataset.theme;
  if (isThemeMode(fromDom)) return fromDom;
  try {
    const fromStorage = localStorage.getItem(THEME_KEY);
    if (isThemeMode(fromStorage)) return fromStorage;
    const legacy = legacyToTheme(localStorage.getItem(LEGACY_VIEW_KEY));
    if (legacy) return legacy;
  } catch {
    /* ignore */
  }
  return "light";
}
