import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SourceTextModule, SyntheticModule } from 'node:vm';

let databaseCalls = 0;
let saved;
const source = await readFile(new URL('../app/api/submit/route.js', import.meta.url), 'utf8');
const options = new SourceTextModule(await readFile(new URL('../lib/formOptions.js', import.meta.url), 'utf8'));
await options.link(() => { throw new Error('Unexpected import'); });
await options.evaluate();
const response = new SyntheticModule(['NextResponse'], function () {
  this.setExport('NextResponse', { json: (body, init) => Response.json(body, init) });
});
const storage = new SyntheticModule(['getSupabaseAdmin'], function () {
  this.setExport('getSupabaseAdmin', () => {
    databaseCalls++;
    return { from: () => ({ insert: async (body) => { saved = body; return { error: null }; } }) };
  });
});
const route = new SourceTextModule(source);
await route.link((name) => {
  if (name === 'next/server') return response;
  if (name === '@/lib/formOptions') return options;
  if (name === '@/lib/supabaseAdmin') return storage;
  throw new Error(`Unexpected import: ${name}`);
});
await route.evaluate();
const submit = route.namespace.POST;

for (const body of [null, [], ['question'], 42, true, 'hello']) {
  test(`non-object JSON ${JSON.stringify(body)} returns 400 before database access`, async () => {
    const before = databaseCalls;
    const result = await submit({ json: async () => body });
    assert.equal(result.status, 400);
    assert.equal((await result.json()).error, 'Submission must be a JSON object.');
    assert.equal(databaseCalls, before);
  });
}
test('malformed JSON returns 400', async () => {
  const result = await submit({ json: async () => { throw new SyntaxError('bad json'); } });
  assert.equal(result.status, 400);
});
test('an empty object still fails required-field validation', async () => {
  const result = await submit({ json: async () => ({}) });
  assert.equal(result.status, 400);
});
test('a valid submission still writes trimmed data and returns 201', async () => {
  const result = await submit({ json: async () => ({ name: ' Demo ', experience: options.namespace.experienceOptions[0], rawQuestion: ' What is weighing? ', finalQuestion: ' How do I compare impacts? ', diagnosis: ['Weighing'] }) });
  assert.equal(result.status, 201);
  assert.equal(saved.name, 'Demo');
  assert.equal(saved.scenario, null);
  assert.deepEqual(saved.diagnosis, ['Weighing']);
});
