
# DIAGRAMED DEVELOPMENT CONTRACT
## Final Coordinate and Interface Cleanup

Repository: jchristophm/diagramed
Working branch: development

OBJECTIVE

Complete one focused cleanup cycle addressing four
specific improvements:

1. Independent coordinate-axis flipping.
2. Monochrome outline icons for the top toolbar.
3. Updated Planet Surface creation defaults.
4. Reordering the Vector Type selection list.

Preserve all existing functionality, semantic relationships,
automatic mathematical naming, coordinate geometry, and
JSON compatibility.

This is a targeted refinement of the existing application,
not a new feature-development cycle.

Deploy the completed implementation automatically to the
existing GitHub Pages website and verify the live application.

============================================================
1. REPOSITORY INSPECTION
============================================================

Before making changes, inspect the current development
branch and the latest implementation.

Identify:

- Coordinate-system semantic records and orientation logic.
- Existing coordinate rotation and dragging mechanisms.
- Current vector-component projection implementation.
- The inclusive 10-degree component suppression logic.
- Coordinate-system configuration dialog.
- Existing top toolbar and its component structure.
- Existing object creation defaults.
- Vector Type selection and eligibility logic.
- Existing JSON persistence and regression tests.
- The current GitHub Actions deployment workflow.

Reuse existing functionality.

Do not introduce new dependencies, graphical frameworks,
semantic models, or unnecessary architectural changes.

Follow the repository's existing development conventions.

============================================================
2. INDEPENDENT COORDINATE-AXIS FLIPPING
============================================================

2.1 Requirements

The existing coordinate system supports rotation but does
not permit independently reversing the positive directions
of its axes.

Add independent axis-direction controls.

The student must be able to:

- Reverse the positive x direction.
- Reverse the positive y direction in 2D.
- Rotate the coordinate system as currently implemented.
- Combine rotation with either or both axis reversals.

All combinations must preserve perpendicular coordinate
axes in 2D.

The controls must not move the coordinate-system origin
or change the geometry of any physical vectors.

2.2 Configuration interface

Extend the EXISTING coordinate-system configuration dialog.

Add two clearly labeled controls:

[ ] Reverse x-axis
[ ] Reverse y-axis

Only display Reverse y-axis when the coordinate system
is configured for 2D.

Preserve the existing rotation controls, visibility
settings, dimensionality selector, and other
configuration functionality.

Do not create a separate axis-direction dialog.

Do not introduce an orientation-reset button.

No particular coordinate orientation should be
presented as pedagogically preferred.

2.3 Interaction with rotation

Axis reversal and coordinate rotation are independent
operations.

The existing rotation angle should continue to define
the orientation of the coordinate system's reference
axes.

Reversal changes which direction along an axis is
designated positive.

For example, at zero rotation, all four combinations
must be supported:

+x right, +y up
+x left,  +y up
+x right, +y down
+x left,  +y down

All four combinations must also support arbitrary
rotation.

Both axis reversals may be enabled simultaneously.

Preserve the existing interactive rotation handle
and numerical angle input.

2.4 Vector-component integration

Update the existing component-rendering logic to respect
independently reversed axes.

Ensure that:

- Component arrows follow the selected positive and
  negative coordinate directions.
- Component signs are correct.
- Existing mathematical labels remain consistent.
- Rotating or flipping axes updates displayed components
  immediately.
- Physical vector geometry is never changed by an
  axis-direction operation.
- The original vector remains visible and unchanged.
- Existing component visibility settings remain intact.

IMPORTANT:

Axis reversal must change the coordinate convention,
not the underlying physical vector.

Do not alter semantic vector identities or numerical
physical quantities.

2.5 Preserve the 10-degree threshold

Retain the existing inclusive 10-degree angular tolerance
for graphical component decomposition.

Components must remain suppressed when a vector is
within 10 degrees, inclusive, of any positive or
negative coordinate axis.

The threshold must operate correctly for:

- Arbitrary coordinate rotation.
- Reversed x direction.
- Reversed y direction.
- Both axes reversed.
- Positive and negative component directions.
- Existing 1D component behavior.

Reversing an axis must not accidentally change the
angular separation used to determine whether graphical
decomposition is appropriate.

Do not modify the actual physical vector orientation
or snap its geometry to an axis.

2.6 1D behavior

For 1D systems:

- Support reversal of the x-axis.
- Hide the y-axis reversal control.
- Preserve existing 1D component-display conventions.
- Preserve existing suppression of insignificant or
  redundant graphical components.

When switching between 1D and 2D, preserve the stored
y-axis reversal state so it is restored if the student
switches back to 2D.

Do not create a second coordinate system.

2.7 Semantic persistence

Extend the existing coordinate-system semantic record
with the minimum information required to preserve
independent axis-direction choices.

Use the existing JSON serialization and loading
architecture.

Requirements:

- Axis reversals survive saving and reloading.
- Existing coordinate rotation remains unchanged.
- Existing origin positioning remains unchanged.
- Previously saved diagrams continue loading correctly.
- Older diagrams without axis-reversal properties
  retain their previously established axis directions.

Do not silently reverse axes in existing documents.

Use backward-compatible defaults when loading older
Diagramed files.

Avoid unnecessary changes to the existing file format.

============================================================
3. MONOCHROME OUTLINE TOOLBAR ICONS
============================================================

3.1 Objective

Replace the current text-only presentation of the four
principal toolbar controls with consistent monochrome
outline icons accompanied by text labels.

The four controls and their intended icons are:

OBJECT
A simple outlined cube or box.

VECTOR
A simple diagonal arrow pointing upward and right.

COORDINATES
A simple coordinate-axis symbol.

ELEMENTS
A simple outlined layers icon with a small dropdown
chevron.

Use the existing icon library if appropriate icons
are already available.

Otherwise, use a small, consistent set of lightweight
vector icons.

Do not introduce an unnecessary large dependency.

3.2 Visual requirements

Use simple, single-color outline icons.

Icons should have:

- Consistent stroke weights.
- Consistent visual dimensions.
- Similar optical weight.
- Consistent spacing.
- No multicolored illustrations.
- No filled decorative backgrounds unless required
  by existing toolbar styling.

Follow Diagramed's existing interface colors and
button styling.

Retain text labels for discoverability.

The intended controls are:

[Box icon]     Object
[Arrow icon]   Vector
[Axes icon]    Coordinates
[Layers icon]  Elements [chevron]

Adapt the arrangement to the existing toolbar and
available screen space.

The visual appearance should remain compact and
uncluttered.

3.3 Preserve behavior

This is a presentation change only.

Preserve the current behavior of all four controls.

Specifically:

Object opens the existing object-creation interface.

Vector opens the existing vector-creation interface.

Coordinates opens coordinate-system creation or
configuration, depending on whether a coordinate
system already exists.

Elements opens the EXISTING dropdown.

Its entries must continue launching the existing
Objects and Vectors management modals and the
coordinate-system interface.

Do not rebuild these modals or change their behavior.

Preserve existing disabled-state behavior, including
disabled controls used for student discovery.

3.4 Desktop and mobile

Ensure that icons and labels remain legible on both
desktop and mobile layouts.

Preserve adequate touch targets.

Do not allow icons to interfere with button selection,
dropdown operation, keyboard accessibility, or
existing toolbar behavior.

Do not redesign unrelated utility controls.

============================================================
4. PLANET SURFACE CREATION DEFAULTS
============================================================

4.1 Objective

Update the DEFAULT configuration used when creating
a new Planet Surface object.

Set:

Object type: Planet Surface
Default name: Earth
Default gravitational field strength: 9.8 m/s²
Default representation: Visible

Match the existing default visibility behavior used
for Fluid and Charged Plate objects.

Use the existing visible Planet Surface representation.
Do not introduce new artwork or graphical primitives.

4.2 Preserve flexibility

The student must still be able to:

- Rename Earth.
- Change gravitational field strength.
- Select the existing hidden representation.
- Modify other currently supported Planet Surface
  properties.

Changing the object's name must not automatically
change gravitational field strength.

Likewise, changing gravitational field strength must
not automatically rename the object.

These remain independently configurable properties.

The semantic object type must remain Planet Surface,
regardless of its displayed name.

4.3 Existing diagrams

Apply these new defaults ONLY when creating new
Planet Surface objects.

Do not migrate, rename, reveal, or otherwise modify
Planet Surface objects in previously saved diagrams.

Existing custom names and visibility settings
must survive loading and editing.

Preserve all existing mathematical naming behavior.

============================================================
5. VECTOR TYPE SELECTION ORDER
============================================================

Reorder the Vector Type selection interface to display
the supported vector types in this exact order:

1. Force
2. Field
3. Separation
4. Acceleration
5. Velocity
6. Displacement

This is strictly a presentation change.

Preserve:

- All existing vector types.
- Existing type-specific configuration dialogs.
- Existing eligibility rules.
- Existing disabled choices used for discovery.
- Existing semantic definitions.
- Existing vector creation and editing behavior.

Do not alter the underlying vector schema.

Do not introduce new vector types.

Do not change the mathematical or physical meaning
of existing vector definitions.

============================================================
6. PRESERVE AUTOMATIC VARIABLE NAMING
============================================================

Diagramed already provides automatic mathematical
variable disambiguation.

For example, creating multiple Weight vectors with
identical BY/ON relationships automatically produces
distinct mathematical symbols using additional
subscripts or other established naming conventions.

This behavior is important and must remain intact.

Do not redesign or replace the naming system.

Axis flipping, rotation, and other coordinate-system
operations must never alter persistent vector identities.

Display labels may reflect coordinate-component
relationships, but naming collisions must continue
to be resolved using the existing naming infrastructure.

Include an appropriate regression test confirming
that automatic naming remains correct when multiple
semantically similar vectors exist.

Preserve existing behavior when objects or vectors
are renamed, added, or deleted.

============================================================
7. EXPLICITLY EXCLUDED WORK
============================================================

Do not implement:

- Mathed integration.
- Chemed integration.
- Equation editing.
- Mathematical token registries.
- New physics concepts or object types.
- New vector types.
- Numerical vector-component calculations.
- Automatic trigonometry.
- AI tutoring.
- Automated assessment.
- Instructor authoring.
- PDF solution export.
- Additional graphical drawing tools.
- New coordinate systems or reference frames.
- Component-label collision detection.
- Automatic component-label repositioning.
- A coordinate-orientation reset feature.
- Further object-dialog redesign.
- Application-wide visual redesign.

Component labels are already movable.

Preserve their current automatic positioning and
manual movement behavior.

Do not expand this cycle into a general polishing pass.

If unrelated issues are encountered, document them
rather than expanding the implementation.

============================================================
8. IMPLEMENTATION SEQUENCE
============================================================

Complete the work in the following order.

PHASE A: INSPECTION

Inspect the current implementation and identify the
smallest appropriate changes.

PHASE B: AXIS FLIPPING

Implement semantic axis-direction settings.

Extend the existing configuration interface.

Update axis rendering and component projections.

Verify persistence and the 10-degree threshold.

PHASE C: TOOLBAR ICONS

Add the four monochrome outline icons.

Preserve existing button behavior and accessibility.

PHASE D: CREATION DEFAULTS AND MENU ORDER

Update Planet Surface defaults.

Reorder the Vector Type list.

PHASE E: TESTING

Run relevant automated tests and build checks.

Add focused regression coverage for the new behavior.

Check JSON backward compatibility.

Verify desktop and mobile-emulation interaction.

Correct any regressions introduced by this cycle.

Commit coherent changes following existing
repository conventions.

============================================================
9. ACCEPTANCE TESTS
============================================================

AXIS FLIPPING

[ ] Reverse x independently.

[ ] Reverse y independently in 2D.

[ ] Reverse both axes simultaneously.

[ ] Combine each reversal configuration with
    arbitrary coordinate rotation.

[ ] Verify that axes remain perpendicular in 2D.

[ ] Verify that axis reversal does not change the
    coordinate-system origin.

[ ] Verify that physical vectors remain unchanged.

[ ] Verify signed component directions for all
    axis-reversal combinations.

[ ] Verify the inclusive 10-degree threshold for
    rotated and reversed coordinate systems.

[ ] Confirm that 1D permits x reversal.

[ ] Confirm that 1D does not display y reversal controls.

[ ] Confirm that switching between 1D and 2D
    preserves the stored y-axis reversal state.

[ ] Save and reload diagrams containing reversed axes.

[ ] Load older diagrams without changing their
    established coordinate conventions.

TOOLBAR

[ ] All four toolbar icons are present.

[ ] All icons use consistent monochrome outline styling.

[ ] Text labels remain visible.

[ ] Existing creation controls work.

[ ] Elements opens its existing dropdown.

[ ] Existing management modals remain unchanged.

[ ] Existing disabled controls remain appropriately
    disabled.

[ ] Desktop layout remains usable.

[ ] Mobile layout maintains adequate touch targets.

PLANET SURFACE

[ ] New Planet Surface defaults to the name Earth.

[ ] New Planet Surface is visible by default.

[ ] Default gravitational field strength remains
    9.8 m/s².

[ ] Object type remains Planet Surface.

[ ] Students can rename the object.

[ ] Students can change gravitational field strength.

[ ] Students can select the hidden representation.

[ ] Previously saved Planet Surface objects retain
    their original names, representations,
    visibility, and physical properties.

VECTOR TYPE ORDER

[ ] Force appears first.

[ ] Field appears second.

[ ] Separation appears third.

[ ] Acceleration appears fourth.

[ ] Velocity appears fifth.

[ ] Displacement appears sixth.

[ ] Existing eligibility and disabled states remain
    unchanged.

REGRESSION

[ ] Existing vector-component behavior remains intact.

[ ] Existing automatic variable naming remains intact.

[ ] Duplicate BY/ON relationships continue receiving
    distinct mathematical symbols.

[ ] Rotating or flipping axes does not change
    persistent vector identities.

[ ] Existing object and vector editing works.

[ ] Existing JSON files load successfully.

[ ] New JSON files round-trip successfully.

[ ] Existing unit tests pass.

[ ] Existing browser tests pass.

[ ] TypeScript and production build checks pass.

============================================================
10. DEPLOYMENT AND LIVE VERIFICATION
============================================================

Use the existing automatic GitHub Actions
development deployment workflow.

After completing implementation:

1. Commit and push changes to development.

2. Confirm that GitHub Actions automatically
   runs the existing verification suite.

3. Confirm that all required verification
   checks pass.

4. Confirm successful deployment to the existing
   GitHub Pages website:

   https://jchristophm.github.io/diagramed/

5. Run and confirm the existing live browser
   acceptance tests against the deployed website.

6. Verify that the live application includes
   the completed changes.

Do not merge into main.

Do not create a separate deployment system.

Do not change the website URL.

Do not claim deployment is complete until the
deployment and live acceptance checks succeed.

If a genuine permission or infrastructure issue
prevents deployment, report it explicitly.

Actual physical touchscreen testing will be
performed separately by the user.

============================================================
11. COMPLETION REPORT
============================================================

After successful implementation and deployment,
provide a concise completion report containing:

- Summary of all four completed improvements.
- Relevant architectural decisions.
- Commit identifier.
- Unit test results.
- Browser test results.
- Build verification results.
- GitHub Actions deployment status.
- Live acceptance test results.
- Confirmed deployment URL.
- Any known limitations.

Distinguish automated browser emulation from
physical touchscreen testing.

Do not claim functionality was verified if it
was not actually tested.

============================================================
12. DEFINITION OF DONE
============================================================

Diagramed supports independent reversal of both
coordinate axes, including in rotated coordinate
systems, without changing physical vector geometry
or disrupting the existing 10-degree graphical
component threshold.

The top toolbar uses four consistent monochrome
outline icons with accompanying labels.

New Planet Surface objects are visible by default,
named Earth, and retain the existing gravitational
field strength of 9.8 m/s².

The Vector Type list follows the specified order.

Existing semantic behavior, automatic mathematical
naming, JSON compatibility, creation/editing
interfaces, and graphical functionality remain intact.

All required tests pass.

The completed implementation is automatically
deployed and verified on the existing development
website.

The application is ready for manual testing and
the separate Mathed/Chemed integration cycle.

END OF CONTRACT
