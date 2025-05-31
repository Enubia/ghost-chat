# Contributing to Ghost Chat

Thank you for your interest in contributing to Ghost Chat! This document provides guidelines to help you contribute effectively.

## Reporting Issues

Please use [GitHub Issues](https://github.com/Enubia/ghost-chat/issues/new/choose) or our [Discord server](https://discord.gg/UVMX32dDcy) to report bugs and errors.

When reporting issues, please include:
- A clear description of the bug
- Steps to reproduce the issue
- Expected and actual behavior
- Screenshots if applicable
- Your operating system and Ghost Chat version

## Development Setup

### Prerequisites:
- Node.js 22+ recommended
- [pnpm](https://pnpm.io/) (our package manager of choice)
- Git

## Contribution Workflow

1. **Fork** the repo on GitHub
2. **Clone** the project to your own machine
3. **Create a branch** for your feature or bugfix
4. **Make your changes** and commit them with clear messages
5. **Push** your work back up to your fork
6. Submit a **Pull request** so that we can review your changes

**NOTE:** Be sure to merge the latest from "upstream" before making a pull request!

## Code Style and Conventions

We [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) for fast linting and [Prettier](https://prettier.io/) for code formatting. All code should pass linting and formatting before being submitted:

- Git hooks automatically run linting and formatting before commits
- GitHub Actions will verify your code meets our standards
- Run `pnpm check` locally to check your code

## Building and Testing

To test your changes locally:
1. Run `pnpm dev` to start the development server
2. Make your changes and verify they work as expected
3. Run `pnpm build` to ensure the application builds correctly

## Adding New Features

When adding new features:
- Ensure all code is properly typed with TypeScript
- Add appropriate translations for any user-facing text
- Update documentation if necessary
- Consider cross-platform compatibility

## Translations

If you're adding or updating translations:
1. Refer to the reference file in `app/renderer/i18n/locales/en-US.json`
2. Create or update the relevant language file
3. Ensure all keys are present and correctly translated

## Pull Request Process

1. Update the documentation with details of changes if applicable
2. Ensure your PR passes all GitHub Actions checks
3. Be responsive to feedback and requests for changes
4. A maintainer will merge your PR once it meets all requirements

## Need Help?

If you need help with your contribution, feel free to:
- Join our [Discord server](https://discord.gg/UVMX32dDcy)
- Comment on the relevant GitHub issue
- Ask questions in your work-in-progress PR

Thank you for contributing to Ghost Chat!