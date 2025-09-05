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
- ✅ **Arguments**: All argument types (strings, integers, floats, objects, arrays, enums)
- ✅ **Aliases**: Field aliasing with metadata preservation
- ✅ **Inline Fragments**: Complete support for conditional type-based field selection
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
| **Inline Fragments** | `__on` property | `... on User { name }` → `__on: { __typeName: "User", name: true }` |

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

### Mutations with Simple Arguments

```ts
const mutation = `
mutation {
    getPersonalStuff(name: "PETER") {
        personal {
            name
            address
        }
        other {
            parents
        }
    }
}
`
const result = graphQlQueryToJson(mutation)

// Output:
{
  mutation: {
    getPersonalStuff: {
      __args: {
        name: "PETER",
      },
      personal: {
        name: true,
        address: true,
      },
      other: {
        parents: true,
      },
    },
  },
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
// Float arguments and numeric types
const query = `
query GetProducts {
    products(
        minRating: 4.5,
        maxPrice: 99.99,
        discount: -10.5,
        threshold: 0.001,
        scientific: 2.5e3
    ) {
        name
        rating
        price
    }
    analytics(
        coordinates: {
            lat: 40.7128,
            lng: -74.006
        },
        mixed: [1, 2.5, 3, 4.75]
    ) {
        data
    }
}
`

const result = graphQlQueryToJson(query)

// Output:
{
  query: {
    products: {
      __args: {
        minRating: 4.5,           // ✅ Float as number
        maxPrice: 99.99,          // ✅ Float as number  
        discount: -10.5,          // ✅ Negative float
        threshold: 0.001,         // ✅ Small decimal
        scientific: 2500          // ✅ Scientific notation (2.5e3)
      },
      name: true,
      rating: true,
      price: true
    },
    analytics: {
      __args: {
        coordinates: {
          lat: 40.7128,           // ✅ Nested floats
          lng: -74.006
        },
        mixed: ["1", "2.5", "3", "4.75"]  // Arrays preserve strings
      },
      data: true
    }
  }
}
```

### Inline Fragments

```ts
// Single inline fragment
const query = `
query {
    posts {
        title
        ... on TextPost {
            content
            wordCount
        }
    }
}
`

const result = graphQlQueryToJson(query)

// Output:
{
  query: {
    posts: {
      title: true,
      __on: {
        __typeName: "TextPost",
        content: true,
        wordCount: true
      }
    }
  }
}
```

```ts
// Multiple inline fragments
const query = `
query {
    media {
        ... on TextPost {
            content
            author {
                name
            }
        }
        ... on ImagePost {
            imageUrl
            altText
        }
        ... on VideoPost {
            videoUrl
            duration
        }
    }
}
`

const result = graphQlQueryToJson(query)

// Output:
{
  query: {
    media: {
      __on: [
        {
          __typeName: "TextPost",
          content: true,
          author: {
            name: true
          }
        },
        {
          __typeName: "ImagePost",
          imageUrl: true,
          altText: true
        },
        {
          __typeName: "VideoPost", 
          videoUrl: true,
          duration: true
        }
      ]
    }
  }
}
```

```ts
// Inline fragments with arguments and variables
const query = `
query GetPosts($limit: Int!) {
    posts {
        title
        ... on TextPost {
            comments(limit: $limit) {
                text
                author {
                    name
                }
            }
        }
    }
}
`

const result = graphQlQueryToJson(query, {
    variables: { limit: 5 }
})

// Output:
{
  query: {
    posts: {
      title: true,
      __on: {
        __typeName: "TextPost",
        comments: {
          __args: { limit: 5 },
          text: true,
          author: {
            name: true
          }
        }
      }
    }
  }
}
```

### Subscriptions

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

## Limitations

While the library supports the core GraphQL features, there are some limitations:

### Fragment Support
- **Inline Fragments**: ✅ **Fully Supported** (e.g., `... on TypeName`)
- **Named Fragments**: Not supported due to multiple definition restriction

```ts
// ❌ Named fragments still throw an error
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

// ✅ Inline fragments work perfectly
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
// Output: { query: { search: { __on: [...] } } }
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
