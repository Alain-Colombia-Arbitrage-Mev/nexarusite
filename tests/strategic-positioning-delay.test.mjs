import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

test('strategic positioning foreground elements wait 5 seconds before entering', () => {
  const source = readFileSync('src/components/StrategicPositioning.astro', 'utf8');
  const panelMatch = source.match(/<div\s+class="sp__panel anim-fade-left"(?<attrs>[^>]*)>/);
  const rightGroupMatch = source.match(/<div\s+class="sp__right-group anim-fade-right"(?<attrs>[^>]*)>/);

  assert.ok(panelMatch, 'Expected the Strategic Positioning text panel to be present');
  assert.match(panelMatch.groups.attrs, /style="[^"]*--delay:\s*5s[^"]*"/);

  assert.ok(rightGroupMatch, 'Expected the Strategic Positioning right group to be present');
  assert.match(rightGroupMatch.groups.attrs, /style="[^"]*--delay:\s*5s[^"]*"/);
});
