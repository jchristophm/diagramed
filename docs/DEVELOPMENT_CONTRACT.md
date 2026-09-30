# DIAGRAMED
# Development Contract 1: Independent Application, Architectural Refactor and JSON Persistence

**Execution environment:** ChatGPT Work (cloud)  
**New repository:** `jchristophm/diagramed`  
**Source repository:** `jchristophm/problemly`  
**Source directory:** `vector-editor/`

## Primary objective

Create an independent Diagramed application using the existing Problemly vector editor as the starting point.

Refactor its internal architecture to support our planned semantic physics model while preserving the current editor's graphical functionality, appearance and mobile interactions.

Replace its existing Problemly attachment functionality with native JSON downloading and loading.

Deploy the new application independently so it can be tested directly in desktop and mobile browsers.

**The intended result is essentially the same editor we already have, but with a fundamentally different internal architecture and a new native file format.**

This is a foundation milestone. Do not implement the actual physics tagging system yet.

---

## 1. Repository isolation and protection

Create a completely independent repository named `jchristophm/diagramed`.

Copy the existing editor from `jchristophm/problemly/vector-editor/` as the starting implementation.

The existing Problemly repository is associated with a live application and must be treated as strictly read-only.

Requirements:

- Do not modify, commit to, create branches in or change any configuration in the Problemly repository.
- Do not interfere with existing Problemly deployments.
- Do not share deployment pipelines between the applications.
- Record the source commit used for the initial copy.
- Make Diagramed a standalone application with no Bubble or Problemly runtime dependencies.

Preserve a record of the imported code before refactoring so that the original implementation can be compared against the result.

All development takes place exclusively in the new repository.

If repository creation requires an additional permission or explicit action from me, identify that action.

## 2. Refactor the application architecture

The existing editor uses JavaScript, Konva and KaTeX. Preserve these technologies, introducing TypeScript and a lightweight build system.

Use ordinary HTML/CSS for the interface unless there is a compelling technical reason to introduce an additional framework.

Do not introduce React or another large frontend framework simply to modernize the application.

The primary architectural requirement is strict separation between three responsibilities:

**A. Application data model**

Owns the authoritative document state, including graphical elements, persistent identities and eventually semantic physics definitions.

**B. Konva rendering and interaction**

Displays the document and manages pointer, mouse and touch interactions.

Drawing operations must update the application model. Konva objects must not become the authoritative storage location for document data.

**C. User interface and document operations**

Manages tools, buttons, dialogs, loading, downloading and application state.

Organize the code into clearly defined, maintainable TypeScript modules. Use a practical architecture rather than creating an unnecessarily elaborate framework.

The result must be ready to accommodate semantic physics without another substantial architectural refactor.

## 3. Prepare the semantic physics architecture

Establish a typed, extensible foundation for our future semantic model.

The planned system will include:

- Physical objects with unique identities, graphical representations and optional physical properties.
- Physical interactions between objects.
- Semantically defined force, field and motion vectors.
- Mathematical variables with persistent identities.
- Independent one-dimensional and two-dimensional coordinate systems.
- Derived vector components.
- Separation between physical definitions and graphical presentation.

Our forthcoming implementation will require students to define variables and physical relationships before creating their corresponding graphical representations.

The architecture should anticipate that requirement.

A graphic's persistent identity must be independent of its Konva instance, position, displayed label and eventual semantic identity.

Create appropriate data structures, interfaces and module boundaries for these future capabilities.

However, do not implement object registries in the UI, physics creation dialogs, interaction tagging, force constraints, coordinate calculations or assessment functionality during this run.

Generic arrows and shapes in the first version remain ordinary graphical primitives. Do not incorrectly assign physical meanings to them.

Prefer a small, functional foundation over large quantities of speculative, unused code.

## 4. Preserve existing editor functionality

The initial user experience should remain essentially identical to the existing Problemly vector editor.

Preserve existing capabilities, including:

- Rectangles, circles, lines, solid arrows and dashed arrows.
- Draggable shapes and independently adjustable vector endpoints.
- Grid snapping and grid visibility controls.
- Text labels and LaTeX mathematical expressions.
- Element selection, editing, transformation and deletion.
- The existing desktop interface and toolbar organization.
- Touch interactions, enlarged touch targets and mobile usability.

Preserve the existing visual appearance wherever practical.

Minor interface adjustments necessary to support the new file operations are acceptable. A visual redesign is explicitly outside this milestone.

During refactoring, investigate existing event-handling and state-management issues. Correct genuine bugs where necessary, provided doing so does not materially change intended behavior.

Do not remove or degrade working functionality merely to simplify the migration.

## 5. Implement native JSON persistence

This is the principal user-facing change in the first development milestone.

**JSON is Diagramed's native document format.**

Replace the existing Problemly attachment functionality with a Download JSON button.

Add an Open JSON button or equivalent file-selection control.

A downloaded file must contain sufficient structured information to reconstruct the complete editable document without access to the original browser session.

The format must be documented and versioned from the beginning.

### Required document structure

Separate the semantic model from the graphical presentation.

The initial format should accommodate:

- Document identity, format version and metadata.
- Semantic physics structures, initially empty or unpopulated.
- Persistent graphical element identities.
- Graphical element types and properties.
- Complete element geometry and drawing order.
- Grid and relevant canvas configuration.
- Text labels and their graphical properties.
- Original LaTeX source and its presentation properties.

The exact schema is an implementation decision, but the separation between semantic definitions and presentation must be explicit.

Do not simply dump Konva's internal state into a JSON file and treat it as our native document format.

The schema must be suitable for later use by Diagramed, Mathed and a deterministic physics assessment engine.

### Download behavior

Downloading should produce a properly formatted, human-readable JSON file that can be opened and inspected in an ordinary text editor.

Use sensible filenames and appropriate formatting.

Do not include temporary selection handles, active selections, invisible interaction targets or other transient editor state.

### Loading behavior

The user must be able to select a previously downloaded Diagramed JSON file and reconstruct the document.

Restore all graphical elements, editable properties, layout information, text and mathematical expressions.

Recreate Konva instances and their associated interaction handlers from the saved application model.

The reloaded document must remain fully editable.

Implement format-version checking and appropriate file validation.

Malformed, unsupported or incompatible files must produce an understandable error without destroying the currently open diagram.

### Mathematical expression preservation

Pay particular attention to the existing LaTeX implementation.

Preserve the original editable LaTeX source, not merely its rendered image.

On loading a document, regenerate the mathematical rendering from the stored LaTeX source and restore its graphical properties.

A mathematical expression must remain editable after downloading and reopening the document.

### Required persistence principle

Saving, reopening and saving again must preserve the document's semantic content and assessable graphical information.

Identical JSON formatting or property ordering is unnecessary. The restored document's meaning, geometry and behavior must be preserved.

## 6. Remove the existing Problemly integration

Remove the existing functionality that packages and sends drawing results to the parent Bubble application.

Remove Problemly-specific messaging and attachment operations.

Replace the existing attachment control with Download JSON, keeping its placement and the surrounding interface as familiar as practical.

Do not implement PNG or SVG export during this milestone.

Internal image rendering necessary to display mathematical expressions is permitted, but image export is outside the current scope.

Do not introduce APIs, external storage systems, authentication or server-side document management.

The application should operate entirely in the browser for its current functionality.

## 7. Independent deployment and browser-based development

Set up a development workflow that requires no local development environment on my computer.

Codex/Work should handle TypeScript compilation, package management, testing and builds.

Configure automated builds and tests through GitHub Actions or an appropriately simple equivalent.

Deploy the application independently of Problemly.

GitHub Pages is acceptable if it provides the simplest reliable deployment. An independent preview-hosting service is also acceptable if it is already available.

Requirements:

- Provide a stable browser-accessible URL.
- Automatically rebuild and deploy updates to the designated development version.
- Support testing in desktop and mobile browsers.
- Keep all deployment configuration within the new Diagramed project.
- Avoid unnecessary services, account creation and manual configuration.

Pull-request preview URLs would be useful. Implement them if straightforward, but prioritize getting a reliable standalone development deployment operational.

If an external hosting connection or one-time account action is unavoidable, complete everything else possible and clearly identify the required action.

Do not modify Problemly's hosting configuration under any circumstances.

## 8. Automated testing and quality requirements

Establish an automated testing foundation that supports future physics development.

At minimum, implement tests for:

**Document persistence**

Create a document containing representative graphical elements, save it, reload it and verify that the reconstructed document preserves the original data.

**Graphical geometry**

Preserve coordinates, arrow endpoints, dimensions, rotation where applicable and drawing order.

**Mathematical expressions**

Preserve original LaTeX, graphical placement and editability after reconstruction.

**Document validation**

Verify appropriate behavior when loading invalid JSON, unsupported file versions and incomplete documents.

**Application regression**

Verify that existing drawing operations remain functional after the architectural refactor.

**Build verification**

Require successful TypeScript compilation and automated tests before accepting changes.

Include automated browser interaction tests where practical, particularly for loading, downloading and essential drawing operations.

Use mobile viewport testing where supported. Automated mobile emulation does not replace manual testing on an actual touchscreen.

Keep the test architecture straightforward so we can expand it during later development.

## 9. Required acceptance demonstration

The final application should demonstrate the following sequence:

1. Open the independently deployed Diagramed application in a browser.
2. Create a diagram containing a rectangle, circle, multiple solid arrows, a dashed arrow, ordinary text and at least one LaTeX expression.
3. Change arrow directions and lengths, reposition elements and use the existing grid-snapping functionality.
4. Download the diagram as a JSON file.
5. Open and inspect the JSON to verify that it contains structured document data, persistent identities and editable LaTeX source.
6. Clear or reload the application.
7. Open the saved JSON file.
8. Verify that the diagram is correctly reconstructed and remains fully editable.
9. Modify the reconstructed diagram, download it again and verify that the modifications were preserved.

Confirm that these operations work in a desktop browser.

Also verify that the application remains usable in a mobile viewport. Actual touchscreen testing can be completed by me after deployment.

The initial graphical behavior should remain consistent with our existing editor.

## 10. Documentation and final deliverables

Deliver a functioning, independently deployed Diagramed application.

Provide:

- The new GitHub repository URL.
- The browser-accessible development URL.
- A brief architectural overview explaining the new module boundaries.
- The documented initial JSON schema and an example document.
- Automated tests and their results.
- A summary of preserved functionality and any identified limitations.
- A brief explanation of how subsequent development should add semantic objects, interactions and typed vectors without restructuring the application again.

Provide instructions for any unavoidable one-time hosting or GitHub configuration.

Document any capabilities that could not be preserved and explain why.

Do not claim completion until the build succeeds and the JSON round-trip tests pass. Clearly distinguish automated verification from anything still requiring manual testing.

## 11. Explicit exclusions

Do not implement any of the following:

- Student-facing semantic tagging dialogs.
- Physical interaction or force-type selection.
- Normal/friction coupling.
- Vector attachment constraints.
- Automatic visual spacing for overlapping semantic vectors.
- Rotatable coordinate systems or calculated vector components.
- Physics validation or grading.
- Mathed integration.
- AI tutoring or AI assessment.
- PNG or SVG export.
- Server-side document storage.
- A redesigned graphical interface.

These features belong to subsequent development milestones.

The current task is specifically to establish the foundation that will make those later developments straightforward.

## 12. Execution priorities

Prioritize in this order:

1. Protect the existing Problemly application through complete repository and deployment isolation.
2. Preserve the current editor's working functionality and mobile interactions.
3. Establish the new authoritative document model and modular TypeScript architecture.
4. Implement reliable, lossless JSON downloading and loading.
5. Establish automated tests and independent browser deployment.
6. Document the resulting architecture and any remaining limitations.

Make reasonable implementation decisions independently rather than interrupting development for minor choices.

Avoid unnecessary architectural complexity, unrelated features and visual redesign.

If the full scope cannot be completed in one execution, prioritize a running, independently deployed editor with functioning JSON persistence and report precisely which architectural or testing tasks remain.

**Completion criterion: The same familiar diagram editor, operating entirely independently of Problemly, with a maintainable architecture designed for our upcoming semantic physics development and reliable native JSON persistence.**

---

## 13. Milestone Checkpoints and Recovery

Because this is a substantial cloud development task, preserve completed work incrementally rather than waiting until the entire project is finished.

**Commit and push completed work to the new Diagramed GitHub repository at the end of every major milestone.**

Requirements:

- Commit and push the initial independent copy of the existing editor before beginning the refactor.
- Create a checkpoint after the TypeScript migration and architectural refactor.
- Create another checkpoint after implementing JSON downloading and loading.
- Create a checkpoint after automated testing and deployment configuration.
- Use descriptive commit messages identifying the completed milestone.
- Run appropriate builds and tests before each checkpoint. Clearly identify any known failures.
- Never commit credentials, tokens or other sensitive information.
- Never commit or push changes to the original Problemly repository.

Work on a dedicated development branch when practical. Do not merge incomplete or unverified work into the default branch.

**Recovery requirement:** If execution is interrupted, encounters a service failure or exhausts available resources, previously completed milestones must remain committed and pushed to GitHub.

Before ending, report the repository URL, working branch, latest pushed commit and the status of each milestone. Clearly identify anything unfinished so a subsequent Work session can resume without repeating completed development.

Prioritize creating recoverable checkpoints over completing additional features when execution time or resources become constrained.

---

## Final execution instruction

Proceed with implementation, not merely architectural planning.

Begin by creating the independent repository and pushing the untouched source copy as the first recovery checkpoint.

Then complete the remaining milestones sequentially, pushing recoverable progress after each.

If you encounter an authorization or deployment blocker, explain precisely what action is required from me. Otherwise, make reasonable technical decisions independently and continue.

The live Problemly repository and deployment must remain completely untouched throughout execution.