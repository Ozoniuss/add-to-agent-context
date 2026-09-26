# Agent instructions

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to run the extension locally and
how to submit changes.

## Code style

Avoid functional-style JavaScript such as `filter`/`map`/`reduce` chains. Prefer
iterative code with plain `for` loops and `if`/`else`. The maintainer is a Go
developer and finds iterative code easier to read.

## Documenting changes

- Update [README.md](README.md) with instructions on how a new feature works.
- Update [CHANGELOG.md](CHANGELOG.md) with what has changed.
- Update the `contributes` section of [package.json](package.json) when adding,
  renaming or changing commands, keybindings or settings, so the extension
  manifest matches the code.
- Keep the agent fields documented in the README's "Customizing agents" section
  in sync with the `addToAgentContext.agents` schema in `package.json`. The same
  goes for the "Default agents" table and the setting's `default` value.
- Keep the README's "Default keybindings" section in sync with the
  `keybindings` in `package.json` whenever a default keybinding is added,
  removed or changed.

## AI contributions

AI-assisted contributions are welcome, and AI-written PR descriptions are fine.
However, PRs where the responses to review comments are obviously AI-generated
will be closed or taken over by the maintainer.
