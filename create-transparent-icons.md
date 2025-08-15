<!-- # Creating Transparent PWA Icons

## Problem
Your PWA icons currently show white/black backgrounds on mobile devices.

## Solution Options

### Option 1: Use Existing Icons with Transparent Background
If your `safenotewhite.png` and `safenoteblack.png` already have transparent backgrounds:
- ✅ Already configured in `vite.config.js`
- `safenotewhite.png` - for regular icons (works on dark backgrounds)
- `safenoteblack.png` - for maskable icons (works on light backgrounds)

### Option 2: Create New Transparent Icons
If your icons still have solid backgrounds, you need to:

1. **Remove Background**: Use any image editor to make background transparent
2. **Create Two Versions**:
   - `safenote-white.png` - White logo on transparent background
   - `safenote-black.png` - Black logo on transparent background

### Option 3: Use SVG Icons (Recommended)
Convert your logo to SVG format for best results:
```html
<!-- In public/ folder -->
safenote-icon.svg (white version)
safenote-icon-dark.svg (black version)
```

## Icon Specifications
- **192x192** - Small icon size
- **512x512** - Large icon size
- **Transparent background** - Essential for clean appearance
- **Purpose 'any'** - Regular icon usage
- **Purpose 'maskable'** - Android adaptive icons

## Testing
After making changes:
1. `npm run build`
2. `git add . && git commit -m "Fix PWA transparent icons"`
3. `git push`
4. Test on mobile device -->
