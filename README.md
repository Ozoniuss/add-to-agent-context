# Add to Agent Context

A VS Code extension that sends the selected content directly to agent
extensions, or simply copies a reference to that selection to the clipboard.
See [How selections are modelled](#how-selections-are-modelled) for how
selections, including multiple ones, are turned into line ranges.

See [Demo](#demo) for a demo video.

## Usage

The idea is similar to Cursor's `Ctrl+L`: select some code and send it straight
to an agent's context, or copy a `path:lines` reference to paste anywhere. The
latter is particularly useful if e.g. you prefer working with agents in the
terminal.

In an editor:

- To send the selection to the agent you last sent to, press `Ctrl+'`. The
  first time, it opens the picker instead. (`addToAgentContext.sendToAgent`)
- To choose which agent to send the selection to, or to copy a `path:lines`
  reference to the clipboard, press `Ctrl+Shift+'` and pick from the list.
  (`addToAgentContext.pickAction`)

With nothing selected in the editor, the whole file is sent or copied. See
[How selections are modelled](#how-selections-are-modelled) for what gets sent
when you select part of a line, several ranges, and so on.

In the explorer, with one or more files or folders selected:

- To copy their paths to the clipboard, one per line, press `Ctrl+'`.
  (`addToAgentContext.copyFilePaths`, which runs VS Code's built-in
  `copyFilePath`)
- To copy the paths or add the files to an agent that supports it, press
  `Ctrl+Shift+'` and pick from the list. (`addToAgentContext.pickFileAction`)

> Note that in the explorer, currently `Ctrl+'` only copies the paths instead of
sending them to the last agent like it does in an editor. That's because not all
agents have a command that accepts a file URI. In particular, Claude Code can
only mention the file open in the active editor. The behavior will change once
I find a reliable way to send to last agent.

### How the last agent is detected and known limitations

The last agent is simply the last one the extension sent to in this workspace,
either with `Ctrl+'` or by picking it with `Ctrl+Shift+'`. Switching to another
agent's panel and working in it manually will not turn it into the last agent.
This is mainly because VS Code does not have a reliable way to determine which
panel of an extension was opened / focused last (or at least I haven't found
one).

There are ways to work around this. For example, if you always keep your agents
in the secondary side bar you can overwrite the keybindings to something like
this:

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

### Default agents

| Id | Agent | Editor selection | Explorer files and folders |
|---|---|---|---|
| `claude` | Claude Code | yes | no |
| `codex` | Codex | yes | yes |

An agent is still listed in the picker when its extension isn't installed, but
it is marked as unavailable.

### Customizing agents

Agents are configured in `settings.json` under `addToAgentContext.agents`:

```jsonc
"addToAgentContext.agents": {
    // add a new agent
    "my-agent": {
        "label": "My Agent",
        "extensionId": "someone.my-agent",
        "command": "myAgent.addSelection",
        "fileCommand": "myAgent.addFile"
    },
    // change one field of a built-in agent, leaving the other ones set to default
    "claude": { "label": "Claude" },
    // remove a built-in agent
    "codex": null
}
```

| Field | Required | Meaning |
|---|---|---|
| `command` | yes | Command that adds the current editor selection to the agent's context |
| `label` | no | Name shown in the picker; defaults to the agent id |
| `fileCommand` | no | Command that adds a file or folder, called with its URI; enables the agent in the explorer picker |
| `extensionId` | no | Extension providing the agent, only used to report that it isn't installed |

The `command` is invoked once per selected line range, with that range as the
editor's only selection, so every range reaches the agent even though agent
commands usually read just the primary selection. The `fileCommand` is invoked
once per selected file or folder.

### Default keybindings

The extension comes with these keybindings.

```json
{
    "key": "ctrl+'",
    "command": "addToAgentContext.sendToAgent",
    "when": "editorTextFocus"
},
{
    "key": "ctrl+shift+'",
    "command": "addToAgentContext.pickAction",
    "when": "editorTextFocus"
},
{
    "key": "ctrl+'",
    "command": "addToAgentContext.copyFilePaths",
    "when": "filesExplorerFocus && !inputFocus"
},
{
    "key": "ctrl+shift+'",
    "command": "addToAgentContext.pickFileAction",
    "when": "filesExplorerFocus && !inputFocus"
}
```

Just remove them if you only want to use the Command Palette, or update them to
whatever works for you. To do that, search for `addToAgentContext` in
**Preferences: Open Keyboard Shortcuts**, or add an entry to your
`keybindings.json` with the command prefixed by `-`. See
[How the last agent is detected and known limitations](#how-the-last-agent-is-detected-and-known-limitations)
for an example of custom keybindings.

## Demo

https://github.com/user-attachments/assets/239e6b06-a1f4-4708-ada0-205dfe9552ba

## How selections are modelled

The extension works with lines, not characters. Every selection in the editor
is turned into the range of lines it covers, and those ranges are what gets
copied or sent to an agent. Once you think of your selections as line ranges,
the result is predictable:

- **A partial line counts as the whole line.** Selecting a single word on line
  42 gives `foo.ts:42`.
- **Whole-line selections don't spill over.** Selecting lines with
  `shift+down` or by dragging the line numbers leaves the cursor at the start
  of the next line. That line has nothing selected, so it isn't included.
- **Plain cursors are ignored.** A cursor with nothing selected adds no lines.
  If there is no selection at all, you get the path to the whole file.
- **Order doesn't matter.** Ranges are sorted by line, whichever order you made
  the selections in.
- **Ranges that share a line are merged.** `11-22` and `22-26` become `11-26`,
  and a range inside another one disappears into it. Ranges on neighboring
  lines, like `1-2` and `3-4`, stay separate.

For example:

| Selections | Result |
|---|---|
| none | `/Users/you/project/src/foo.ts` |
| a word on line 42 | `/Users/you/project/src/foo.ts:42` |
| lines 42 to 58 | `/Users/you/project/src/foo.ts:42-58` |
| lines 34-46, then 11-22 | `/Users/you/project/src/foo.ts:11-22,34-46` |
| lines 11-22 and 22-26 | `/Users/you/project/src/foo.ts:11-26` |

There are various ways to create selections, especially with keyboard shortcuts.
For a simple way to test how this works, you can make multiple selections by
holding `alt` and making selections with the mouse.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to run the extension locally and
how to submit changes.
