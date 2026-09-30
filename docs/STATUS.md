# Development Contract 2 status

Working branch: `development`. `main` preserves the original import. Problemly is unchanged.

## Saved milestones

1. Interface and semantic creation: `92a30508e265892cd229b32942ca6808f79970f1`.
2. Properties and variable registry: `31d16a3e203c2d9fe378295d897767a466fb0581`.
3. Collection, visibility and synchronized labels: `12af6c8c197f3ce49769489ace52031a43cae3e0`.
4. Final checkpoint completes version 2 JSON, explicit version 1 migration, acceptance tests and deployment documentation.

## Validation

On 2026-09-30 UTC, all 16 unit tests and all 10 production-build browser tests passed. TypeScript compilation and production build passed. Browser tests cover desktop and emulated Pixel 7 touch, the full Rock/Table/Earth acceptance scenario, persistent IDs through editing and reopening, rectangle resize, hidden appearance restoration, property changes, enlarged point interaction, collision guidance, deletion and genuine Phase 1 graphics without invented semantics. Invalid imports preserve the open document.

Final deployment verification is pending the workflow for this checkpoint. Live development URL: https://jchristophm.github.io/diagramed/ . GitHub Actions tests and deploys `development` automatically.

## Architecture and limitations

The authoritative document store owns semantic objects and independent graphical records. Object properties reference persistent variables with quantity, owner, units and explicit known/unknown state. Geometry attachment points and dependency-aware deletion provide Phase 3 entry points. See README.md and docs/FORMAT.md for architecture and migration details.

Actual mobile touchscreen acceptance is reserved for the user. There is no autosave, undo, unit conversion, physics solving, force creation, Mathed integration, server storage or image export. Existing legacy graphics remain editable, but generic creation is removed. The cloud proxy may require a temporary local browser ignoreHTTPSErrors setting for live tests; the committed browser configuration does not disable certificate checks.
