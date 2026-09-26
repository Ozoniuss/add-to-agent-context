export type Range = [start: number, end: number];

interface LineSelection {
  start: { line: number };
  end: { line: number; character: number };
  isEmpty: boolean;
}

export interface SelectionSource {
  selections: readonly LineSelection[];
}

export interface PathSource extends SelectionSource {
  document: { uri: { fsPath: string } };
}

// takes the lines from all selections and returns a list of non-overlapping
// intervals that covers them, e.g. ([5,21], [23,34])
//
// Note that a range is a closed interval to match what the copied path would
// report.
export function mergedRanges(editor: SelectionSource): Range[] {
  const intervals: Range[] = [];
  for (const sel of editor.selections) {
    if (sel.isEmpty) {
      continue;
    }
    intervals.push([sel.start.line + 1, lastSelectedLine(sel) + 1]);
  }
  intervals.sort((a, b) => a[0] - b[0]);

  const merged: Range[] = [];
  for (const [start, end] of intervals) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}

// selecting whole lines (shift+down, or dragging the gutter) ends the selection
// at column 0 of the following line, which contains no selected text
function lastSelectedLine(sel: LineSelection): number {
  if (sel.end.character === 0 && sel.end.line > sel.start.line) {
    return sel.end.line - 1;
  }
  return sel.end.line;
}

// formatPath prints something like this, depending on how many selections there
// are:
// /home/ozoniuss/github/add-to-agent-context/extension.js:5-21
// /home/ozoniuss/github/add-to-agent-context/extension.js:5-21,23-34
//
// Note that intervals are closed since it's more intuitive to understand what
// is being selected.
export function formatPath(editor: PathSource): string {
  const path = editor.document.uri.fsPath;
  const merged = mergedRanges(editor);
  if (merged.length === 0) {
    return path;
  }

  const parts: string[] = [];
  for (const [start, end] of merged) {
    if (start === end) {
      parts.push(`${start}`);
    } else {
      parts.push(`${start}-${end}`);
    }
  }
  return `${path}:${parts.join(',')}`;
}
