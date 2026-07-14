const vscode = require('vscode');

function activate(context) {
  const cmd = vscode.commands.registerCommand('copyPathWithLines.copy', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    let path = editor.document.uri.fsPath;

    const allowMultiple = vscode.workspace
      .getConfiguration('copyPathWithLines')
      .get('allowMultipleSelections', true);

    const selections = allowMultiple ? editor.selections : [editor.selection];

    const intervals = selections
      .filter((sel) => !sel.isEmpty)
      .map((sel) => [sel.start.line + 1, sel.end.line + 1])
      .sort((a, b) => a[0] - b[0]);

    const merged = [];
    for (const [start, end] of intervals) {
      const last = merged[merged.length - 1];
      if (last && start <= last[1]) {
        last[1] = Math.max(last[1], end);
      } else {
        merged.push([start, end]);
      }
    }

    if (merged.length > 0) {
      const suffix = merged
        .map(([start, end]) => (start === end ? `${start}` : `${start}-${end}`))
        .join(',');
      path += `:${suffix}`;
    }

    await vscode.env.clipboard.writeText(path);
  });
  context.subscriptions.push(cmd);
}

function deactivate() { }

module.exports = { activate, deactivate };
