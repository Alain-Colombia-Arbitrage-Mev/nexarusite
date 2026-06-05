import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

test('what NGS provides section uses S-005 video background', () => {
  const source = readFileSync('src/components/WhatNGSProvides.astro', 'utf8');
  const sectionMatch = source.match(/<section\s+class="section"\s+id="section-provides"(?<attrs>[^>]*)>/);

  assert.ok(sectionMatch, 'Expected the What NGS Provides section to be present');
  assert.match(sectionMatch.groups.attrs, /data-video=\{whatNgsProvidesVideo\}/);
  assert.match(
    source,
    /const whatNgsProvidesVideo = 'https:\/\/pub-1177376bfc1641b2aeba0cd63a27cb3a\.r2\.dev\/videos\/S-005\.mp4';/
  );
  assert.doesNotMatch(sectionMatch.groups.attrs, /Secuencia 006|Secuencia%20006/);
});
