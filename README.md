graphql-query-to-json
=====================

![Statement coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F30d15c83-919d-4ca2-bda8-408fae98ad27.trayapp.io%2Fstatements)
![Function coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F30d15c83-919d-4ca2-bda8-408fae98ad27.trayapp.io%2Ffunctions)
![Line coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F30d15c83-919d-4ca2-bda8-408fae98ad27.trayapp.io%2Flines)
![Branches badge](https://img.shields.io/endpoint?url=https%3A%2F%2F30d15c83-919d-4ca2-bda8-408fae98ad27.trayapp.io%2Fbranches)

A TypeScript library that converts GraphQL query and mutation strings into structured JSON objects. This library serves as the reverse of [json-to-graphql-query](https://www.npmjs.com/package/json-to-graphql-query), enabling programmatic manipulation and analysis of GraphQL queries.

## Features

- ✅ **Full GraphQL Support**: Queries, mutations, and subscriptions
- ✅ **Variable Handling**: Complete variable substitution with validation
- ✅ **Arguments**: All argument types (strings, integers, objects, arrays, enums)
- ✅ **Aliases**: Field aliasing with metadata preservation
- ✅ **Nested Objects**: Arbitrarily deep nesting support
- ✅ **Scalar Fields with Arguments**: Recent enhancement for scalar field arguments
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

### 1. Simple Queries

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

### 2. Variables and Arguments

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

### 3. Scalar Fields with Arguments

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

### 4. Mutations with Complex Arguments

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
            preferences: ["email", "sms"],
            metadata: {
                source: "signup_form",
                campaign: "spring_2024"
            }
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
          email: "john@example.com",
          preferences: ["email", "sms"],
          metadata: {
            source: "signup_form",
            campaign: "spring_2024"
          }
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

### 5. Aliases and Field Renaming

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

### 6. Enum Types

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

### 7. Array Arguments

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

### 8. Empty Values and Edge Cases

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

### 9. Deeply Nested Objects

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

### 10. Mixed Variable Types

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

### 11. Subscriptions

```ts
// Basic subscription
const subscription = `
subscription {
    messageAdded {
        id
        content
        user {
            name
            email
        }
    }
}
`

const result = graphQlQueryToJson(subscription)

// Output:
{
  subscription: {
    messageAdded: {
      id: true,
      content: true,
      user: {
        name: true,
        email: true
      }
    }
  }
}
```

```ts
// Subscription with variables and arguments
const subscription = `
subscription MessageSubscription($userId: ID!, $channel: String!) {
    messageAdded(userId: $userId, channel: $channel) {
        id
        content
        timestamp
    }
}
`

const result = graphQlQueryToJson(subscription, {
    variables: {
        userId: "123",
        channel: "general"
    }
})

// Output:
{
  subscription: {
    messageAdded: {
      __args: {
        userId: "123",
        channel: "general"
      },
      id: true,
      content: true,
      timestamp: true
    }
  }
}
```

```ts
// Subscription with aliases and enums
const subscription = `
subscription {
    latestMessage: messageAdded(channel: PUBLIC) {
        id
        content
    }
}
`

const result = graphQlQueryToJson(subscription)

// Output:
{
  subscription: {
    latestMessage: {
      __aliasFor: "messageAdded",
      __args: {
        channel: { "value": "PUBLIC" }
      },
      id: true,
      content: true
    }
  }
}
```

## API Reference

### `graphQlQueryToJson(query, options?)`

**Parameters:**
- `query` (string): The GraphQL query, mutation, or subscription string
- `options` (object, optional):
  - `variables` (object): Variables referenced in the query

**Returns:** JSON object representation of the GraphQL query

**Throws:**
- Error if query syntax is invalid
- Error if variables are referenced but not provided
- Error if query contains multiple operations

### Helper Functions

The library also exports utility functions:

```ts
import { flatMap, isString, isArray, isObject } from 'graphql-query-to-json'

// Custom array flattening
flatMap([1, 2, 3], x => [x, x + 1]) // [1, 2, 2, 3, 3, 4]

// Type checking utilities
isString("hello") // true
isArray([1, 2, 3]) // true
isObject({}) // true
```

## Error Handling

The library provides descriptive error messages:

```ts
// Missing variables
const query = `query($id: ID!) { user(id: $id) { name } }`
graphQlQueryToJson(query)
// Throws: "The query you want to parse is using variables..."

// Invalid syntax
graphQlQueryToJson(`query { user { name`)
// Throws GraphQL parse error

// Multiple operations
const query = `
query GetUser { user { name } }
query GetPosts { posts { title } }
`
graphQlQueryToJson(query)
// Throws: "The parsed query has more than one set of definitions"
```

## Limitations

While the library supports the core GraphQL features, there are some limitations:

### Fragment Support
- **Named Fragments**: Not supported due to multiple definition restriction
- **Inline Fragments**: Not supported (e.g., `... on TypeName`)

```ts
// ❌ This will throw an error
const queryWithFragment = `
query {
    user {
        ...UserFields
    }
}

fragment UserFields on User {
    id
    name
}
`
// Throws: "The parsed query has more than one set of definitions"

// ❌ This will cause a runtime error
const queryWithInlineFragment = `
query {
    search {
        ... on User {
            name
        }
        ... on Post {
            title
        }
    }
}
`
// Causes: Cannot read properties of undefined
```

### Directives
- **Directive Handling**: Directives like `@include`, `@skip` are parsed but ignored
- The library focuses on structure extraction rather than directive execution

```ts
// ✅ This works but directives are ignored
const queryWithDirective = `
query($includeEmail: Boolean!) {
    user {
        name
        email @include(if: $includeEmail)
    }
}
`
// The @include directive won't affect the output structure
```

These limitations apply equally to queries, mutations, and subscriptions since they all use the same AST processing logic.

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
npm test             # Run Jest tests
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

- **Query Analysis**: Programmatically analyze GraphQL query structure
- **Query Transformation**: Convert between query formats
- **Documentation Generation**: Extract field usage patterns
- **Testing**: Validate query structures in tests
- **Query Building**: Dynamically construct queries from JSON
- **Schema Introspection**: Analyze client query patterns
- **Caching Keys**: Generate cache keys from query structure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm run build && npm test`
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details
