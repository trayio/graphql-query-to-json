graphql-query-to-json
=====================


![Statement coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F30d15c83-919d-4ca2-bda8-408fae98ad27.trayapp.io%2Fstatements)
![Function coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F30d15c83-919d-4ca2-bda8-408fae98ad27.trayapp.io%2Ffunctions)
![Line coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F30d15c83-919d-4ca2-bda8-408fae98ad27.trayapp.io%2Flines)
![Branches badge](https://img.shields.io/endpoint?url=https%3A%2F%2F30d15c83-919d-4ca2-bda8-408fae98ad27.trayapp.io%2Fbranches)

This is a simple module that takes a graphQL query string and converts it into a JSON object. Think of it as the reverse of the excellent module [json-to-graphql-query](https://www.npmjs.com/package/json-to-graphql-query).

## Installation

```sh
npm install graphql-query-to-json
# or
yarn add graphql-query-to-json
```

## Usage

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
