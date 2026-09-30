# Development Contract 2 status

Working branch: `development`. `main` preserves the original import. Problemly is unchanged.

## Saved milestones

1. Interface and semantic creation: `92a30508e265892cd229b32942ca6808f79970f1`.
2. Properties and variable registry: `31d16a3e203c2d9fe378295d897767a466fb0581`.
3. Collection, visibility and synchronized labels: `12af6c8c197f3ce49769489ace52031a43cae3e0`.
4. JSON, migration and acceptance checkpoint: `d9adfe72aaaeb4ea8702627287917d1fabe644f6`. The subsequent handoff commit records live verification.

## Validation

On 2026-09-30 UTC, all 16 unit tests and all 10 production-build browser tests passed. TypeScript compilation and production build passed. Browser tests cover desktop and emulated Pixel 7 touch, the full Rock/Table/Earth acceptance scenario, persistent IDs through editing and reopening, rectangle resize, hidden appearance restoration, property changes, enlarged point interaction, collision guidance, deletion and genuine Phase 1 graphics without invented semantics. Invalid imports preserve the open document.

GitHub Actions run 36664331170 completed verification and deployment successfully for application commit d9adfe72aaaeb4ea8702627287917d1fabe644f6. All 10 desktop/mobile browser acceptance tests also passed independently against the deployed URL on 2026-09-30 UTC. Development Contract 2 is complete; no implementation work remains. Live development URL: https://jchristophm.github.io/diagramed/ . GitHub Actions tests and deploys `development` automatically.

## Architecture and limitations

The authoritative document store owns semantic objects and independent graphical records. Object properties reference persistent variables with quantity, owner, units and explicit known/unknown state. Geometry attachment points and dependency-aware deletion provide Phase 3 entry points. See README.md and docs/FORMAT.md for architecture and migration details.

Actual mobile touchscreen acceptance is reserved for the user. There is no autosave, undo, unit conversion, physics solving, force creation, Mathed integration, server storage or image export. Existing legacy graphics remain editable, but generic creation is removed. The cloud proxy may require a temporary local browser ignoreHTTPSErrors setting for live tests; the committed browser configuration does not disable certificate checks.


## Contract 3 in progress

Object categories, specialized presets/renderers and version 3 object persistence are implemented. 24 unit tests and TypeScript/production build pass. Local Chromium cannot launch because this execution environment denies its socket operation; desktop/mobile browser verification is delegated to the existing GitHub Actions workflow. Checkpoint 1 is pending that browser result. Checkpoints 2–5 remain unfinished. Resume from development; do not touch main or Problemly.

Checkpoint 1 confirmed: GitHub Actions run 36749778933 passed all 24 unit tests, build and 12 desktop/mobile browser tests and deployed successfully (commit 7e10c90a11811f1f67dcdc160fb75df3d9f18196). The first candidate failed only because a regression test assumed variable array order; it now checks persistent IDs.

Checkpoint 2 candidate: canonical constants, interaction-owned quantities, separation commands and UI, constrained endpoint attachment, visibility, abbreviations and ownership validation are implemented. 27 unit tests and build pass. Browser tests will run in GitHub Actions. Full force/field/motion UI and expressions remain unfinished.

Checkpoint 2 verified and deployed: 40998b5ec279b25eb505327f0913c542148b9dd7, GitHub Actions run 36750432191. Unit/build and 14 desktop/mobile browser tests passed.

Checkpoint 3 candidate adds all semantic force categories, fields and motion vectors, reusable deterministic eligibility, linked normal/friction/resultant graphics, magnitude editing and collections. 31 unit tests and production build pass; browser verification is pending this push. Expressions and final acceptance/deployment handoff remain unfinished.
