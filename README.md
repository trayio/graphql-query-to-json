graphql-query-to-json
=====================

This is a simple module that takes a graphQL query string and converts it into a JSON object. Think of it as the reverse of the excellent module [json-to-graphql-query](https://www.npmjs.com/package/json-to-graphql-query).

Example:

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
expect(result).toEqual({
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
})
```

# Debugging
Run the VSCode configuration "Jest" and set a breakpoint in the code wherever you feel the need to inspect.
