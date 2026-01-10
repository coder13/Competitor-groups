# Dark Mode Implementation Guide

This document describes the dark mode implementation in the Competition Groups application and provides guidance for developers adding dark mode support to new components.

## Overview

The application uses Tailwind CSS's class-based dark mode strategy. The theme preference is managed via a React context provider and persisted in localStorage.

## Architecture

### Theme Management

- **Provider**: `UserSettingsProvider` manages the theme state
- **Context**: `UserSettingsContext` provides access to theme settings
- **Hook**: `useUserSettings()` hook for accessing theme in components
- **Storage**: Theme preference is stored in localStorage with the key `competition-groups.{CLIENT_ID}.theme`

### Theme Options

1. **Light**: Always use light theme
2. **Dark**: Always use dark theme
3. **System**: Follow the system's color scheme preference

### Implementation Details

The `UserSettingsProvider`:

- Monitors system theme preference via `window.matchMedia('(prefers-color-scheme: dark)')`
- Applies the `dark` class to `document.documentElement` when dark mode is active
- Persists the user's theme choice to localStorage
- Restores the theme on page load

## Adding Dark Mode to Components

### Basic Pattern

Use Tailwind's `dark:` variant to add dark mode styles:

```tsx
<div className="bg-white dark:bg-gray-800">
  <h1 className="text-gray-900 dark:text-white">Title</h1>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

### Common Patterns

#### Background Colors

```tsx
// Main backgrounds
className = 'bg-white dark:bg-gray-900';

// Card/panel backgrounds
className = 'bg-white dark:bg-gray-800';

// Nested/elevated backgrounds
className = 'bg-gray-50 dark:bg-gray-700';
```

#### Text Colors

```tsx
// Primary text
className = 'text-gray-900 dark:text-white';

// Secondary text
className = 'text-gray-600 dark:text-gray-400';

// Muted/tertiary text
className = 'text-gray-500 dark:text-gray-500';
```

#### Borders

```tsx
// Default borders
className = 'border-gray-200 dark:border-gray-700';

// Emphasized borders
className = 'border-gray-300 dark:border-gray-600';
```

#### Links

```tsx
// Primary links
className = 'text-blue-700 dark:text-blue-400';

// With underline
className = 'text-blue-700 dark:text-blue-400 underline';
```

#### Interactive States

```tsx
// Hover
className = 'hover:bg-gray-100 dark:hover:bg-gray-700';

// Focus
className = 'focus:ring-blue-500 dark:focus:ring-blue-400';

// Active/Selected
className = 'bg-blue-100 dark:bg-blue-900';
```

#### Shadows

```tsx
// Subtle shadow
className = 'shadow-md dark:shadow-gray-800';

// No shadow in dark mode (optional)
className = 'shadow-md dark:shadow-none';
```

## Examples from the Codebase

### Header Component

```tsx
<header className="bg-white dark:bg-gray-800 shadow-md">
  <Link to="/" className="text-blue-500 dark:text-blue-400">
    <i className="fa fa-home" />
  </Link>
</header>
```

### List Item Component

```tsx
<li
  className="border bg-white dark:bg-gray-800 dark:border-gray-700 
               hover:bg-slate-100 dark:hover:bg-gray-700">
  <p className="text-gray-900 dark:text-white">{title}</p>
  <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
</li>
```

### Button Component

```tsx
<button
  className="bg-white dark:bg-gray-800 
                   text-gray-900 dark:text-white
                   border-gray-200 dark:border-gray-700
                   hover:bg-gray-100 dark:hover:bg-gray-700">
  Click me
</button>
```

## Testing Dark Mode

### Manual Testing

1. Navigate to `/settings`
2. Select "Dark" theme
3. Verify all visible components display correctly
4. Check for:
   - Proper contrast between text and backgrounds
   - Visible borders and dividers
   - Readable link colors
   - Appropriate hover states

### Automated Testing

When adding dark mode classes to components with snapshot tests, update the snapshots:

```bash
yarn test -u
```

## Color Palette Reference

### Light Mode

- Background: `white`, `gray-50`
- Text: `gray-900`, `gray-600`, `gray-500`
- Borders: `gray-200`, `gray-300`
- Links: `blue-700`

### Dark Mode

- Background: `gray-900`, `gray-800`, `gray-700`
- Text: `white`, `gray-400`, `gray-500`
- Borders: `gray-700`, `gray-600`
- Links: `blue-400`

## Best Practices

1. **Always pair background and text colors**: When you change a background to dark, update text colors for contrast
2. **Test with both themes**: Always check that your component looks good in both light and dark mode
3. **Use semantic color scales**: Stick to the established gray and blue scales for consistency
4. **Consider interactive states**: Don't forget to add dark mode variants for hover, focus, and active states
5. **Update tests**: Remember to update snapshot tests when adding dark mode classes

## Accessibility

- Maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Test with high contrast mode enabled
- Ensure focus indicators are visible in both themes

## Future Enhancements

Potential improvements to the dark mode system:

- Add more theme options (e.g., high contrast, custom themes)
- Implement per-page theme overrides
- Add transition animations when switching themes
- Create a theme preview component
- Add keyboard shortcuts for theme switching
