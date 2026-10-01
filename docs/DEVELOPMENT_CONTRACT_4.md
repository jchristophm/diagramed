
# DIAGRAMED DEVELOPMENT CONTRACT
## Coordinate Systems and Interface Consolidation

PROJECT: Diagramed
TARGET: Existing Diagramed GitHub repository
BRANCH: Existing development branch
SCOPE: Coordinate systems, vector-component integration, toolbar consolidation, and contextual dialog simplification

============================================================
1. OBJECTIVE
============================================================

Implement the semantic coordinate-system feature and simplify Diagramed's existing interface.

This development cycle has four deliverables:

1. Implement an interactive, semantic 1D/2D coordinate system.

2. Integrate the coordinate system with existing vector-component rendering and semantic relationships.

3. Consolidate the top toolbar, reusing the existing element-management modals.

4. Simplify object and vector creation/editing dialogs by eliminating redundant selectors and hiding irrelevant properties.

Preserve the existing semantic architecture, graphical capabilities, supported physics concepts, specialized object definitions, vector behaviors, and JSON persistence.

This cycle prepares Diagramed for a separate Mathed integration project. Do not implement mathematical equation editing, a shared mathematical token registry, or assessment functionality.

The goal is a working, tested implementation, not a prototype.

============================================================
2. REPOSITORY INSPECTION
============================================================

Before modifying code, inspect the existing Diagramed repository and its current development branch.

Specifically, identify:

- Existing semantic object and vector definitions.
- Object presets and category definitions.
- Object and vector creation/editing dialogs.
- Existing Objects and Vectors management modals.
- Current toolbar and its event handlers.
- Vector-component geometry and rendering.
- Resultant-force and component-label conventions.
- Canvas interaction, dragging, rotation, and touch support.
- Current JSON serialization and loading.
- Existing automated tests and development documentation.

Determine which existing components and utilities can be reused.

In particular, understand the relationship between the current "Start with" and "Category" object selectors before consolidating them. Preserve legitimate preset functionality while eliminating their ability to create contradictory object definitions.

Similarly, inspect how existing vector types determine their permitted properties and relationships before modifying those dialogs.

Do not rewrite working components, replace the rendering framework, or undertake an unrelated architectural refactor.

Follow the repository's established development conventions.

Implement changes incrementally and preserve a functional application throughout development.

Do not modify the production branch or deploy a public release.

============================================================
3. SEMANTIC COORDINATE SYSTEM
============================================================

3.1 General requirements

Implement a maximum of ONE coordinate system per diagram.

The coordinate system is a semantic element, independent of physical objects and vectors.

It has:

- A persistent semantic identity.
- An origin.
- An x-axis.
- An optional y-axis.
- An orientation.
- A dimensionality setting.
- A visibility setting.

Supported dimensions:

1D: One x-axis.

2D: Perpendicular x- and y-axes.

Default orientation:

Positive x points right.
Positive y points up.

Do not implement multiple coordinate systems, object-attached coordinate systems, or reference-frame transformations.

3.2 Creation

Add a Coordinates button to the top toolbar.

If no coordinate system exists, clicking Coordinates opens a creation interface allowing the student to choose 1D or 2D.

Create the coordinate system approximately at the center of the visible canvas.

If a coordinate system already exists, the same button opens its configuration interface instead of creating another.

Prevent duplicate coordinate systems at both the user-interface and semantic-model levels.

3.3 Visual representation

Use compact coordinate axes rather than lines extending across the entire canvas.

Display:

- The coordinate-system origin.
- Positive axis directions.
- Appropriate x and y labels.

Use styling consistent with Diagramed's existing graphical conventions.

The axes should be identifiable without visually dominating the physics diagram.

Editing and rotation handles should appear when the coordinate system is selected.

Avoid permanent visual clutter.

3.4 Positioning

Students can drag the coordinate system by its origin.

Dragging moves the entire coordinate system without altering its orientation.

Moving the coordinate system must not:

- Move physical objects.
- Move physical vectors.
- Change vector directions.
- Change coordinate-relative vector components.

The origin is a visual reference point and must not be attached to any physical object.

3.5 Rotation

Students can rotate the coordinate system interactively using a rotation handle.

Also provide an exact numerical rotation-angle input in its configuration interface.

Use mathematical angular conventions:

- Zero degrees: positive x points right.
- Positive angles: counterclockwise rotation.
- Negative angles: clockwise rotation.

Account correctly for screen coordinates, where positive screen y commonly points downward.

In 2D, the coordinate axes must remain perpendicular throughout rotation.

In 1D, the single x-axis rotates freely.

Rotation should immediately update any displayed vector components.

3.6 Configuration

Provide a coordinate-system configuration interface consistent with Diagramed's existing element editors.

Supported settings:

- Dimensionality: 1D or 2D.
- Rotation angle.
- Visibility.
- Delete coordinate system.

Position is primarily controlled by dragging the origin on the canvas.

Ensure that users can manipulate and configure the coordinate system using both mouse and touch interfaces.

Switching between 1D and 2D must preserve the existing origin and x-axis orientation.

Switching to 1D hides the y-axis and makes y-component displays unavailable.

Switching back to 2D restores the perpendicular y-axis.

These operations must not alter or delete physical objects or vectors.

3.7 Visibility and deletion

Students can hide and show the coordinate system without deleting its semantic definition.

When hidden, coordinate-system selection handles must not remain visible.

Existing physical objects and vectors remain unaffected.

Deleting the coordinate system removes its explicit definition and any dependent component displays or editing states that require it.

Do not delete physical vectors or their underlying semantic definitions.

============================================================
4. VECTOR-COMPONENT INTEGRATION
============================================================

4.1 Coordinate-relative components

Integrate the new coordinate system with Diagramed's existing vector-component implementation.

Components must be displayed relative to the coordinate-system axes rather than assuming fixed horizontal and vertical screen directions.

For 2D systems, components project along the rotated x- and y-axes.

For 1D systems, only the x-component is displayed. Do not incorrectly represent the original vector as entirely parallel to x if it has a perpendicular contribution.

Account for positive and negative component directions.

Rotating the coordinate system must update component geometry immediately.

Moving the coordinate-system origin must not change component directions or magnitudes.

Changing a vector's position or direction must update its displayed components appropriately.

4.2 Preserve existing conventions

Retain Diagramed's established graphical and semantic component behavior.

Specifically:

- Only the active vector displays components.
- Component graphics retain their existing dotted styling.
- Preserve current mathematical label conventions.
- Preserve object-specific and interaction-specific subscripts.
- Preserve existing component visibility behavior.
- Preserve existing resultant-force functionality.

Pay particular attention to normal forces, friction forces, resultant forces, and any special component behavior already implemented.

Do not replace semantic force relationships with generic graphical arrows.

Adapt the existing component-rendering mechanisms wherever possible.

4.3 Graphical versus numerical components

Diagramed's graphical vector lengths are qualitative unless explicit physical quantities establish numerical values.

Preserve this distinction.

Use vector geometry to construct graphical component projections.

Do not derive numerical physical quantities from displayed arrow lengths.

Do not automatically generate:

- Numerical component values.
- Trigonometric expressions.
- Mathematical equations.
- Derived physics quantities.

These belong to later mathematical and assessment functionality.

4.4 Existing diagrams and missing coordinate systems

Preserve compatibility with diagrams created before explicit coordinate systems existed.

Inspect the existing component implementation and retain appropriate legacy display behavior when loading those diagrams.

Do not silently insert an explicit coordinate system into existing files.

For newly created diagrams, coordinate-dependent component editing should clearly indicate when a coordinate system is needed.

Distinguish any retained legacy implicit horizontal/vertical convention from an explicitly defined coordinate system in the semantic model.

Do not create a second, competing component-rendering system.

============================================================
5. SEMANTIC MODEL AND PERSISTENCE
============================================================

Represent the coordinate system within Diagramed's existing semantic data architecture.

Its JSON representation must preserve:

- Stable identity.
- Dimensionality.
- Origin position.
- Orientation.
- Visibility.
- Any additional essential configuration.

Document the orientation convention and avoid ambiguity between screen coordinates and mathematical coordinates.

Preserve the semantic information necessary to determine which coordinate directions define vector components.

Prefer calculating derived graphical component geometry from authoritative semantic data rather than unnecessarily duplicating it.

The implementation must support complete JSON round-tripping.

After saving and reloading a diagram:

- The coordinate system must reappear in the correct location.
- Its dimensionality must be preserved.
- Its orientation must be preserved.
- Its visibility must be preserved.
- Its relationship to vector-component displays must remain correct.

Maintain backward compatibility with previously saved Diagramed files.

Do not introduce unnecessary changes to existing object or vector schemas.

The new semantic structure should be suitable for later consumption by Mathed and the assessment engine, but neither integration is part of this contract.

============================================================
6. TOOLBAR CONSOLIDATION
============================================================

6.1 Current toolbar

The current top toolbar contains:

Object | Objects | Edit | Vector | Vectors

It also displays the currently selected element.

Replace these redundant controls with a consolidated toolbar.

6.2 New toolbar

The new top toolbar contains four principal controls:

OBJECT
VECTOR
COORDINATES
ELEMENTS [dropdown]

Match the existing application's visual style.

The distinction is intentional:

The first three controls create or define semantic elements.

Elements provides access to existing elements and their management interfaces.

6.3 Creation controls

OBJECT:

Opens the existing object-creation dialog, with the simplifications specified later in this contract.

VECTOR:

Opens the existing vector-creation dialog.

COORDINATES:

Opens coordinate-system creation if none exists, or the existing system's configuration if one has already been created.

6.4 Elements dropdown

The Elements dropdown has three choices:

Objects
Vectors
Coordinate System

OBJECTS:

Launch the EXISTING Objects selection and management modal.

VECTORS:

Launch the EXISTING Vectors selection and management modal.

COORDINATE SYSTEM:

Launch the new coordinate-system configuration interface, or its creation interface when appropriate.

IMPORTANT:

The Elements dropdown is ONLY a launcher.

Do not construct replacement Objects or Vectors management interfaces.

Reuse their existing components, event handlers, selection behavior, editing controls, and deletion functionality.

Preserve all existing capabilities within these modals.

Avoid maintaining duplicate implementations of the same element-management functionality.

6.5 Remove the Edit button

Remove the standalone Edit button from the top toolbar.

Double-clicking an element on the canvas already opens its editor.

The existing Objects and Vectors management modals already expose editing controls.

Preserve both pathways.

Coordinate-system editing should follow the same general interaction conventions.

Ensure modal-based editing remains accessible on touch devices where double-clicking may be inconvenient.

The existing selected-element label may remain as passive status information if useful.

Do not introduce another permanent editing button.

6.6 Preserve existing utilities

Preserve existing functionality for:

- Opening JSON files.
- Downloading JSON files.
- Grid visibility.
- Element deletion.
- Other established application utilities.

Only consolidate the specified creation and management controls.

The generic graphical drawing primitives have ALREADY been removed from the user-facing toolbar.

Do not revisit their removal or unnecessarily change the underlying graphical infrastructure.

============================================================
7. SIMPLIFY OBJECT CREATION
============================================================

7.1 Eliminate redundant selectors

The current Define Object dialog contains two independent selectors:

Start with
Category

They contain substantially overlapping choices and permit contradictory configurations.

For example, it is currently possible to select Planet Surface as the starting template while independently selecting String/Cable as the category.

This must no longer be possible.

Replace the two independent selectors with ONE unified selector labeled:

Object type

This selector determines the object's semantic type and initializes the appropriate configuration.

Do not preserve conflicting independent type assignments behind the simplified interface.

7.2 Object types and presets

The unified selector must support the existing semantic object types, including:

- Ordinary physical object.
- Spatial point.
- Planet Surface.
- Spring.
- String/Cable.
- Charged Plate.
- Fluid.

Inspect the existing code for additional supported types and presets.

Preserve all legitimate existing functionality.

Preserve named presets such as Book and Rock wherever they currently exist.

If the existing implementation distinguishes a named preset from a semantic object type, maintain that distinction internally while presenting a coherent creation workflow.

A named preset must initialize a valid semantic object type with appropriate defaults.

It must never be possible to combine an incompatible preset and type.

Ordinary physical object should be the default generic creation choice.

7.3 Type-specific initialization

Selecting an object type must initialize its appropriate:

- Default name, when applicable.
- Representation.
- Physical properties.
- Specialized configuration.
- Existing default values.

For example:

Spring should initialize spring-appropriate configuration.

Planet Surface should initialize its existing planetary properties.

String/Cable should initialize its appropriate representation and configuration.

Ordinary physical object should offer its existing general representation options and applicable physical properties.

Preserve all supported specialized physical behaviors.

Do not change the underlying physics definitions.

7.4 Switching object types

When a student changes the selected object type during creation:

- Update the available representation options.
- Update the available properties.
- Update any type-specific configuration controls.
- Remove incompatible selections from the active configuration.
- Apply appropriate defaults for the newly selected type.

Do not allow properties from a previously selected, incompatible type to leak into the created object's semantic definition.

Preserve valid user-entered information where appropriate.

Do not unnecessarily erase shared values such as a custom name when changing types.

============================================================
8. CONTEXT-SENSITIVE OBJECT AND VECTOR DIALOGS
============================================================

IMPORTANT DESIGN PRINCIPLE:

Preserve disabled options where they help students discover available physics concepts during TYPE SELECTION.

However, once a specific object or vector type has been selected, its configuration dialog should display ONLY options relevant to that type.

Do not fill creation and editing dialogs with irrelevant disabled controls.

Apply this principle consistently throughout object and vector configuration.

8.1 Preserve discovery during type selection

Retain the application's existing approach of displaying unavailable or disabled options where appropriate during object-type and vector-type selection.

This helps students discover supported physics concepts and understand that certain capabilities exist but are not currently applicable.

Preserve the existing eligibility conditions and their semantic meaning.

Do not indiscriminately hide unavailable object or vector types from selection interfaces.

Consolidating the object selectors must not eliminate legitimate discovery behavior.

8.2 Context-sensitive object properties

Once an object type has been selected, display only the physical properties and configuration fields applicable to that type.

Currently, the ordinary physical object dialog displays properties such as:

- Mass.
- Electric charge.
- Density.
- Gravitational field strength.
- Spring constant.
- Extension/compression.
- Surface charge density.

Some are applicable, while others are correctly disabled.

Instead of displaying irrelevant properties as disabled controls, omit them from that type's configuration dialog entirely.

For example:

An ordinary physical object should display its applicable optional properties but should not display irrelevant controls for spring constants or surface charge density.

A spring should display its applicable spring-specific properties.

A charged plate should display its applicable charge-related properties.

A Planet Surface should display its applicable planetary properties.

Use the EXISTING semantic property-eligibility logic to determine which controls appear.

Do not invent a separate set of eligibility rules merely for presentation.

IMPORTANT:

An applicable OPTIONAL property must remain visible and available even if the student has not enabled it.

Only properties that are NOT APPLICABLE to the selected type should be hidden.

8.3 Context-sensitive vector properties

Apply the identical approach to vector creation and editing.

After the student selects a vector type, display only the configuration controls, relationships, and physical properties appropriate to that type.

Preserve the existing distinctions among:

- Force vectors.
- Field vectors.
- Acceleration vectors.
- Velocity vectors.
- Displacement vectors.
- Other supported semantic vector definitions.

Preserve specialized semantic relationships, including:

- Force: BY which object ON which object.
- Separation vectors: FROM which object or point TO which object or point.
- Existing contact-force and resultant-force relationships.
- Any other relationships currently defined by the application.

Do not introduce irrelevant fields or controls simply because another vector type supports them.

Preserve legitimate optional settings for the selected type.

Do not change existing vector eligibility requirements or permit invalid semantic relationships.

8.4 Creation and editing consistency

Apply context-sensitive controls to BOTH creation and editing dialogs.

The same semantic type should expose the same applicable properties regardless of whether the element is being created or edited.

When editing, preserve all existing valid property values.

If existing editing functionality permits changing an element's type, update the visible controls appropriately and prevent incompatible properties from persisting.

Do not add type-changing functionality to editors that do not currently support it merely to satisfy this requirement.

8.5 Context-sensitive representations and descriptions

Representation choices must also be appropriate to the selected object type.

Do not display irrelevant representation choices as disabled options inside the configuration dialog.

Inspect existing explanatory text and helper messages.

For example, the current statement:

"All representations describe point-like physical objects."

should appear only where that statement is actually applicable.

Do not display it indiscriminately for specialized types.

Preserve useful explanations, but remove irrelevant instructions and redundant interface text.

8.6 Avoid excessive redesign

This is a targeted dialog simplification, not a comprehensive redesign of object and vector editors.

Reuse existing components and business logic.

Remove unnecessary clutter without altering established physics functionality.

Preserve current semantic structures and JSON compatibility.

============================================================
9. INTERACTION AND USABILITY
============================================================

Maintain consistency with Diagramed's existing interface.

Required behaviors:

- Mouse interaction.
- Touch interaction.
- Existing canvas gestures.
- Reliable coordinate dragging.
- Reliable coordinate rotation.
- Adequately sized manipulation handles.
- Accessible modal-based editing.
- Responsive creation dialogs.
- Responsive element-management interfaces.

Prevent coordinate-system manipulation from accidentally moving unrelated objects or vectors.

Avoid permanent editing panels or floating toolbars that unnecessarily reduce canvas space.

The consolidated toolbar must remain usable on smaller screens.

The Elements dropdown should require no unusually precise pointer or touch interaction.

Context-sensitive dialogs should become shorter and easier to navigate, particularly on mobile devices.

Do not undertake a general application-wide visual redesign.

A separate stabilization and polishing cycle will follow.

============================================================
10. IMPLEMENTATION SEQUENCE
============================================================

Complete the work in the following order.

PHASE A: INSPECTION

Inspect the existing architecture and identify reusable components.

Pay particular attention to current component geometry, legacy file compatibility, object preset definitions, and property-eligibility rules.

PHASE B: COORDINATE SYSTEM

Implement:

- Semantic data structure.
- 1D and 2D support.
- Creation and configuration.
- Rendering.
- Origin positioning.
- Free rotation.
- Visibility.
- Deletion.
- JSON persistence.

Test this functionality before continuing.

PHASE C: VECTOR-COMPONENT INTEGRATION

Adapt existing vector-component behavior to the new coordinate system.

Verify rotated component geometry, signed directions, dimensionality changes, existing labels, and resultant-force behavior.

Preserve legacy diagram compatibility.

PHASE D: TOOLBAR CONSOLIDATION

Implement:

Object | Vector | Coordinates | Elements

Connect Elements directly to the existing management modals.

Remove the redundant toolbar buttons and standalone Edit button.

Preserve existing utility controls.

PHASE E: DIALOG SIMPLIFICATION

Consolidate object creation into one object-type selector.

Preserve compatible presets and existing object semantics.

Remove irrelevant disabled properties and controls from object and vector configuration dialogs.

Apply the same contextual presentation rules during creation and editing.

Preserve disabled options where appropriate during type selection for discovery purposes.

PHASE F: INTEGRATION AND REGRESSION TESTING

Test all affected workflows together.

Correct regressions introduced by this development cycle.

Keep changes focused on the agreed scope.

Commit coherent implementation stages following existing repository conventions.

============================================================
11. ACCEPTANCE TESTS
============================================================

The contract is complete only when the following behaviors have been verified.

COORDINATE SYSTEMS

[ ] Create a 1D coordinate system.

[ ] Create a 2D coordinate system.

[ ] New systems initially appear near the canvas center.

[ ] Drag the origin without affecting physical elements.

[ ] Rotate the system using its interactive handle.

[ ] Set an exact rotation angle.

[ ] Verify mathematical positive-angle conventions.

[ ] Verify perpendicular axes in 2D.

[ ] Switch between 1D and 2D without losing orientation.

[ ] Hide and show the system.

[ ] Delete the system without deleting physical elements.

[ ] Prevent creation of multiple coordinate systems.

VECTOR COMPONENTS

[ ] Display components relative to conventional axes.

[ ] Display components relative to rotated axes.

[ ] Verify positive and negative component directions.

[ ] Verify that components update when the axes rotate.

[ ] Verify that components update when a vector changes direction.

[ ] Verify that moving the coordinate origin does not change decomposition.

[ ] Confirm that only the active vector displays components.

[ ] Preserve dotted component styling.

[ ] Preserve established mathematical labels.

[ ] Preserve existing resultant-force behavior.

[ ] Verify that 1D displays only the applicable x-component.

[ ] Verify that switching dimensions does not destructively alter vectors.

TOOLBAR

[ ] Object launches the object-creation dialog.

[ ] Vector launches the vector-creation dialog.

[ ] Coordinates launches creation or configuration as appropriate.

[ ] Elements contains Objects, Vectors, and Coordinate System.

[ ] Objects launches the EXISTING Objects management modal.

[ ] Vectors launches the EXISTING Vectors management modal.

[ ] Existing management modal functionality remains intact.

[ ] The standalone Edit button has been removed.

[ ] Double-click editing continues to work.

[ ] Editing remains accessible through the management modals.

[ ] Existing utility controls remain functional.

OBJECT CREATION

[ ] The redundant Start with and Category selectors have been consolidated.

[ ] There is one coherent Object type selector.

[ ] Every existing supported object type remains available.

[ ] Existing legitimate named presets remain available.

[ ] Contradictory preset/type combinations are impossible.

[ ] Each type initializes its appropriate representation and properties.

[ ] Switching types updates configuration correctly.

[ ] Incompatible properties do not leak into created objects.

CONTEXT-SENSITIVE DIALOGS

[ ] Irrelevant properties are hidden rather than disabled.

[ ] Applicable optional properties remain visible even when unchecked.

[ ] Ordinary physical objects show only applicable properties.

[ ] Specialized objects display their appropriate properties.

[ ] Representation choices match the selected object type.

[ ] Helper text is contextually appropriate.

[ ] Vector dialogs show only type-relevant configuration controls.

[ ] Existing force and separation-vector relationships are preserved.

[ ] Creation and editing dialogs follow the same presentation rules.

[ ] Existing valid property values survive editing.

[ ] Type-selection interfaces retain appropriate discovery behavior.

PERSISTENCE AND REGRESSION

[ ] Save and reload a diagram with a rotated coordinate system.

[ ] Preserve origin, orientation, dimensionality, and visibility.

[ ] Preserve coordinate-relative component behavior after reloading.

[ ] Open previously saved Diagramed files successfully.

[ ] Do not silently redefine legacy coordinate behavior.

[ ] Preserve existing object and vector semantics.

[ ] Test the complete workflow with mouse interaction.

[ ] Test the complete workflow with touch interaction, where an appropriate testing environment is available.

[ ] Run existing automated tests.

[ ] Add automated regression coverage for new semantic behavior, geometry, persistence, and dialog eligibility.

[ ] Confirm that the application builds successfully.

============================================================
12. EXPLICITLY OUT OF SCOPE
============================================================

Do not implement:

- Mathed integration.
- Equation editing.
- Mathematical token registries.
- Automatic equation generation.
- Numerical vector-component calculations.
- Automatic trigonometry.
- AI tutoring.
- Automated assessment.
- Instructor authoring workflows.
- Canvas/LMS integration.
- PDF solution export.
- Multiple coordinate systems.
- Object-attached reference frames.
- New general-purpose drawing tools.
- An application-wide visual redesign.

Mathed will receive a separate development contract after reviewing the existing Chemed codebase.

Avoid speculative infrastructure for excluded functionality.

============================================================
13. COMPLETION AND REPORTING
============================================================

Before reporting completion:

1. Execute the available automated tests and build checks.

2. Add appropriate regression tests for newly implemented functionality.

3. Verify the important coordinate-system and interface workflows.

4. Test JSON round-tripping and backward compatibility.

5. Inspect the final changes for unintended modifications.

6. Commit the completed work to the appropriate development branch.

Provide a concise completion report containing:

- Implemented functionality.
- Significant architectural decisions.
- Reused and modified components.
- Automated tests executed and their results.
- Manual testing performed.
- Relevant commit identifiers.
- Known limitations or unfinished items.

Distinguish tested behavior from behavior that could not be verified.

If inspection reveals an architectural conflict with the requested implementation, preserve semantic correctness and existing functionality. Document significant deviations rather than silently changing the requested behavior.

Do not claim successful mobile or browser interaction testing unless it was actually performed.

============================================================
14. DEFINITION OF DONE
============================================================

Diagramed supports one fully interactive, semantically persistent 1D/2D coordinate system.

Its vector components respond correctly to the coordinate-system orientation while preserving existing vector semantics and graphical conventions.

The top toolbar has been consolidated into:

Object | Vector | Coordinates | Elements

The existing Objects and Vectors management modals are preserved and launched from the Elements dropdown.

Object creation uses one coherent type selector and no longer permits contradictory type/preset combinations.

Object and vector configuration dialogs display only the properties and options relevant to the selected semantic type, while type-selection interfaces retain appropriate discovery behavior.

Existing Diagramed files remain compatible.

The implementation is tested and ready for the separate Mathed/Chemed integration cycle.

END OF CONTRACT


CONTRACT AMENDMENT: ANGULAR THRESHOLD FOR COMPONENT DISPLAY

1. Treat vectors within 10 degrees (inclusive) of any positive or negative coordinate axis as aligned with that axis.
2. In 2D, display component arrows only when the vector differs from BOTH coordinate axes by more than 10 degrees.
3. Near either axis, suppress graphical decomposition entirely, including tiny perpendicular components and labels.
4. Measure differences relative to the ROTATED coordinate system.
5. Reevaluate whenever vector or coordinate system rotates.
6. Apply tolerance ONLY to graphical presentation. Preserve geometry and semantic data; never snap or rotate the vector to enforce alignment.
7. In 1D, suppress insignificant projections and unnecessary decomposition. Interpretation: suppress near parallel and perpendicular directions; otherwise show x only.
8. Use one configurable internal constant, default 10 degrees, without a user-facing setting.
