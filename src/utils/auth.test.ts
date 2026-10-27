import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../constants';

// auth.ts reads the client ID when it loads, so import it after stubbing env.
async function loadAuth() {
  vi.resetModules();
  vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', 'test-client-id');
  return import('./auth');
}

function tokenResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('PKCE', () => {
  it('matches the RFC 7636 test vector', async () => {
    const { generateCodeChallenge } = await loadAuth();
    await expect(
      generateCodeChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'),
    ).resolves.toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });

  it('generates URL-safe verifiers', async () => {
    const { generateCodeVerifier } = await loadAuth();
    expect(generateCodeVerifier()).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
});

describe('getAuthUrl', () => {
  it('builds an authorize URL and stores state for the callback', async () => {
    const { getAuthUrl } = await loadAuth();
    const url = new URL(await getAuthUrl());

    expect(url.origin + url.pathname).toBe('https://accounts.spotify.com/authorize');
    expect(url.searchParams.get('client_id')).toBe('test-client-id');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('redirect_uri')).toBe(`${window.location.origin}/callback`);
    expect(url.searchParams.get('state')).toBe(sessionStorage.getItem(STORAGE_KEYS.AUTH_STATE));
    expect(sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER)).toBeTruthy();
  });
});

describe('handleCallback', () => {
  it('rejects a mismatched state without calling Spotify', async () => {
    const { handleCallback } = await loadAuth();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    sessionStorage.setItem(STORAGE_KEYS.AUTH_STATE, 'expected');
    sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, 'verifier');

    const result = await handleCallback('?code=abc&state=attacker');

    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports errors returned by Spotify', async () => {
    const { handleCallback } = await loadAuth();
    await expect(handleCallback('?error=access_denied')).resolves.toEqual({
      ok: false,
      error: 'Spotify denied access: access_denied',
    });
  });

  it('exchanges each code only once, even if called twice (React StrictMode)', async () => {
    const { handleCallback, getAccessToken } = await loadAuth();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        tokenResponse({ access_token: 'access', refresh_token: 'refresh', expires_in: 3600 }),
      );
    vi.stubGlobal('fetch', fetchMock);
    sessionStorage.setItem(STORAGE_KEYS.AUTH_STATE, 'state');
    sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, 'verifier');

    const [first, second] = await Promise.all([
      handleCallback('?code=abc&state=state'),
      handleCallback('?code=abc&state=state'),
    ]);

    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBe('access');
  });
});

describe('token refresh', () => {
  it('shares one refresh request between concurrent callers', async () => {
    const { getValidAccessToken } = await loadAuth();
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'old');
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'refresh');
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, String(Date.now() - 1000));
    const fetchMock = vi
      .fn()
      .mockResolvedValue(tokenResponse({ access_token: 'new', expires_in: 3600 }));
    vi.stubGlobal('fetch', fetchMock);

    const tokens = await Promise.all([getValidAccessToken(), getValidAccessToken()]);

    expect(tokens).toEqual(['new', 'new']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // Spotify didn't rotate the refresh token, so the old one is kept.
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBe('refresh');
  });

  it('clears tokens when the refresh token is rejected', async () => {
    const { refreshAccessToken, getAccessToken } = await loadAuth();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'old');
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, 'revoked');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(tokenResponse({ error: 'invalid_grant' }, 400)),
    );

    await expect(refreshAccessToken()).resolves.toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it('returns the stored token when it is still valid', async () => {
    const { getValidAccessToken } = await loadAuth();
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'current');
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, String(Date.now() + 60 * 60 * 1000));
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(getValidAccessToken()).resolves.toBe('current');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('granted scopes', () => {
  it('remembers the scopes Spotify granted and clears them on logout', async () => {
    const { handleCallback, hasGrantedScope, clearTokens } = await loadAuth();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        tokenResponse({
          access_token: 'a',
          expires_in: 3600,
          scope: 'user-top-read user-read-currently-playing',
        }),
      ),
    );
    sessionStorage.setItem(STORAGE_KEYS.AUTH_STATE, 's');
    sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, 'v');

    await handleCallback('?code=scoped&state=s');

    expect(hasGrantedScope('user-read-currently-playing')).toBe(true);
    expect(hasGrantedScope('user-read')).toBe(false);
    clearTokens();
    expect(hasGrantedScope('user-read-currently-playing')).toBe(false);
  });

  it('treats sessions from before scope tracking as not granted', async () => {
    const { hasGrantedScope } = await loadAuth();
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'old-session');
    expect(hasGrantedScope('user-read-currently-playing')).toBe(false);
  });
});
