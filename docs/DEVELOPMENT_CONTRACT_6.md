
# DIAGRAMED DEVELOPMENT CONTRACT
## Final Interface Cleanup, Undo/Redo and Data Protection

Repository: jchristophm/diagramed
Working branch: development
Deployment: Existing automatic GitHub Pages workflow

OBJECTIVE

Complete the final planned Diagramed interface and
usability cycle before beginning Mathed development.

Implement four improvements:

1. Correct the default Vector Type selection.
2. Redesign the bottom toolbar and remove Delete.
3. Implement comprehensive document-level Undo/Redo.
4. Protect students against accidentally losing
   unsaved work.

Preserve all existing physics functionality, semantic
relationships, coordinate systems, graphical behavior,
automatic mathematical naming and JSON compatibility.

This is not an opportunity to expand Diagramed's physics
features or undertake an application-wide redesign.

Implement, test, automatically deploy and verify the
completed application.

============================================================
1. INITIAL REPOSITORY INSPECTION
============================================================

Inspect the current development branch before making
changes.

Identify:

- Vector creation and editing initialization.
- Vector Type ordering and eligibility rules.
- Existing top and bottom toolbar implementations.
- Current monochrome outline icon implementation.
- DocumentStore and document state-management logic.
- Canvas gestures and their commit mechanisms.
- Modal creation, editing and deletion operations.
- Existing keyboard event handling.
- Coordinate-system state and transformations.
- JSON serialization, loading and downloading.
- Existing dirty-state or history infrastructure,
  if any.
- Existing test and deployment workflows.

Reuse established components and architectural patterns.

Avoid duplicating document state or introducing a second
competing state-management system.

Preserve current functionality and development conventions.

============================================================
2. CORRECT DEFAULT VECTOR TYPE
============================================================

The Vector Type dropdown currently displays its choices
in the correct order:

1. Force
2. Field
3. Separation
4. Acceleration
5. Velocity
6. Displacement

However, opening the new-vector creation dialog currently
selects Separation by default.

Correct this behavior.

REQUIREMENTS

When creating a new vector, explicitly initialize the
Vector Type selection to Force when Force is eligible.

Ensure the actual form state is initialized correctly,
not merely the visual ordering of dropdown options.

If Force is unavailable, preserve the application's
existing eligibility and disabled-state rules.

Do not automatically select an ineligible vector type
that cannot be created.

When EDITING an existing vector, preserve its actual
semantic type.

Editing a Separation vector must continue displaying
Separation, for example.

Opening a new creation dialog after editing an existing
vector must not inherit the edited vector's type.

Preserve the existing Vector Type ordering, eligibility
logic, creation fields and semantic relationships.

Do not modify the underlying vector model.

============================================================
3. BOTTOM TOOLBAR REDESIGN
============================================================

3.1 New toolbar

Replace the current bottom toolbar:

Open | Grid | Delete | Save

with five controls in this EXACT left-to-right order:

GRID | UNDO | REDO | OPEN | SAVE

This arrangement deliberately groups file operations
together on the right.

Use the SAME visual language already implemented in
Diagramed's top toolbar.

Each control should have a simple monochrome outline
icon and a short text label.

Use the existing icon library or icon implementation
where practical.

Required icons:

GRID:
An outlined square grid.

UNDO:
A conventional curved backward arrow.

REDO:
A corresponding curved forward arrow.

OPEN:
An outlined open folder.

SAVE:
A conventional outlined save/floppy-disk icon.

Use consistent stroke widths, optical sizes,
spacing and button styling.

Retain visible text labels underneath the icons.

Do not introduce multicolored icons, decorative
backgrounds or a different toolbar design system.

3.2 Layout

Keep all five buttons centered and properly spaced.

Preserve the exact order:

Grid, Undo, Redo, Open, Save.

Open and Save must remain adjacent.

Ensure the toolbar works comfortably on desktop
and narrow mobile screens.

Buttons must have sufficiently large touch targets.

Do not allow labels to overlap, buttons to extend
outside the viewport, or the layout to introduce
unnecessary horizontal scrolling.

Prefer compact spacing and sizing consistent with
the existing mobile top toolbar.

3.3 Grid

Preserve the existing grid-toggle behavior.

The button must indicate its current state through
an appropriate active/inactive visual treatment.

Do not change the grid's geometry, snapping behavior,
appearance or physics-related interaction.

Determine whether grid visibility is currently a
persisted document setting or a transient UI setting,
and preserve that existing distinction.

3.4 Open and Save

Preserve the existing JSON opening and downloading
functionality.

Do not introduce a new file format.

Do not change the current file naming conventions
or serialization architecture.

Open must participate in the unsaved-work protection
described later in this contract.

Save must update the document's saved-state tracking
only when the existing save/download operation has
successfully been initiated.

Do not introduce accounts, cloud storage, automatic
server synchronization or an unrelated file manager.

============================================================
4. REMOVE THE PERMANENT DELETE BUTTON
============================================================

Remove Delete from the bottom toolbar entirely.

This button presents an unnecessary risk because
students may accidentally delete the wrong selected
element, particularly on mobile devices.

PRESERVE EXISTING DELETION PATHWAYS

Students must still be able to delete elements through:

- The Delete key on a physical keyboard.
- Existing element editing dialogs.
- Existing Objects and Vectors management modals.
- The existing coordinate-system management interface.

Preserve the application's current element-deletion
behavior and any existing confirmation mechanisms.

Ensure that deleting elements remains accessible
on mobile devices without requiring a keyboard.

Do not add a replacement permanent Delete button
elsewhere in the application.

Element deletion must participate in Undo/Redo.

============================================================
5. DOCUMENT-LEVEL UNDO/REDO
============================================================

This is the primary engineering task in this cycle.

Implement reliable document-level editing history.

Students must be able to reverse and restore changes
to their physics diagrams without corrupting the
underlying semantic model.

Use the existing document architecture as the source
of truth.

Do not attempt to implement Undo/Redo by manually
reversing individual DOM or canvas-rendering operations.

Choose a history mechanism compatible with the
existing DocumentStore and its established mutation
and rendering pathways.

A bounded semantic-document snapshot approach is
acceptable if it fits the existing architecture.

Prioritize correctness, recoverability and simplicity.

5.1 Required undoable operations

Support Undo/Redo for all meaningful document edits,
including:

OBJECTS

- Creating an object.
- Deleting an object.
- Moving an object.
- Editing its name.
- Changing its representation.
- Changing physical properties.
- Changing other persisted object settings.
- Repositioning its displayed labels.

VECTORS

- Creating a vector.
- Deleting a vector.
- Changing its semantic configuration.
- Changing its participants or relationships.
- Dragging or repositioning vectors.
- Changing vector endpoints and displayed geometry.
- Editing supported physical properties.
- Changing persisted component visibility.
- Repositioning vector and component labels.

COORDINATE SYSTEM

- Creating the coordinate system.
- Deleting it.
- Moving its origin.
- Rotating its axes.
- Changing between 1D and 2D.
- Reversing either coordinate axis.
- Changing coordinate-system visibility.
- Editing other persisted coordinate settings.

OTHER DOCUMENT CHANGES

Include existing semantic and graphical editing
operations that modify the saved document.

Do not restrict history to the newly implemented
features.

5.2 Gesture grouping

This requirement is especially important.

A completed drag or rotation gesture should create
ONE history entry.

For example:

A student drags a vector endpoint through 50
intermediate positions.

Undo should restore the vector to its position before
the entire gesture began.

Redo should restore the final position.

The student must NOT need to press Undo 50 times.

Apply this principle to:

- Object dragging.
- Vector manipulation.
- Label dragging.
- Coordinate-system positioning.
- Coordinate-system rotation.
- Other continuous canvas gestures.

Use the existing gesture-start and gesture-end
mechanisms wherever practical.

Do not record redundant history entries for
intermediate rendering updates.

Pointer cancellation must not leave an incomplete
or corrupted history transaction.

5.3 Modal editing

Treat an ordinary committed modal edit as one logical
history operation wherever practical.

For example, changing an object's name and mass during
a single editing session should ordinarily produce
one undoable change when the user saves the dialog.

Canceling a dialog must not create a history entry.

Opening a dialog without making changes must not
create a history entry.

Preserve the existing dialog workflows.

5.4 Semantic integrity

Undo/Redo must preserve the complete semantic state.

This includes:

- Stable object IDs.
- Stable vector IDs.
- BY/ON and FROM/TO relationships.
- Physical-property definitions.
- Automatic mathematical naming.
- Component relationships.
- Coordinate-system definitions.
- Existing graphical configuration.
- Persisted label positions.

Consider this example:

A student creates a Rock, adds a weight vector, and
then deletes the Rock.

Undo must restore the Rock and any associated
relationships removed by the deletion.

The restored elements must retain their original
semantic identities.

Redo must restore the correct deleted state.

Do not regenerate new IDs for restored elements.

Do not preserve stale graphical objects or leave
dangling semantic relationships.

Restore the authoritative document state and allow
existing derivation/rendering mechanisms to recreate
its presentation.

5.5 Automatic naming

Preserve the existing automatic variable naming and
collision-disambiguation logic.

Multiple semantically similar vectors must continue
receiving distinct mathematical symbols.

Undoing or redoing changes must not generate
unnecessary new identities or destabilize references.

Existing automatic naming should follow restored
semantic document state.

Do not redesign the naming system.

5.6 History behavior

Implement conventional history semantics.

UNDO:

Reverts the most recent meaningful document change.

REDO:

Restores the most recently undone change.

After Undo, making a new document edit must invalidate
the abandoned Redo branch.

Do not create history entries for no-op operations.

Do not create new history entries while restoring
an existing history state.

Maintain a reasonable bounded history, initially
targeting at least 100 completed editing operations
if practical within the application's memory budget.

Avoid unnecessarily retaining full rendering caches
or duplicate graphical resources.

Selection changes, opening dialogs and other purely
transient interface interactions should not clutter
document history.

5.7 History boundaries

Successful opening of another JSON document should
establish a fresh document history.

Do not allow Undo to unexpectedly switch back to
an entirely different previously opened file.

The newly opened document becomes the starting
state for its own history.

Saving the current document must NOT erase its
editing history.

Students should be able to save, make more changes,
and still undo those changes normally.

============================================================
6. UNDO/REDO CONTROLS AND SHORTCUTS
============================================================

6.1 Bottom toolbar buttons

The new Undo and Redo buttons must invoke the
document-history system.

Undo is disabled when no earlier history state exists.

Redo is disabled when no redo state exists.

Disabled states should be visually distinguishable
without introducing additional interface clutter.

Update button availability immediately when the
history state changes.

Both buttons must work with touch input.

6.2 Keyboard shortcuts

Support conventional keyboard shortcuts:

Windows/Linux:

Ctrl+Z       Undo
Ctrl+Shift+Z Redo
Ctrl+Y       Redo

macOS:

Command+Z       Undo
Command+Shift+Z Redo

Preserve the existing Delete-key functionality.

Avoid interfering with browser functionality when
the application is not the appropriate shortcut target.

6.3 Text-field interaction

Ordinary text inputs and editable fields must retain
their expected editing behavior.

For example, if a student is typing an object's name,
Ctrl+Z should not unexpectedly undo an unrelated
canvas operation.

Respect input focus and the application's existing
modal architecture.

Use native text editing behavior within ordinary
text fields where appropriate.

Committed document edits must subsequently be
available through document-level Undo/Redo.

6.4 Future Mathed compatibility

Mathed will eventually be integrated as an independent
mathematical expression editor.

Do not implement Mathed-specific history now.

However, avoid a keyboard architecture that would
make it difficult for a focused embedded editor
to manage its own typing history in the future.

The host document and focused embedded editors
should eventually be able to cooperate without
conflicting shortcut handlers.

No speculative notebook or Mathed implementation
is required during this cycle.

============================================================
7. UNSAVED-WORK PROTECTION
============================================================

Diagramed currently relies on explicit JSON
saving/downloading.

Students must receive appropriate protection against
accidentally losing unsaved work.

Implement reliable document dirty-state tracking
and the associated navigation safeguards.

7.1 Dirty-state tracking

Track whether the current document has changed since
its last successful save or successful file load.

Meaningful document modifications mark it as changed.

Undoing changes back to the saved document state
should clear the dirty state.

Redoing changes away from the saved state should
restore it.

A saved-state comparison or equivalent robust
approach is acceptable.

Do not simply mark a document as permanently changed
after its first edit.

Do not confuse ordinary selection changes or
nonpersistent interface activity with document edits.

7.2 Save behavior

When the existing Save operation successfully
generates and initiates the JSON download, establish
the current document as the saved reference state.

Preserve history after saving.

If the save operation fails before download initiation,
do not clear the unsaved state.

Acknowledge the limitations of browser download
confirmation; do not claim to verify that the user
has permanently retained the downloaded file.

7.3 Opening another file

If the current document contains unsaved changes,
warn the student before replacing it with another
JSON file.

Provide a clear opportunity to cancel.

Cancel must preserve the existing document,
selection and editing history.

Only replace the document after the student
chooses to proceed and a valid replacement file
has been successfully loaded.

If the file picker is canceled or the selected file
is invalid, preserve the current document.

Successful loading establishes the replacement
document as the new saved baseline.

Preserve all existing import validation.

7.4 Browser navigation

When practical, use standard browser mechanisms
to warn students before:

- Reloading the page.
- Closing the browser tab.
- Navigating away from Diagramed.

Warn only when unsaved document changes exist.

Use the browser's established beforeunload behavior.

Modern browsers control the wording of these
confirmation dialogs.

Do not introduce misleading claims that warnings
can be guaranteed in every mobile browser or
during operating-system termination.

Document those platform limitations.

7.5 Scope restrictions

Do not introduce autosave.

Do not introduce local-storage recovery, accounts,
cloud backups or server-side document persistence.

These are separate future decisions.

The present requirement is to protect the existing
explicit save/load workflow.

============================================================
8. PRESERVE EXISTING FUNCTIONALITY
============================================================

All existing Diagramed capabilities must remain intact.

In particular, preserve:

- Semantic object definitions.
- Specialized object defaults.
- Context-sensitive configuration dialogs.
- Semantic vector definitions.
- Automatic mathematical naming.
- Coordinate-system creation and manipulation.
- Independent coordinate-axis flipping.
- The inclusive 10-degree component threshold.
- Coordinate-relative vector decomposition.
- Existing draggable labels.
- Existing object and vector management modals.
- Current top toolbar styling and functionality.
- Current JSON format and backward compatibility.
- Existing mouse and touch gestures.

Do not change the graphical conventions for
component arrows or labels.

Do not introduce new component-label positioning
logic or collision detection.

Do not add physics calculations or mathematical
equation editing.

============================================================
9. IMPLEMENTATION SEQUENCE
============================================================

Complete the work in the following order.

PHASE A: INSPECTION

Identify the existing document-mutation and
gesture-handling architecture.

Determine the appropriate history boundaries and
dirty-state mechanism.

PHASE B: HISTORY ENGINE

Implement document-level history.

Ensure meaningful semantic changes produce
appropriate history entries.

Group continuous gestures into individual actions.

Preserve semantic identities and relationships.

PHASE C: KEYBOARD AND TOOLBAR INTEGRATION

Implement conventional keyboard shortcuts.

Add functional Undo and Redo controls.

Replace the bottom toolbar with:

Grid | Undo | Redo | Open | Save

Remove the permanent Delete button.

Preserve all existing deletion pathways.

PHASE D: UNSAVED-WORK PROTECTION

Connect dirty-state tracking to the saved document
baseline and document history.

Protect file opening and browser navigation.

Preserve existing file operations.

PHASE E: VECTOR DEFAULT

Correct the new-vector form initialization so that
Force is selected whenever eligible.

Preserve existing editing behavior and eligibility.

PHASE F: REGRESSION TESTING

Exercise all affected functionality.

Add appropriate automated tests.

Test desktop and mobile-emulation workflows.

Correct regressions introduced by the implementation.

Keep changes narrowly focused on this contract.

============================================================
10. ACCEPTANCE TESTS
============================================================

VECTOR CREATION

[ ] New vector creation defaults to Force when eligible.

[ ] Existing vectors retain their correct types
    when edited.

[ ] Opening a new vector dialog after editing
    another vector initializes correctly.

[ ] Existing eligibility and type ordering remain
    unchanged.

BOTTOM TOOLBAR

[ ] Buttons appear in this exact order:
    Grid, Undo, Redo, Open, Save.

[ ] All five controls have consistent monochrome
    outline icons and visible labels.

[ ] Grid retains its existing toggle behavior.

[ ] Grid state is visually identifiable.

[ ] Open retains its existing file-loading behavior.

[ ] Save retains its existing JSON download behavior.

[ ] The permanent Delete button is absent.

[ ] Existing deletion pathways still work.

[ ] Desktop and mobile layouts remain usable.

UNDO/REDO

[ ] Undo object creation.

[ ] Redo object creation.

[ ] Undo object deletion.

[ ] Redo object deletion.

[ ] Restore dependent semantic relationships
    after undoing deletion.

[ ] Undo and redo object property editing.

[ ] Undo and redo object movement.

[ ] Undo and redo vector creation and deletion.

[ ] Undo and redo vector relationship changes.

[ ] Undo and redo vector endpoint manipulation.

[ ] Undo and redo manual label repositioning.

[ ] Undo and redo coordinate creation and deletion.

[ ] Undo and redo coordinate origin movement.

[ ] Undo and redo coordinate rotation.

[ ] Undo and redo independent axis flipping.

[ ] Undo and redo other persisted
    coordinate-system settings.

[ ] Continuous dragging produces one history entry
    per completed gesture.

[ ] Continuous rotation produces one history entry
    per completed gesture.

[ ] Canceling a dialog creates no history entry.

[ ] No-op operations create no history entries.

[ ] New edits invalidate the abandoned Redo branch.

[ ] Undo and Redo buttons correctly reflect
    history availability.

[ ] Conventional keyboard shortcuts work.

[ ] Text-field editing does not accidentally
    trigger unrelated document operations.

[ ] Semantic identities remain stable after
    undoing and redoing operations.

[ ] Automatic mathematical naming remains correct.

[ ] Saving does not erase history.

[ ] Opening another document establishes
    a fresh history.

UNSAVED-WORK PROTECTION

[ ] Meaningful document edits set dirty state.

[ ] Returning to the saved document state
    clears dirty state.

[ ] Redoing changes restores dirty state
    where appropriate.

[ ] Successful save initiation establishes
    a new saved baseline.

[ ] Failed save initiation retains dirty state.

[ ] Opening another file warns when necessary.

[ ] Canceling replacement preserves current work.

[ ] Invalid replacement files preserve current work.

[ ] Successful replacement establishes a clean state.

[ ] Browser reload/navigation warning works
    in supported desktop browsers.

[ ] Relevant mobile-browser limitations
    are documented.

REGRESSION

[ ] Existing physics relationships remain correct.

[ ] Automatic variable disambiguation still works.

[ ] Coordinate rotation and flipping still work.

[ ] The inclusive 10-degree suppression rule
    remains unchanged.

[ ] Component graphics and labels remain intact.

[ ] Existing JSON files load correctly.

[ ] New documents save and reload correctly.

[ ] Existing automated tests pass.

[ ] New history and dirty-state tests pass.

[ ] Desktop browser tests pass.

[ ] Mobile-emulation browser tests pass.

[ ] TypeScript checks pass.

[ ] Production build succeeds.

============================================================
11. DEPLOYMENT
============================================================

Use the existing automatic development deployment
workflow.

After implementation:

1. Commit the completed work to development.

2. Push the changes.

3. Confirm successful GitHub Actions verification.

4. Confirm automatic deployment to:

   https://jchristophm.github.io/diagramed/

5. Run and verify the existing live browser
   acceptance tests.

6. Confirm that the deployed application includes
   all changes specified in this contract.

Do not merge into main.

Do not replace the existing deployment system.

Do not change the website URL.

If deployment encounters a genuine permission or
infrastructure problem, report it explicitly.

Physical-device touchscreen testing will be
performed separately by the user.

============================================================
12. EXPLICITLY EXCLUDED WORK
============================================================

Do not implement:

- Mathed integration.
- Equation editing.
- Notebook functionality.
- AI tutoring or assessment.
- Automatic physics calculations.
- New physics concepts.
- New vector or object types.
- PDF export.
- Automatic cloud saving.
- Server-side document storage.
- User accounts.
- Additional coordinate-system features.
- Component-label collision detection.
- General interface redesign.
- Unrelated codebase refactoring.

Document unrelated issues rather than expanding
the scope of this development cycle.

============================================================
13. COMPLETION REPORT
============================================================

Provide a concise report containing:

- Implemented changes.
- History architecture and transaction boundaries.
- Dirty-state implementation.
- Significant technical decisions.
- Relevant commit identifier.
- Unit test results.
- Browser test results.
- Build verification.
- GitHub Actions deployment status.
- Live acceptance results.
- Confirmed deployment URL.
- Known limitations.

Explicitly identify any history operations or
browser navigation scenarios that could not
be verified.

Do not claim physical touchscreen testing unless
it was actually performed.

============================================================
14. DEFINITION OF DONE
============================================================

New vectors default to Force when eligible.

The bottom toolbar contains:

Grid | Undo | Redo | Open | Save

The controls use the same monochrome outline
icon-and-label design as the top toolbar.

The permanent Delete button is removed, while
existing keyboard and modal-based deletion remain.

Document-level Undo/Redo reliably restores
semantic and graphical editing operations without
corrupting physical relationships or mathematical
variable identities.

Continuous manipulation gestures create logical
single history operations.

Unsaved-work safeguards protect the existing
JSON opening and saving workflow, subject to
documented browser limitations.

Existing physics functionality and JSON
compatibility remain intact.

All required automated checks pass.

The implementation is automatically deployed
and verified on the existing GitHub Pages site.

Following successful manual testing, Diagramed's
graphical editor is ready for the separate
Mathed development and integration project.

END OF CONTRACT
