# Changelog

## Unreleased

- New experimental `pasteExplorerPathsDirectly` agent field, off by default.
  When it's on for an agent with an `openChatInSidebarCommand`, **Add Explorer
  Selection to Agent** (`addToAgentContext.pickFileAction`) offers that agent
  even without a `fileCommand`, which makes it usable with Claude Code. Instead
  of calling the agent's `fileCommand`, it copies the selected paths to the
  clipboard, opens the agent's chat and pastes them into its input. The paths
  stay on the clipboard.
- New **Add Explorer Selection to Last Agent** command
  (`addToAgentContext.sendFilesToAgent`) that sends the files and folders
  selected in the explorer to the last agent, like `sendToAgent` does for the
  editor selection. If there is no last agent, or it can't receive files and
  folders, it opens **Add Explorer Selection to Agent** instead. Like
  `sendToAgent`, it accepts an agent id as `args`.
- `Ctrl+'` (`Cmd+'` on macOS) in the explorer now runs
  `addToAgentContext.sendFilesToAgent` instead of copying the selected paths.
  `addToAgentContext.copyFilePaths` no longer has a default keybinding.
- Picking an agent in **Add Explorer Selection to Agent** makes it the last
  agent.

## 1.3.0

- New **Open Last Agent Chat in Sidebar** command
  (`addToAgentContext.openLastChatInSidebar`) that opens the chat of the last
  agent you sent to, or asks which one to open. Like `sendToAgent`, it accepts
  an agent id as `args` to open that agent's chat instead. For the default
  agents it opens the chat in the sidebar. It has no default keybinding.
- New **Open Agent Chat in Sidebar** command
  (`addToAgentContext.openChatInSidebar`) that asks which agent's chat to open.
  It has no default keybinding.
- Opening an agent's chat with either command makes it the last agent, so
  `sendToAgent` sends to it next.
- New optional `openChatInSidebarCommand` agent field, set to
  `claudeVSCodeSidebarSecondary.focus` for Claude Code and
  `chatgpt.openSidebar` for Codex by default.

## 1.2.0

- On macOS the default keybindings use `Cmd` instead of `Ctrl`.

## 1.1.0

- Selecting text with the mouse shows a popup with an **Add to _agent_** button
  for each available agent and a **Copy to clipboard** button. Hovering over
  selected text shows it too. The only exception is double-clicking a word,
  there is a best-effort implementation to detect double-clicks and avoid
  showing the popup in that case. This is purely personal preference  since I
  generally I always make a selection by dragging, but will sometimes double
  click on a symbol when reading code (either to see where it shows up in other
  places or simply as a fidgeting habit). Moving the mouse slightly will still
  show the popup.
- Turn the mouse selection feature off with `addToAgentContext.selectionPopup`
  setting (on by default).
- The extension now activates on startup, so the popup works before any of its
  commands has been run.
- Requires VS Code 1.108 or newer.

## 1.0.0

Initial release.
