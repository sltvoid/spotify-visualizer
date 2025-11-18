const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback';

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'user-library-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-follow-read',
].join(' ');

// Generate code verifier for PKCE
const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
};

// Generate code challenge from verifier
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
};

// Base64 URL encode
const base64URLEncode = (buffer: Uint8Array): string => {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

export const getAuthUrl = async (): Promise<string> => {
  if (!CLIENT_ID) {
    alert('❌ Error: Spotify Client ID is not configured!\n\nPlease add VITE_SPOTIFY_CLIENT_ID to your Vercel environment variables and redeploy.');
    throw new Error('VITE_SPOTIFY_CLIENT_ID is not defined. Check your environment variables.');
  }

  const state = generateRandomString(16);
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store state and verifier for callback
  localStorage.setItem('spotify_auth_state', state);
  localStorage.setItem('spotify_code_verifier', codeVerifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  console.log('🚀 Using PKCE flow, redirecting to:', authUrl);

  return authUrl;
};

export const handleCallback = async (): Promise<string | null> => {
  console.log('🔍 Callback Debug (PKCE):');
  console.log('Full URL:', window.location.href);

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  if (error) {
    console.error('❌ Spotify returned error:', error);
    alert(`Spotify authorization failed: ${error}`);
    return null;
  }

  const storedState = localStorage.getItem('spotify_auth_state');
  const codeVerifier = localStorage.getItem('spotify_code_verifier');

  console.log('Code:', code ? 'Found ✅' : 'Not found ❌');
  console.log('State from URL:', state);
  console.log('Stored State:', storedState);
  console.log('Code Verifier:', codeVerifier ? 'Found ✅' : 'Not found ❌');

  if (state !== storedState) {
    console.error('❌ State mismatch');
    return null;
  }

  if (!code || !codeVerifier) {
    console.error('❌ Missing code or verifier');
    return null;
  }

  try {
    // Exchange code for token
    console.log('🔄 Exchanging code for access token...');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID!,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Token exchange failed:', errorData);
      throw new Error(`Token exchange failed: ${errorData.error}`);
    }

    const data = await response.json();
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

    console.log('✅ Token exchange successful!');

    // Store tokens
    localStorage.setItem('spotify_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('spotify_refresh_token', refreshToken);
    }

    // Clean up
    localStorage.removeItem('spotify_auth_state');
    localStorage.removeItem('spotify_code_verifier');

    return accessToken;
  } catch (error) {
    console.error('❌ Error during token exchange:', error);
    return null;
  }
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('spotify_access_token');
};

export const logout = (): void => {
  localStorage.removeItem('spotify_access_token');
  window.location.href = '/';
};

const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};
