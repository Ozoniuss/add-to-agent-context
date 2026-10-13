# Agent instructions

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to run the extension locally and
how to submit changes. If the user says they are the maintainer, skip the pull
request steps and work and commit directly on `main` instead. Everything else
in this file still applies.

## Code style

Avoid functional-style JavaScript such as `filter`/`map`/`reduce` chains. Prefer
iterative code with plain `for` loops and `if`/`else`. The maintainer is a Go
developer and finds iterative code easier to read.

Name the variable holding a `registerCommand` result after the command ID
without the `addToAgentContext.` prefix, e.g. `const pickAction = ...` for
`addToAgentContext.pickAction`. If the handler is a named function, add
`Handler`, e.g. `pickActionHandler`.

## Documenting changes

- Update [README.md](README.md) with instructions on how a new feature works.
- Update [CHANGELOG.md](CHANGELOG.md) with what has changed. Add your entries
  under an `## Unreleased` heading at the top of the file, and create that
  heading if it doesn't exist. Don't add a version number. That happens when
  the next release is made.
- Update the `contributes` section of [package.json](package.json) when adding,
  renaming or changing commands, keybindings or settings, so the extension
  manifest matches the code.
- Keep the agent fields documented in the README's "Customizing agents" section
  in sync with the `addToAgentContext.agents` schema in `package.json`. The same
  goes for the "Default agents" table and the setting's `default` value.
- Keep the README's "Default keybindings" section in sync with the
  `keybindings` in `package.json` whenever a default keybinding is added,
  removed or changed. In `package.json`, each keybinding sets `key` for Windows
  and Linux and `mac` for macOS. The README shows them as they would appear in
  a user's `keybindings.json`, which has no `mac` field, so it has one block
  with the `key` values and a separate macOS block with the `mac` values.

## Releasing

Only the maintainer makes releases. When asked to make one:

1. Pick the new version from the `## Unreleased` entries, following semantic
   versioning. Use a patch bump for bug fixes only, a minor bump for new
   features, commands or settings, and a major bump for changes that break
   existing setups, such as removing or renaming a command or setting. If it's
   unclear, ask.
2. Run `npm version <version> --no-git-tag-version` to bump the version in
   `package.json` and `package-lock.json`.
3. Rename `## Unreleased` in [CHANGELOG.md](CHANGELOG.md) to `## <version>`.
   The release workflow takes the release notes from this heading and fails if
   it's missing.
4. Commit these changes on `main`.
5. Tag that commit `v<version>`, e.g. `git tag v1.3.0`. The release workflow
   checks that the tag matches the version in `package.json`.

Don't push unless asked. Pushing the tag triggers the release workflow, which
publishes a GitHub release.

## AI contributions

AI-assisted contributions are welcome, and AI-written PR descriptions are fine.
However, PRs where the responses to review comments are obviously AI-generated
will be closed or taken over by the maintainer.
