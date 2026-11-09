import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  checkProxy,
  confirmOnboard,
  confirmRecover,
  extractProxyToken,
  extractProxyUrl,
  resendOnboard,
  slugFromProxyUrl,
  startOnboard,
  startRecover,
} from "@/integrations/doliproxy/client";
import {
  clearPending,
  clearSession,
  loadPending,
  loadSession,
  savePending,
  saveSession,
} from "@/integrations/doliproxy/storage";
import type { DoliProxySession, PendingOnboard, ProxyStatus } from "@/integrations/doliproxy/types";
import { probeDolibarrConnection, type DolibarrConnectionInfo } from "@/integrations/dolibarr/client";

type ConnectExistingInput = {
  proxyToken: string;
  slug?: string;
  email?: string;
};

interface DoliProxyContextType {
  session: DoliProxySession | null;
  pending: PendingOnboard | null;
  loading: boolean;
  checking: boolean;
  error: string | null;
  dolibarr: DolibarrConnectionInfo | null;
  isConnected: boolean;
  isErpConnected: boolean;
  startCreate: (input: { email: string; slug: string; trueAddress: string }) => Promise<void>;
  confirmCreate: (code: string) => Promise<DoliProxySession>;
  resendCode: () => Promise<void>;
  startRestore: (input: { email: string; slug: string }) => Promise<void>;
  confirmRestore: (code: string) => Promise<DoliProxySession>;
  connectExisting: (input: ConnectExistingInput) => Promise<DoliProxySession>;
  refreshStatus: () => Promise<ProxyStatus | null>;
  saveDolApiKey: (apiKey: string) => Promise<DolibarrConnectionInfo>;
  setSyncSales: (enabled: boolean) => void;
  setDefaultSocId: (id: number | undefined) => void;
  disconnect: () => void;
  cancelPending: () => void;
}

const DoliProxyContext = createContext<DoliProxyContextType | undefined>(undefined);

function sessionFromConfirm(
  result: Awaited<ReturnType<typeof confirmOnboard>>,
  pending: PendingOnboard,
  status?: ProxyStatus
): DoliProxySession {
  const token = extractProxyToken(result);
  if (!token) {
    throw new Error("DoliProxy n'a pas renvoyé de jeton. Vérifiez le code et réessayez.");
  }
  const proxyUrl =
    extractProxyUrl(result, pending.slug) ||
    status?.proxy_url ||
    `https://${pending.slug}.0.doliproxy.fr`;
  const trueAddress = result.data?.true_address || result.true_address || status?.true_address || pending.trueAddress || "";

  return {
    proxyToken: token,
    proxyUrl: proxyUrl.replace(/\/$/, ""),
    trueAddress,
    slug: pending.slug,
    email: pending.email,
    syncSales: true,
    lastStatus: status,
    connectedAt: new Date().toISOString(),
  };
}

export const DoliProxyProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<DoliProxySession | null>(null);
  const [pending, setPending] = useState<PendingOnboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dolibarr, setDolibarr] = useState<DolibarrConnectionInfo | null>(null);

  const persist = useCallback((next: DoliProxySession) => {
    saveSession(next);
    setSession(next);
  }, []);

  useEffect(() => {
    const existing = loadSession();
    const pendingOnboard = loadPending();
    setSession(existing);
    setPending(pendingOnboard);
    setLoading(false);
  }, []);

  const refreshStatus = useCallback(async () => {
    if (!session?.proxyToken) return null;
    setChecking(true);
    setError(null);
    try {
      const status = await checkProxy(session.proxyToken);
      const next = {
        ...session,
        lastStatus: status,
        proxyUrl: status.proxy_url || session.proxyUrl,
        trueAddress: status.true_address || session.trueAddress,
      };
      persist(next);

      if (next.dolApiKey) {
        try {
          const info = await probeDolibarrConnection(next.proxyUrl, next.dolApiKey, next.trueAddress);
          setDolibarr(info);
          persist({
            ...next,
            dolApiBase: info.apiBase,
            companyName: info.company?.name,
          });
        } catch {
          setDolibarr(null);
        }
      }

      return status;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de vérifier le proxy");
      throw err;
    } finally {
      setChecking(false);
    }
  }, [persist, session]);

  useEffect(() => {
    if (!session?.proxyToken) return;
    refreshStatus().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.proxyToken]);

  const startCreate = useCallback(async (input: { email: string; slug: string; trueAddress: string }) => {
    setError(null);
    const result = await startOnboard({
      email: input.email,
      slug: input.slug,
      true_address: input.trueAddress,
    });
    if (!result.data?.onboarding_token) {
      throw new Error(result.message || "Impossible de démarrer l'enregistrement DoliProxy");
    }
    const nextPending: PendingOnboard = {
      kind: "onboard",
      email: input.email,
      slug: input.slug,
      trueAddress: input.trueAddress,
      onboardingToken: result.data.onboarding_token,
      expiresAt: result.data.expires_at,
    };
    savePending(nextPending);
    setPending(nextPending);
  }, []);

  const confirmCreate = useCallback(async (code: string) => {
    if (!pending?.onboardingToken) {
      throw new Error("Aucune demande DoliProxy en cours");
    }
    setError(null);
    const result = await confirmOnboard(pending.onboardingToken, code);
    const token = extractProxyToken(result);
    let status: ProxyStatus | undefined;
    if (token) {
      try {
        status = await checkProxy(token);
      } catch {
        status = undefined;
      }
    }
    const next = sessionFromConfirm(result, pending, status);
    persist(next);
    clearPending();
    setPending(null);
    return next;
  }, [pending, persist]);

  const resendCode = useCallback(async () => {
    if (!pending?.onboardingToken) {
      throw new Error("Aucune demande DoliProxy en cours");
    }
    const result = await resendOnboard(pending.onboardingToken);
    const token = result.data?.onboarding_token || pending.onboardingToken;
    const next = {
      ...pending,
      onboardingToken: token,
      expiresAt: result.data?.expires_at || pending.expiresAt,
    };
    savePending(next);
    setPending(next);
  }, [pending]);

  const startRestore = useCallback(async (input: { email: string; slug: string }) => {
    setError(null);
    const result = await startRecover(input.email, input.slug);
    const nextPending: PendingOnboard = {
      kind: "recover",
      email: input.email,
      slug: input.slug,
      recoveryToken: result.data?.recovery_token,
      expiresAt: result.data?.expires_at,
    };
    savePending(nextPending);
    setPending(nextPending);
  }, []);

  const confirmRestore = useCallback(async (code: string) => {
    if (!pending || pending.kind !== "recover") {
      throw new Error("Aucune récupération DoliProxy en cours");
    }
    setError(null);
    const result = await confirmRecover({
      email: pending.email,
      slug: pending.slug,
      code,
      recovery_token: pending.recoveryToken,
    });
    const token = extractProxyToken(result);
    let status: ProxyStatus | undefined;
    if (token) {
      try {
        status = await checkProxy(token);
      } catch {
        status = undefined;
      }
    }
    const next = sessionFromConfirm(result, pending, status);
    persist(next);
    clearPending();
    setPending(null);
    return next;
  }, [pending, persist]);

  const connectExisting = useCallback(async (input: ConnectExistingInput) => {
    setError(null);
    const status = await checkProxy(input.proxyToken.trim());
    const next: DoliProxySession = {
      proxyToken: input.proxyToken.trim(),
      proxyUrl: status.proxy_url.replace(/\/$/, ""),
      trueAddress: status.true_address,
      slug: input.slug || slugFromProxyUrl(status.proxy_url),
      email: input.email,
      syncSales: true,
      lastStatus: status,
      connectedAt: new Date().toISOString(),
    };
    persist(next);
    clearPending();
    setPending(null);
    return next;
  }, [persist]);

  const saveDolApiKey = useCallback(async (apiKey: string) => {
    if (!session) throw new Error("Connectez d'abord un DoliProxy");
    const info = await probeDolibarrConnection(session.proxyUrl, apiKey.trim(), session.trueAddress);
    persist({
      ...session,
      dolApiKey: apiKey.trim(),
      dolApiBase: info.apiBase,
      companyName: info.company?.name,
    });
    setDolibarr(info);
    return info;
  }, [persist, session]);

  const setSyncSales = useCallback((enabled: boolean) => {
    if (!session) return;
    persist({ ...session, syncSales: enabled });
  }, [persist, session]);

  const setDefaultSocId = useCallback((id: number | undefined) => {
    if (!session) return;
    persist({ ...session, defaultSocId: id });
  }, [persist, session]);

  const disconnect = useCallback(() => {
    clearSession();
    setSession(null);
    setDolibarr(null);
    setError(null);
  }, []);

  const cancelPending = useCallback(() => {
    clearPending();
    setPending(null);
  }, []);

  const value = useMemo<DoliProxyContextType>(() => ({
    session,
    pending,
    loading,
    checking,
    error,
    dolibarr,
    isConnected: Boolean(session?.proxyToken),
    isErpConnected: Boolean(session?.dolApiKey && dolibarr),
    startCreate,
    confirmCreate,
    resendCode,
    startRestore,
    confirmRestore,
    connectExisting,
    refreshStatus,
    saveDolApiKey,
    setSyncSales,
    setDefaultSocId,
    disconnect,
    cancelPending,
  }), [
    session,
    pending,
    loading,
    checking,
    error,
    dolibarr,
    startCreate,
    confirmCreate,
    resendCode,
    startRestore,
    confirmRestore,
    connectExisting,
    refreshStatus,
    saveDolApiKey,
    setSyncSales,
    setDefaultSocId,
    disconnect,
    cancelPending,
  ]);

  return <DoliProxyContext.Provider value={value}>{children}</DoliProxyContext.Provider>;
};

export const useDoliProxy = () => {
  const context = useContext(DoliProxyContext);
  if (!context) {
    throw new Error("useDoliProxy must be used within a DoliProxyProvider");
  }
  return context;
};
