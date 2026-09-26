# Contributing

Any contributions are welcome to make the extension better.

## Running locally

```bash
nvm use
npm install
npm test
npm run install-extension
```

`npm run install-extension` packages `add-to-agent-context.vsix` and installs it
into VS Code. Reload the window afterward. There's no integration tests so this
is how I actually test the extension works as expected.

## Making a pull request

1. Fork the repository.
2. Create a branch in your fork and make your changes.
3. Run `npm test` and check that the tests pass.
4. Open a pull request against `main`.

## Not sure how to make a pull request?

Just [open an issue](https://github.com/Ozoniuss/add-to-agent-context/issues)
describing the bug or the change you'd like, and I'll take it from there. Or
have an agent make the pull request for you:)
