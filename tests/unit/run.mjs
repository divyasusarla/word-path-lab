// Runs the unit tests in Node (used by GitHub Actions): node tests/unit/run.mjs
// The same tests also run in the browser as part of tests/index.html.
import { tests } from './engine.test.js';

let failed = 0;
for (const [name, fn] of tests) {
  try { await fn(); console.log(`✓ ${name}`); }
  catch (e) { failed++; console.log(`✗ ${name}\n    ${e.message}`); }
}
console.log(`\n${tests.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
