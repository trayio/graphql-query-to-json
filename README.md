graphql-query-to-json
=====================

![Statement coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F30d15c83-919d-4ca2-bda8-408fae98ad27.trayapp.io%2Fstatements)
![Function coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F30d15c83-919d-4ca2-bda8-408fae98ad27.trayapp.io%2Ffunctions)
![Line coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F30d15c83-919d-4ca2-bda8-408fae98ad27.trayapp.io%2Flines)
![Branches badge](https://img.shields.io/endpoint?url=https%3A%2F%2F30d15c83-919d-4ca2-bda8-408fae98ad27.trayapp.io%2Fbranches)

A TypeScript library that converts GraphQL query and mutation strings into structured JSON objects. This library serves as the reverse of [json-to-graphql-query](https://www.npmjs.com/package/json-to-graphql-query), enabling programmatic manipulation and analysis of GraphQL queries.

## Features

- ✅ **Full GraphQL Support**: Queries, mutations and subscriptions
- ✅ **Variable Handling**: Complete variable substitution with validation
- ✅ **Arguments**: All argument types (strings, integers, objects, arrays, enums)
- ✅ **Aliases**: Field aliasing with metadata preservation
- ✅ **Type Safety**: Full TypeScript support with comprehensive type definitions
- ✅ **Error Handling**: Descriptive error messages for malformed queries and missing variables
- ✅ **Framework Agnostic**: Works with any JavaScript/TypeScript environment

## Installation

```sh
npm install graphql-query-to-json
# or
yarn add graphql-query-to-json
```

## Basic Usage

```ts
const {graphQlQueryToJson} = require("graphql-query-to-json")

const query = `
query GetThisStuff($name: String, $lastName: String) {
    viewer {
        personal(criteria: {
            name: $name,
            lastName: $lastName
        }) {
            name
            address
        }
    }
}
`
const result = graphQlQueryToJson(query, {
    variables: {
        name: "PETER",
        lastName: "SCHMIDT",
    },
})

console.log(result)
// Output:
{
  query: {
    viewer: {
      personal: {
        __args: {
          criteria: {
            name: "PETER",
            lastName: "SCHMIDT",
          },
        },
        name: true,
        address: true,
      },
    },
  },
}
```

## Transformation Rules

The library follows predictable transformation patterns:

| GraphQL Element | JSON Representation | Example |
|----------------|-------------------|---------|
| **Scalar Fields** | `true` | `name` → `name: true` |
| **Object Fields** | Nested objects | `user { name }` → `user: { name: true }` |
| **Arguments** | `__args` property | `user(id: 1)` → `user: { __args: { id: 1 } }` |
| **Aliases** | Field renaming + `__aliasFor` | `renamed: user` → `renamed: { __aliasFor: "user" }` |
| **Variables** | Substituted values | `$userId` → actual variable value |
| **Enums** | `EnumType` wrapper | `status: ACTIVE` → `status: { "value": "ACTIVE" }` |

## Comprehensive Examples

### Simple Queries

```ts
// Single and multiple fields
const query = `
query {
    viewer {
        name
        email
    }
    user {
        profile {
            avatar
            bio
        }
    }
}
`

const result = graphQlQueryToJson(query)

// Output:
{
  query: {
    viewer: {
      name: true,
      email: true
    },
    user: {
      profile: {
        avatar: true,
        bio: true
      }
    }
  }
}
```

### Variables and Arguments

```ts
// Query with variables
const query = `
query GetUser($userId: ID!, $includeProfile: Boolean!) {
    user(id: $userId) {
        name
        email
        profile @include(if: $includeProfile) {
            bio
            avatar
        }
    }
}
`

const result = graphQlQueryToJson(query, {
    variables: {
        userId: "123",
        includeProfile: true
    }
})

// Output:
{
  query: {
    user: {
      __args: { id: "123" },
      name: true,
      email: true,
      profile: {
        bio: true,
        avatar: true
      }
    }
  }
}
```

### Scalar Fields with Arguments

```ts
// Scalar fields that accept arguments
const query = `
query {
    userCount(filter: "active")
    totalRevenue(currency: "USD", year: 2024)
    averageRating(precision: 2)
}
`

const result = graphQlQueryToJson(query)

// Output:
{
  query: {
    userCount: {
      __args: { filter: "active" }
    },
    totalRevenue: {
      __args: { currency: "USD", year: 2024 }
    },
    averageRating: {
      __args: { precision: 2 }
    }
  }
}
```

### Mutations with Complex Arguments

```ts
// Mutation with nested object arguments
const mutation = `
mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
        id
        name
        profile {
            email
            settings {
                theme
                notifications
            }
        }
    }
}
`

const result = graphQlQueryToJson(mutation, {
    variables: {
        input: {
            name: "John Doe",
            email: "john@example.com",
        }
    }
})

// Output:
{
  mutation: {
    createUser: {
      __args: {
        input: {
          name: "John Doe",
          email: "john@example.com"
        }
      },
      id: true,
      name: true,
      profile: {
        email: true,
        settings: {
          theme: true,
          notifications: true
        }
      }
    }
  }
}
```

### Aliases and Field Renaming

```ts
// Multiple aliases for the same field
const query = `
query {
    currentUser: user(id: 1) {
        name
        email
    }
    adminUser: user(id: 2) {
        name
        permissions
    }
    guestUser: user(id: 3) {
        name
        status
    }
}
`

const result = graphQlQueryToJson(query)

// Output:
{
  query: {
    currentUser: {
      __aliasFor: "user",
      __args: { id: 1 },
      name: true,
      email: true
    },
    adminUser: {
      __aliasFor: "user",
      __args: { id: 2 },
      name: true,
      permissions: true
    },
    guestUser: {
      __aliasFor: "user",
      __args: { id: 3 },
      name: true,
      status: true
    }
  }
}
```

### Enum Types

```ts
// Enums in arguments
const query = `
query {
    posts(status: PUBLISHED, orderBy: CREATED_DESC) {
        title
        content
    }
    users(role: ADMIN, sortBy: NAME_ASC) {
        name
        email
    }
}
`

const result = graphQlQueryToJson(query)

// Output (enums are wrapped in EnumType objects):
{
  query: {
    posts: {
      __args: {
        status: { "value": "PUBLISHED" },
        orderBy: { "value": "CREATED_DESC" }
      },
      title: true,
      content: true
    },
    users: {
      __args: {
        role: { "value": "ADMIN" },
        sortBy: { "value": "NAME_ASC" }
      },
      name: true,
      email: true
    }
  }
}
```

### Array Arguments

```ts
// Lists and arrays as arguments
const mutation = `
mutation {
    updateUser(
        id: "123",
        tags: ["developer", "typescript", "graphql"],
        permissions: [READ, WRITE, ADMIN]
    ) {
        id
        tags
        permissions
    }
}
`

const result = graphQlQueryToJson(mutation)

// Output:
{
  mutation: {
    updateUser: {
      __args: {
        id: "123",
        tags: ["developer", "typescript", "graphql"],
        permissions: [
          "READ",
          "WRITE",
          "ADMIN"
        ]
      },
      id: true,
      tags: true,
      permissions: true
    }
  }
}
```

### Empty Values and Edge Cases

```ts
// Empty strings, objects, and arrays
const mutation = `
mutation {
    createRecord(input: {
        name: "",
        metadata: {},
        tags: [],
        count: 0,
        isActive: false
    }) {
        id
        status
    }
}
`

const result = graphQlQueryToJson(mutation)

// Output:
{
  mutation: {
    createRecord: {
      __args: {
        input: {
          name: "",
          metadata: {},
          tags: [],
          count: 0,
          isActive: false
        }
      },
      id: true,
      status: true
    }
  }
}
```

### Deeply Nested Objects

```ts
// Complex nested structures
const query = `
query {
    organization {
        teams {
            members {
                user {
                    profile {
                        personalInfo {
                            address {
                                street
                                city
                                country
                            }
                        }
                    }
                }
            }
        }
    }
}
`

const result = graphQlQueryToJson(query)

// Output:
{
  query: {
    organization: {
      teams: {
        members: {
          user: {
            profile: {
              personalInfo: {
                address: {
                  street: true,
                  city: true,
                  country: true
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### Mixed Variable Types

```ts
// Various data types as variables
const query = `
query SearchContent(
    $text: String!,
    $limit: Int!,
    $offset: Int,
    $filters: FilterInput!,
    $includeArchived: Boolean
) {
    search(
        query: $text,
        first: $limit,
        skip: $offset,
        filters: $filters,
        archived: $includeArchived
    ) {
        results {
            id
            title
            excerpt
        }
        totalCount
    }
}
`

const result = graphQlQueryToJson(query, {
    variables: {
        text: "GraphQL tutorial",
        limit: 10,
        offset: 0,
        filters: {
            category: "tutorial",
            difficulty: "beginner",
            tags: ["graphql", "api"]
        },
        includeArchived: false
    }
})

// Output:
{
  query: {
    search: {
      __args: {
        query: "GraphQL tutorial",
        first: 10,
        skip: 0,
        filters: {
          category: "tutorial",
          difficulty: "beginner",
          tags: ["graphql", "api"]
        },
        archived: false
      },
      results: {
        id: true,
        title: true,
        excerpt: true
      },
      totalCount: true
    }
  }
}
```

## API Reference

### `graphQlQueryToJson(query, options?)`

**Parameters:**
- `query` (string): The GraphQL query or mutation string
- `options` (object, optional):
  - `variables` (object): Variables referenced in the query

**Returns:** JSON object representation of the GraphQL query

**Throws:**
- Error if query syntax is invalid
- Error if variables are referenced but not provided
- Error if query contains multiple operations

## TypeScript Support

Full TypeScript definitions are included:

```ts
import { graphQlQueryToJson } from 'graphql-query-to-json'

interface Variables {
  userId: string
  limit: number
}

const variables: Variables = {
  userId: "123",
  limit: 10
}

const result = graphQlQueryToJson(query, { variables })
// Result is properly typed
```

## Development

### Building
```bash
npm run build        # Compile TypeScript to JavaScript
npm run watch        # Build in watch mode
```

### Testing
```bash
npm test              # Run Jest tests
npm run test:coverage # Run tests with coverage
```

### Code Quality
```bash
npm run lintFull     # Run Prettier and ESLint with auto-fix
```

## Architecture

The library uses a multi-phase approach:

1. **Parse**: Uses `graphql` library to parse query into AST
2. **Validate**: Ensures all variables are provided
3. **Transform**: Recursively processes selections, arguments, and aliases
4. **Substitute**: Replaces variable placeholders with actual values

Key components:
- `getSelections()`: Processes field selections recursively
- `getArguments()`: Handles all argument types and nesting
- `replaceVariables()`: Deep variable substitution using lodash.mapValues
- `checkEachVariableInQueryIsDefined()`: Variable validation with descriptive errors

## Use Cases

- **Query Analysis**: Programmatically analyse GraphQL query structure
- **Query Transformation**: Convert between query formats
- **Testing**: Validate query structures in tests
- **Documentation Generation**: Extract field usage patterns
- **Caching Keys**: Generate cache keys from query structure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm run build && npm test`
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details
