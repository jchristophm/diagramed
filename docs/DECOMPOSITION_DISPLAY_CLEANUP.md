# Decomposition display cleanup

## Files changed

- `src/model.ts`: optional presentation offsets for component and component-angle labels.
- `src/persistence.ts`: validate saved offset kinds, axes, coordinate pairs and finite numeric bounds.
- `src/renderer.ts`: draggable label images, gesture history, offset restoration and retained decomposition during coordinate selection/rendering.
- `tests/unit/labels.test.ts`: offset round trips, legacy document-space migration, semantic/geometry preservation and malformed-offset rejection.
- `tests/browser/decomposition-display.spec.ts`: independent mouse/touch dragging, geometry and semantic invariance, undo/redo, zoom/pan, reload, retained decomposition, coordinate configuration and transfer to another vector.
- `tests/browser/coordinates.spec.ts`: retained overlay after origin movement; inspect live decomposition midway through rotation.
- `tests/browser/angles.spec.ts`: expect retained angle overlay after coordinate selection.
- `docs/DECOMPOSITION_DISPLAY_CLEANUP.md`: this completion report.

## Component-label offsets

The existing vector graphic stores optional `decompositionLabels.components.x` and `.y` pairs, each `[offsetX, offsetY]` in document-space units. Each pair is relative to that component's generated label anchor. Dragging writes only the dragged pair. No semantic component record or vector geometry is changed.

## Component-angle label offsets

The same graphic stores optional `decompositionLabels.angles.x` and `.y` document-space pairs relative to generated angle-label anchors. The image is draggable; its parent angle group and arc are not. Existing automatic collision placement computes default anchors independently of these manual offsets, preventing redraw/reload from moving another label after a drag. Both undefined and numerical angle labels use this rendering path.

Offsets are serialized with presentation data, validated on import, and reapplied during rendering. Missing offsets default to zero. Existing document transforms convert pointer movement into document coordinates, so zoom and pan do not change their meaning. Each drag uses the existing history transaction mechanism and creates one undoable edit.

## Active decomposition during coordinate interaction

The renderer retains the last selected vector graphic when selection moves to the coordinate system. Full redraws also restore coordinate selection while retaining that vector. Existing origin and rotation handlers refresh the same decomposition during the gesture; coordinate configuration, dimensions and reversals regenerate it from current coordinate state. Selecting another vector transfers the overlay. Existing visibility switches and tolerance still gate rendering. This active selection is transient renderer state, not saved label or semantic data.

## Regression results

- `npm test`: **351 passed**, including 7 new offset persistence/validation cases.
- `npm run build`: **passed**.
- `npm run test:browser -- --workers=2`: **106 passed** on Desktop Chrome and Pixel 7 touch, including 4 new browser cases.
- Existing save/load, history, zoom, pan, physical quantities, vector, component, angle and coordinate suites all passed.
- The development deployment workflow reruns the full suite before deployment and against the published GitHub Pages application. Its final status is available in the repository Actions history.

## Scope confirmation

Only label display offsets and retention of the decomposition during coordinate interaction changed. Component/angle semantics, numerical angle-definition behavior, decomposition tolerance, coordinate geometry, viewport/scaling architecture and UI layout are unchanged. No features, unrelated refactoring, Mathed or Notebook integration were added.
