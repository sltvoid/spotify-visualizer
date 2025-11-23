# Mobile & Desktop View Separation

This document explains how the Spotify Visualizer handles mobile and desktop views separately.

## Overview

The application now features a clear separation between mobile and desktop layouts, allowing for optimized user experiences on different device sizes.

## Architecture

### Hooks

#### `useIsMobile` (`src/hooks/useIsMobile.ts`)
- **Purpose**: Detects if the viewport is mobile-sized
- **Default breakpoint**: 768px
- **Returns**: Boolean indicating mobile state
- **Usage**: `const isMobile = useIsMobile();`

#### `useViewportSize` (`src/hooks/useIsMobile.ts`)
- **Purpose**: Returns viewport category
- **Returns**: `'mobile' | 'tablet' | 'desktop'`
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1023px
  - Desktop: ≥ 1024px

### Mobile-Specific Components

#### `MobileTabBar` (`src/components/MobileTabBar.tsx`)
- Fixed bottom navigation bar
- Shows 5 primary tabs: Overview, Insights, Artists, Library, Recent
- Icon-based navigation with labels
- Active tab highlighted with Spotify green glow effect
- Only visible on mobile screens (`md:hidden`)

#### `MobileHeader` (`src/components/MobileHeader.tsx`)
- Sticky top header with current tab title
- Hamburger menu to access all tabs
- Slide-in navigation menu from the right
- Spotify logo and app branding
- Replaces the large desktop header on mobile

### Layout Differences

#### Mobile Layout (`< 768px`)
```
┌─────────────────────┐
│  Mobile Header      │ ← Sticky top with menu
├─────────────────────┤
│                     │
│  Time Range (card)  │
│                     │
│  Content            │
│                     │
│                     │
├─────────────────────┤
│  Mobile Tab Bar     │ ← Fixed bottom
└─────────────────────┘
```

**Features**:
- Sticky header with hamburger menu
- Time range selector shown as a card above content
- Fixed bottom tab bar with 5 primary tabs
- Full menu accessible via hamburger icon
- Compact spacing (p-4)
- Bottom padding to accommodate tab bar (pb-24)

#### Desktop Layout (`≥ 768px`)
```
┌─────────────────────────────┐
│    Spotify Logo & Title     │
├─────────────────────────────┤
│      User Profile Card      │
├─────────────────────────────┤
│  ┌─ Tabs ────────────────┐  │
│  │ Overview | Artists... │  │
│  ├───────────────────────┤  │
│  │ Time Period Selector  │  │
│  └───────────────────────┘  │
├─────────────────────────────┤
│         Content             │
│                             │
├─────────────────────────────┤
│         Footer              │
└─────────────────────────────┘
```

**Features**:
- Large centered header with animated logo
- User profile card
- Horizontal tab navigation with all tabs visible
- Time range selector integrated into tabs card
- Maximum width container (max-w-7xl)
- Generous spacing (p-8)
- Footer with attribution

## Implementation in Dashboard

The Dashboard component (`src/pages/Dashboard.tsx`) uses conditional rendering:

```tsx
const isMobile = useIsMobile();

return (
  <div className="min-h-screen relative z-10">
    {isMobile ? (
      // Mobile Layout
      <>
        <MobileHeader {...} />
        <div className="p-4 pb-24 space-y-4">
          {renderContent()}
        </div>
        <MobileTabBar {...} />
      </>
    ) : (
      // Desktop Layout
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Desktop header, tabs, content */}
        </div>
      </div>
    )}
  </div>
);
```

## Shared Content

The `renderContent()` function is shared between both layouts, ensuring consistent data display while allowing layout-specific optimizations.

## Future Mobile Improvements

Now that mobile/desktop views are separated, mobile-specific enhancements can be made:

1. **Touch gestures**: Swipe between tabs
2. **Pull-to-refresh**: Reload data
3. **Optimized components**: Smaller charts, condensed lists
4. **Progressive loading**: Lazy load content
5. **Mobile-specific animations**: Touch feedback
6. **Orientation handling**: Portrait vs landscape layouts
7. **Safe area handling**: iOS notch support

## Testing

To test different layouts:
1. **Desktop**: View on screens ≥ 768px wide
2. **Mobile**: View on screens < 768px wide
3. **Browser DevTools**: Toggle device toolbar and select mobile devices
4. **Resize window**: Observe layout switch at 768px breakpoint

## Customization

To adjust the mobile breakpoint:
```tsx
const isMobile = useIsMobile(1024); // Use 1024px instead of 768px
```

To add more mobile tabs, edit `MOBILE_TABS` in `MobileTabBar.tsx`.
