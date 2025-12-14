# Pop-ups.dev Engine SDK

A lightweight, embeddable popup SDK for websites. Renders popups based on configurations fetched from the Pop-ups.dev API.

## Features

- 🪶 **Lightweight**: ~9KB gzipped
- 🔒 **Isolated**: Shadow DOM prevents CSS conflicts
- ⚡ **Smart Triggers**: Time delay, scroll percentage, exit intent
- 📊 **Frequency Capping**: Per session, per day, or lifetime
- 🎨 **Two Types**: Modal popups and Top Bar announcements

## Quick Start

```bash
npm install
npm run dev          # Development server
npm run build:sdk    # Build production bundle
```

## Usage

### Embed in Any Website

```html
<script 
  src="https://your-cdn.vercel.app/sdk.js" 
  data-api-key="YOUR_API_KEY"
></script>
```

That's it! The SDK will:
1. Read your API key from the script tag
2. Fetch popup configurations from the API
3. Display popups based on trigger rules

## Project Structure

```
src/
├── engine/              # Core rendering
│   ├── PopupRenderer.jsx    # Preact component
│   └── styles.js           # CSS-in-JS
│
├── sdk/                 # SDK bundle entry
│   ├── index.js            # Orchestration
│   ├── triggers.js         # Time/scroll/exit triggers
│   └── frequency.js        # View capping
│
└── preview/             # Dashboard export
    └── index.js            # React-compatible wrapper

dev/                     # Test pages
├── index.html              # Vite dev testing
└── production-test.html    # Production bundle testing

dist/                    # Built output
└── sdk.js               # Production IIFE bundle
```

## Vercel Deployment

This project is configured for Vercel. After connecting to GitHub:

1. **Build Command**: `npm run build:sdk`
2. **Output Directory**: `dist`
3. **Install Command**: `npm install`

The `vercel.json` is already configured with:
- CORS headers for cross-origin requests
- Proper caching headers
- Root URL redirects to `/sdk.js`

### CDN URL

After deployment, your SDK will be available at:
```
https://your-project.vercel.app/sdk.js
```

## Development

### Testing with Vite (HMR)
```bash
npm run dev
# Open http://localhost:5173/
```
> Note: Uses mock data in Vite due to module transformation

### Testing Production Bundle
```bash
npm run build:sdk
npx serve . -p 3333
# Open http://localhost:3333/dev/production-test.html
```

## Configuration

In `src/sdk/index.js`:

| Variable | Description |
|----------|-------------|
| `API_BASE_URL` | Supabase Edge Function URL |
| `USE_MOCK` | `true` for mock data, `false` for real API |
| `DEV_API_KEY` | Fallback API key for local dev |

## API Response Format

The SDK expects this JSON structure from your API:

```json
[
  {
    "id": "popup-uuid",
    "name": "Popup Name",
    "design": {
      "type": "modal|top_bar",
      "headline": "Title",
      "body": "Description",
      "btnText": "Button",
      "btnLink": null,
      "position": "top|bottom",
      "isSticky": true,
      "colors": {
        "background": "#ffffff",
        "text": "#333333",
        "buttonBg": "#0199fe",
        "buttonText": "#ffffff",
        "overlay": "rgba(0,0,0,0.5)",
        "closeIcon": "#999999"
      },
      "styles": {
        "borderRadius": "16px",
        "boxShadow": "subtle|medium|strong"
      },
      "showWatermark": true
    },
    "rules": {
      "trigger": {
        "type": "immediate|time_delay|scroll_percent|exit_intent",
        "value": 3
      },
      "frequency": {
        "cap": "always|once_per_session|once_per_user_24h|once_lifetime"
      }
    }
  }
]
```

## Build Commands

| Command | Description | Output |
|---------|-------------|--------|
| `npm run dev` | Vite dev server | http://localhost:5173/ |
| `npm run build:sdk` | Production IIFE | `dist/sdk.js` (~9KB gzip) |

## License

MIT
