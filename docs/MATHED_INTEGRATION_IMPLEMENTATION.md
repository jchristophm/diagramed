# UI cleanup and Mathed expression integration

## Delivered behavior

Component-angle inputs now form compact mathematical rows with a narrow numerical field and an adjacent degree symbol. The section is hidden when meaningful two-component angles are unavailable, including missing/1D coordinates, alignment within the existing tolerance, hidden component display and zero motion. Angle definition, complementary values and direction constraints retain their existing behavior.

Contact friction follows the requested sequence: friction type, rendered force/coefficient variables, optional coefficient definition, then **Define friction** with Unknown/Known/Expression. Static or kinetic selection immediately creates the appropriate unknown dimensionless coefficient in an isolated semantic draft. Its existence is independent of the definition checkbox. Coefficient units are stored as `1` and have no visible unit control.

Force interaction dropdowns show every supported interaction category, with unavailable categories disabled. BY/ON selectors retain only eligible actual objects. Vector-type discovery remains intact.

The normal coordinate modal no longer exposes canvas-relative numeric rotation. Existing orientation data, direct manipulation, reversal, dimensions, persistence and explanatory guidance remain. There is no new accessibility mode.

Velocity, acceleration and displacement graphics now use freely editable presentation positions while retaining object ownership, direction, length, color, labels and history. Forces and fields retain their attachment rules. Shared-origin markers count attached vectors rather than freely positioned motion. A `motionPlacement: "free"` presentation flag enables one-time adoption of the old attached visual origin when importing historical motion graphics.

## Mathed reuse and integration

`src/vendor/mathed/` pins the existing reusable editor to `jchristophm/mathed` commit `f261d6834d381216667a13dc37255f6c5cf897d4`. The model, controller, renderer, vocabulary, LaTeX implementation and styles are reused. `mathed.ts` has two small instance API additions: live vocabulary updates and variable insertion through the retained controller cursor. Numeric pending input is committed before dropdown insertion. Editing, nested structures, keyboard/touch controls, deletion, navigation, autocomplete and structured output remain Mathed's implementation. No runtime download or separate application frame is needed.

`src/expression-ui.ts` is the shared host adapter used for object properties, vector magnitudes, separation magnitudes, friction and interaction volume. Coefficients intentionally retain Unknown/Known controls as requested. Every embedded expression editor has a compact Variables dropdown with mathematically rendered entries. Opening it leaves Mathed's logical cursor intact; selection inserts a persistent-ID token in that position, including a nested slot, and restores editor focus. Autocomplete uses the same IDs.

Vocabulary includes all semantic variable IDs currently exposed by the document or modal draft, plus the existing immutable constant IDs. Unknown and hidden quantities remain usable. No contextual relevance filter is applied. Existing component variables are included through the semantic variable registry; graphical decorations do not invent variable identities or numerical quantities.

Vector dialogs use an isolated DocumentStore draft with stable IDs. Changes immediately update all embedded vocabularies. Saving commits that same draft; cancellation never commits it. Object forms allocate draft property IDs, expose enabled properties immediately, and preserve those IDs when saving. Renames update generated vocabulary symbols without replacing references.

## Expression data and canvas rendering

Legacy Diagramed expression trees still load and render. Editing imports them structurally into Mathed. New definitions store `state: "expression"` and `expression: { type: "mathed", expression: [...] }`, preserving Mathed's nested mathematical nodes and variable IDs rather than strings, HTML or authoritative LaTeX. Persistent references are resolved to current symbols for rendering.

Canvas labels append the expression RHS to the variable where that quantity is normally displayed. Label dragging, document-space offsets, zoom/pan, history and reload remain shared with existing labels. Numerical definitions retain their established formatting.

Validation checks structured data, supported nodes, completeness and available IDs. It does not infer relevant operands, reject cycles as mathematical errors, evaluate expressions, check units or judge mathematical/physical correctness. Removing a referenced quantity still requires removing its references first, preventing dangling IDs. Modal failures remain visible and do not mutate the saved document.

Legacy friction interactions missing a coefficient acquire an unknown coefficient once on load; subsequent reloads preserve its ID. Existing numerical coefficient data is retained.

## Files changed

- UI and adapters: `index.html`, `style.css`, `src/main.ts`, `src/vector-ui.ts`, `src/coordinate-ui.ts`, `src/property-form.ts`, `src/expression-ui.ts`.
- Semantic data, persistence and rendering: `src/semantics.ts`, `src/model.ts`, `src/expressions.ts`, `src/objects.ts`, `src/physics.ts`, `src/persistence.ts`, `src/quantity-labels.ts`, `src/renderer.ts`.
- Reused Mathed source and provenance: `src/vendor/mathed/{mathed,controller,model,vocabulary,renderer,latex}.ts`, `style.css`, `ORIGIN.md`.
- New tests: `tests/unit/mathed-integration.test.ts`, `tests/browser/mathed-integration.spec.ts`.
- Updated regressions: unit expressions; browser angles, cleanup, coordinates, decomposition display, expressions, history, integration, refinements, zero motion, and view helpers.
- This implementation report.

## Validation

- Unit suite: **358 passed**.
- Production TypeScript/Vite build: **passed**.
- Full desktop/mobile browser suite: **124 passed**.
- Selected-motion drag/handle checks after the final adjustment: **6 passed**.
- Earlier focused interaction/integration suite: **50 passed**.
- Focused final interaction checks: **28 passed**, including independent expression-label movement/persistence, unknown identifiers, invalid-definition feedback, referenced-coefficient removal, nested cursor insertion and motion movement.
- Desktop and Pixel 7 touch screenshots were inspected for the embedded editor and compact vocabulary control.

The development workflow runs the full suite before Pages deployment and again against the published application. Final workflow status is available in the repository Actions history.

## Scope

Semantic objects, interactions, vectors, variables and presentation remain distinct. No Notebook, assessment, tutoring, accessibility mode, automatic equation generation, numerical solving, unit algebra, correctness checking or unrelated architecture rewrite was added.
