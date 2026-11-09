export type DolibarrUser = {
  id?: number | string;
  login?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
};

export type DolibarrCompany = {
  name?: string;
  country_code?: string;
  currency_code?: string;
};

export type DolibarrThirdParty = {
  id: number | string;
  name: string;
  email?: string;
  client?: string | number;
  code_client?: string;
};

export type DolibarrProduct = {
  id: number | string;
  ref: string;
  label: string;
  price?: string | number;
  price_ttc?: string | number;
  status?: string | number;
};

export type DolibarrConnectionInfo = {
  apiBase: string;
  version?: string;
  company?: DolibarrCompany;
  user?: DolibarrUser;
  thirdPartyCount?: number;
  productCount?: number;
};

export class DolibarrError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "DolibarrError";
    this.status = status;
    this.body = body;
  }
}

function trimSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function candidateApiBases(proxyUrl: string, trueAddress?: string): string[] {
  const bases = new Set<string>();
  const proxy = trimSlash(proxyUrl);

  bases.add(proxy);

  try {
    const path = trueAddress ? new URL(trueAddress).pathname : "/api/index.php";
    const cleanPath = path.replace(/\/+$/, "") || "/";
    if (cleanPath !== "/") {
      bases.add(`${proxy}${cleanPath}`);
    }
  } catch {
    bases.add(`${proxy}/api/index.php`);
  }

  if (!proxy.endsWith("/api/index.php")) {
    bases.add(`${proxy}/api/index.php`);
  }

  return Array.from(bases);
}

async function dolibarrFetch<T>(
  apiBase: string,
  path: string,
  apiKey: string,
  init: RequestInit = {}
): Promise<T> {
  const url = `${trimSlash(apiBase)}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("DOLAPIKEY", apiKey);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...init, headers });
  const text = await response.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  if (!response.ok) {
    const errorObject = json as { error?: { message?: string }; message?: string } | null;
    throw new DolibarrError(
      errorObject?.error?.message || errorObject?.message || `Erreur Dolibarr (${response.status})`,
      response.status,
      json
    );
  }

  return json as T;
}

export async function loginForApiKey(apiBase: string, login: string, password: string): Promise<string> {
  const result = await dolibarrFetch<{ success?: { token?: string }; token?: string }>(
    apiBase,
    `/login?login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`,
    ""
  );
  const token = result?.success?.token || result?.token;
  if (!token) {
    throw new DolibarrError("La connexion Dolibarr n'a pas renvoyé de clé API", 401, result);
  }
  return token;
}

export async function getStatus(apiBase: string, apiKey: string) {
  return dolibarrFetch<{ success?: { dolibarr_version?: string }; dolibarr_version?: string }>(
    apiBase,
    "/status",
    apiKey
  );
}

export async function getCompany(apiBase: string, apiKey: string) {
  return dolibarrFetch<DolibarrCompany>(apiBase, "/setup/company", apiKey);
}

export async function getCurrentUser(apiBase: string, apiKey: string) {
  try {
    return await dolibarrFetch<DolibarrUser>(apiBase, "/users/info", apiKey);
  } catch {
    return dolibarrFetch<DolibarrUser>(apiBase, "/users/me", apiKey);
  }
}

export async function listThirdParties(apiBase: string, apiKey: string, limit = 20) {
  return dolibarrFetch<DolibarrThirdParty[]>(
    apiBase,
    `/thirdparties?sortfield=t.nom&sortorder=ASC&limit=${limit}&mode=1`,
    apiKey
  );
}

export async function listProducts(apiBase: string, apiKey: string, limit = 20) {
  return dolibarrFetch<DolibarrProduct[]>(
    apiBase,
    `/products?sortfield=t.ref&sortorder=ASC&limit=${limit}&sqlfilters=(t.tosell:=:1)`,
    apiKey
  );
}

export async function createInvoice(
  apiBase: string,
  apiKey: string,
  input: {
    socid: number | string;
    lines: Array<{ desc: string; subprice: number; qty: number; tva_tx?: number; fk_product?: number | string }>;
    note_private?: string;
  }
) {
  const invoiceId = await dolibarrFetch<number>(apiBase, "/invoices", apiKey, {
    method: "POST",
    body: JSON.stringify({
      socid: input.socid,
      type: "0",
      note_private: input.note_private,
    }),
  });

  for (const line of input.lines) {
    await dolibarrFetch(apiBase, `/invoices/${invoiceId}/lines`, apiKey, {
      method: "POST",
      body: JSON.stringify({
        desc: line.desc,
        subprice: line.subprice,
        qty: line.qty,
        tva_tx: line.tva_tx ?? 0,
        fk_product: line.fk_product,
      }),
    });
  }

  await dolibarrFetch(apiBase, `/invoices/${invoiceId}/validate`, apiKey, {
    method: "POST",
    body: JSON.stringify({ notrigger: 0 }),
  });

  return invoiceId;
}

export async function probeDolibarrConnection(
  proxyUrl: string,
  apiKey: string,
  trueAddress?: string
): Promise<DolibarrConnectionInfo> {
  const bases = candidateApiBases(proxyUrl, trueAddress);
  let lastError: unknown;

  for (const apiBase of bases) {
    try {
      const status = await getStatus(apiBase, apiKey);
      const [company, user, thirdParties, products] = await Promise.all([
        getCompany(apiBase, apiKey).catch(() => undefined),
        getCurrentUser(apiBase, apiKey).catch(() => undefined),
        listThirdParties(apiBase, apiKey, 5).catch(() => undefined),
        listProducts(apiBase, apiKey, 5).catch(() => undefined),
      ]);

      return {
        apiBase,
        version: status?.success?.dolibarr_version || status?.dolibarr_version,
        company,
        user,
        thirdPartyCount: Array.isArray(thirdParties) ? thirdParties.length : undefined,
        productCount: Array.isArray(products) ? products.length : undefined,
      };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof DolibarrError) throw lastError;
  throw new DolibarrError(
    lastError instanceof Error ? lastError.message : "Impossible de joindre Dolibarr via DoliProxy",
    0
  );
}
