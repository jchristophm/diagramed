# Derived component angles and numerical quantity labels

This pass replaces the general-purpose Angle model on `development` and implements section 25A. The previous standalone-Angle implementation and completed viewport are preserved at `backup/pre-derived-component-angles-2026-10-02` (commit `7f3921e42a52f4be552f60addd47eb414a436e53`). The branch was clean; its 271 unit tests passed before changes, and its preceding GitHub verification, Pages deployment, and 92 live browser tests were successful.

## 1. Recovery reference

The named backup exists both locally and on GitHub. No wholesale revert was performed. Document coordinates, bounds, scrolling, pan, zoom, pinch, grid spacing and selection-handle scaling remain in place.

## 2. General Angle removal

Removed `src/angles.ts` and `src/angle-ui.ts`, the toolbar tool, From/To modal, Elements collection, independent arc/label dragging, warning banner, generic direction-reference types and `semantics.angles` type. Removed generic-Angle deletion restrictions while retaining existing physical relationship/expression restrictions.

## 3. Retained useful work

`src/component-angles.ts` reuses the former approach to signed projections against rotated/reversed axes, mathematical screen-y inversion, participant notation, and geometric direction reconstruction. Arc drawing with a shortest signed sweep remains in the renderer, now inside the selected-vector decomposition layer. Mathematical image rendering and all document transforms remain shared with other labels. Existing angle tests were replaced with component-angle tests.

## 4. Data representation

Each `PhysicalVector` may hold:

```ts
showAngles?: boolean; // absent means true
componentAngle?: {
  coordinateSystemId: string;
  axis: 'x' | 'y'; // the most recently authored field
  value: number; // degrees, 0 through 90 inclusive
};
```

Existing `Graphic.showComponents` remains the component switch. The complementary degree value is derived, never redundantly stored. Angle quantity identity is `(vector ID, coordinate-system ID, component axis)`. Neither rendered labels nor generic Angle elements are stored. Old files default to angles visible and values undefined.

## 5. Compact naming

For a vector type whose generated base symbol is unique in the document, labels are `\theta_{W,x}`, `\theta_{W,y}`, or the corresponding vector base (`v`, `a`, `F`, etc.). When multiple vectors share that base, the existing participant/disambiguated magnitude symbol is used inside the theta subscript. This distinguishes repeated force/motion types without inventing editable names. Axis subscripts are always `x` or `y`, never `-x` or `-y`.

## 6. Signed directions

The vector is projected onto `coordinateBasis(angle, reverseX, reverseY)`. Each component direction is its actual projection times that basis. The arcs connect the resultant direction to these signed component directions, so they are local and acute and add to 90 degrees. Reversing an axis changes projection signs without changing the physical component ray. Both arcs originate at the vector's attached tail, independently of coordinate-system origin. Label placement searches nearby document-space positions to avoid semantic/component labels and the other angle label, including longer numerical definitions. Arc anchors and vector geometry stay fixed.

## 7. Shared 10-degree rule

`componentAngleGeometry` calls the existing `graphicalComponents`. There is no new display threshold. Both angle arcs/labels are absent at or inside the inclusive 10-degree boundary of either axis and present outside it when two components exist. In 1D, existing x-component behavior remains; angle controls are visible but disabled because a complementary pair requires 2D.

## 8. Vector-modal controls

Without coordinates, the modal says “Define a coordinate system to display components and angles.” With coordinates, it shows a read-only symbol beside each optional degree input and a checked-by-default Show angles checkbox. The complete fieldset stays visible but disabled when decomposition is suppressed, zero, 1D, or components are switched off. Helper text explains availability and dependencies. Only the selected vector has a decomposition overlay; selecting coordinates or deselecting removes it.

## 9. Complementary fields

Editing either field updates the other to `90 - value`; the newly edited axis becomes the authored axis. Clearing either field clears both. Values are not filled from drawing orientation. Floating-point artifacts in derived complements are rounded to twelve significant digits; explicitly stored numbers are retained without display truncation.

## 10. Save and Cancel

Typing updates modal draft state only. Save vector groups the semantic edit, visibility settings and geometry constraint into one undoable transaction. Cancel or dismiss leaves geometry, visibility and authored values untouched. Changing magnitude to known zero clears an existing direction constraint rather than making a direction for a zero vector.

## 11. Orientation selection and attachments

The four local solutions relative to the undirected x basis are compared with the current direction using principal angular distance. The nearest solution is chosen, preserving the current quadrant as closely as possible. The direction is applied without grid-rounding the endpoints, preserving exact drawn length and tail. The drawn length is not interpreted as a numerical physical magnitude.

Linked normal/friction/resultant vectors retain their orthogonal/resultant relationship by rotating the contact group together. Editing a friction or resultant entry still uses the established contact-group modal, but its angle controls and selected overlay refer to that actual vector. Sibling authored angles whose directions change are cleared.

A separation derives its direction from FROM/TO attachments. Applying its angle keeps FROM fixed and relocates TO around it, preserving separation length and both endpoint references. The modal explicitly explains this behavior. Other separation constraints affected by endpoint movement are invalidated. Independent motion/force/field vectors retain their own attachment and length.

## 12. Coordinate invalidation

Changing rotation, axis reversal or dimensionality clears authored definitions without moving physical vectors. Deletion also clears definitions. Origin-only translation and visibility-only changes preserve them, because those do not change component directions. The modal explains that orientation/configuration edits clear known angles. Direct coordinate rotation handles use the same invalidation behavior and existing gesture history.

## 13. Manual direction invalidation

Endpoint drag, object movement/transform affecting a separation, and graphical vector direction edits compare the before/after semantic directions. Authored definitions clear when the direction changes or becomes zero; they do not silently acquire a replacement value. Length-only changes and ordinary attached-vector translation preserve definitions. Contact-group dependencies are included in the direction comparison.

## 14. Legacy compatibility

`parseDocument` discards obsolete `semantics.angles` before relationship validation and document-space migration. Generic records are ignored even if their old references/presentation are malformed: they are unsupported historical records, not migrated constraints. Their values cannot safely be reinterpreted as the new component angles. The rest of the file receives the existing strict validation. Saving the loaded document omits the obsolete records. Versions 1/2/3 and existing viewport migration remain supported.

## 15. Numerical definitions (25A)

`src/quantity-labels.ts` is the shared numerical display convention. Existing quantities with `state: 'known'` render their generated variable plus `= value unit`; unknown and pre-existing expression-state quantities retain the variable only. The same helper renders component-angle numbers with degree notation. No values come from graphical length, angle, size or position.

All existing object property labels participate: mass, electric charge, density, local gravity, spring constant, extension/compression, and surface charge density. All existing vector magnitude labels participate: forces, fields, velocity, acceleration, displacement and separation. Known-zero motion keeps its existing scalar label-only presentation. Stored preset gravity (9.8 m/s²) and fluid density (1000 kg/m³) are shown as real definitions. The existing generated naming convention is retained, including compact `g`/`k` where the project already uses it rather than forcibly adding subscripts.

Units use roman mathematical text and actual superscripts (`m/s²`, `kg/m³`, etc.); dimensionless unit `1` is conventionally omitted. Scientific notation is rendered as a mantissa times a power of ten. Value/unit edits and conversion to unknown regenerate labels from the same variable ID. No display string is serialized. Existing interaction-only coefficient/volume quantities have no dedicated diagram label in the current editor; no new label surface or quantity type was introduced for them.

## 16. Validation results

Local verification: 344 unit tests passed; TypeScript and the production Vite build passed (the existing bundle-size warning remains); all 102 desktop/mobile browser cases passed across the full regression run and the corrected coordinate-gesture rerun. The full run passed 101 cases and failed only an overly strict sub-pixel pointer-angle assertion; both projects passed after matching that assertion to the existing one-degree gesture precision. `git diff --check` passed. GitHub verification passed all 102 cases for the main implementation. The final label-collision adjustment also passed all 12 angle browser cases locally, including an assertion that defined angle labels do not overlap semantic/component labels; desktop/mobile screenshots were inspected. The deployment workflow reruns all 102 browser cases and repeats them against Pages for the final commit. Coverage includes quadrants, rotated/reversed coordinates, the exact 10-degree boundary, nearest constraints, provenance, complementary updates, visibility, selection, zero/1D cases, invalid input/import, legacy generic records, linked contact/separation behavior, Save/Cancel, undo/redo, coordinate gestures, manual direction changes, numerical labels, value/unit edits and reload.

Existing viewport/pinch/pan/history/physics/notation/legacy-example suites remain part of the full browser run, on desktop Chrome and Pixel 7 touch emulation. Screenshots are visually inspected for label placement. Physical Android/iOS hardware is not claimed as tested.

## 17. Scope preservation

No Mathed integration, new expression editor, expression evaluation, unit algebra, numerical propagation, equation generation or physical-correctness assessment was added. The existing legacy expression feature is retained without expanding it. Changes to renderer selection and label placement are limited to the derived-angle behavior and semantic numerical display; viewport/scaling algorithms are unchanged.
