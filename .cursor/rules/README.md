# Cursor Rules for Kids-5-Minute-Activity-App

This directory contains cursor rules that define coding standards and best practices for the project.

## Available Rules

### Core Development Rules
- **`architecture.mdc`** - System architecture and design principles
- **`angular-best-practices.mdc`** - Angular-specific development guidelines
- **`code-style-and-structure.mdc`** - General code style and structure guidelines

### Code Quality Rules
- **`linting-and-code-quality.mdc`** - ESLint, TypeScript, and code quality standards
- **`typescript-code-style.mdc`** - TypeScript-specific coding standards and patterns
- **`standardjs-rules.mdc`** - JavaScript/TypeScript formatting rules

### Technical Rules
- **`naming-conventions.mdc`** - File and variable naming standards
- **`scss-modules.mdc`** - SCSS/CSS styling guidelines
- **`ui-performance-optimization.mdc`** - Performance optimization practices
- **`error-handling-and-validation.mdc`** - Error handling and validation patterns

### Workflow Rules
- **`command-line-practices.mdc`** - Terminal and command line best practices
- **`todo-file-structure.mdc`** - TODO.md file structure, format, and modification rules

## Key Standards

### TypeScript
- ✅ **NO `any` types** - Use proper TypeScript types
- ✅ **Explicit return types** - All functions must have return types
- ✅ **Strict typing** - Use interfaces and proper type definitions
- ✅ **JSDoc comments** - Document all public methods

### Code Style
- ✅ **Consistent formatting** - Follow established patterns
- ✅ **Single responsibility** - Each file/function has one purpose
- ✅ **Descriptive naming** - Use clear, meaningful names
- ✅ **Error handling** - Proper error handling patterns

### Testing
- ✅ **Mock data** - Use comprehensive mock data from test-utils
- ✅ **Proper spies** - Use `spyOn()` instead of manual spies
- ✅ **Type safety** - Avoid `any` types in tests
- ✅ **Async testing** - Use `async/await` for asynchronous tests

### Command Line
- ✅ **NO `&&` chaining** - Use separate commands
- ✅ **Clear navigation** - Use explicit `cd` commands
- ✅ **Proper error handling** - Check command outputs
- ✅ **Descriptive explanations** - Explain what commands do

## Usage

These rules are automatically applied by Cursor when working on the project. They help maintain:
- **Code consistency** across the project
- **Type safety** with proper TypeScript usage
- **Performance** through optimization guidelines
- **Maintainability** through clear structure and documentation

## Enforcement

- **Linting**: Run `npm run lint` to check code quality
- **Type checking**: Run `npx tsc --noEmit --strict` to verify types
- **Testing**: Run `npm test` to ensure functionality
- **Pre-commit**: All checks should pass before committing code 