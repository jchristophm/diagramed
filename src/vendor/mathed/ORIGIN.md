This is the reusable Mathed source from jchristophm/mathed, development commit
f261d6834d381216667a13dc37255f6c5cf897d4. Controller, model, renderer, vocabulary,
LaTeX generation and styles are unchanged. mathed.ts adds only insertVariable
and updateVocabulary to its public instance API for host dropdown insertion and
live vocabulary updates. Diagramed's adapter lives outside this directory.
The pinned source is bundled locally; Pages needs no runtime external editor.
