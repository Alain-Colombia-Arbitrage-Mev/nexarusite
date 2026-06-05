import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));

test('Cloudflare deploy config targets the connected Worker', () => {
  assert.equal(config.name, 'nexarusite');
});

test('Cloudflare deploy config serves the static Astro build only', () => {
  assert.deepEqual(config.assets, { directory: './dist' });
  assert.equal(Object.hasOwn(config, 'main'), false);
});

test('Cloudflare deploy config does not provision session KV bindings', () => {
  assert.equal(Object.hasOwn(config, 'kv_namespaces'), false);
  assert.equal(JSON.stringify(config).includes('SESSION'), false);
});
