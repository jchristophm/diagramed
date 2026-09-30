# Development Contract 3.1 integration candidate

Starting HEAD: 7dd858c2825a03a845165dd875a6755f883f5087.

1. Automatic notation: c09d347f8be575e2bddbda31dfb14f7faf4bddca; run 36762872315 succeeded with 52 unit tests, build, 36 browser tests, deployment and independent live verification.
2. Graphical/interface checkpoint: 890ada46634ec31ae1ff56180b92780bca3e6cd9; run 36764245148 succeeded with 57 unit tests, build, 40 desktop/mobile browser tests, deployment and the same 40 tests independently against the live URL. Initial checkpoint 5c56751 could not register a test helper imported from another spec; corrected helper registration in 890ada4.
3. Integration candidate: historical default labels receive current placement without rewriting imported geometry/offsets; first historical rename updates automatic notation; long-name collisions stay within symbol limits; historic generic normal labels become N and generated resultant labels become F. Extended required scenario now authors an expression, rotates Table, moves Book, introduces abbreviation conflict, preserves IDs/AST/manual label offsets and round trips JSON.

Local 62 unit tests and production build passed. Screenshot review confirmed compact math labels and origins; final automatic labels now receive a small boundary adjustment, while manual offsets remain unrestricted. Candidate fcbd34f94bca801af0190571b5449b0dc0a47fdf passed run 36765608002: 61 unit tests, production build, 40 compiled browser tests, deployment and all 40 independently against the live URL. Final review added singleton naming restoration after deleting a second spring/environment, with one regression test. The final correction is awaiting its exact-revision verification. All original legacy fixtures and Contract 3 regression scenarios retained. README.md and docs/FORMAT.md updated; format remains version 3. Problemly, original/ and main untouched.

Manual: actual physical touchscreen acceptance remains the user's responsibility. No new physics functionality, dependencies, layout engine, solving or coordinate components. No autosave or undo.
