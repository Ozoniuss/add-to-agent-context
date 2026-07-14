# Changelog

## 0.0.1

- Initial release: copy the active file's full path, appending `:line` or
  `:start-end` when a selection is active.
- Support multiple selections: line ranges from all cursors/selections are
  collected, sorted, and merged (touching ranges are combined, e.g. `11-22` and
  `22-26` become `11-26`), producing suffixes like `:11-22&34-46`. Controlled by
  the `copyPathWithLines.allowMultipleSelections` setting (enabled by default).
