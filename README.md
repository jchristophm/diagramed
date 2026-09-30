# Diagramed

Independent browser diagram editor, imported from the Problemly vector editor. The original source is preserved verbatim in `original/`; see `SOURCE.md` for provenance. Original files are reference material, not the active application.

## Architecture

- `src/model.ts`: authoritative native document and graphical primitives, persistent UUIDs, document editing operations.
- `src/semantics.ts`: independent typed definitions for future objects, interactions, variables, vectors, coordinate systems and components. Generic graphics have no inferred physical meaning.
- `src/renderer.ts`: Konva instances and transient selection controls; pointer interactions commit changes into the model. Canvas presentation scales to the viewport without changing stored geometry.
- `src/math.ts`: regenerated KaTeX rendering from editable LaTeX source; cached images are transient.
- `src/main.ts`: tools, label/math editor, file picker, loading and downloading. File loads validate and pre-render math before replacing the current document.
- `src/persistence.ts`: version checking, validation, human-readable JSON serialization.

Future semantic creation should add model operations that create definitions first, then optionally create graphics with independent `id` and `semanticId`. Define relationship constraints in the semantic/model layer, never in Konva. Assessment consumes the native document. This milestone does not execute physics constraints or calculations.

## Development and checks

`npm ci`, `npm test`, `npm run build`, `npx playwright install --with-deps chromium`, `npm run test:browser`. `npm run dev` starts a local preview in Work. No local environment is needed on the user's computer.

Work is on `development`; `main` preserves the untouched import checkpoint. Each milestone is pushed independently. GitHub Actions tests pull requests and rebuilds/deploys pushes to `development`, only after unit, compilation and desktop/mobile browser tests pass.

## One-time GitHub Pages setup

In this repository only, open **Settings → Pages → Build and deployment → Source → GitHub Actions**. If the `github-pages` environment restricts deployment branches, allow `development`. Then rerun the Verify and deploy workflow if necessary. Expected URL after successful deployment: https://jchristophm.github.io/diagramed/ . A URL is not evidence of a successful deployment; verify the workflow's deploy job before claiming it is live.

No Problemly hosting settings, branches or files are changed. No accounts, backend storage, authentication, image exports or Bubble messaging are part of the active application.

## Preserved controls and limitations

Top toolbar: solid arrow, dashed arrow, line, box, circle. Bottom toolbar: Open JSON, math, label, grid visibility, delete, Download JSON. Drag unselected lines/arrows; select them to adjust independent endpoints with enlarged touch targets. Other elements use Konva resize/rotation controls. Labels and math edit on double-click/double-tap; the label editor uses a modal to avoid the source's inconsistent textarea cancellation. Grid snapping remains active when the grid is hidden. Delete key does not delete elements while typing.

Document coordinates are independent of viewport dimensions; changing screen size scales the view. New documents start at the available canvas size. Selection, transformer handles and touch hit zones never enter JSON. There is no undo, unsaved-change prompt or multi-selection, matching the scope of the original editor. Label wrapping uses natural text width. LaTeX rendering is an internal raster display, recreated from source; no PNG/SVG export is offered. Real touchscreen testing remains a user acceptance step even after mobile emulation passes.

See `docs/FORMAT.md` and `examples/representative.diagramed.json` for the native format.
