# Scripts

## Thumbnail Generation

### Overview

The `generate-thumbnails.js` script automatically generates preview thumbnails for all prototypes by launching a headless browser, navigating to each prototype route, and capturing a screenshot.

### Usage

**Manual generation:**

```bash
npm run generate:thumbnails
```

**Automatic generation:**
Thumbnails are automatically regenerated during the build process via the `prebuild` hook:

```bash
npm run build  # Generates thumbnails first, then builds
```

### How It Works

1. Starts a Vite dev server on port 5173
2. Launches Puppeteer in headless mode
3. For each prototype defined in the script:
   - Navigates to the prototype route
   - Waits for network idle and additional render time (1.5s)
   - Captures a screenshot at 1200x675px (16:9 aspect ratio)
   - Saves to `public/thumbnails/{prototype-id}.png`
4. Cleans up browser and server processes

### Adding New Prototypes

When adding a new prototype, update both files:

**1. Update `src/labs/data/prototypes.ts`:**

```typescript
export const prototypes: PrototypeMetadata[] = [
  {
    id: "my-new-prototype",
    title: "My New Prototype",
    description: "Description here",
    // ... other fields
    deviceType: "desktop", // or "mobile" or "tablet"
  },
];
```

**2. Update `scripts/generate-thumbnails.js`:**

```javascript
const prototypes = [
  {
    id: "my-new-prototype", // Must match the ID in src/labs/data/prototypes.ts
    path: "/my-new-prototype", // The route to navigate to (must match your router config)
    deviceType: "desktop", // Must match the deviceType in prototypes.ts: 'desktop' | 'mobile' | 'tablet'
  },
];
```

Then run `npm run generate:thumbnails` to generate the new thumbnail.

### Configuration

You can adjust these settings in `generate-thumbnails.js`:

**Device Viewports:**
The script supports different viewport sizes for different device types:

- `desktop`: 1200x675px (16:9 aspect ratio)
- `mobile`: 375x667px (iPhone-like)
- `tablet`: 768x1024px (iPad-like)

**Other Settings:**

- `RENDER_DELAY`: Wait time after page load for animations (default: 1500ms)
- `SERVER_PORT`: Port for the dev server (default: 5173)

**Prototype Banner Behavior:**

- Desktop prototypes: Show banner by default (hidden in thumbnails via `?thumbnail=true`)
- Mobile/Tablet prototypes: Banner is hidden automatically (may render in device frames instead)

### Requirements

- Puppeteer will automatically install Chrome on first run
- If Chrome installation fails, run: `npx puppeteer browsers install chrome`

### Troubleshooting

**"Could not find Chrome" error:**

```bash
npx puppeteer browsers install chrome
```

**Timeout errors:**

- Increase `RENDER_DELAY` if your prototype has slow-loading content
- Check that your prototype route is accessible
- Ensure no other process is using port 5173

**Screenshot quality issues:**

- Adjust `deviceScaleFactor` in the script (currently set to 2 for retina displays)
- Increase viewport dimensions if needed
- Add additional wait conditions for dynamic content
