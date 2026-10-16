# Changelog

## Unreleased

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
