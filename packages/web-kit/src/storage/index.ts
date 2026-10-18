/**
 * Namespaced browser storage (spec §6). Every toyonix app shares one origin, so all storage
 * access goes through here:
 *
 *   toyonix:shared:<key>  cross-app settings, only the keys defined in SharedKeys
 *   toyonix:<appId>:<key> app-private data
 *
 * Values are stored as JSON in a versioned envelope: { "v": 1, "data": … }.
 * Shared keys and the envelope format are frozen contracts: changing them is a major release.
 *
 * Never store secrets here: any script on the origin (any toyonix app) can read it.
 */
import { getAppId, getBasePath } from "../env";
import { isThemePreference, type ThemePreference } from "../theme";

export const STORAGE_PREFIX = "toyonix";
export const SHARED_SCOPE = "shared";
export const ENVELOPE_VERSION = 1;

/** Cross-app settings. Adding a key is a minor release; changing a key's type is major. */
export interface SharedKeys {
  theme: ThemePreference;
}

const SHARED_VALIDATORS: { [K in keyof SharedKeys]: (value: unknown) => value is SharedKeys[K] } = {
  theme: isThemePreference,
};

interface Envelope<T> {
  v: typeof ENVELOPE_VERSION;
  data: T;
}

/** Fired on window when a toyonix key changes in *this* tab (the `storage` event covers other tabs). */
const CHANGE_EVENT = "toyonix:storage";

interface ChangeDetail {
  key: string;
}

const KEY_PART = /^[A-Za-z0-9._-]+$/;

export function storageKey(scope: string, key: string): string {
  if (!KEY_PART.test(scope) || !KEY_PART.test(key)) {
    throw new Error(`Invalid storage key "${scope}:${key}": use letters, digits, ".", "_" or "-".`);
  }
  return `${STORAGE_PREFIX}:${scope}:${key}`;
}

type Backend = "local" | "session";

function area(backend: Backend): Storage | undefined {
  try {
    if (typeof window === "undefined") return undefined;
    return backend === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    // Storage can throw when disabled (privacy settings, sandboxed iframes).
    return undefined;
  }
}

function readEnvelope(storage: Storage | undefined, fullKey: string): unknown {
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(fullKey);
    if (raw === null) return undefined;
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && (parsed as Envelope<unknown>).v === ENVELOPE_VERSION) {
      return (parsed as Envelope<unknown>).data;
    }
  } catch {
    // Corrupt or foreign value: treat as missing.
  }
  return undefined;
}

function writeEnvelope(storage: Storage | undefined, fullKey: string, data: unknown): boolean {
  if (!storage) return false;
  try {
    const envelope: Envelope<unknown> = { v: ENVELOPE_VERSION, data };
    storage.setItem(fullKey, JSON.stringify(envelope));
    notify(fullKey);
    return true;
  } catch {
    // Quota exceeded or storage disabled.
    return false;
  }
}

function removeKey(storage: Storage | undefined, fullKey: string): void {
  if (!storage) return;
  try {
    storage.removeItem(fullKey);
    notify(fullKey);
  } catch {
    // ignore
  }
}

function notify(fullKey: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ChangeDetail>(CHANGE_EVENT, { detail: { key: fullKey } }));
}

/** Calls `listener` when `fullKey` changes in this tab or another tab. Returns an unsubscribe. */
function subscribeKey(fullKey: string, listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === fullKey || event.key === null) listener();
  };
  const onLocal = (event: Event) => {
    if ((event as CustomEvent<ChangeDetail>).detail.key === fullKey) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onLocal);
  };
}

export interface AppStore {
  /** Returns the stored value, or undefined if missing/corrupt. Validate it before trusting it. */
  get<T = unknown>(key: string): T | undefined;
  /** Returns false if the value couldn't be written (storage disabled or full). */
  set(key: string, value: unknown): boolean;
  remove(key: string): void;
  subscribe(key: string, listener: () => void): () => void;
  /** The full storage key, e.g. "toyonix:gen:draft". */
  key(key: string): string;
}

function appStore(backend: Backend): AppStore {
  const full = (key: string) => storageKey(getAppId(), key);
  return {
    get: <T>(key: string) => readEnvelope(area(backend), full(key)) as T | undefined,
    set: (key, value) => writeEnvelope(area(backend), full(key), value),
    remove: (key) => removeKey(area(backend), full(key)),
    subscribe: (key, listener) => subscribeKey(full(key), listener),
    key: full,
  };
}

export interface SharedStore {
  get<K extends keyof SharedKeys>(key: K): SharedKeys[K] | undefined;
  set<K extends keyof SharedKeys>(key: K, value: SharedKeys[K]): boolean;
  remove(key: keyof SharedKeys): void;
  subscribe(key: keyof SharedKeys, listener: () => void): () => void;
}

const sharedStore: SharedStore = {
  get(key) {
    const value = readEnvelope(area("local"), storageKey(SHARED_SCOPE, key));
    return SHARED_VALIDATORS[key](value) ? value : undefined;
  },
  set(key, value) {
    if (!SHARED_VALIDATORS[key](value)) throw new Error(`Invalid value for shared key "${key}"`);
    return writeEnvelope(area("local"), storageKey(SHARED_SCOPE, key), value);
  },
  remove: (key) => removeKey(area("local"), storageKey(SHARED_SCOPE, key)),
  subscribe: (key, listener) => subscribeKey(storageKey(SHARED_SCOPE, key), listener),
};

export const storage = {
  /** App-private localStorage: toyonix:<appId>:<key>. */
  app: appStore("local"),
  /** App-private sessionStorage: toyonix:<appId>:<key>. */
  session: appStore("session"),
  /** Cross-app settings: toyonix:shared:<key>. Only kit-defined keys. */
  shared: sharedStore,
} as const;

/** IndexedDB database name for this app: "toyonix:<appId>:<name>". */
export function dbName(name: string): string {
  return storageKey(getAppId(), name);
}

/** Cookie path for this app ("/<slug>/", or "/" for root). Always set app cookies with it. */
export function cookiePath(): string {
  return `${getBasePath()}/`;
}
