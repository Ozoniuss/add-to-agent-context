# Changelog

## 0.1.0

- Document a `ctrl+l` binding that opens the destination picker when the
  secondary sidebar is closed, preserving per-agent routing while it is open.
- New command `copyPathWithLines.sendToAgent` adds the path with line selection
  directly to a coding agent's context. Pass an agent id as an argument to choose
  one, or omit it to reuse the agent last used in the workspace. Binding it per
  agent behind an `activeAuxiliary` comparison routes it to the selected
  agent container in the secondary sidebar; see the README.
- New command `copyPathWithLines.pickAction` opens a destination picker: copy to
  clipboard, or send to any registered agent.
- Register agents through the `copyPathWithLines.agents` setting. Claude Code and
  Codex ship as defaults; an agent whose extension is missing or whose command is
  no longer registered is reported instead of silently failing.
- Agent commands only read the primary selection, so `perRangeInvocation`
  invokes the agent's command once per merged line range to carry multiple
  cursors through.
- Add the `copyPathWithLines.revealOnSend` setting to control whether an agent's
  `revealCommand` runs before sending. Neither default agent needs one: both
  reveal themselves and both cope with being closed at the time.

## 0.0.1

- Initial release: copy the active file's full path, appending `:line` or
  `:start-end` when a selection is active.
- Support multiple selections: line ranges from all cursors/selections are
  collected, sorted, and merged (touching ranges are combined, e.g. `11-22` and
  `22-26` become `11-26`), producing suffixes like `:11-22,34-46`. Controlled by
  the `copyPathWithLines.allowMultipleSelections` setting (enabled by default).
