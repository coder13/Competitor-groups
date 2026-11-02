### Competition-groups

[![Netlify Status](https://api.netlify.com/api/v1/badges/de795f72-dd3d-4adf-915f-2a11f9f58525/deploy-status)](https://app.netlify.com/sites/competition-groups/deploys)

## Summary

View WCA Competition groups digitally.

## Development

This project is built with Vite, React, and TypeScript.

Deployment test: updated PWA prompt language check, 2026-05-26.

```bash
git clone git@github.com/coder13/competitor-groups && cd competitor-groups

# this project uses yarn
yarn
yarn dev

# testing
yarn test

# component and page development
yarn storybook
yarn build-storybook
```

## WCIF v2 migration (0.1.1)

Public competition downloads pin `/competitions/{id}/wcif/version/2`. The API boundary
normalizes v2 personal-best `value` and attempt `value` to the existing helper/UI aliases
`best` and `result`, preserving the original fields, participation rules, linked rounds,
qualification dates/conditions, assignments and extensions. Round result `best` and
`average`, WCA Live, and the separate results API retain their existing contracts.
Persisted older UI data remains readable; new network requests always use v2.

Regression coverage lives in `src/lib/wcifV2.test.ts`; run `yarn test --runInBand`,
`yarn check:type` and `yarn build`. On 2026-11-02, both public endpoints still responded
for SlovenianNationals2026 (v1.1 / v2.2); the migration does not assume a confirmed shutdown.
See [WCA's migration notice](https://github.com/coder13/Competitor-groups/issues/92).
