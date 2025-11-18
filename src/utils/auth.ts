const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback';

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'user-library-read',
  'playlist-read-private',
].join(' ');

export const getAuthUrl = (): string => {
  // Debug logging
  console.log('🔍 Debug Info:');
  console.log('CLIENT_ID:', CLIENT_ID);
  console.log('REDIRECT_URI:', REDIRECT_URI);
  console.log('All env vars:', import.meta.env);

  if (!CLIENT_ID) {
    alert('❌ Error: Spotify Client ID is not configured!\n\nPlease add VITE_SPOTIFY_CLIENT_ID to your Vercel environment variables and redeploy.');
    throw new Error('VITE_SPOTIFY_CLIENT_ID is not defined. Check your environment variables.');
  }

  const state = generateRandomString(16);
  localStorage.setItem('spotify_auth_state', state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'token',
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: SCOPES,
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  console.log('🚀 Redirecting to:', authUrl);

  return authUrl;
};

export const handleCallback = (): string | null => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);

  const accessToken = params.get('access_token');
  const state = params.get('state');
  const storedState = localStorage.getItem('spotify_auth_state');

  if (state !== storedState) {
    console.error('State mismatch');
    return null;
  }

  if (accessToken) {
    localStorage.setItem('spotify_access_token', accessToken);
    localStorage.removeItem('spotify_auth_state');
    return accessToken;
  }

  return null;
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
