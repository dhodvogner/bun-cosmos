# Contributing to bun-cosmos

Thank you for your interest in contributing to bun-cosmos! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/bun-cosmos.git`
3. Install dependencies: `bun install`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development

### Running Tests

```bash
bun test
```

### Running the Example

```bash
bun run start
```

This will start the example project on http://localhost:3009

### Project Structure

```
bun-cosmos/
├── src/               # Library source code
│   ├── index.ts      # Main entry point
│   ├── config.ts     # Configuration resolver
│   ├── types.ts      # TypeScript type definitions
│   └── watch-build.ts # Build and watch functionality
├── test/             # Test files
├── example/          # Example project
├── cosmos/           # Cosmos renderer files
└── .github/          # GitHub Actions workflows
```

## Making Changes

### Code Style

- Use TypeScript for all code
- Follow the existing code style
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Commit Messages

- Use clear and descriptive commit messages
- Start with a verb in present tense (e.g., "Add", "Fix", "Update")
- Reference issues when applicable (e.g., "Fix #123")

### Testing

- Add tests for new features
- Ensure all tests pass before submitting PR
- Update documentation if needed

## Submitting a Pull Request

1. Push your changes to your fork
2. Create a Pull Request from your branch to `main`
3. Describe your changes in the PR description
4. Link any related issues
5. Wait for review and address any feedback

## Reporting Issues

- Use GitHub Issues to report bugs
- Provide a clear description and steps to reproduce
- Include your environment details (Bun version, OS, etc.)

## Code of Conduct

Be respectful and constructive in all interactions. We're all here to make bun-cosmos better!

## Questions?

Feel free to open an issue for questions or discussions about the project.

Thank you for contributing! 🎉
