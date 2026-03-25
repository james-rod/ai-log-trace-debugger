import { getToken, clearToken } from "./auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:4000";

function offlineHint() {
  return (
    "Backend may be offline. " +
    `Check that the backend is running and that ${API_BASE}/health is reachable.`
  );
}
console.log("API_BASE:", API_BASE);

async function handleAuthErrors(res: Response) {
  if (res.status === 401) clearToken();
}

function buildHeaders(initHeaders?: HeadersInit): Headers {
  const headers = new Headers(initHeaders);

  // Always send JSON
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Attach JWT if present
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

/* -------------------------
   GET
------------------------- */
export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      method: "GET",
      headers: buildHeaders(init?.headers),
      cache: "no-store",
    });
  } catch {
    throw new Error(offlineHint());
  }

  await handleAuthErrors(res);

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      msg = body?.error ?? msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

/* -------------------------
   POST
------------------------- */
export async function apiPost<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      method: "POST",
      headers: buildHeaders(init?.headers),
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new Error(offlineHint());
  }

  await handleAuthErrors(res);

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const parsed = await res.json();
      msg = parsed?.error ?? msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

/* -------------------------
   DELETE
------------------------- */
export async function apiDelete(
  path: string,
  init?: RequestInit,
): Promise<void> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      method: "DELETE",
      headers: buildHeaders(init?.headers),
      cache: "no-store",
    });
  } catch {
    throw new Error(offlineHint());
  }

  await handleAuthErrors(res);

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const parsed = await res.json();
      msg = parsed?.error ?? msg;
    } catch {}
    throw new Error(msg);
  }
}
