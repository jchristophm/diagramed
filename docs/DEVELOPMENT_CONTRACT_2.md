# Diagramed: Development Contract 2
## Semantic Objects, Physical Properties and Variable Registry

**Repository:** `jchristophm/diagramed`  
**Starting branch:** `development`  
**Execution:** ChatGPT Work  
**Objective:** Transform Diagramed from a generic drawing application into an object-first semantic physics editor.

### 1. Primary objective

Build the semantic object-creation system using the existing TypeScript architecture established in Development Contract 1.

Every newly created graphical object must represent a defined physical object. Students should not be able to draw arbitrary shapes that lack semantic identities.

Implement physical properties and the mathematical variable registry, including known and unknown quantities.

Preserve our existing Konva rendering foundation, touch controls, grid snapping and JSON persistence.

This is not a visual redesign. However, the original generic drawing interface should be replaced with the simpler semantic interface described below.

Do not implement forces, fields or other semantic vectors yet.

### 2. Preserve the existing development foundation

Before implementation:

- Inspect the existing TypeScript architecture, native JSON specification and automated tests.
- Preserve the successful Phase 1 implementation in GitHub.
- Continue development independently of Problemly.
- Preserve the existing authoritative document model and separation between semantics and presentation.
- Retain reusable Konva interactions, selection handling, mathematical rendering and mobile touch infrastructure.

Do not create an alternative state-management system or duplicate the existing document model.

Use the existing architecture wherever practical, extending or correcting it where necessary.

### 3. Simplify the editor interface

Replace the existing generic creation toolbar with a semantic creation interface.

The only active creation tool in this phase is **Object**.

Clicking or tapping Object opens the object-definition dialog.

Remove the generic shape, arrow, line, text and equation creation buttons from the visible interface.

Retain essential document controls:

- Open JSON
- Download JSON
- Toggle grid
- Delete selected object

Provide access to editing an existing object's definition.

Add an object collection interface where students can browse, select and manage their defined objects.

Keep the interface compact and mobile-friendly. Do not introduce permanent panels that significantly reduce usable canvas space on phones.

Do not display nonfunctional placeholders for future Vector or Coordinates tools.

Retain reusable drawing and mathematical-rendering capabilities internally for subsequent development.

### 4. Semantic object creation

Creating an object must begin with its physical definition rather than its graphical appearance.

The creation dialog must support:

**Object identity**

- User-defined object name.
- Persistent unique semantic identity.
- Editing the name without changing that identity.

**Graphical representation**

- Circle
- Rectangle
- Point
- No visible representation

Circle, rectangle and point are aesthetic representations of point-like physical objects. They do not imply extended-body or rotational physics.

A rectangle must support resizing so a student can visually represent a surface, such as a table.

Point representations must remain easy to select and manipulate, including on mobile.

**Visibility**

Students can create objects that exist in their physical model without displaying them on the canvas.

Hiding a visible object must preserve its semantic identity, properties and graphical configuration. Showing it again should restore its previous appearance and position.

Hidden objects must remain accessible through the object collection.

Creating an object should be completed through an explicit confirmation action. Canceling must not leave partial semantic definitions or orphaned graphics.

### 5. Physical properties

Support three optional physical properties:

- Mass
- Electric charge
- Density

No property is required merely to create an object.

Each selected property requires a mathematical variable definition.

Students must be able to enter symbols such as `m`, `m_2`, `q` and `\rho`, using notation compatible with our existing LaTeX rendering.

For each property, provide two states:

**Unknown**

The student explicitly defines the property and its mathematical symbol but does not provide a numerical value.

**Known**

The student defines the symbol and provides a numerical value in appropriate units.

Provide sensible default units for the three properties.

Distinguish an explicitly unknown property from a property that has not been defined at all. An undefined property must never be interpreted as zero.

Only selected properties should appear in the semantic model.

Property definitions must be independently editable and removable.

### 6. Implement the variable registry

Extend the existing semantic variable structures to establish a working document-level variable registry.

Every defined physical property must reference a persistent variable identity.

Requirements:

- Persistent unique variable identifiers.
- Mathematical symbols stored independently of variable identities.
- Associated physical quantity or property type.
- Appropriate units.
- Known numerical value or explicit unknown state.
- Relationships connecting variables to their owning physical objects.

Renaming a variable must preserve its identity and all existing references.

Prevent accidental ambiguous symbol assignments. When students attempt to reuse a symbol, provide appropriate guidance rather than silently creating conflicting definitions.

The registry must become the common foundation for the semantic vectors and future Mathed integration.

Do not implement equation construction or mathematical problem-solving functionality.

### 7. Predefined objects

Introduce a small predefined-object selection mechanism, initially containing Earth.

Students should be able to select Earth without manually creating it from scratch.

Earth must:

- Have an ordinary persistent semantic object identity within the document.
- Default to no visible graphical representation.
- Be accessible and editable through the object collection.
- Support optional physical properties using the same property-definition system as other objects.

Do not automatically insert Earth into every diagram.

Do not automatically generate gravitational forces, gravitational fields, numerical constants or equations when Earth is selected.

The predefined-object mechanism should be extensible without requiring a substantial redesign.

Do not build an extensive predefined-object library in this phase.

### 8. Object collection and editing

Provide a compact, accessible interface listing every defined object, including hidden objects.

Students must be able to:

- Select an existing object.
- Edit its name, appearance and physical properties.
- Change its visibility.
- Select or locate its graphical representation when visible.
- Delete the object.

Ensure that selecting an object from either the canvas or the collection leads to the same underlying semantic record.

Changes must immediately update the canvas and associated labels where applicable.

Deleting an object must remove its associated graphical representation and handle its property variables consistently.

Avoid creating orphaned variables or invalid references.

Establish a clear deletion policy that future interaction and vector references can extend.

### 9. Semantic graphical relationships

Every newly created visible object must have a graphical representation linked to its semantic object identity.

Use the independent persistent IDs established during Phase 1.

The application model remains authoritative. Konva implements rendering and interaction but does not own physical definitions.

Moving, resizing or otherwise manipulating a graphical object must never destroy or replace its semantic identity.

Provide automatically generated graphical labels using the object's definitions. At minimum, support its name and relevant property symbols without requiring students to create arbitrary text elements.

Keep labels synchronized when object names or property symbols change.

Avoid unnecessary visual clutter. Provide reasonable label positioning and an appropriate means of controlling optional displayed information.

Establish a well-defined central attachment point for every visible object, including point representations. Future semantic force vectors will use these attachment locations.

Do not implement vector attachment or force interactions during this phase.

### 10. Native JSON persistence

Continue using structured JSON as Diagramed's native document format.

Save the complete semantic state, including:

- Physical objects and their persistent identities.
- Property definitions.
- Mathematical variable registry.
- Visible and hidden object states.
- Links between semantic objects and graphical representations.
- Complete graphical configuration and label presentation.

Opening a saved file must reconstruct both the physical definitions and editable graphical representations.

Preserve the distinction between semantic data and presentation data.

**Backward compatibility is required.**

Previously generated Phase 1 documents must remain loadable without losing their original graphical data.

Existing generic graphical elements must not automatically acquire invented physical meanings.

Legacy graphics may remain editable when loaded, but students must not be offered the generic creation tools in the new semantic interface.

If incompatible schema changes require a new JSON format version, implement explicit migration or compatible loading. Document the format changes.

Invalid files must not destroy the currently loaded document.

### 11. Automated tests and acceptance

Extend the existing automated testing infrastructure.

Implement tests covering semantic identity, property state management, variable references, object visibility, graphical synchronization, deletion and JSON round trips.

Include appropriate automated browser tests for object creation, editing, downloading and reopening.

Test mobile layouts and touch interactions where supported.

The following scenario is the required acceptance demonstration:

1. Create a Rock represented by a circle with an explicitly unknown mass `m_2`.
2. Create a Table represented by a rectangle, without any physical properties, and resize it to resemble a surface.
3. Select Earth from the predefined objects, keeping it hidden.
4. Confirm that all three objects appear in the object collection.
5. Edit Rock's mass to a known numerical value, preserving its variable identity.
6. Move the visible objects and modify their presentation.
7. Download the JSON document.
8. Reload the application and reopen the saved document.
9. Verify that all three objects, their identities, properties, variables, graphical configurations and visibility settings have been restored.
10. Modify the reopened document, save it again and verify that the changes persist.

Also load a previously saved Phase 1 document and verify that its original graphical content remains intact.

Automated tests must pass, and the application must build successfully.

Actual mobile touchscreen acceptance testing will be performed separately by the user.

### 12. Deployment and explicit exclusions

Continue using the existing independent Diagramed GitHub repository and browser deployment.

Push completed development to GitHub and update the deployed development version.

Do not modify the original Problemly repository or deployment.

Do not implement:

- Generic graphical creation tools.
- Force interactions or force vectors.
- Normal/friction coupling.
- Velocity, acceleration or displacement vectors.
- Electric or gravitational field vectors.
- Coordinate-system creation or vector components.
- Extended objects or rotational mechanics.
- Mathed integration.
- Deterministic assessment or AI.
- PNG or SVG export.
- Server-side document storage.

The objective is a fully functional semantic object editor, not an incomplete implementation of the entire physics system.

### 13. Milestone checkpoints and recovery

Commit and push completed work incrementally.

Create checkpoints after:

1. Interface conversion and semantic object creation.
2. Physical properties and variable registry.
3. Object collection, visibility and graphical synchronization.
4. JSON persistence, backward compatibility, automated testing and deployment.

Run appropriate tests before checkpointing, and identify any outstanding failures.

Maintain a recoverable development branch. Do not merge incomplete or unverified work into `main`.

Never modify the Problemly repository.

If execution is interrupted, preserve all successfully completed milestones in GitHub.

Report the latest pushed commit, branch and unfinished work so development can resume without repeating completed tasks.

### 14. Final deliverables

Provide:

- The updated browser-accessible development application.
- The GitHub development branch and latest commit.
- A brief explanation of the object and variable architecture.
- Documentation describing any changes to the JSON format.
- Automated testing results.
- Known limitations and any required manual testing.
- A brief summary of the architectural entry points for implementing semantic forces in Phase 3.

**Completion criterion:** Students can independently create, edit, display, hide, save and reopen physical objects with formally defined properties and mathematical variables. The editor no longer permits creation of meaningless generic drawing primitives, and its underlying architecture is ready for semantic vectors and physical interactions.

Proceed with implementation, making reasonable technical decisions independently while preserving repository isolation and creating recoverable GitHub checkpoints.