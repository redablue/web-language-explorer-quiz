export const DOLIPROXY_API_BASE = "https://doliproxy.fr/api/v1";

export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/;

export type DoliProxyApiError = {
  success?: boolean;
  status?: "error" | string;
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
};

export type SlugCheckResult = {
  available: boolean;
  reserved?: boolean;
  full_subdomain?: string;
  code?: string;
  message?: string;
};

export type OnboardStartResult = {
  success: boolean;
  message?: string;
  code?: string;
  data?: {
    onboarding_token: string;
    expires_at?: string;
    email: string;
    slug: string;
  };
};

export type RecoverStartResult = {
  success: boolean;
  message?: string;
  code?: string;
  data?: {
    recovery_token?: string;
    expires_at?: string;
    email?: string;
    slug?: string;
  };
};

export type ProxyTokenPayload = {
  proxy_token?: string;
  token?: string;
  proxy_url?: string;
  public_address?: string;
  slug?: string;
  true_address?: string;
  email?: string;
};

export type ConfirmResult = {
  success: boolean;
  message?: string;
  code?: string;
  data?: ProxyTokenPayload;
} & ProxyTokenPayload;

export type ProxyStatus = {
  status: string;
  is_trial: boolean;
  trial_ends_at: string | null;
  expires_at: string | null;
  proxy_url: string;
  true_address: string;
  code?: string;
  message?: string;
};

export type DolibarrCompany = {
  name?: string;
  version?: string;
  country?: string;
  currency?: string;
};

export type DoliProxySession = {
  proxyToken: string;
  proxyUrl: string;
  trueAddress: string;
  slug: string;
  email?: string;
  dolApiKey?: string;
  dolApiBase?: string;
  defaultSocId?: number;
  syncSales: boolean;
  companyName?: string;
  lastStatus?: ProxyStatus;
  connectedAt?: string;
};

export type PendingOnboard = {
  kind: "onboard" | "recover";
  email: string;
  slug: string;
  trueAddress?: string;
  onboardingToken?: string;
  recoveryToken?: string;
  expiresAt?: string;
};
