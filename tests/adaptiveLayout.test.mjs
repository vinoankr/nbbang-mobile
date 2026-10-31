import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/utils/adaptiveLayout.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { getUsableRect } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const none = { top: 0, right: 0, bottom: 0, left: 0 };

test('keeps asymmetric rail, status bar and navigation insets out of the content', () => {
  assert.deepEqual(getUsableRect({ width: 390, height: 844 }, { top: 20, right: 64, bottom: 34, left: 8 }),
    { x: 8, y: 20, width: 318, height: 790 });
});

test('keeps a single column entirely on one side of a vertical fold', () => {
  assert.deepEqual(getUsableRect({ width: 1000, height: 800 }, none,
    [{ kind: 'division', frame: { x: 490, y: 0, width: 20, height: 800 } }]),
  { x: 0, y: 0, width: 482, height: 800 });
});

test('uses the larger half above or below a horizontal fold', () => {
  assert.deepEqual(getUsableRect({ width: 800, height: 1000 }, none,
    [{ kind: 'division', frame: { x: 0, y: 400, width: 800, height: 10 } }]),
  { x: 0, y: 418, width: 800, height: 582 });
});

test('avoids zero-width hinges and ignores camera regions already outside the safe area', () => {
  const size = { width: 800, height: 600 };
  assert.equal(getUsableRect(size, none, [{ kind: 'division', frame: { x: 400, y: 0, width: 0, height: 600 } }]).width, 392);
  assert.deepEqual(getUsableRect(size, { ...none, top: 40 },
    [{ kind: 'occlusion', frame: { x: 300, y: 0, width: 50, height: 20 } }]),
  { x: 0, y: 40, width: 800, height: 560 });
});

test('recalculates safely for short windows and folds disappearing when unfolded', () => {
  assert.deepEqual(getUsableRect({ width: 390, height: 300 }, { ...none, bottom: 20 }),
    { x: 0, y: 0, width: 390, height: 280 });
  assert.deepEqual(getUsableRect({ width: 1200, height: 800 }, none), { x: 0, y: 0, width: 1200, height: 800 });
  assert.equal(getUsableRect({ width: 100, height: 20 }, { ...none, top: 50 }).height, 0);
});
