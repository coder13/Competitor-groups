Instruction file for the AI agent working on the WCA competition groups web application.

## Project Overview

This is a React + TypeScript web application for viewing WCA (World Cube Association) competition groups digitally. The project uses Vite for development/build, Apollo Client for GraphQL, React Query for data fetching, and TailwindCSS/Styled Components for styling. The AI agent working on this project should understand the modular, component-driven structure and adhere to the repository’s coding and testing practices.

---

## Code Layout

- `src/` — Main source code.
  - `pages/` — Route-level components.
  - `components/` — Reusable React components.
  - `containers/` — Higher-level components that manage state and logic. These use components and are used in pages.
  - `hooks/` — Custom React hooks.
  - `providers/` — Context providers for global state management.
  - `lib/` — Utility functions and helpers.
  - `lib/api.ts` — Data fetching and API abstraction layers.
- `public/` — Static assets.
- `package.json` — Project scripts and dependencies.
- `vite.config.ts` — Vite configuration.

---

## Setup & Dependencies

- **Node.js version:** Use the version compatible with Yarn 1.22+ and the dependencies in `package.json`.
- **Install dependencies:**
  ```bash
  yarn
  ```
- **No special environment variables** are required for development or testing by default.

---

## Building & Running

- **Development server:**
  ```bash
  yarn dev
  ```
- **Production build:**
  ```bash
  yarn build
  ```
- **Preview production build:**
  ```bash
  yarn serve
  ```

---

## Testing

- **Run all tests:**
  ```bash
  yarn test
  ```
- **Testing libraries:** Jest and React Testing Library.
- **Before committing, always run the tests** and ensure **all tests pass**. The AI agent must run the full test suite after changes.
- All new features and bug fixes should include or update relevant tests.

---

## Linting & Formatting

- **Lint code:**
  ```bash
  yarn lint
  ```
- **Type-check code:**
  ```bash
  yarn check:type
  ```
- **Formatting:** Prettier is used for code formatting. ESLint is used for linting. Import sorting is handled by Prettier plugins.
- The AI agent should fix any lint or type errors it introduces. (CI will fail if errors are present.)

---

## Coding Conventions

- **TypeScript:** All code must be type-safe. Use/extend types in `src/types` as needed.
- **Styling:** Use TailwindCSS for utility-first styles; use Styled Components for component-scoped styles.
- **State Management:** Use React Query for server state and Apollo Client for GraphQL APIs.
- **Data Fetching:** Abstract API logic into `/lib/api.ts`.
- **Routing:** Use React Router v6.
- **Testing:** All new logic must have corresponding Jest/RTL tests.
- **Internationalization:** Use `i18next` and `react-i18next` for translations.
- **Documentation:** Update `README.md` and add comments where necessary.
- **Function and variable names:** Should be clear and descriptive.
- **Components:** Prefer functional components and hooks. Reusable components must live in `src/components/`.
- **Event handlers:** Define `onClick` handlers with `useCallback` instead of inline lambdas.

---

## Commit & PR Guidelines

- **Commits:** Use clear, descriptive commit messages. Conventional Commits format is preferred (`feat: ...`, `fix: ...`, `refactor: ...`).
- **Pull Requests:** Include a summary of changes and reasoning. Reference issues if applicable (e.g., “Closes #123”).
- **CI:** Tests and linting run on every PR. Ensure all checks pass before finalizing.

---

## Additional Instructions

- **Do not modify** files in `public/` unless the task explicitly requires it.
- **Do not update dependencies** in `package.json` without approval.
- **New libraries:** Prefer existing dependencies or standard approaches first.
- **New files:** The agent can create new files for features or tests, but all new code should be covered by tests.
- **Comments:** Add comments to explain complex logic; maintainability is valued.
- **Composable components:** Prefer creating small, reusable components over monolithic views.
- **Keep instructions fresh:** When you discover new working conventions or project expectations, update this `AGENTS.md` to capture them.

---

If unsure, review the `README.md`, existing code, or add clarifying comments in your PR.
