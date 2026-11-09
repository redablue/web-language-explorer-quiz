import {
  DOLIPROXY_API_BASE,
  type ConfirmResult,
  type DoliProxyApiError,
  type OnboardStartResult,
  type ProxyStatus,
  type RecoverStartResult,
  type SlugCheckResult,
} from "./types";

export class DoliProxyError extends Error {
  code?: string;
  status: number;
  body?: DoliProxyApiError;

  constructor(message: string, status: number, body?: DoliProxyApiError) {
    super(message);
    this.name = "DoliProxyError";
    this.status = status;
    this.code = body?.code;
    this.body = body;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": "fr",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${DOLIPROXY_API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let json: T & DoliProxyApiError | null = null;
  if (text) {
    try {
      json = JSON.parse(text) as T & DoliProxyApiError;
    } catch {
      json = null;
    }
  }

  if (!response.ok) {
    throw new DoliProxyError(
      json?.message || `Erreur DoliProxy (${response.status})`,
      response.status,
      json ?? undefined
    );
  }

  return (json ?? ({} as T));
}

export function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function firstValidationError(body?: DoliProxyApiError): string | undefined {
  if (!body?.errors) return body?.message;
  const first = Object.values(body.errors).find((messages) => messages?.length);
  return first?.[0] || body.message;
}

export async function checkSlug(slug: string): Promise<SlugCheckResult> {
  return request<SlugCheckResult>("/proxy/slug/check", {
    method: "POST",
    body: { slug: normalizeSlug(slug) },
  });
}

export async function startOnboard(input: {
  email: string;
  slug: string;
  true_address: string;
  source_module?: string;
  source_url?: string;
}): Promise<OnboardStartResult> {
  return request<OnboardStartResult>("/proxy/onboard", {
    method: "POST",
    body: {
      email: input.email.trim(),
      slug: normalizeSlug(input.slug),
      true_address: input.true_address.trim(),
      source_module: input.source_module ?? "station-manager",
      source_url: input.source_url ?? (typeof window !== "undefined" ? window.location.origin : undefined),
    },
  });
}

export async function confirmOnboard(onboardingToken: string, code: string): Promise<ConfirmResult> {
  return request<ConfirmResult>("/proxy/onboard/confirm", {
    method: "POST",
    body: {
      onboarding_token: onboardingToken,
      code: code.trim(),
    },
  });
}

export async function resendOnboard(onboardingToken: string): Promise<OnboardStartResult> {
  return request<OnboardStartResult>("/proxy/onboard/resend", {
    method: "POST",
    body: { onboarding_token: onboardingToken },
  });
}

export async function startRecover(email: string, slug: string): Promise<RecoverStartResult> {
  return request<RecoverStartResult>("/proxy/recover", {
    method: "POST",
    body: {
      email: email.trim(),
      slug: normalizeSlug(slug),
    },
  });
}

export async function confirmRecover(input: {
  email: string;
  slug: string;
  code: string;
  recovery_token?: string;
}): Promise<ConfirmResult> {
  return request<ConfirmResult>("/proxy/recover/confirm", {
    method: "POST",
    body: {
      email: input.email.trim(),
      slug: normalizeSlug(input.slug),
      code: input.code.trim(),
      recovery_token: input.recovery_token || undefined,
    },
  });
}

export async function checkProxy(token: string): Promise<ProxyStatus> {
  const result = await request<ProxyStatus>("/proxy/check", {
    method: "POST",
    token,
  });
  if (result.status === "error" || result.code === "invalid_token") {
    throw new DoliProxyError(result.message || "Jeton DoliProxy invalide", 401, result);
  }
  return result;
}

export function slugFromProxyUrl(proxyUrl?: string, fallback = ""): string {
  if (!proxyUrl) return fallback;
  try {
    return new URL(proxyUrl).hostname.split(".")[0] || fallback;
  } catch {
    return fallback;
  }
}

export async function updateTrueAddress(token: string, trueAddress: string) {
  return request<{ success: boolean; true_address: string }>("/proxy", {
    method: "PATCH",
    token,
    body: { true_address: trueAddress.trim() },
  });
}

export function extractProxyToken(result: ConfirmResult): string | undefined {
  return result.data?.proxy_token || result.data?.token || result.proxy_token || result.token;
}

export function extractProxyUrl(result: ConfirmResult, fallbackSlug?: string): string | undefined {
  const url =
    result.data?.proxy_url ||
    result.data?.public_address ||
    result.proxy_url ||
    result.public_address;
  if (url) return url.replace(/\/$/, "");
  if (fallbackSlug) return `https://${normalizeSlug(fallbackSlug)}.0.doliproxy.fr`;
  return undefined;
}
