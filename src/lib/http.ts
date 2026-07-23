const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  // Don't hard-fail in development, but warn the developer to configure env
  // The .env.example contains guidance for VITE_API_URL
  // eslint-disable-next-line no-console
  console.warn("VITE_API_URL is not set. API requests may fail. Set VITE_API_URL in your .env file.");
}

let authToken: string | null = typeof window !== "undefined" ? localStorage.getItem("service_report_token") : null;
let unauthorizedHandler: ((response: Response) => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("service_report_token", token);
    else localStorage.removeItem("service_report_token");
  }
}

export function onUnauthorized(cb: (response: Response) => void) {
  unauthorizedHandler = cb;
}

function buildUrl(pathOrUrl: string) {
  try {
    // If absolute URL provided, use it
    const u = new URL(pathOrUrl);
    return u.toString();
  } catch {
    // Relative path -> resolve against API_BASE
    if (!API_BASE) throw new Error("API base URL not configured (VITE_API_URL)");
    return `${API_BASE.replace(/\/$/, "")}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
  }
}

export async function rawFetch(pathOrUrl: string, options?: RequestInit) {
  const url = buildUrl(pathOrUrl);
  const headers = new Headers(options?.headers as HeadersInit);

  if (authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && unauthorizedHandler) {
    unauthorizedHandler(response);
  }

  return response;
}

export async function requestJson<T = unknown>(pathOrUrl: string, options?: RequestInit): Promise<T> {
  const opts = { ...options };
  const headers = new Headers(opts.headers as HeadersInit);

  // If body is provided as a plain object and caller didn't stringify, stringify it
  if (opts.body && typeof opts.body !== "string" && !(opts.body instanceof FormData)) {
    try {
      opts.body = JSON.stringify(opts.body);
    } catch (e) {
      // leave as-is
    }
  }

  if (opts.body && typeof opts.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  opts.headers = headers;

  const response = await rawFetch(pathOrUrl, opts);

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const body = await response.json().catch(() => null);
      const message = body?.message ?? body?.error ?? `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    throw new Error(`Request failed with status ${response.status} ${response.statusText}`);
  }

  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  // Fallback: return text
  const text = await response.text();
  return (text as unknown) as T;
}
