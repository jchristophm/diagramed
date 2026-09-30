import {writeFileSync} from 'node:fs';
import {scenarios} from '../tests/fixtures/scenarios';
import {serializeDocument} from '../src/persistence';
for(const [key,store]of Object.entries(scenarios()))writeFileSync(`examples/scenario-${key}.diagramed.json`,serializeDocument(store.document));
