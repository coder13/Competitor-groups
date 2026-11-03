# Dual-round regression fixtures

Round-only extracts from the public WCIF v2 endpoints, inspected 2026-11-03:

- https://www.worldcubeassociation.org/api/v0/competitions/FMCEastMelbourne2026/wcif/version/2
- https://www.worldcubeassociation.org/api/v0/competitions/CubeAgainstCancerHongKong2026/wcif/version/2

Only the relevant event rounds are retained (FMC and 3x3, respectively). Person profiles and registration data are excluded. Extensions are cleared. Attempts and component values remain intact, with the official shared dual-round rankings.

WCA Regulation 9v4 defines ranking by the better result of either round; 9v4a retains both component results; 9v5 prohibits elimination between components. Advancement percentages count distinct competitors across the linked source rounds. Later participants need not match the original qualification estimate because of withdrawals/replacements.

Published-results endpoint verified separately on 2026-11-03: Hong Kong uses `1`, `2`, `f` for its three 3x3 rounds; FMC East Melbourne returned no published results. WCIF is available for both.


## Stored advancement semantics

- Qualification uses the distinct union of participant result rows, including blank rows, but not scheduled group assignments or registrations. Official ranks, the 75% cap, and ties are preserved.
- A populated target result roster takes precedence over calculated qualification. WCIF target membership takes precedence over published API membership; the latter is used only when the corresponding WCIF roster is empty. An unresolved API identity cannot prove that a known qualifier was excluded: known matches are settled, remaining eligible rows stay provisional.
- Without target participation, all calculated qualifiers are provisional when any source component is missing/empty or any result lacks its expected attempts. Completion respects format, cutoff, and zero-padded API attempts. Complete snapshots settle the estimate; they do not establish future organizer decisions.
- Selected Live rows override stored values and flags, including blank Live rows. Stored snapshots cannot reproduce all Live edit history, organizer-only state, or exact clinching simulation. Marking all calculated qualifiers provisional during incomplete rounds is deliberately conservative.
- Caption tests use actual English resources for timed, FMC, multi-blind, null, and linked thresholds. Storybook stories prefixed `Synthetic` are isolated edge-case fixtures, not evidence of a real competition incident.

Primary implementation references, inspected 2026-11-03:

- [Live advancement and clinching](https://github.com/thewca/wca-live/blob/main/lib/wca_live/scoretaking/advancing.ex)
- [Live open-round definition](https://github.com/thewca/wca-live/blob/main/lib/wca_live/scoretaking/round.ex): any result row, even blank, makes a round open.
- [Live expected attempts](https://github.com/thewca/wca-live/blob/main/lib/wca_live/scoretaking/result.ex)
- [Live WCIF export](https://github.com/thewca/wca-live/blob/main/lib/wca_live/synchronization/export.ex): includes blank result rows.
- [WCIF2 result conditions and units](https://github.com/thewca/wcif/blob/latest/specification.md#resultcondition)
