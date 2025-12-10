# Theme Token File System

## Overview

The theme system allows you to define multiple CSS token files (themes) that users can switch between via a dropdown in the left sidebar navigation. Each theme applies CSS custom properties globally and can also specify a background color for component preview areas.

## Configuration

### Basic Structure

In your `documentor.config.json`, define themes in the `theme.tokens` array:

```json
{
  "theme": {
    "tokens": [
      {
        "light": {
          "source": "src/themes/light.css",
          "background": "#FFFFFF"
        },
        "dark": {
          "source": "src/themes/dark.css",
          "background": "#1F2937"
        }
      }
    ],
    "defaultTheme": "light"
  }
}
```

### Theme Configuration Properties

Each theme object has the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `source` | string | Yes | Path to the CSS/SCSS file containing CSS custom properties |
| `background` | string | No | Background color for component preview areas (any valid CSS color value) |

### The `background` Property

The `background` property serves a specific purpose: **it sets the background color for live component preview areas in the documentation**.

**Why is this useful?**
- A light theme typically uses dark text on white backgrounds
- A dark theme typically uses light text on dark backgrounds
- Components need to be showcased against appropriate backgrounds to be visible and properly evaluated

**How it works:**
1. When a user selects a theme, the background color is applied via the CSS variable `--theme-background`
2. The `LivePreview` component uses `var(--theme-background, #f8f9fa)` as its background
3. All component previews across the documentation automatically use this background

**Example:**
```json
{
  "light": {
    "source": "src/themes/light.css",
    "background": "#FFFFFF"  // White background for light theme components
  },
  "dark": {
    "source": "src/themes/dark.css",
    "background": "#1F2937"  // Dark gray background for dark theme components
  }
}
```

## Theme CSS Files

Your theme CSS files should define CSS custom properties (CSS variables) at the `:root` level:

```css
/**
 * Light Theme Design Tokens
 * Default theme for component documentation
 */

:root {
  /* Primary Colors */
  --primary-color: #0066cc;
  --primary-hover: #0052a3;
  --primary-active: #003d7a;

  /* Background Colors */
  --background-primary: #ffffff;
  --background-secondary: #f9fafb;
  --background-tertiary: #f3f4f6;

  /* Text Colors */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;

  /* Component-Specific Tokens */
  --button-primary-bg: var(--primary-color);
  --button-primary-text: #ffffff;

  /* ... more tokens ... */
}
```

## Build Process

When you run `npm run docs:build`, the build system:

1. **Discovers themes** from `documentor.config.json`
2. **Parses CSS files** to extract token count and metadata
3. **Copies theme CSS files** to `docs/themes/`
4. **Generates theme index** at `docs/metadata/themes.json` containing:
   - Theme ID (derived from filename)
   - Theme name (formatted from filename)
   - Token count
   - Background color (if specified)
   - Metadata from JSDoc comments

## Runtime Behavior

### Initial Load
1. Documentation site loads `themes.json` on mount
2. Checks localStorage for saved theme preference
3. Falls back to `defaultTheme` from config (or first theme)
4. Applies theme CSS and background color

### Theme Switching
When a user selects a theme from the sidebar dropdown:
1. Previous theme CSS file is removed from document head
2. New theme CSS file is injected as `<link>` tag
3. Background color is applied via `--theme-background` CSS variable
4. All components automatically re-render with new token values
5. Theme preference is saved to localStorage

### CSS Variable Application
The theme background is applied to the preview container in VariantShowcase:
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

This ensures the entire preview area receives the theme background, eliminating white space around components. The LivePreview component itself remains styling-agnostic and simply renders the component without additional background styling.

## Backward Compatibility

The system supports the legacy format where themes map directly to file paths:

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

In this format:
- No background color is applied (uses default fallback)
- Theme CSS tokens are still applied globally
- All other functionality works the same

## Examples

### Minimal Configuration
```json
{
  "theme": {
    "tokens": [{
      "default": {
        "source": "src/themes/default.css"
      }
    }]
  }
}
```

### Multiple Themes with Backgrounds
```json
{
  "theme": {
    "tokens": [{
      "light": {
        "source": "src/themes/light.css",
        "background": "#FFFFFF"
      },
      "dark": {
        "source": "src/themes/dark.css",
        "background": "#1F2937"
      },
      "high-contrast": {
        "source": "src/themes/high-contrast.css",
        "background": "#000000"
      },
      "sepia": {
        "source": "src/themes/sepia.css",
        "background": "#F4ECD8"
      }
    }],
    "defaultTheme": "light"
  }
}
```

### Brand-Specific Themes
```json
{
  "theme": {
    "tokens": [{
      "acme-light": {
        "source": "src/themes/brands/acme-light.css",
        "background": "#FFFFFF"
      },
      "acme-dark": {
        "source": "src/themes/brands/acme-dark.css",
        "background": "#2C3E50"
      },
      "techcorp": {
        "source": "src/themes/brands/techcorp.css",
        "background": "#F0F4F8"
      }
    }]
  }
}
```

## Use Cases

### 1. Light/Dark Mode Support
Showcase components in both light and dark contexts with appropriate backgrounds:
- Light theme: white/light gray background
- Dark theme: dark gray/black background

### 2. Brand Customization
Create theme files for different brands or clients, each with their own background colors to match their design systems.

### 3. Accessibility Themes
Provide high-contrast themes with suitable backgrounds:
- High contrast theme on pure black background
- Large text theme with neutral background

### 4. Design System Evolution
Compare old vs new design system side-by-side with appropriate preview backgrounds for each version.

## Best Practices

1. **Choose appropriate background colors**: Select backgrounds that make components visible and match the theme's intended use case
2. **Use CSS variables in components**: Ensure your components reference CSS variables for colors, spacing, etc.
3. **Test theme combinations**: Verify components look correct with each theme's background
4. **Document token usage**: Add JSDoc comments to your CSS files to explain token purposes
5. **Maintain consistency**: Use similar token naming conventions across all themes
6. **Consider contrast**: Ensure sufficient contrast between component colors and preview backgrounds

## Troubleshooting

**Components not updating when theme changes?**
- Ensure components use CSS variables (e.g., `var(--primary-color)`)
- Check that theme CSS files are being copied to `docs/themes/`

**Background colors not applying?**
- Verify `background` property is set in theme config
- Check browser DevTools for `--theme-background` CSS variable on `:root`
- Ensure `LivePreview.scss` uses `var(--theme-background)`

**Themes not appearing in dropdown?**
- Check that `themes.json` exists in `website/build/metadata/`
- Verify theme CSS files exist in `website/build/themes/`
- Check browser console for fetch errors

## File Locations

- **Config**: `documentor.config.json`
- **Theme CSS Files**: `src/themes/*.css` (or your custom path)
- **Build Output**:
  - `docs/themes/*.css` (copied CSS files)
  - `docs/metadata/themes.json` (theme index)
- **Website Build**:
  - `website/build/themes/*.css`
  - `website/build/metadata/themes.json`
