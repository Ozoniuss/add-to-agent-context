# Copy Path With Line Selection

A VS Code extension taht copies the active file's full path to the clipboard,
appending the selected line range when there is a selection.

- No selection → `/Users/you/project/src/foo.ts`
- Single line selected → `/Users/you/project/src/foo.ts:42`
- Range selected → `/Users/you/project/src/foo.ts:42-58`


## Usage

You can run **Copy Path With Line Selection** from the Command Palette, however
it makes much more sense to bind this to a shortcut. I wrote this as an overwrite
for the `copyFilePath` shortcut when I am working in an editor. You can add the
following rebind to your keybindings.json file to only make it trigger when you
have a text selection in an editor:

```json
    {
        "key": "shift+alt+c",
        "command": "-copyFilePath",
        "when": "editorTextFocus"
    },
    {
        "key": "shift+alt+c",
        "command": "copyPathWithLines.copy",
        "when": "editorTextFocus"
    }
```

## Install from source

```bash
npm install -g @vscode/vsce
vsce package
```

Then install into your editor of choice:

```bash
# VS Code
code --install-extension copy-path-with-lines-0.0.1.vsix

# Cursor
cursor --install-extension copy-path-with-lines-0.0.1.vsix
```

Reload the window afterward.
