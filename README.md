# Spotify Stats Visualizer

A personal Spotify statistics dashboard in the spirit of stats.fm. Log in with Spotify and explore your top artists, tracks, albums, genres, and listening history.

Everything runs in your browser: there is no backend, and your data is never stored or shared.

## Features

- **Overview**: headline stats plus your top artists and genres
- **Insights**: genre diversity, artist loyalty, decade breakdown, and more
- **Top Artists / Tracks / Albums** for the last 4 weeks, 6 months, or all time
- **Genres**: distribution chart across your top artists
- **Library**: saved-track stats with CSV export
- **Playlists** and **Recently Played**
- **Audio Features**: only for apps with extended API access (see [Spotify API limits](#spotify-api-limits))

The selected tab and time range are kept in the URL, so refreshing or sharing a link keeps your place.

## Tech stack

- [React 19](https://react.dev) + TypeScript
- [Vite](https://vite.dev) for dev server and builds
- [TanStack Query](https://tanstack.com/query) for data fetching and caching
- [React Router](https://reactrouter.com)
- [Tailwind CSS v4](https://tailwindcss.com) (theme tokens live in `src/index.css`)
- [Recharts](https://recharts.org) for charts, [Lucide](https://lucide.dev) for icons
- [Vitest](https://vitest.dev), ESLint, and Prettier

## Getting started

Requires Node.js 22.22 or newer (see `.nvmrc`).

### 1. Create a Spotify app

1. Open the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and click **Create app**.
2. Add this redirect URI: `http://127.0.0.1:5173/callback`
   Spotify no longer accepts `localhost` redirect URIs, so use the loopback IP.
3. Select **Web API**, save, and copy the **Client ID**.
4. While the app is in Development Mode, add your Spotify account under **User Management**.

### 2. Configure and run

```bash
npm install
cp .env.example .env    # then set VITE_SPOTIFY_CLIENT_ID
npm run dev
```

Open **http://127.0.0.1:5173** (not `localhost`; the address must match the redirect URI).

## Scripts

| Command           | What it does                                          |
| ----------------- | ----------------------------------------------------- |
| `npm run dev`     | Start the dev server on http://127.0.0.1:5173         |
| `npm run build`   | Type-check and build for production into `dist/`      |
| `npm run preview` | Serve the production build locally                    |
| `npm test`        | Run unit tests once (`npm run test:watch` to watch)   |
| `npm run lint`    | Run ESLint                                            |
| `npm run format`  | Format everything with Prettier                       |
| `npm run check`   | Typecheck, lint, format check, and tests (same as CI) |

## Spotify API limits

Spotify has restricted its Web API several times. This app degrades gracefully instead of breaking:

- **Audio features** (Audio Features tab, Advanced Audio tab, mood and energy insights): unavailable to apps created after November 27, 2024 unless they have extended access. Those sections show an explanation instead.
- **February 2026 Development Mode changes**: popularity scores and profile details (email, country, followers, plan) are no longer returned. Popularity charts and those profile fields are hidden when missing. Development Mode apps also require the owner to have Spotify Premium and allow up to 5 users.

See Spotify's [February 2026 migration guide](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide) for details.

## Project structure

```
src/
├── components/      # Dashboard sections and shared UI (CoverImage, StatCard, ...)
├── constants/       # API settings, tabs, time ranges, chart colors
├── hooks/           # TanStack Query hooks, one per Spotify resource
├── lib/             # Query client setup (retries, 401 handling)
├── pages/           # Login, OAuth callback, Dashboard
├── services/        # Typed Spotify Web API client (fetch-based)
├── types/           # Spotify response types
├── utils/           # Auth (PKCE), stats calculations, formatters
├── App.tsx          # Routes
├── main.tsx         # Entry point and providers
└── index.css        # Tailwind theme and glass design system
```

## How authentication works

The app uses Spotify's [Authorization Code with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow) flow, which needs no client secret:

- The PKCE verifier and CSRF `state` live in `sessionStorage` only for the login round trip.
- Access and refresh tokens are stored in `localStorage`. Tokens are refreshed automatically before they expire, and concurrent requests share one refresh.
- Requested scopes are read-only: profile, top items, recently played, library, and playlists.

## Deployment

The repo includes a `vercel.json` with SPA rewrites and security headers (including a Content Security Policy). For any host:

1. Add `https://your-domain.com/callback` as a redirect URI in the Spotify dashboard.
2. Set `VITE_SPOTIFY_CLIENT_ID` in the host's environment. `VITE_SPOTIFY_REDIRECT_URI` is optional and defaults to `<origin>/callback`.
3. Build with `npm run build` and serve `dist/`, rewriting unknown paths to `index.html`.

## License

MIT
