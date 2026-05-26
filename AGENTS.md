Use space-y instead of mt-2 for better spacing between elements.
Always use spacing in multiples of 2 unless you need to use odd spacing for a specific reason. This helps maintain visual consistency across the app.

## Branch and deployment workflow

- `main` is the GitHub default branch and Netlify production branch.
- `beta` is the permanent integration and beta-testing branch.
- Feature and fix PRs should target `beta`, not `main`.
- Production releases happen by opening or updating the deploy PR from `beta` into `main`.
- Use the manual GitHub Actions `Deploy` workflow to create or update the `beta` -> `main` release PR.
- PRs into `main` are guarded and should only come from `beta`.
