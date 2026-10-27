import { SPOTIFY_AUTH_URL, SPOTIFY_SCOPES, SPOTIFY_TOKEN_URL, STORAGE_KEYS } from '../constants';

const CLIENT_ID: string | undefined = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

/** Refresh this long before the token actually expires. */
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

/**
 * Redirect URI registered in the Spotify dashboard. Defaults to this origin's
 * `/callback` so the same build works locally and in production.
 */
export function getRedirectUri(): string {
  return import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/callback`;
}

export function isAuthConfigured(): boolean {
  return Boolean(CLIENT_ID);
}

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

export function base64UrlEncode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function generateCodeVerifier(): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(hash));
}

function generateState(): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(16)));
}

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

function storeTokens(data: TokenResponse): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
  // Spotify may rotate the refresh token; keep the old one if it doesn't.
  if (data.refresh_token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
  }
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, String(Date.now() + data.expires_in * 1000));
}

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function isTokenExpired(now: number = Date.now()): boolean {
  const expiry = Number(localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY));
  return !expiry || now >= expiry - TOKEN_EXPIRY_BUFFER_MS;
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
}

export function logout(): void {
  clearTokens();
  window.location.assign('/');
}

async function requestToken(body: Record<string, string>): Promise<TokenResponse> {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(details.error_description || details.error || `HTTP ${response.status}`, {
      cause: response.status,
    });
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Authorization flow
// ---------------------------------------------------------------------------

/**
 * Builds the Spotify authorization URL (Authorization Code with PKCE).
 * The state and code verifier live in sessionStorage: they only need to
 * survive the round trip to Spotify in this tab.
 */
export async function getAuthUrl(): Promise<string> {
  if (!CLIENT_ID) {
    throw new Error(
      'Spotify Client ID is not configured. Add VITE_SPOTIFY_CLIENT_ID to your environment.',
    );
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  sessionStorage.setItem(STORAGE_KEYS.AUTH_STATE, state);
  sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    state,
    scope: SPOTIFY_SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  return `${SPOTIFY_AUTH_URL}?${params}`;
}

export type CallbackResult = { ok: true } | { ok: false; error: string };

// An authorization code can only be exchanged once. React StrictMode runs
// effects twice in development, so share one exchange per code.
const pendingExchanges = new Map<string, Promise<CallbackResult>>();

/** Exchanges the authorization code in `search` (the callback URL's query) for tokens. */
export function handleCallback(search: string = window.location.search): Promise<CallbackResult> {
  const params = new URLSearchParams(search);
  const code = params.get('code');

  if (params.get('error')) {
    return Promise.resolve({ ok: false, error: `Spotify denied access: ${params.get('error')}` });
  }
  if (!code) {
    return Promise.resolve({ ok: false, error: 'Missing authorization code.' });
  }

  let exchange = pendingExchanges.get(code);
  if (!exchange) {
    exchange = exchangeCode(code, params.get('state'));
    pendingExchanges.set(code, exchange);
  }
  return exchange;
}

async function exchangeCode(code: string, state: string | null): Promise<CallbackResult> {
  const storedState = sessionStorage.getItem(STORAGE_KEYS.AUTH_STATE);
  const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
  sessionStorage.removeItem(STORAGE_KEYS.AUTH_STATE);
  sessionStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);

  // Reject responses we didn't ask for (CSRF protection).
  if (!state || state !== storedState) {
    return { ok: false, error: 'Login session did not match. Please try again.' };
  }
  if (!codeVerifier || !CLIENT_ID) {
    return { ok: false, error: 'Login session expired. Please try again.' };
  }

  try {
    const data = await requestToken({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      code_verifier: codeVerifier,
    });
    storeTokens(data);
    return { ok: true };
  } catch (err) {
    console.error('Token exchange failed:', err);
    return { ok: false, error: 'Could not complete login with Spotify. Please try again.' };
  }
}

// ---------------------------------------------------------------------------
// Refresh
// ---------------------------------------------------------------------------

let refreshInFlight: Promise<string | null> | null = null;

/**
 * Refreshes the access token. Concurrent callers share one request so a
 * rotated refresh token is never used twice.
 */
export function refreshAccessToken(): Promise<string | null> {
  refreshInFlight ??= doRefresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function doRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken || !CLIENT_ID) return null;

  try {
    const data = await requestToken({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    storeTokens(data);
    return data.access_token;
  } catch (err) {
    console.error('Token refresh failed:', err);
    // 400/401 means the refresh token is no longer valid.
    if (err instanceof Error && (err.cause === 400 || err.cause === 401)) {
      clearTokens();
    }
    return null;
  }
}

/** Returns a usable access token, refreshing it first if needed. */
export async function getValidAccessToken(): Promise<string | null> {
  const token = getAccessToken();
  if (!token) return null;
  return isTokenExpired() ? refreshAccessToken() : token;
}
