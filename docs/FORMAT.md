# Diagramed native JSON, version 1

Top-level `format` is `diagramed`; `version` is the integer `1`. `id` is the document's persistent UUID. `metadata` contains title and ISO creation/update timestamps. `semantics` and `presentation` are explicitly separate.

`semantics` contains arrays `objects`, `interactions`, `variables`, `vectors`, `coordinateSystems`, `components`, initially empty. Their types are documented in `src/semantics.ts`. Property values in object `properties` are variable IDs. Semantics are stored without applying physics rules in this milestone. The validator checks structure, not physical correctness or referential physics consistency.

`presentation.canvas` stores positive `width` and `height` in document units; `grid` stores positive `size` and boolean `visible`. `presentation.elements` is ordered bottom-to-top; array order is drawing order. Each element has independent persistent `id`, optional `semanticId`, and `kind` (`rectangle`, `circle`, `line`, `arrow`, `dashedArrow`, `text`, `latex`).

Each primitive stores `x`, `y`, `rotation` in degrees, signed nonzero `scaleX`/`scaleY`, `width`, `height`, `radius`, four local endpoint coordinates in `points`, `stroke`, `fill`, `strokeWidth`, `text`, `latex`, `fontSize`, and `fontFamily`. Shared fields not used by a particular primitive remain present for a uniform schema. Rectangle position is its upper-left; circle position is its center. Lines/arrows use local endpoints relative to x/y. Transform is translation, rotation, then local scaling. Text uses native natural width; math size derives from regenerated source at its stored font size, then applies scale/rotation.

Rendered math pixels, Konva nodes, active selection and controls are transient. Math source remains editable on reopen. Download uses UTF-8, two-space indentation, an application/json MIME type and `.diagramed.json` extension. Saving does not change metadata; editing does.

Validation rejects malformed JSON, unsupported version/format, missing required fields, duplicate/empty element or semantic IDs, unknown kinds, nonfinite/oversized geometry, zero scales, invalid dimensions and unsafe grid density. Limits: 10 MB file, 5,000 entries per array, 100,000 characters per text field, 10,000 document units per canvas axis, 10,000 grid lines. Extra fields are retained to accommodate metadata extensions, but version 1 readers must not infer meaning from them. Use a new format version for incompatible changes.

Round-trip equivalence means preserving document content, element identity, geometry, transform, order, editable text/math and semantic definitions; property order/whitespace are irrelevant. File rejection leaves the current diagram intact.
