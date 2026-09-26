# Add to Agent Context

A VS Code extension that copies the active file's full path to the clipboard,
appending the selected line range when there is a selection.

- No selection → `/Users/you/project/src/foo.ts`
- Single line selected → `/Users/you/project/src/foo.ts:42`
- Range selected → `/Users/you/project/src/foo.ts:42-58`
- Multiple selections → `/Users/you/project/src/foo.ts:11-22,34-46`

## Multiple selections

One simple way to make multiple selections is using the mouse: `alt+click`

You can also make multiple selections in vscode in other ways, for example using
`ctrl+d` to place a cursor at the next token that matches the highlighted text.

When you have multiple cursors/selections, the line ranges from every selection
are collected, sorted, and merged into a single suffix. Two ranges that touch
(one ends where the next begins, e.g. `11-22` and `22-26`) are merged into one
(`11-26`).

## Usage

You can run **Copy Path with Lines** from the Command Palette, however
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
    "command": "addToAgentContext.copy",
    "when": "editorTextFocus"
}
```

https://github.com/user-attachments/assets/2505dd5d-a286-4be1-ab07-e297dfc36656

### Copying file paths from explorer

Sometimes it is also useful to just copy the location directly from the explorer
sidebar, if you don't want to also open the file in an editor. This can be
achieved without the extension using the following remap (on Windows it should
work by default):

```json
{
    "key": "shift+alt+c",
    "command": "copyFilePath",
    "when": "filesExplorerFocus"
}
```

https://github.com/user-attachments/assets/bbfc8b1b-12e0-4c62-96b3-948550576766

## Adding to an agent's context

You can also add the selection directly to an agent's context using `Ctrl+L`,
similar to Cursor's implementation. This currently works with Claude Code and
Codex extensions.

```json
{
    "key": "ctrl+l",
    "command": "addToAgentContext.sendToAgent",
    "when": "editorTextFocus"
},
{
    "key": "ctrl+l",
    "command": "addToAgentContext.pickAction",
    "when": "editorTextFocus && !auxiliaryBarVisible"
},
{
    "key": "ctrl+l",
    "command": "addToAgentContext.sendToAgent",
    "args": "claude",
    "when": "editorTextFocus && auxiliaryBarVisible && activeAuxiliary == workbench.view.extension.claude-sidebar-secondary"
},
{
    "key": "ctrl+l",
    "command": "addToAgentContext.sendToAgent",
    "args": "codex",
    "when": "editorTextFocus && auxiliaryBarVisible && activeAuxiliary == workbench.view.extension.codexSecondaryViewContainer"
},
{
    "key": "ctrl+shift+l",
    "command": "addToAgentContext.pickAction",
    "when": "editorTextFocus"
}
```

### Configuring agents

Agents are configured in `settings.json` under `addToAgentContext.agents`,
keyed by agent id (the id you pass as `args` in the keybindings above). Your
entries are merged with the built-in `claude` and `codex` ones, so you only
write what you want to change:

```jsonc
"addToAgentContext.agents": {
    // add a new agent
    "my-agent": {
        "label": "My Agent",
        "extensionId": "someone.my-agent",
        "command": "myAgent.addSelection"
    },
    // change one field of a built-in agent
    "claude": { "label": "Claude" },
    // remove a built-in agent
    "codex": null
}
```

Each agent needs a `command`, which is the command that adds the current editor
selection to that agent's context. `label` is the name shown in the picker and
defaults to the agent id. `extensionId` is optional and
only used to report a missing extension. Both built-in agents open and focus their
own panel when their command runs.

The command is invoked once per selected line range, with that range as the
editor's only selection, so every range reaches the agent even though agent
commands usually read just the primary selection.

## Install from source

```bash
nvm use
npm install
npm test
npm run install-extension
```

`npm run install-extension` packages `add-to-agent-context.vsix` and installs it
into VS Code. For Cursor, run `npm run package` and then:

```bash
cursor --install-extension add-to-agent-context.vsix
```

Reload the window afterward.
