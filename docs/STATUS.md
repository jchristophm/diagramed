# Recovery status, 2026-09-30 UTC

Repository: https://github.com/jchristophm/diagramed . Working branch: `development`. `main` is the untouched import checkpoint. Resume from the latest `development` commit, not the old source files.

## Checkpoints

1. Untouched source import: `e9347bb6c94c3fd758326492d062b2f249df3474`, pushed. Original file Git blob hashes exactly match Problemly.
2. TypeScript and authoritative document model: `4f371ff075feecd4f776aba390e579579eb679ae`, pushed. Build passed; persistence controls intentionally disabled at that checkpoint.
3. JSON loading/downloading: `a818cfd352631f8b9e34542c099b09882796a6a6`, pushed. Build and eight document tests passed.
4. Browser regression tests, documentation and Pages workflow: `096e8ed16c1e7fcaa6120e1ff69786ed543e1208`, pushed. Eight unit tests and four desktop/mobile browser tests passed locally and in GitHub Actions run 36658435261.
5. Final handoff commit includes this report, the original development contract and browser tests configured against production assets. Production-build browser tests also pass locally (four tests).

## Deployment verified

GitHub Pages was enabled and the development branch was allowed by the environment protection rules. GitHub Actions run 36658620755, attempt 3, completed verification and deployment successfully. Deployed application commit: 5131b382160562409fc5113516ad505a5764e3a8. All four browser acceptance tests passed against the live URL on 2026-09-30 UTC. The cloud test proxy certificate required a temporary local-only ignoreHTTPSErrors setting; the repository's normal browser configuration is unchanged.

Live development URL: https://jchristophm.github.io/diagramed/ . Verified live. After activation, repeat the browser tests with `TEST_URL=https://jchristophm.github.io/diagramed/ npm run test:browser` (requires build only when using the local preview, not this hosted URL). Actual device touch acceptance still requires the user. Pull-request previews are not configured.

Independent deployment and live acceptance tests have passed. Build, document persistence, graphical operations, emulated touch endpoint interaction and production asset checks are complete. Problemly's main commit remains fb432d00f07bcf9d2b386fa4de98d792b823a57f; no write operations targeted Problemly.

## Known differences

Text editing uses the existing math modal layout instead of the source's buggy inline textarea. Viewport resize scales a fixed document coordinate system instead of changing stored geometry. Circles retain Konva scale transforms (nonuniform transforms can present an ellipse). Math and labels retain their scale/rotation on reopen. No semantic UI, physics evaluation, exports, undo, server or Mathed integration were added.
