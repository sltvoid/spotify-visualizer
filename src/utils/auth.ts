import { STORAGE_KEYS, SPOTIFY_SCOPES, SPOTIFY_TOKEN_URL } from '../constants';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI =
  import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback';

const SCOPES = SPOTIFY_SCOPES.join(' ');

// Token expiry buffer (refresh 5 minutes before actual expiry)
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

/**
 * Generates a cryptographically secure random string for PKCE code verifier.
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generates SHA-256 hash of the code verifier for PKCE code challenge.
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

/**
 * Base64 URL encodes a Uint8Array (URL-safe base64 without padding).
 */
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Generates a cryptographically secure random string for state parameter.
 */
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

/**
 * Builds and returns the Spotify authorization URL using PKCE flow.
 */
export async function getAuthUrl(): Promise<string> {
  if (!CLIENT_ID) {
    const errorMsg =
      'Spotify Client ID is not configured. Please add VITE_SPOTIFY_CLIENT_ID to your environment variables.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const state = generateRandomString(16);
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store state and verifier for callback validation
  localStorage.setItem(STORAGE_KEYS.AUTH_STATE, state);
  localStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

/**
 * Stores tokens and calculates expiry time.
 */
function storeTokens(data: TokenResponse): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);

  if (data.refresh_token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
  }

  // Calculate and store token expiry time
  const expiryTime = Date.now() + data.expires_in * 1000;
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
}

/**
 * Handles the OAuth callback, exchanges authorization code for tokens.
 */
export async function handleCallback(): Promise<string | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  if (error) {
    console.error('Spotify authorization error:', error);
    return null;
  }

  const storedState = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
  const codeVerifier = localStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);

  // Validate state to prevent CSRF attacks
  if (state !== storedState) {
    console.error('State mismatch - possible CSRF attack');
    return null;
  }

  if (!code || !codeVerifier || !CLIENT_ID) {
    console.error('Missing required parameters for token exchange');
    return null;
  }

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token exchange failed:', errorData);
      throw new Error(`Token exchange failed: ${errorData.error}`);
    }

    const data: TokenResponse = await response.json();
    storeTokens(data);

    // Clean up temporary auth data
    localStorage.removeItem(STORAGE_KEYS.AUTH_STATE);
    localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);

    return data.access_token;
  } catch (err) {
    console.error('Error during token exchange:', err);
    return null;
  }
}

/**
 * Refreshes the access token using the refresh token.
 * @returns New access token or null if refresh fails
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  if (!refreshToken || !CLIENT_ID) {
    console.error('No refresh token or client ID available');
    return null;
  }

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token refresh failed:', errorData);

      // If refresh token is invalid, clear all tokens and force re-auth
      if (response.status === 400 || response.status === 401) {
        clearTokens();
      }
      return null;
    }

    const data: TokenResponse = await response.json();
    storeTokens(data);

    return data.access_token;
  } catch (err) {
    console.error('Error refreshing token:', err);
    return null;
  }
}

/**
 * Checks if the access token needs to be refreshed.
 */
export function isTokenExpired(): boolean {
  const expiryTime = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

  if (!expiryTime) {
    return true;
  }

  // Check if token will expire within the buffer time
  return Date.now() >= parseInt(expiryTime, 10) - TOKEN_EXPIRY_BUFFER_MS;
}

/**
 * Gets a valid access token, refreshing if necessary.
 * @returns Valid access token or null if unavailable
 */
export async function getValidAccessToken(): Promise<string | null> {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    return null;
  }

  if (isTokenExpired()) {
    const newToken = await refreshAccessToken();
    return newToken;
  }

  return token;
}

/**
 * Gets the current access token (synchronous, doesn't refresh).
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Clears all authentication tokens from storage.
 */
export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
}

/**
 * Logs out the user by clearing tokens and redirecting to login.
 */
export function logout(): void {
  clearTokens();
  window.location.href = '/';
}
