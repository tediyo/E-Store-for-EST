# Theme System Documentation

This document explains how to use and customize the theme system in the E Store application.

## Features

- **Three Theme Options**: Light, Dark, and Auto
- **System Preference Detection**: Auto theme follows the user's system preference
- **Persistent Storage**: Theme choice is saved in localStorage
- **Smooth Transitions**: CSS transitions for theme switching
- **Responsive Design**: Works on all screen sizes

## How to Use

### Theme Toggle Component

The theme toggle is available in two locations:
1. **Sidebar**: Below the navigation menu
2. **Header**: Top-right corner of the main content area

### Theme Options

1. **Light Theme**: Forces light mode regardless of system preference
2. **Dark Theme**: Forces dark mode regardless of system preference  
3. **Auto Theme**: Automatically follows the user's system preference

## Implementation Details

### Theme Context (`useTheme` hook)

```typescript
const { theme, setTheme, resolvedTheme } = useTheme()
```

- `theme`: Current user-selected theme ('light' | 'dark' | 'auto')
- `setTheme`: Function to change the theme
- `resolvedTheme`: Actual applied theme ('light' | 'dark')

### CSS Custom Properties

The theme system uses CSS custom properties for consistent theming:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #0f172a;
  --border-color: #e2e8f0;
  /* ... more properties */
}

.dark {
  --bg-primary: #0f172a;
  --text-primary: #f8fafc;
  --border-color: #475569;
  /* ... more properties */
}
```

### Tailwind Classes

Use Tailwind's dark mode classes for theme-aware styling:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content that adapts to theme
</div>
```

## Adding Theme Support to Components

### 1. Use the useTheme Hook

```tsx
import { useTheme } from '../hooks/useTheme'

function MyComponent() {
  const { resolvedTheme } = useTheme()
  
  return (
    <div className={`${resolvedTheme === 'dark' ? 'dark-styles' : 'light-styles'}`}>
      Content
    </div>
  )
}
```

### 2. Use Tailwind Dark Mode Classes

```tsx
<div className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
  <h1 className="text-gray-900 dark:text-white">Title</h1>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

### 3. Use CSS Custom Properties

```tsx
<div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
  Content using CSS variables
</div>
```

## Customization

### Adding New Theme Colors

1. Update `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      custom: {
        50: '#f0f9ff',
        500: '#0ea5e9',
        600: '#0284c7',
      }
    }
  }
}
```

2. Update `globals.css`:
```css
:root {
  --custom-color: #0ea5e9;
}

.dark {
  --custom-color: #38bdf8;
}
```

### Component-Specific Themes

For components that need custom theme logic:

```tsx
function CustomComponent() {
  const { resolvedTheme } = useTheme()
  
  const themeStyles = {
    light: 'bg-white text-black',
    dark: 'bg-gray-900 text-white'
  }
  
  return (
    <div className={themeStyles[resolvedTheme]}>
      Custom themed content
    </div>
  )
}
```

## Best Practices

1. **Always provide both light and dark variants** for colors, backgrounds, and borders
2. **Use semantic color names** (e.g., `--bg-primary` instead of `--bg-white`)
3. **Test both themes** during development
4. **Use CSS custom properties** for complex theme values
5. **Maintain consistent contrast ratios** in both themes

## Troubleshooting

### Theme Not Persisting
- Check that `ThemeProvider` wraps your app
- Verify localStorage is available and not blocked

### Dark Mode Not Working
- Ensure `darkMode: 'class'` is set in `tailwind.config.js`
- Check that dark mode classes are properly applied

### System Preference Not Detected
- Verify `prefers-color-scheme` media query support
- Check browser compatibility

## Demo Page

Visit `/theme-demo` to see all theme options in action and test component appearances in different themes.
