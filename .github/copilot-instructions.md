# WCA Competition Groups - GitHub Copilot Instructions

**ALWAYS follow these instructions first. Only fallback to additional search and context gathering if the information in these instructions is incomplete or found to be in error.**

This is a React + TypeScript web application for viewing WCA (World Cube Association) competition groups digitally. Built with Vite, Apollo Client for GraphQL, React Query for data fetching, and TailwindCSS/Styled Components for styling.

## Working Effectively

### Bootstrap and Setup

- **Node.js version:** Use Node.js v20+ (confirmed working: v20.19.5)
- **Package manager:** Always use Yarn v1.22+
- **Install dependencies:**
  ```bash
  yarn install --frozen-lockfile
  ```
  **NEVER CANCEL:** Takes ~75 seconds. Set timeout to 120+ seconds.

### Development Workflow

- **Start development server:**

  ```bash
  yarn dev
  ```

  Serves at http://localhost:5173/. Ready in ~1 second.

- **Production build:**

  ```bash
  yarn build
  ```

  **NEVER CANCEL:** Takes ~15 seconds. Set timeout to 60+ seconds.

- **Preview production build:**
  ```bash
  yarn serve
  ```
  Serves at http://localhost:4173/. Ready in ~1 second.

### Validation Commands

Run these commands in order before committing any changes:

1. **Lint code:**

   ```bash
   yarn lint
   ```

   Takes ~3 seconds. May show warnings but should have 0 errors.

2. **Type check:**

   ```bash
   yarn check:type
   ```

   Takes ~8 seconds. Must pass with no errors.

3. **Run tests:**
   ```bash
   yarn test
   ```
   **NEVER CANCEL:** Takes ~9 seconds. Set timeout to 60+ seconds. All 8 tests must pass.

## Manual Validation Requirements

**CRITICAL:** After making changes, ALWAYS test actual functionality:

1. **Start the development server:** `yarn dev`
2. **Navigate to http://localhost:5173/**
3. **Verify the homepage loads:** Should show "Competition Groups" header with search interface
4. **Test basic navigation:** Ensure UI components render without errors
5. **Check browser console:** No critical JavaScript errors (some GA/analytics warnings are expected)

## Repository Structure

### Key Directories

- `src/pages/` — Route-level components (main application screens)
- `src/components/` — Reusable React components
- `src/containers/` — Higher-level components managing state and logic
- `src/hooks/` — Custom React hooks
- `src/providers/` — Context providers for global state
- `src/lib/` — Utility functions and helpers
  - `src/lib/api.ts` — Data fetching and API abstraction
- `public/` — Static assets (DO NOT modify unless explicitly required)

### Configuration Files

- `package.json` — Dependencies and scripts
- `vite.config.ts` — Vite build configuration
- `tsconfig.json` — TypeScript configuration with path aliases (@/\*)
- `tailwind.config.js` — TailwindCSS configuration
- `eslint.config.mjs` — ESLint configuration
- `jest.config.ts` — Jest testing configuration

### Git Hooks (Husky)

- **Pre-commit:** Runs Prettier formatting automatically
- **Pre-push:** Runs `yarn lint && yarn check:type && yarn test` (takes ~20 seconds total)

## CI/CD Pipeline

GitHub Actions run on every PR:

1. **Lint workflow:** `yarn lint` (~3s)
2. **Type check workflow:** `yarn check:type` (~8s)
3. **Test workflow:** `yarn test` (~9s)

**All checks must pass before merge.**

## Development Guidelines

### Code Standards

- **TypeScript:** All code must be type-safe. Use existing types in `src/types` or extend as needed
- **Styling:** Prefer TailwindCSS utilities. Use Styled Components for component-scoped styles
- **State Management:** Use React Query for server state, Apollo Client for GraphQL
- **Testing:** Add Jest/React Testing Library tests for new features
- **Imports:** Use `@/` path alias for src imports (e.g., `import { Component } from '@/components/Component'`)

### Common Tasks

- **Add new component:** Create in `src/components/` with corresponding `.test.tsx` file
- **Add new page:** Create in `src/pages/` directory
- **Add utility function:** Add to appropriate file in `src/lib/`
- **Update API logic:** Modify `src/lib/api.ts`

## Timing Expectations

| Command           | Expected Time | Timeout Setting |
| ----------------- | ------------- | --------------- |
| `yarn install`    | ~75 seconds   | 120+ seconds    |
| `yarn build`      | ~15 seconds   | 60+ seconds     |
| `yarn test`       | ~9 seconds    | 60+ seconds     |
| `yarn lint`       | ~3 seconds    | 30+ seconds     |
| `yarn check:type` | ~8 seconds    | 30+ seconds     |
| `yarn dev`        | ~1 second     | 10+ seconds     |

**NEVER CANCEL long-running commands.** Builds may take longer on slower systems.

## Environment Setup

### Dependencies Already Installed

- React 18.2 + TypeScript 5.8+
- Vite 4.4+ for build tooling
- TailwindCSS 3.3+ for styling
- Jest + React Testing Library for testing
- ESLint + Prettier for code quality
- Husky for git hooks

### Environment Variables

- **Development:** No special environment variables required
- **Production:** Deployed via Netlify with automatic builds

## Known Issues

1. **Lint warnings:** Currently shows 3 minor unused variable warnings - these are acceptable
2. **Build warnings:** May show "chunks are larger than 500KB" - this is expected
3. **Console errors:** GA_MEASUREMENT_ID and FontAwesome blocked requests are expected in local development

## Testing Strategy

- **Unit tests:** Jest + React Testing Library (2 test suites, 8 tests)
- **Manual testing:** Always test UI functionality after changes
- **Snapshot testing:** Component snapshots are maintained for UI consistency
- **E2E testing:** Manual validation of user workflows required

## Quick Reference

```bash
# Full validation workflow (run before committing)
yarn install --frozen-lockfile  # 75s
yarn lint                        # 3s
yarn check:type                  # 8s
yarn test                        # 9s
yarn build                       # 15s

# Development
yarn dev                         # Start dev server
# Make changes, test manually at http://localhost:5173/

# Pre-commit validation runs automatically via Husky
```

Always reference these instructions first. Search or explore the codebase only when these instructions are insufficient or incorrect.
