# Development Contract 3.1 integration candidate

Starting HEAD: 7dd858c2825a03a845165dd875a6755f883f5087.

1. Automatic notation: c09d347f8be575e2bddbda31dfb14f7faf4bddca; run 36762872315 succeeded with 52 unit tests, build, 36 browser tests, deployment and independent live verification.
2. Graphical/interface checkpoint: 890ada46634ec31ae1ff56180b92780bca3e6cd9; run 36764245148 succeeded with 57 unit tests, build, 40 desktop/mobile browser tests, deployment and the same 40 tests independently against the live URL. Initial checkpoint 5c56751 could not register a test helper imported from another spec; corrected helper registration in 890ada4.
3. Integration candidate: historical default labels receive current placement without rewriting imported geometry/offsets; first historical rename updates automatic notation; long-name collisions stay within symbol limits; historic generic normal labels become N and generated resultant labels become F. Extended required scenario now authors an expression, rotates Table, moves Book, introduces abbreviation conflict, preserves IDs/AST/manual label offsets and round trips JSON.

Local 59 unit tests and production build passed. Final GitHub compiled/live verification pending this candidate's push. All original legacy fixtures and Contract 3 regression scenarios retained. README.md and docs/FORMAT.md updated; format remains version 3. Problemly, original/ and main untouched.

Manual: actual physical touchscreen acceptance remains the user's responsibility. No new physics functionality, dependencies, layout engine, solving or coordinate components. No autosave or undo.
