import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

test('key advantages section uses S-004 video background', () => {
  const source = readFileSync('src/components/KeyAdvantages.astro', 'utf8');
  const sectionMatch = source.match(/<section\s+class="section"\s+id="section-advantages"(?<attrs>[^>]*)>/);

  assert.ok(sectionMatch, 'Expected the Key Advantages section to be present');
  assert.match(
    sectionMatch.groups.attrs,
    /data-video=\{keyAdvantagesVideo\}/
  );
  assert.match(
    source,
    /const keyAdvantagesVideo = 'https:\/\/pub-1177376bfc1641b2aeba0cd63a27cb3a\.r2\.dev\/videos\/S-004\.mp4';/
  );
  assert.doesNotMatch(sectionMatch.groups.attrs, /Secuencia 005|Secuencia%20005/);
});
