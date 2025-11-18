# Spotify Stats Visualizer

A comprehensive Spotify statistics visualizer - a clone of stats.fm and must.fm. Visualize your listening habits with beautiful charts and analytics!

## Features

### 📊 Comprehensive Analytics
- **Top Artists** - View your most listened artists with popularity charts
- **Top Tracks** - See your favorite songs with detailed statistics
- **Recently Played** - Track your listening history in real-time
- **Audio Features** - Analyze your music taste with radar charts showing:
  - Danceability
  - Energy
  - Valence (Happiness)
  - Acousticness
  - Instrumentalness
  - Liveness
  - Speechiness

### 🎨 Beautiful Visualizations
- **Bar Charts** - Artist and track popularity
- **Radar Charts** - Audio features analysis
- **Pie Charts** - Genre distribution
- **Progress Bars** - Visual popularity indicators

### ⏱️ Multiple Time Ranges
- **Last 4 Weeks** - Short term listening habits
- **Last 6 Months** - Medium term trends
- **All Time** - Your complete listening history

### 🎯 User Experience
- Responsive design for all devices
- Modern gradient UI with Spotify branding
- Real-time loading states
- Error handling
- Direct links to Spotify

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - API requests
- **React Router** - Navigation
- **Lucide React** - Icons
- **Spotify Web API** - Data source

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- A Spotify account
- Spotify Developer credentials

### 1. Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in the details:
   - App name: "Spotify Stats Visualizer" (or your choice)
   - App description: "Personal Spotify statistics visualizer"
   - Redirect URI: `http://localhost:5173/callback`
4. Save and copy your **Client ID**

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Spotify Client ID:
```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Login with Spotify

1. Click "Login with Spotify" on the home page
2. Authorize the application
3. You'll be redirected to the dashboard with all your stats!

## Project Structure

```
src/
├── components/        # React components
│   ├── AudioFeatures.tsx       # Radar chart for audio analysis
│   ├── GenreDistribution.tsx   # Pie chart for genres
│   ├── ListeningStats.tsx      # Overview statistics
│   ├── LoadingSpinner.tsx      # Loading state component
│   ├── RecentlyPlayed.tsx      # Recent tracks list
│   ├── TimeRangeSelector.tsx   # Time period selector
│   ├── TopArtists.tsx          # Top artists with charts
│   ├── TopTracks.tsx           # Top tracks list
│   └── UserProfile.tsx         # User info and logout
├── pages/            # Page components
│   ├── Callback.tsx           # OAuth callback handler
│   ├── Dashboard.tsx          # Main dashboard
│   └── Login.tsx              # Login page
├── services/         # API services
│   └── spotify.ts             # Spotify API client
├── types/            # TypeScript types
│   └── spotify.ts             # Spotify data types
├── utils/            # Utilities
│   └── auth.ts                # Authentication helpers
├── App.tsx           # Main app with routing
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Comparison

### Stats.fm / Must.fm Features Implemented

✅ Top Artists with charts
✅ Top Tracks with popularity
✅ Recently Played timeline
✅ Audio Features analysis
✅ Genre Distribution
✅ Multiple time ranges
✅ User profile display
✅ Responsive design
✅ Direct Spotify links

## API Scopes Used

The app requests the following Spotify scopes:
- `user-read-private` - Access to user profile data
- `user-read-email` - Access to user email
- `user-top-read` - Access to top artists and tracks
- `user-read-recently-played` - Access to listening history
- `user-library-read` - Access to saved content
- `playlist-read-private` - Access to private playlists

## Privacy

- All data is fetched directly from Spotify's API
- No data is stored on any server
- Authentication tokens are stored locally in your browser
- Data is never shared with third parties

## Deployment

### For Production Deployment:

1. Update the redirect URI in your Spotify Developer Dashboard to your production URL
2. Update `.env` with production values:
```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=https://yourdomain.com/callback
```
3. Build the project:
```bash
npm run build
```
4. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Credits

Built with ❤️ using Spotify Web API

Inspired by stats.fm and must.fm
