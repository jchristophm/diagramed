# Document viewport and semantic Angles — implementation report

## Recovery and commits

The untouched development implementation was clean at
`43c4ad1580b6bac140e4573825b758c98dd955ad`. Its 246 unit tests and production build
passed before changes. Both local Git and GitHub retain it as
`backup/pre-document-zoom-angles-2026-10-02`.

The document/viewport refactor is isolated in commit `dcd489f`. Angles and final
regression refinements are a subsequent commit. No history was rewritten and no
Mathed integration was attempted.

## Substantially changed files

| Area | Files |
| --- | --- |
| Document/view | `src/model.ts`, `src/renderer.ts`, `src/main.ts`, `src/persistence.ts`, `src/objects.ts`, `src/coordinate-ui.ts`, `index.html`, `style.css` |
| Angle model/UI | new `src/angles.ts`, new `src/angle-ui.ts`, `src/semantics.ts` |
| Dependency protection | `src/physics.ts`, `src/coordinates.ts` |
| Regression coverage | new `tests/unit/viewport.test.ts`, `tests/unit/angles.test.ts`, `tests/browser/viewport.spec.ts`, `tests/browser/viewport-interactions.spec.ts`, `tests/browser/angles.spec.ts`, `tests/browser/view-helpers.ts`; migration and transform updates to existing regression files |

## Document and view representation

`presentation.canvas` has fixed logical document bounds: `width`, `height`,
`minX`, `minY`, and `coordinateSpace: "grid"`. Positions, dimensions, endpoints,
label offsets and physics coordinate origins are logical document quantities.
Ten logical units form one fine-grid interval; a 40-unit-wide rectangle is four
fine-grid intervals wide. Logical units have a nominal mapping of one CSS pixel
at 100%, independent of monitor density or viewport dimensions.

New documents cover 3200 × 2400 logical units (320 × 240 fine-grid cells), from
(-1600,-1200) to (1600,1200). Fine snapping is every 10 units, versus the former
20. Major lines appear every five fine intervals. Spawn offsets use this same
lattice near the canonical document origin (0,0). The user-created physics
coordinate origin is stored separately and can move independently.

The Konva Stage allocates only viewport-sized drawing buffers. A native DOM
scroll extent supplies horizontal and vertical scrolling. The Stage's single
scale/translation transform maps the fixed document to the viewport. Resizing
changes drawing-buffer dimensions and the visible region, never document
geometry. Zoom and scroll are editor state: they are not serialized, do not
create undo entries, and do not mark the document dirty.

Toolbar zoom is bounded to 50–200%, with 25-percentage-point increments. The
percentage resets to 100%. Buttons preserve the viewport-center document point.
Two-touch gestures share the same zoom, preserve the gesture focal point, and
translate the viewport as the centroid moves. One-touch object/vector editing
continues to use Konva. Native wheel/trackpad scrolling navigates the document.
Visual objects, arrows, dots, axes, components, dashes, text and arcs scale with
the document. Invisible hit regions compensate for zoom. Label hit areas extend
away from their top edge to avoid intercepting nearby object drags.

Surface creation and movement use document geometry. New surfaces span the
fixed document width; their labels start near the boundary. Their saved rectangle
is not rebuilt from browser dimensions. Migrated surface rectangles retain
original dimensions, rather than stretching to the larger working extent.

## Conservative migration

Versions 1, 2 and 3 remain supported. A file without the coordinate-space marker
is migrated once: subtract half its original canvas width/height from every
absolute graphic position and physics coordinate origin. Widths, heights,
radii, rotations, scales, relative vector endpoints and label offsets stay
unchanged. The old spawn center becomes (0,0). The working bounds grow to at least
3200 × 2400, and the grid tightens to at most 10 logical units. The marker prevents
repeat migration or scaling drift. Existing semantic IDs and authored values
are preserved.

## Angle records and controlled direction sources

Angles are optional `semantics.angles` records, separate from vectors and forces:

```json
{
  "id": "angle-id",
  "from": {"type": "vector", "vectorId": "vector-id"},
  "to": {"type": "axis", "coordinateSystemId": "coordinate-id", "axis": "x", "sign": -1},
  "value": 30,
  "visible": true,
  "presentation": {"x": 0, "y": 0, "labelOffset": [0, 0]}
}
```

`value` is optional explicit degrees. Drawing orientations never generate it.
The modal offers From, To, a read-only generated variable, optional Value and
Show angle. The category has a top-level tool and an Elements collection.
Arcs and labels can move independently, with persisted document-space offsets
and grouped gesture undo. Existing modal, collection and keyboard deletion
patterns are retained.

| Direction source | Persistent reference |
| --- | --- |
| Full vector | `{type:"vector", vectorId}` |
| Vector component | `{type:"component", vectorId, coordinateSystemId, axis}` |
| Signed axis | `{type:"axis", coordinateSystemId, axis, sign:1|-1}` |

Components use projections onto the actual rotated/reversed physics basis.
Their directions follow the projection's sign, not a generic positive axis.
Derived components are identified by vector + coordinate-system + axis, so no
unrelated vector or variable is created. The selector exposes nonzero component
projections even when presentation hides component arrows or suppresses them
within the existing ten-degree visual tolerance. Truly zero projections and
zero motion vectors have no direction. Axes/components require coordinates;
1D offers only x directions. Hidden source graphics retain semantic directions.

Labels use `theta_FROM,TO` notation rendered as `θ` with mathematical subscripts.
They are derived on demand, never stored as editable display text. The existing
`vectorSymbol` function reuses the project's object abbreviations, including
first-letter/second-letter conflict handling and participant subscripts. Duplicate
vector sources get deterministic disambiguation suffixes. Component axes append
to participant subscripts. Axis identifiers explicitly include `+` or `−`.
Renaming a source, introducing abbreviation conflicts, or editing From/To
regenerates the Angle label from its persistent IDs.

Screen-y inversion is internal. Arcs use the signed shortest rotation from From
to To, positive counterclockwise and negative clockwise. Rays at the display
vertex communicate source directions without moving the original vectors.

## Dependency behavior and limitations

Deleting a referenced vector, linked interaction group or coordinate system is
blocked with an explicit instruction to delete dependent angles first. Removing
friction/component source vectors during configuration is similarly protected.
Invalid imported reference IDs/types/signs are rejected atomically.

A retained source can become directionless when its projection becomes zero,
a motion magnitude becomes known zero, separation endpoints coincide, or a y
axis is disabled by 1D mode. Its Angle keeps its references, optional authored
value and offsets. Its arc is withheld; a visible warning and the Angles
collection identify the undefined direction. The user can repair the source,
choose another defined From/To, or delete the Angle. Nothing silently redirects.
These explicitly undefined states save/reload without losing references.

The canvas is finite. Geometry outside document bounds is not automatically
expanded. New elements always spawn near (0,0), including when the view is panned
away. Pan/zoom reopen at the editor's origin view rather than restoring a saved
camera. Two-touch behavior was tested with Chromium touch emulation; physical
Android/iOS devices were not available. Pinch focal preservation can be clamped
at a finite document boundary. Exactly opposite directions use the signed
principal-angle result; ±180° are geometrically indistinguishable. Explicit
values may intentionally differ from drawn directions and are not validated
against illustrative geometry. No 3D, inferred equations, grading, AI or Mathed
features were added.

## Verification

- All 246 prior unit tests retained, with migration/spawn expectations updated
  for the intentional coordinate change; additional viewport and Angle tests.
- Desktop and Pixel 7 touch browser regression scenarios cover existing objects,
  movement/resizing, semantic labels, forces, fields, linked contact groups,
  resultants, components, rotated/reversed coordinates, separation, surfaces,
  expressions, zero motion, modal edits, grid, native downloads, malformed loads,
  keyboard shortcuts, history grouping/cancellation and unsaved-work safeguards.
- New scenarios cover resize, zoom bounds/reset, repeated zoom, creation after
  resize/zoom, scroll, focal-point pinch and touch pan without dirtying geometry;
  angle vocabulary/naming, explicit values, visibility, dependencies, invalidation,
  repair, arc/label dragging, undo/redo, keyboard deletion and reopen.
- Nine existing examples were tested through migration and repeated save/load:
  `representative`, `version2`, `semantic-objects`, and scenarios A–F. Saved IDs,
  proportions and physical values were preserved. These include historical v1/v2
  and current semantic files; no additional personal saved diagrams were supplied.
- Browser gesture helpers now use the actual Stage transform rather than the old
  viewport-width/document-width fit ratio. Fixtures requesting a whole-page view
  explicitly set a camera; application-origin and mobile view behavior have
  separate regression coverage.

Final local verification after a clean `npm ci`: **271 unit tests passed**, **92
browser tests passed** across desktop and Pixel 7 projects; TypeScript and the
production build passed. `git diff --check` passed. The existing Vite bundle-size
advisory remains; it is not a new test/build failure. The repository's existing
GitHub Actions workflow performs verification, Pages deployment, and independent
live browser acceptance when `development` is pushed. Deployment status is
reported in the completion message.
