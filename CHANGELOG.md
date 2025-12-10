# Changelog

## Phase 3.2 Implementation - Theme Token File System

### Changes Made

#### 1. Theme Background CSS Update
**Changed**: Background color application to the correct parent container

**Location**: `VariantShowcase.scss` - `.preview-content` container

```scss
.preview-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  padding: 1.5rem;
  background: var(--theme-background, #f8f9fa);
  border: 2px dashed var(--border-color, #e5e7eb);
  border-radius: 0.375rem;
  transition: background 0.3s ease;
}
```

**Reason**: The theme background needs to be applied to the `.preview-content` parent container (in VariantShowcase) that wraps the LivePreview component. This ensures the entire preview area gets the theme background without white space around the component. The LivePreview component itself remains styling-agnostic and simply renders the component.

#### 2. Build Process Enhancement
**Added**: `copy-docs-assets` script to automate copying theme files

**File**: `scripts/copy-docs-assets.js`
- Automatically copies `docs/metadata/*` to `website/build/metadata/`
- Automatically copies `docs/themes/*` to `website/build/themes/`
- Integrated into `docs:dev` workflow

**Updated package.json scripts:**
```json
{
  "copy-docs-assets": "node ./scripts/copy-docs-assets.js",
  "docs:dev": "npm run docs:build && npm run build:website && npm run copy-docs-assets && node ./bin/documentor.js dev"
}
```

**Why**: Previously, theme files were generated in `docs/` but not automatically copied to the website build, preventing the ThemeSwitcher from loading themes. This automation ensures themes are always available to the documentation site.

#### 3. Configuration Format
**Updated**: `documentor.config.json` to use new theme structure

```json
{
  "theme": {
    "tokens": [{
      "light": {
        "source": "src/themes/light.css",
        "background": "#000000"
      },
      "dark": {
        "source": "src/themes/dark.css",
        "background": "#FFFFFF"
      }
    }]
  }
}
```

#### 4. ThemeSwitcher Styling Fix
**Changed**: ThemeSwitcher component to use fixed colors instead of CSS variables

**Before:**
```scss
.theme-switcher {
  background: var(--background-secondary, #f9fafb);
  border: 1px solid var(--border-color, #e5e7eb);
  // ... other CSS variable-based styles
}
```

**After:**
```scss
.theme-switcher {
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  // ... uses fixed hex colors throughout
}
```

**Reason**: The ThemeSwitcher is part of the sidebar navigation and should maintain the global sidebar appearance (white background) regardless of which theme is selected. Using CSS variables caused the switcher's background to change when themes were applied, which was inconsistent with the sidebar design.

### Components Affected

1. **VariantShowcase.scss** - `.preview-content` applies theme background
2. **LivePreview.scss** - Simplified, no theme background styling
3. **ThemeSwitcher.tsx** - Applies `--theme-background` CSS variable
4. **ThemeSwitcher.scss** - Fixed colors to maintain sidebar consistency
5. **Sidebar.tsx** - Displays ThemeSwitcher component
6. **theme-parser.ts** - Parses both `source` and `background` properties
7. **builder.ts** - Includes background in generated themes.json

### User-Facing Changes

#### What Users See
- **Theme Dropdown**: Appears in left sidebar between stats and component navigation
- **Theme Options**: Shows "Light" and "Dark" based on config
- **Live Background Updates**: Component preview backgrounds change instantly when theme is selected
- **Persistent Preference**: Selected theme saved to localStorage

#### How Backgrounds Work
- Light theme: Black background (#000000) for components
- Dark theme: White background (#FFFFFF) for components
- Allows proper visibility of components regardless of theme color scheme

### Developer Experience

#### Build Workflow
```bash
# Full development workflow (automated)
npm run docs:dev

# Or step by step
npm run docs:build       # Generate docs + themes
npm run build:website    # Build React app
npm run copy-docs-assets # Copy themes to build
npm run docs:serve       # Start server
```

#### File Structure After Build
```
website/build/
├── metadata/
│   ├── Button.json
│   ├── InputField.json
│   ├── index.json
│   └── themes.json       ← Theme configuration
└── themes/
    ├── light.css         ← Theme CSS files
    └── dark.css
```

### Testing Changes

To test the theme system:

1. **Start dev server**: `npm run docs:dev`
2. **Open browser**: Navigate to `http://localhost:6006`
3. **Check sidebar**: Theme dropdown should appear below stats
4. **Switch themes**: Select "Dark" from dropdown
5. **Verify background**: Component preview backgrounds should change
6. **Verify persistence**: Refresh page, theme should remain selected

### Documentation Updates

- **THEME_SYSTEM.md**: Updated CSS variable application section
- **PROJECT.md**: Phase 3.2 already documented
- **CHANGELOG.md**: This file (new)

### Breaking Changes

None - Backward compatible with legacy theme format (string paths).

### Migration Notes

Existing configurations using the old format still work:
```json
{
  "theme": {
    "tokens": [{
      "light": "src/themes/light.css",
      "dark": "src/themes/dark.css"
    }]
  }
}
```

This will load themes without background colors (uses default fallback).

---

**Date**: December 10, 2024
**Phase**: 3.2 - Theme Token File System
**Status**: Complete
