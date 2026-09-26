import test from 'node:test';
import assert from 'node:assert/strict';
import { mergedRanges, formatPath, type PathSource, type Range } from '../ranges';

type Selection = PathSource['selections'][number];

const AT_BEGINNING_OF_LINE = 0;
const NOT_AT_BEGINNING_OF_LINE = 10;

function sel(startLine: number, endLine: number, endCharacter = NOT_AT_BEGINNING_OF_LINE): Selection {
  return {
    start: { line: startLine - 1 },
    end: { line: endLine - 1, character: endCharacter },
    isEmpty: false,
  };
}

function wholeLines(startLine: number, endLine: number): Selection {
  return sel(startLine, endLine + 1, AT_BEGINNING_OF_LINE);
}

function cursor(line: number): Selection {
  return { start: { line: line - 1 }, end: { line: line - 1, character: 0 }, isEmpty: true };
}

function editor(...selections: Selection[]): PathSource {
  return { selections, document: { uri: { fsPath: '/repo/foo.js' } } };
}

test('mergedRanges', (t) => {
  const cases: { name: string; selections: Selection[]; want: Range[] }[] = [
    { name: 'no selections', selections: [], want: [] },
    { name: 'only empty cursors', selections: [cursor(3), cursor(8)], want: [] },
    { name: 'single line', selections: [sel(5, 5)], want: [[5, 5]] },
    { name: 'single range', selections: [sel(5, 21)], want: [[5, 21]] },
    { name: 'disjoint ranges', selections: [sel(5, 21), sel(23, 34)], want: [[5, 21], [23, 34]] },
    { name: 'unsorted input', selections: [sel(23, 34), sel(5, 21)], want: [[5, 21], [23, 34]] },
    { name: 'overlapping', selections: [sel(5, 21), sel(10, 30)], want: [[5, 30]] },
    { name: 'touching', selections: [sel(11, 22), sel(22, 26)], want: [[11, 26]] },
    { name: 'adjacent lines stay separate', selections: [sel(1, 2), sel(3, 4)], want: [[1, 2], [3, 4]] },
    { name: 'contained', selections: [sel(5, 30), sel(10, 12)], want: [[5, 30]] },
    { name: 'chain of merges', selections: [sel(1, 5), sel(5, 9), sel(8, 12)], want: [[1, 12]] },
    { name: 'empty cursor ignored', selections: [sel(5, 21), cursor(40)], want: [[5, 21]] },
    { name: 'whole lines exclude next line', selections: [wholeLines(5, 7)], want: [[5, 7]] },
    { name: 'single whole line', selections: [wholeLines(5, 5)], want: [[5, 5]] },
    { name: 'whole lines next to each other stay separate', selections: [wholeLines(1, 2), wholeLines(3, 4)], want: [[1, 2], [3, 4]] },
    { name: 'column 0 on the same line is kept', selections: [sel(5, 5, 0)], want: [[5, 5]] },
  ];

  for (const c of cases) {
    t.test(c.name, () => {
      assert.deepEqual(mergedRanges(editor(...c.selections)), c.want);
    });
  }
});

test('formatPath', (t) => {
  const cases: { name: string; selections: Selection[]; want: string }[] = [
    { name: 'no selection', selections: [cursor(3)], want: '/repo/foo.js' },
    { name: 'single line', selections: [sel(5, 5)], want: '/repo/foo.js:5' },
    { name: 'single range', selections: [sel(5, 21)], want: '/repo/foo.js:5-21' },
    { name: 'multiple ranges', selections: [sel(23, 34), sel(5, 21), sel(40, 40)], want: '/repo/foo.js:5-21,23-34,40' },
    { name: 'whole lines', selections: [wholeLines(5, 7)], want: '/repo/foo.js:5-7' },
  ];

  for (const c of cases) {
    t.test(c.name, () => {
      assert.equal(formatPath(editor(...c.selections)), c.want);
    });
  }
});
