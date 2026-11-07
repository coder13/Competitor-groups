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

During `yarn dev`, NotifyComp token requests are proxied to
`https://www.competitiongroups.com`, so production WCA sign-in and NotifyComp
authorization work without running Netlify Functions locally. The deployed
function checks the WCA access token and competition permissions. Set
`NOTIFY_COMP_TOKEN_ORIGIN` in `.env.local` to use another deployed token issuer
or a local Netlify Dev server. Use a token issuer connected to the same WCA and
NotifyComp environments as the frontend, and restart Vite after changing it.
