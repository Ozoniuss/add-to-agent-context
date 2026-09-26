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

## AI contributions

AI-assisted contributions are welcome, and AI-written PR descriptions are fine.
However, PRs where the responses to review comments are obviously AI-generated
will be closed or taken over by the maintainer.
