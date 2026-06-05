import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

test('transition to key advantages uses S-003 video', () => {
  const source = readFileSync('src/pages/index.astro', 'utf8');
  const transitionMatch = source.match(/<Transition\s+id="trans-04"(?<attrs>[^>]*)\/>/);

  assert.ok(transitionMatch, 'Expected trans-04 transition to be present');
  assert.match(
    transitionMatch.groups.attrs,
    /video="https:\/\/pub-1177376bfc1641b2aeba0cd63a27cb3a\.r2\.dev\/videos\/S-003\.mp4"/
  );
  assert.doesNotMatch(transitionMatch.groups.attrs, /Secuencia 004|Secuencia%20004/);
});
