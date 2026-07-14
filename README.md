# Copy Path With Line Selection

A tiny VS Code / Cursor extension that copies the active file's full path to the
clipboard, appending the selected line range when there is a selection.

- No selection → `/Users/you/project/src/foo.ts`
- Single line selected → `/Users/you/project/src/foo.ts:42`
- Range selected → `/Users/you/project/src/foo.ts:42-58`

Handy for pasting precise pointers into code reviews, chats, or AI assistants.

## Usage

Run **Copy Path With Line Selection** from the Command Palette
(`Cmd+Shift+P`), or bind it to a shortcut.

To rebind (e.g. to `Shift+Opt+C`), open *Preferences: Open Keyboard Shortcuts (JSON)*
and add:

```json
{ "key": "shift+alt+c", "command": "-copyFilePath" },
{ "key": "shift+alt+c", "command": "copyPathWithLines.copy", "when": "editorTextFocus" }
```

The first line unbinds whatever command currently owns the shortcut.

## Install from source

```bash
npm install -g @vscode/vsce
vsce package
cursor --install-extension copy-path-with-lines-0.0.1.vsix   # or: code --install-extension ...
```

Reload the window afterward.
