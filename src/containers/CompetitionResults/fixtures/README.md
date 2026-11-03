# Dual-round regression fixtures

Round-only extracts from the public WCIF v2 endpoints, inspected 2026-11-03:

- https://www.worldcubeassociation.org/api/v0/competitions/FMCEastMelbourne2026/wcif/version/2
- https://www.worldcubeassociation.org/api/v0/competitions/CubeAgainstCancerHongKong2026/wcif/version/2

Only the relevant event rounds are retained (FMC and 3x3, respectively). Person profiles and registration data are excluded. Extensions are cleared. Attempts and component values remain intact, with the official shared dual-round rankings.

WCA Regulation 9v4 defines ranking by the better result of either round; 9v4a retains both component results; 9v5 prohibits elimination between components. Advancement percentages count distinct competitors across the linked source rounds. Later participants need not match the original qualification estimate because of withdrawals/replacements.

Published-results endpoint verified separately on 2026-11-03: Hong Kong uses `1`, `2`, `f` for its three 3x3 rounds; FMC East Melbourne returned no published results. WCIF is available for both.
