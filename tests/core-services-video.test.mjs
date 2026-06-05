import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const coreServicesVideoUrl = 'https://pub-1177376bfc1641b2aeba0cd63a27cb3a.r2.dev/videos/S-006.mp4';

test('core services uses S-006 once and reveals content at the video end', () => {
  const indexSource = readFileSync('src/pages/index.astro', 'utf8');
  const componentSource = readFileSync('src/components/CoreServiceStructure.astro', 'utf8');
  const sectionMatch = componentSource.match(/<section\s+class="section"\s+id="section-services"(?<attrs>[^>]*)>/);
  const headlineMatch = componentSource.match(/<h2\s+class="cs-headline anim-fade-left"(?<attrs>[^>]*)>/);
  const subheadlineMatch = componentSource.match(/<p\s+class="cs-subheadline anim-fade-left"(?<attrs>[^>]*)>/);
  const ctaMatch = componentSource.match(/<div\s+class="cs-cta anim-fade-up"(?<attrs>[^>]*)>/);

  assert.doesNotMatch(indexSource, /id="trans-07"|Secuencia 007|Secuencia%20007/);

  assert.ok(sectionMatch, 'Expected Core Service Structure section to be present');
  assert.match(sectionMatch.groups.attrs, /data-video=\{coreServicesVideo\}/);
  assert.match(
    componentSource,
    new RegExp(`const coreServicesVideo = '${coreServicesVideoUrl.replaceAll('.', '\\.')}';`)
  );
  assert.match(componentSource, /const coreServicesContentDelay = 6;/);
  assert.doesNotMatch(sectionMatch.groups.attrs, /Secuencia 007|Secuencia%20007/);

  assert.ok(headlineMatch, 'Expected Core Service Structure headline to be present');
  assert.match(headlineMatch.groups.attrs, /style=\{`--delay: \$\{coreServicesContentDelay\}s`\}/);

  assert.ok(subheadlineMatch, 'Expected Core Service Structure subheadline to be present');
  assert.match(subheadlineMatch.groups.attrs, /style=\{`--delay: \$\{coreServicesContentDelay \+ 0\.1\}s`\}/);

  assert.match(componentSource, /style=\{`--delay: \$\{coreServicesContentDelay \+ 0\.2 \+ i \* 0\.1\}s`\}/);

  assert.ok(ctaMatch, 'Expected Core Service Structure CTA to be present');
  assert.match(ctaMatch.groups.attrs, /style=\{`--delay: \$\{coreServicesContentDelay \+ 0\.7\}s`\}/);
});
