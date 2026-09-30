# Diagramed

Object-first semantic physics editor, independent of Problemly. Live development app: https://jchristophm.github.io/diagramed/ . Source: `development`. `main` preserves the original import checkpoint; `original/` preserves the untouched source. No writes or deployment changes target Problemly.

## Use

**Object** defines a physical object before creating its representation. Choose circle, rectangle, point, or no visible representation. All describe point-like physical objects; a rectangle may visually represent a table without implying extended-body mechanics. Earth is available under Start with; it starts hidden and adds no constants or forces.

Select optional mass, electric charge or density, define a LaTeX symbol and choose Unknown or Known. A known property requires a finite value in one of the offered appropriate units. Mass/density cannot be negative; charge may be signed. Undefined properties are absent, never zero. Unknown properties contain no numerical value. Symbol collisions produce guidance; use distinct subscripts. Editing a symbol or value preserves its variable ID. Unchecking a property removes its owned variable.

**Objects** opens a compact collection containing visible and hidden definitions. Select a name to locate its representation, or use Edit, Hide/Show and Delete. Selecting on the canvas and in the collection uses the same semantic record. A visible object's name/property symbols are generated from its definition; optional labels can be switched off in Edit. Drag a label to position it independently. Double-click/double-tap an object or its label to edit its definition. Points have enlarged hit targets. Rectangles resize independently horizontally/vertically. Moving/resizing changes graphics, not semantic IDs.

**Open**, **Grid**, **Delete**, **Save** provide JSON opening, grid visibility, selected-object deletion and JSON downloading. Hiding preserves the saved appearance, transform, labels and position. JSON v1 files still load as legacy graphics and remain editable, but no generic creation tools are offered. Text/math on imported graphics edit with double-click/double-tap. There is no autosave, undo or unsaved-change prompt; download before leaving the page.

## Architecture and extension points

- `src/model.ts`: one authoritative document store, independent graphical IDs, presentation records. Konva is never the document database.
- `src/semantics.ts`: physical objects, variables and reserved interaction/vector/coordinate/component types.
- `src/objects.ts`: atomic confirmed object edits, property variable registry, visibility, presets and dependency-aware deletion. Property ownership is explicit, not based on a displayed symbol. UI drafts do not mutate the document.
- `src/property-form.ts`: property form draft and LaTeX previews; validates input before calling model operations.
- `src/geometry.ts`: `attachmentPoint()` computes a stable central attachment location from stored geometry and transforms, without Konva.
- `src/renderer.ts`: reusable Konva interactions, independent touch targets, selection and derived synchronized labels. Label pixels, selection handles and Konva instances are transient.
- `src/main.ts`: object dialogs, collection, document controls, selection routing and legacy editing.
- `src/persistence.ts`: v1 migration, v2 validation and readable JSON.
- `src/math.ts`: cached internal KaTeX raster rendering from stored LaTeX source.

Phase 3 should add interaction/vector commands beside object commands, reference object IDs and variable IDs, and use `attachmentPoint()` for graphical attachment. Extend the quantity/type definitions and relationship validator for vector-owned variables. Do not infer physics from shape, position or label. The deletion policy currently removes owned property variables and linked graphics; it refuses deletion/removal when preserved interactions, vectors or components depend on them. This is the hook for future relationship-aware deletion. No forces or other vector creation, assessment, coordinates or Mathed features are implemented.

## Build, tests and deployment

`npm ci`, `npm test`, `npm run build`, `npx playwright install --with-deps chromium`, `npm run test:browser`. Browser tests run against compiled assets via Vite preview. `npm run dev` starts development. `TEST_URL=https://jchristophm.github.io/diagramed/ npm run test:browser` checks the live app.

GitHub Actions verifies pushes to `development` and pull requests, then deploys development after unit tests, TypeScript compilation/build and desktop/mobile browser tests pass. Pages is enabled with GitHub Actions and the environment allows `development`. All work is checkpointed to GitHub. Real mobile touchscreen acceptance remains separate from automated emulation. PR preview hosting is not configured.

See `docs/FORMAT.md`, `docs/STATUS.md`, `docs/DEVELOPMENT_CONTRACT_2.md` and `examples/semantic-objects.diagramed.json`.
