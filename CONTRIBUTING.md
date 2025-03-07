# Contributing to 3D Jamaican Dominoes

Thank you for considering contributing to this project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Community](#community)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. By participating, you are expected to uphold this code. Please report unacceptable behavior to [maintainer-email@example.com].

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```
   git clone https://github.com/YOUR-USERNAME/3d-jamaican-dominoes.git
   cd 3d-jamaican-dominoes
   ```
3. Add the original repository as an upstream remote:
   ```
   git remote add upstream https://github.com/kearry/3d-jamaican-dominoes.git
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Set up environment variables:
   ```
   cp .env.example .env.local
   ```
6. Initialize the database:
   ```
   npm run db:migrate
   npm run db:seed
   ```
7. Start the development server:
   ```
   npm run dev
   ```

## Development Workflow

1. Create a new branch for your feature or bugfix:
   ```
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```
2. Make your changes
3. Run the linter to ensure code quality:
   ```
   npm run lint
   ```
4. Run the type checker:
   ```
   npx tsc --noEmit
   ```
5. Run tests:
   ```
   npm test
   ```
6. Commit your changes with a descriptive commit message following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve issue with domino rotation"
   ```
7. Push to your fork:
   ```
   git push origin feature/your-feature-name
   ```
8. Submit a pull request to the main repository

## Pull Request Process

1. Ensure your PR description clearly describes the problem and solution
2. Include the relevant issue number if applicable
3. Update documentation if needed
4. Make sure all CI checks pass
5. Get at least one code review approval before merging

## Coding Standards

This project uses:

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

All code should follow these standards:

- Use TypeScript for all new features
- Follow the existing code style
- Include proper type definitions
- Document complex functions and components
- Keep components small and focused

## 3D and Game Development Guidelines

When working with Three.js and game logic:

1. **Performance Optimization**:
   - Minimize render calls
   - Reuse geometries and materials
   - Use object pooling for frequently created/destroyed objects
   - Implement level-of-detail (LOD) for complex models

2. **Game Logic**:
   - Separate game logic from rendering logic
   - Use predictable state management patterns
   - Handle edge cases in game rules

3. **Accessibility**:
   - Ensure game can be played without relying solely on colors
   - Add keyboard controls where possible
   - Include options for different visual preferences

## Testing

This project uses Jest and React Testing Library for testing. All new features should include tests. To run tests:

```
npm test
```

Different types of tests to include:

- **Unit Tests**: For utility functions and small components
- **Component Tests**: For UI components with React Testing Library
- **Integration Tests**: For features that span multiple components
- **E2E Tests**: For critical user flows (future)

## Documentation

Good documentation is crucial for this project:

- Add JSDoc comments to functions and components
- Update README.md when adding major features
- Document API endpoints with clear request/response examples
- Add to USER_GUIDE.md when user-facing features change

## Reporting Bugs

When reporting bugs, please include:

1. A clear, descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Browser/device information
7. Any additional context

Use the GitHub Issues template for bug reports.

## Feature Requests

Feature requests are welcome! Please use the GitHub Issues template for feature requests and include:

1. A clear description of the feature
2. The motivation for the feature
3. How it would benefit users
4. Any implementation ideas you have

## Community

Join our community channels for discussion:

- GitHub Discussions
- [Discord](#) (coming soon)
- [Twitter](#) (coming soon)

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT License.

---

Thank you for contributing to 3D Jamaican Dominoes!