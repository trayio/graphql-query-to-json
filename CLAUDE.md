# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript library that converts GraphQL query strings into JSON objects. It's the reverse of json-to-graphql-query. The main export is the `graphQlQueryToJson` function located in `src/index.ts`.

## Development Commands

- `npm run build` - Compile TypeScript to JavaScript in the dist/ directory
- `npm run watch` - Build in watch mode for development
- `npm test` - Run Jest tests on compiled JavaScript in dist/
- `npm run test:coverage` - Run tests with coverage reporting
- `npm run lintFull` - Run Prettier and ESLint with auto-fix

## Architecture

### Core Function (`src/index.ts`)
The main `graphQlQueryToJson` function:
1. Parses GraphQL queries using the `graphql` library's `parse` function
2. Recursively processes the AST to extract selections, arguments, and variables
3. Handles aliases, enums (via json-to-graphql-query), nested objects, and variable substitution
4. Returns a JSON representation where field names map to `true` or nested objects, with arguments stored in `__args` properties

### Key Processing Functions
- `getSelections()` - Processes selection sets recursively
- `getArguments()` - Handles argument processing including variables and enum types
- `replaceVariables()` - Substitutes variable placeholders with actual values
- `checkEachVariableInQueryIsDefined()` - Validates all query variables have values

### Build Process
- TypeScript source in `src/` compiles to CommonJS in `dist/`
- Tests run against compiled JavaScript, not source TypeScript
- Uses ES5 target with CommonJS modules for broad compatibility

### Testing
- Comprehensive Jest test suite in `src/test/full_functionality.spec.ts`
- README examples validation tests in `src/test/readme_examples.spec.ts`
- Tests cover queries, mutations, subscriptions, aliases, enums, variables, scalar fields with arguments, float arguments (including edge cases), inline fragments, and error cases
- Tests run against compiled dist/ files, so always build before testing
- To run a single test file: `npm test -- --testNamePattern="specific test name"`
- Current coverage: 99% statements, 98% branches (line 111 in index.ts is unreachable dead code)

## Important Implementation Details

### GraphQL AST Processing
The library processes GraphQL Abstract Syntax Trees (AST) from the `graphql` library. Key AST node types handled:
- `OperationDefinition` - Query/mutation/subscription operations
- `Field` - Individual field selections with optional arguments and aliases
- `InlineFragment` - Inline fragments for conditional type-based field selection
- `Argument` - Field arguments with various value types (string, int, float, enum, object, list, variable)
- `SelectionSet` - Groups of field selections

### Transformation Logic
- **Field Selection**: Simple fields become `fieldName: true`
- **Nested Objects**: Objects with selections become `fieldName: { nestedField: true }`
- **Arguments**: Stored in `__args` property: `fieldName: { __args: { argName: value } }`
- **Aliases**: Aliased fields get `__aliasFor` metadata: `alias: { __aliasFor: "originalField" }`
- **Variables**: Replaced with actual values using `replaceVariables()` function
- **Enums**: Wrapped in `EnumType` objects from json-to-graphql-query library (except in arrays where they remain strings)
- **Inline Fragments**: Single fragment becomes `__on: { __typeName: "TypeName", ...fields }`, multiple fragments become `__on: [{ __typeName: "Type1", ...}, ...]`

### Error Handling
- Validates that all variables referenced in query are provided
- Throws descriptive errors for malformed GraphQL syntax
- Prevents multiple operations in single query string
