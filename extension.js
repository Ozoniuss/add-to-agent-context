const vscode = require('vscode');

function activate(context) {
  const cmd = vscode.commands.registerCommand('copyPathWithLines.copy', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    let path = editor.document.uri.fsPath;
    const sel = editor.selection;

    if (!sel.isEmpty) {
      const start = sel.start.line + 1;
      const end = sel.end.line + 1;
      path += start === end ? `:${start}` : `:${start}-${end}`;
    }

    await vscode.env.clipboard.writeText(path);
  });
  context.subscriptions.push(cmd);
}

function deactivate() {}

module.exports = { activate, deactivate };
