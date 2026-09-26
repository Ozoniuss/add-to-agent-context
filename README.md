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

You can also add the selection directly to an agent's context using `Ctrl+'`,
similar to Cursor's `Ctrl+L`. This currently works with Claude Code and
Codex extensions.

The extension comes with these keybindings, active when an editor has focus:

| Key | Command |
|---|---|
| `Ctrl+'` | `addToAgentContext.sendToAgent` |
| `Ctrl+Shift+'` | `addToAgentContext.pickAction` |

`Ctrl+'` sends to the last agent you sent to in this workspace. The first time,
when there is no last agent yet, it opens the picker instead. `Ctrl+Shift+'`
always opens the picker, and whichever agent you pick there becomes the target
of `Ctrl+'` from then on. It doesn't matter where the agent's panel is (primary
sidebar, secondary sidebar, bottom panel or an editor tab), since the agent's
own command opens and focuses it.

To always send to one agent regardless of the last one used, pass its id as
`args`:

```json
{
    "key": "ctrl+alt+'",
    "command": "addToAgentContext.sendToAgent",
    "args": "codex",
    "when": "editorTextFocus"
}
```

**Known limitation:** the target is the last agent the extension sent to, not
the agent panel you last opened or used. If you open another agent's panel and
work in it manually, `Ctrl+'` still sends to the previous agent until you pick
the new one with `Ctrl+Shift+'`. VS Code doesn't let extensions see which views
are open or focused, so there is no reliable way to follow the visible panel.

#### Workaround: agents kept in the secondary sidebar

If you always keep your agents in the secondary sidebar, you can add these
keybindings to your `keybindings.json`. `Ctrl+'` then sends to whichever agent
is showing in the secondary sidebar, and opens the picker when the secondary
sidebar is hidden. This relies on the secondary sidebar's context keys, so it
doesn't work for agents moved to the primary sidebar, the bottom panel or an
editor tab.

```json
{
    "key": "ctrl+'",
    "command": "addToAgentContext.pickAction",
    "when": "editorTextFocus && !auxiliaryBarVisible"
},
{
    "key": "ctrl+'",
    "command": "addToAgentContext.sendToAgent",
    "args": "claude",
    "when": "editorTextFocus && auxiliaryBarVisible && activeAuxiliary == workbench.view.extension.claude-sidebar-secondary"
},
{
    "key": "ctrl+'",
    "command": "addToAgentContext.sendToAgent",
    "args": "codex",
    "when": "editorTextFocus && auxiliaryBarVisible && activeAuxiliary == workbench.view.extension.codexSecondaryViewContainer"
}
```

Your own keybindings take priority over the ones the extension comes with. If
the secondary sidebar is showing something other than an agent, none of these
match and `Ctrl+'` falls back to the default: sending to the last agent you sent
to.

### Adding files and folders from the explorer

Select one or more items in the explorer and press `Ctrl+Shift+'` to either copy
their paths to the clipboard (one per line) or pick an agent to add them to.
Only agents with a `fileCommand` are offered, which currently means Codex.

The extension comes with these keybindings, active when the explorer has focus
and you aren't renaming a file:

| Key | Command |
|---|---|
| `Ctrl+'` | `copyFilePath` (built-in) |
| `Ctrl+Shift+'` | `addToAgentContext.pickFileAction` |

In the explorer, plain `Ctrl+'` copies the selected paths with VS Code's
built-in **Copy Path** rather than sending them to the last agent, because
Claude Code has no way to receive them (see the limitation below). You can then
paste the paths into any agent's input.

A command run from a keybinding doesn't receive the explorer selection, so the
extension runs the built-in **Copy Path** to read it and then restores your
clipboard.

**Known limitation:** Claude Code can't receive files or folders from the
explorer. Its only command for adding context, `claude-vscode.insertAtMention`,
takes no arguments and always mentions the file open in the active editor, and
it has no command that accepts a file path or URI (checked with Claude Code
2.1.283). It is therefore not offered in this picker. To add a file to Claude
Code, open it and use `Ctrl+'` with nothing selected, which mentions the whole
file.

### Changing the default keybindings

To rebind or remove any of the keybindings the extension comes with, search
for `addToAgentContext` (or `copyFilePath`) in **Preferences: Open Keyboard
Shortcuts**, or add an entry with the command prefixed by `-` to your
`keybindings.json`:

```json
{
    "key": "ctrl+'",
    "command": "-addToAgentContext.sendToAgent",
    "when": "editorTextFocus"
}
```

### Configuring agents

Agents are configured in `settings.json` under `addToAgentContext.agents`,
keyed by agent id (the id you can pass as `args` to `sendToAgent`). Your
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
defaults to the agent id. `fileCommand` is the command that adds a file or folder,
called with its URI, and enables the agent for the explorer picker. `extensionId`
is optional and only used to report a missing extension. Both built-in agents open and focus their
own panel when their command runs.

The command is invoked once per selected line range, with that range as the
editor's only selection, so every range reaches the agent even though agent
commands usually read just the primary selection.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to run the extension locally and
how to submit changes.
