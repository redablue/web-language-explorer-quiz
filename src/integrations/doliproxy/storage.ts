import type { DoliProxySession, PendingOnboard } from "./types";

const SESSION_KEY = "station.doliproxy.session";
const PENDING_KEY = "station.doliproxy.pending";

export function loadSession(): DoliProxySession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DoliProxySession;
    if (!parsed?.proxyToken || !parsed?.proxyUrl) return null;
    return {
      ...parsed,
      syncSales: parsed.syncSales !== false,
    };
  } catch {
    return null;
  }
}

export function saveSession(session: DoliProxySession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function loadPending(): PendingOnboard | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingOnboard;
  } catch {
    return null;
  }
}

export function savePending(pending: PendingOnboard) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function clearPending() {
  localStorage.removeItem(PENDING_KEY);
}
