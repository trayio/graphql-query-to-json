import {graphQlQueryToJson} from "../index"
import {EnumType} from "json-to-graphql-query"

describe("Queries", () => {
    it("Single property", () => {
        const query = `
            query {
                viewer {
                    theOnlyPropertyIWant
                }
                other {
                    anotherOne
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    theOnlyPropertyIWant: true,
                },
                other: {
                    anotherOne: true,
                },
            },
        })
    })

    it("Two properties", () => {
        const query = `
            query {
                viewer {
                    propertyOne
                    propertyTwo
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    propertyOne: true,
                    propertyTwo: true,
                },
            },
        })
    })

    it("Two properties separated by commas", () => {
        const query = `
            query {
                viewer {
                    propertyOne,
                    propertyTwo
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    propertyOne: true,
                    propertyTwo: true,
                },
            },
        })
    })

    it("Nested simple query using commas", () => {
        const query = `
            query {
                viewer {
                    propertyOne,
                    propertyTwo
                }
                nested {
                    evenDeeper {
                        nestedOne,
                        nestedTwo,
                        nestedThree
                    }
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    propertyOne: true,
                    propertyTwo: true,
                },
                nested: {
                    evenDeeper: {
                        nestedOne: true,
                        nestedTwo: true,
                        nestedThree: true,
                    },
                },
            },
        })
    })

    it("Nested simple query using commas with custom query name", () => {
        const query = `
            query GetThatStuff {
                viewer {
                    propertyOne,
                    propertyTwo
                }
                nested {
                    evenDeeper {
                        nestedOne,
                        nestedTwo,
                        nestedThree
                    }
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    propertyOne: true,
                    propertyTwo: true,
                },
                nested: {
                    evenDeeper: {
                        nestedOne: true,
                        nestedTwo: true,
                        nestedThree: true,
                    },
                },
            },
        })
    })

    it("Simple query using variables", () => {
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
    })

    it("Scalar field with arguments", () => {
        const query = `
        query fooBarAlias($name: String!, $lastName: String!) {
            fooBar(name: $name, lastName: $lastName)
        }`
        const result = graphQlQueryToJson(query, {
            variables: {
                name: "PETER",
                lastName: "SCHMIDT",
            },
        })
        expect(result).toEqual({
            query: {
                fooBar: {
                    __args: {
                        name: "PETER",
                        lastName: "SCHMIDT",
                    },
                },
            },
        })
    })
})

describe("Mutations", () => {
    it("Emtpy properties", () => {
        const mutation = `
            mutation {
                getPersonalStuff (info: {
                    emptyString: "",
                    emptyObject: {},
                    emptyArray: [],
                }) {
                    personal
                }
            }
        `
        expect(graphQlQueryToJson(mutation)).toEqual({
            mutation: {
                getPersonalStuff: {
                    personal: true,
                    __args: {
                        info: {
                            emptyString: "",
                            emptyObject: {},
                            emptyArray: [],
                        },
                    },
                },
            },
        })
    })

    it("Simple mutation using string argument with sibling queries", () => {
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
        expect(graphQlQueryToJson(mutation)).toEqual({
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
        })
    })

    it("Simple mutation using multiple string arguments with sibling queries", () => {
        const mutation = `
        mutation {
            getPersonalStuff(name: "AMADEUS", lastName: "MOZART") {
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
        expect(graphQlQueryToJson(mutation)).toEqual({
            mutation: {
                getPersonalStuff: {
                    __args: {
                        name: "AMADEUS",
                        lastName: "MOZART",
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
        })
    })

    it("Arguments wrapped in object", () => {
        const mutation = `
        mutation {
            getPersonalStuff(input: {
                name: "HANNES",
                lastName: "RUDOLF"
            }) {
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
        expect(graphQlQueryToJson(mutation)).toEqual({
            mutation: {
                getPersonalStuff: {
                    __args: {
                        input: {
                            name: "HANNES",
                            lastName: "RUDOLF",
                        },
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
        })
    })

    it("Arguments wrapped in object using an int value", () => {
        const mutation = `
        mutation {
            getPersonalStuff(input: {
                count: 1000,
            }) {
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
        expect(graphQlQueryToJson(mutation)).toEqual({
            mutation: {
                getPersonalStuff: {
                    __args: {
                        input: {
                            count: 1000,
                        },
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
        })
    })

    it("Arguments wrapped in nested object", () => {
        const mutation = `
        mutation {
            getPersonalStuff(input: {
                name: "HANNES",
                lastName: "RUDOLF",
                city: {
                    name: "Hollywood",
                    country: "California, USA"
                }
            }) {
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
        expect(graphQlQueryToJson(mutation)).toEqual({
            mutation: {
                getPersonalStuff: {
                    __args: {
                        input: {
                            name: "HANNES",
                            lastName: "RUDOLF",
                            city: {
                                name: "Hollywood",
                                country: "California, USA",
                            },
                        },
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
        })
    })
    it("Argument is a list", () => {
        const mutation = `
        mutation {
            getPersonalStuff(input: [
                "ONE",
                "TWO"
            ]) {
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
        expect(graphQlQueryToJson(mutation)).toEqual({
            mutation: {
                getPersonalStuff: {
                    __args: {
                        input: ["ONE", "TWO"],
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
        })
    })

    it("Argument is a int", () => {
        const mutation = `
        mutation {
            getUsers(count: 1000) {
                personal {
                    count
                }
            }
        }`
        expect(graphQlQueryToJson(mutation)).toEqual({
            mutation: {
                getUsers: {
                    __args: {
                        count: 1000,
                    },
                    personal: {
                        count: true,
                    },
                },
            },
        })
    })
})

describe("Subscriptions", () => {
    it("Simple subscription", () => {
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
        expect(graphQlQueryToJson(subscription)).toEqual({
            subscription: {
                messageAdded: {
                    id: true,
                    content: true,
                    user: {
                        name: true,
                        email: true,
                    },
                },
            },
        })
    })

    it("Subscription with arguments", () => {
        const subscription = `
            subscription MessageSubscription($userId: ID!) {
                messageAdded(userId: $userId) {
                    id
                    content
                    timestamp
                }
            }
        `
        const result = graphQlQueryToJson(subscription, {
            variables: {
                userId: "123",
            },
        })
        expect(result).toEqual({
            subscription: {
                messageAdded: {
                    __args: {
                        userId: "123",
                    },
                    id: true,
                    content: true,
                    timestamp: true,
                },
            },
        })
    })

    it("Subscription with alias", () => {
        const subscription = `
            subscription {
                latestMessage: messageAdded {
                    id
                    content
                }
            }
        `
        expect(graphQlQueryToJson(subscription)).toEqual({
            subscription: {
                latestMessage: {
                    __aliasFor: "messageAdded",
                    id: true,
                    content: true,
                },
            },
        })
    })

    it("Subscription with enum arguments", () => {
        const subscription = `
            subscription {
                messageAdded(channel: PUBLIC, priority: HIGH) {
                    id
                    content
                }
            }
        `
        expect(graphQlQueryToJson(subscription)).toEqual({
            subscription: {
                messageAdded: {
                    __args: {
                        channel: new EnumType("PUBLIC"),
                        priority: new EnumType("HIGH"),
                    },
                    id: true,
                    content: true,
                },
            },
        })
    })

    it("Subscription with scalar field with arguments", () => {
        const subscription = `
            subscription {
                messageCount(channel: "general", since: "2024-01-01")
            }
        `
        expect(graphQlQueryToJson(subscription)).toEqual({
            subscription: {
                messageCount: {
                    __args: {
                        channel: "general",
                        since: "2024-01-01",
                    },
                },
            },
        })
    })

    it("Subscription with nested objects and complex arguments", () => {
        const subscription = `
            subscription NotificationSubscription($input: NotificationInput!) {
                notificationAdded(input: $input) {
                    id
                    message
                    user {
                        id
                        name
                        profile {
                            avatar
                        }
                    }
                    metadata {
                        priority
                        tags
                    }
                }
            }
        `
        const result = graphQlQueryToJson(subscription, {
            variables: {
                input: {
                    userId: "123",
                    channels: ["email", "push"],
                    filters: {
                        priority: "high",
                        categories: ["system", "user"],
                    },
                },
            },
        })
        expect(result).toEqual({
            subscription: {
                notificationAdded: {
                    __args: {
                        input: {
                            userId: "123",
                            channels: ["email", "push"],
                            filters: {
                                priority: "high",
                                categories: ["system", "user"],
                            },
                        },
                    },
                    id: true,
                    message: true,
                    user: {
                        id: true,
                        name: true,
                        profile: {
                            avatar: true,
                        },
                    },
                    metadata: {
                        priority: true,
                        tags: true,
                    },
                },
            },
        })
    })

    it("Subscription with directives (directives are ignored)", () => {
        const subscription = `
            subscription MessageSubscription($includeUser: Boolean!) {
                messageAdded {
                    id
                    content
                    user @include(if: $includeUser) {
                        name
                    }
                }
            }
        `
        const result = graphQlQueryToJson(subscription, {
            variables: {
                includeUser: true,
            },
        })
        expect(result).toEqual({
            subscription: {
                messageAdded: {
                    id: true,
                    content: true,
                    user: {
                        name: true,
                    },
                },
            },
        })
    })

    it("Should throw error for subscription with named fragments", () => {
        const subscriptionWithFragment = `
            subscription {
                messageAdded {
                    ...MessageFields
                }
            }

            fragment MessageFields on Message {
                id
                content
                user {
                    name
                }
            }
        `
        expect(() => {
            graphQlQueryToJson(subscriptionWithFragment)
        }).toThrow("The parsed query has more than one set of definitions")
    })

    it("Should handle subscription with inline fragments", () => {
        const subscriptionWithInlineFragment = `
            subscription {
                messageAdded {
                    id
                    content
                    ... on TextMessage {
                        text
                    }
                    ... on ImageMessage {
                        imageUrl
                        caption
                    }
                }
            }
        `
        expect(graphQlQueryToJson(subscriptionWithInlineFragment)).toEqual({
            subscription: {
                messageAdded: {
                    id: true,
                    content: true,
                    __on: [
                        {
                            __typeName: "TextMessage",
                            text: true,
                        },
                        {
                            __typeName: "ImageMessage",
                            imageUrl: true,
                            caption: true,
                        },
                    ],
                },
            },
        })
    })
})

describe("Aliases", () => {
    it("Simple example with aliases", () => {
        const query = `
            query {
                viewer {
                    thingOne {
                        name
                        team
                    }
                    renamed: thingOne {
                        propertyC
                    }
                }
            }
        `
        const json = graphQlQueryToJson(query)
        expect(json).toEqual({
            query: {
                viewer: {
                    thingOne: {
                        name: true,
                        team: true,
                    },
                    renamed: {
                        __aliasFor: "thingOne",
                        propertyC: true,
                    },
                },
            },
        })
    })
})

describe("Enum Types", () => {
    it("Simple enum type", () => {
        const query = `
            query {
                viewer {
                    stuffWithArguments(argumentOne: ALL) {
                        personalEnumData
                    }
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    stuffWithArguments: {
                        __args: {
                            argumentOne: new EnumType("ALL"),
                        },
                        personalEnumData: true,
                    },
                },
            },
        })
    })

    it("Argument is a variable", () => {
        const query = `
    mutation {
        getUsers(count: $count) {
            personal {
                count
            }
        }
    }`
        const result = graphQlQueryToJson(query, {
            variables: {
                count: 1000,
            },
        })
        expect(result).toEqual({
            mutation: {
                getUsers: {
                    __args: {
                        count: 1000,
                    },
                    personal: {
                        count: true,
                    },
                },
            },
        })
    })
})

describe("Complex examples", () => {
    it("Query using name, variables, enums and aliases", () => {
        const variables = {ownership: "ALL", name: ""}
        const query =
            "query GetAuthenticationsPrivate($name: String, $ownership: OwnershipQueryType!) {\n  viewer {\n    userAuthentications(criteria: {name: $name, ownershipQueryType: $ownership}) {\n      edges {\n        node {\n          id\n          name\n          created\n          creator {\n            name\n            id\n            __typename\n          }\n          service {\n            icon\n            __typename\n          }\n          owner {\n            ownerType\n            __typename\n          }\n          customFields\n          scopes\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    count: userAuthentications(criteria: {ownershipQueryType: ALL}) {\n      edges {\n        node {\n          id\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
        const result = graphQlQueryToJson(query, {variables})
        const userAuthenticationsQuery = {
            __args: {
                criteria: {
                    name: "",
                    ownershipQueryType: "ALL",
                },
            },
            edges: {
                node: {
                    id: true,
                    name: true,
                    created: true,
                    creator: {
                        name: true,
                        id: true,
                        __typename: true,
                    },
                    service: {
                        icon: true,
                        __typename: true,
                    },
                    owner: {
                        ownerType: true,
                        __typename: true,
                    },
                    customFields: true,
                    scopes: true,
                    __typename: true,
                },
                __typename: true,
            },
            __typename: true,
        }
        const countQuery = {
            __aliasFor: "userAuthentications",
            __args: {
                criteria: {
                    ownershipQueryType: "ALL",
                },
            },
            edges: {
                node: {
                    id: true,
                    __typename: true,
                },
                __typename: true,
            },
            __typename: true,
        }
        const expectedQueryOutput = {
            query: {
                viewer: {
                    __typename: true,
                    userAuthentications: userAuthenticationsQuery,
                    count: countQuery,
                },
            },
        }
        expect(result).toEqual(expectedQueryOutput)
    })
})

describe("Errors", () => {
    it("Throws error if given invalid graphQL schema", () => {
        expect(() => graphQlQueryToJson(`query { asdf sd`)).toThrow()
    })

    it("Throws error if query has variable which is not passed in", () => {
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
        const getResult = () =>
            graphQlQueryToJson(query, {
                variables: {
                    name: "PETER",
                },
            })
        expect(getResult).toThrow()
    })

    it("Should throw error when query has multiple operations", () => {
        const multipleOperationsQuery = `
query GetUser {
    user {
        name
    }
}

query GetPosts {
    posts {
        title
    }
}
`

        expect(() => {
            graphQlQueryToJson(multipleOperationsQuery)
        }).toThrow("The parsed query has more than one set of definitions")
    })

    it("Should throw error when mixing queries and mutations", () => {
        const mixedOperationsQuery = `
query GetUser {
    user {
        name
    }
}

mutation CreatePost {
    createPost(title: "Test") {
        id
    }
}
`

        expect(() => {
            graphQlQueryToJson(mixedOperationsQuery)
        }).toThrow("The parsed query has more than one set of definitions")
    })
})

describe("Edge Cases and Additional Coverage", () => {
    it("Handles query with no variable definitions", () => {
        const query = `
            query {
                viewer {
                    name
                }
            }
        `
        expect(() => graphQlQueryToJson(query, {variables: {}})).not.toThrow()
    })

    it("Handles boolean arguments", () => {
        const query = `
            query {
                viewer {
                    posts(published: true, featured: false) {
                        title
                    }
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    posts: {
                        __args: {
                            published: true,
                            featured: false,
                        },
                        title: true,
                    },
                },
            },
        })
    })

    it("Handles float arguments as numbers", () => {
        const query = `
            query {
                viewer {
                    products(rating: 4.5, price: 99.99) {
                        name
                    }
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    products: {
                        __args: {
                            rating: 4.5,
                            price: 99.99,
                        },
                        name: true,
                    },
                },
            },
        })
    })

    it("Handles mixed int and float arguments", () => {
        const query = `
            query {
                viewer {
                    analytics(count: 100, threshold: 2.5, limit: 50, percentage: 87.3) {
                        data
                    }
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    analytics: {
                        __args: {
                            count: 100,
                            threshold: 2.5,
                            limit: 50,
                            percentage: 87.3,
                        },
                        data: true,
                    },
                },
            },
        })
    })

    it("Handles negative float arguments", () => {
        const query = `
            query {
                viewer {
                    adjustments(offset: -12.5, delta: -0.001) {
                        result
                    }
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    adjustments: {
                        __args: {
                            offset: -12.5,
                            delta: -0.001,
                        },
                        result: true,
                    },
                },
            },
        })
    })

    it("Handles zero and decimal edge cases", () => {
        const query = `
            query {
                viewer {
                    measurements(zero: 0.0, decimal: 0.5, trailing: 3.0) {
                        values
                    }
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    measurements: {
                        __args: {
                            zero: 0.0,
                            decimal: 0.5,
                            trailing: 3.0,
                        },
                        values: true,
                    },
                },
            },
        })
    })

    it("Handles floats in nested object arguments", () => {
        const query = `
            query {
                viewer {
                    complexSearch(criteria: {
                        score: 8.5,
                        weight: 1.2,
                        coordinates: {
                            lat: 40.7128,
                            lng: -74.0060
                        }
                    }) {
                        results
                    }
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    complexSearch: {
                        __args: {
                            criteria: {
                                score: 8.5,
                                weight: 1.2,
                                coordinates: {
                                    lat: 40.7128,
                                    lng: -74.006,
                                },
                            },
                        },
                        results: true,
                    },
                },
            },
        })
    })

    it("Handles floats in array arguments", () => {
        const query = `
            query {
                viewer {
                    dataPoints(values: [1.1, 2.2, 3.3, 4.4]) {
                        summary
                    }
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    dataPoints: {
                        __args: {
                            values: ["1.1", "2.2", "3.3", "4.4"],
                        },
                        summary: true,
                    },
                },
            },
        })
    })

    it("Handles mixed type arrays with floats", () => {
        const query = `
            query {
                viewer {
                    mixedData(values: [1, 2.5, 3, 4.75]) {
                        result
                    }
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    mixedData: {
                        __args: {
                            values: ["1", "2.5", "3", "4.75"],
                        },
                        result: true,
                    },
                },
            },
        })
    })

    it("Handles float variables in arguments", () => {
        const query = `
            query TestFloatVars($price: Float!, $discount: Float) {
                viewer {
                    products(maxPrice: $price, discountRate: $discount) {
                        name
                        finalPrice
                    }
                }
            }
        `
        const result = graphQlQueryToJson(query, {
            variables: {
                price: 199.99,
                discount: 0.15,
            },
        })
        expect(result).toEqual({
            query: {
                viewer: {
                    products: {
                        __args: {
                            maxPrice: 199.99,
                            discountRate: 0.15,
                        },
                        name: true,
                        finalPrice: true,
                    },
                },
            },
        })
    })

    it("Handles scientific notation floats", () => {
        const query = `
            query {
                viewer {
                    scientificData(small: 1e-5, large: 2.5e3, negative: -1.5e-2) {
                        results
                    }
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    scientificData: {
                        __args: {
                            small: 1e-5,
                            large: 2.5e3,
                            negative: -1.5e-2,
                        },
                        results: true,
                    },
                },
            },
        })
    })

    it("Handles null arguments as undefined", () => {
        const query = `
            query {
                viewer {
                    profile(avatar: null) {
                        name
                    }
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    profile: {
                        __args: {
                            avatar: undefined,
                        },
                        name: true,
                    },
                },
            },
        })
    })

    it("Handles simple string arrays in arguments", () => {
        const query = `
            query {
                search(tags: ["tech", "news"]) {
                    results
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                search: {
                    __args: {
                        tags: ["tech", "news"],
                    },
                    results: true,
                },
            },
        })
    })

    it("Handles variables with mixed types", () => {
        const query = `
            query TestQuery($text: String!, $count: Int!, $active: Boolean!, $rating: Float!) {
                search(filter: {
                    text: $text,
                    count: $count,
                    active: $active,
                    rating: $rating
                }) {
                    results
                }
            }
        `
        const result = graphQlQueryToJson(query, {
            variables: {
                text: "test",
                count: 5,
                active: true,
                rating: 3.7,
            },
        })
        expect(result).toEqual({
            query: {
                search: {
                    __args: {
                        filter: {
                            text: "test",
                            count: 5,
                            active: true,
                            rating: 3.7,
                        },
                    },
                    results: true,
                },
            },
        })
    })

    it("Handles simple variable replacement in nested objects", () => {
        const query = `
            query TestQuery($name: String!) {
                user(filter: { name: $name, active: true }) {
                    id
                    name
                }
            }
        `
        const result = graphQlQueryToJson(query, {
            variables: {
                name: "Alice",
            },
        })
        expect(result).toEqual({
            query: {
                user: {
                    __args: {
                        filter: {
                            name: "Alice",
                            active: true,
                        },
                    },
                    id: true,
                    name: true,
                },
            },
        })
    })

    it("Handles enums in lists", () => {
        const query = `
            query {
                posts(statuses: [PUBLISHED, DRAFT, ARCHIVED]) {
                    title
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                posts: {
                    __args: {
                        statuses: ["PUBLISHED", "DRAFT", "ARCHIVED"],
                    },
                    title: true,
                },
            },
        })
    })

    it("Handles string concatenation edge case in variable replacement", () => {
        const query = `
            query TestQuery($prefix: String!) {
                search(term: $prefix) {
                    results
                }
            }
        `
        const result = graphQlQueryToJson(query, {
            variables: {
                prefix: "test_prefix_value",
            },
        })
        expect(result).toEqual({
            query: {
                search: {
                    __args: {
                        term: "test_prefix_value",
                    },
                    results: true,
                },
            },
        })
    })

    describe("Inline Fragments", () => {
        it("Single inline fragment", () => {
            const query = `
                query {
                    posts {
                        title
                        ... on TextPost {
                            content
                        }
                    }
                }
            `
            expect(graphQlQueryToJson(query)).toEqual({
                query: {
                    posts: {
                        title: true,
                        __on: {
                            __typeName: "TextPost",
                            content: true,
                        },
                    },
                },
            })
        })

        it("Multiple inline fragments", () => {
            const query = `
                query {
                    posts {
                        title
                        ... on TextPost {
                            content
                            wordCount
                        }
                        ... on ImagePost {
                            imageUrl
                            altText
                        }
                    }
                }
            `
            expect(graphQlQueryToJson(query)).toEqual({
                query: {
                    posts: {
                        title: true,
                        __on: [
                            {
                                __typeName: "TextPost",
                                content: true,
                                wordCount: true,
                            },
                            {
                                __typeName: "ImagePost",
                                imageUrl: true,
                                altText: true,
                            },
                        ],
                    },
                },
            })
        })

        it("Inline fragment with nested selections", () => {
            const query = `
                query {
                    posts {
                        title
                        ... on TextPost {
                            content
                            author {
                                name
                                bio
                            }
                        }
                    }
                }
            `
            expect(graphQlQueryToJson(query)).toEqual({
                query: {
                    posts: {
                        title: true,
                        __on: {
                            __typeName: "TextPost",
                            content: true,
                            author: {
                                name: true,
                                bio: true,
                            },
                        },
                    },
                },
            })
        })

        it("Inline fragment with arguments", () => {
            const query = `
                query {
                    posts {
                        title
                        ... on TextPost {
                            content
                            comments(limit: 5) {
                                text
                            }
                        }
                    }
                }
            `
            expect(graphQlQueryToJson(query)).toEqual({
                query: {
                    posts: {
                        title: true,
                        __on: {
                            __typeName: "TextPost",
                            content: true,
                            comments: {
                                __args: {
                                    limit: 5,
                                },
                                text: true,
                            },
                        },
                    },
                },
            })
        })

        it("Nested inline fragments", () => {
            const query = `
                query {
                    media {
                        ... on Post {
                            title
                            ... on TextPost {
                                content
                            }
                            ... on ImagePost {
                                imageUrl
                            }
                        }
                        ... on Comment {
                            text
                            author {
                                name
                            }
                        }
                    }
                }
            `
            expect(graphQlQueryToJson(query)).toEqual({
                query: {
                    media: {
                        __on: [
                            {
                                __typeName: "Post",
                                title: true,
                                __on: [
                                    {
                                        __typeName: "TextPost",
                                        content: true,
                                    },
                                    {
                                        __typeName: "ImagePost",
                                        imageUrl: true,
                                    },
                                ],
                            },
                            {
                                __typeName: "Comment",
                                text: true,
                                author: {
                                    name: true,
                                },
                            },
                        ],
                    },
                },
            })
        })

        it("Inline fragment with enum arguments", () => {
            const query = `
                query {
                    posts {
                        title
                        ... on TextPost {
                            content(format: MARKDOWN) {
                                rendered
                            }
                        }
                    }
                }
            `
            expect(graphQlQueryToJson(query)).toEqual({
                query: {
                    posts: {
                        title: true,
                        __on: {
                            __typeName: "TextPost",
                            content: {
                                __args: {
                                    format: new EnumType("MARKDOWN"),
                                },
                                rendered: true,
                            },
                        },
                    },
                },
            })
        })

        it("Inline fragment with variables", () => {
            const query = `
                query GetPosts($limit: Int!) {
                    posts {
                        title
                        ... on TextPost {
                            comments(limit: $limit) {
                                text
                            }
                        }
                    }
                }
            `
            expect(graphQlQueryToJson(query, {variables: {limit: 10}})).toEqual(
                {
                    query: {
                        posts: {
                            title: true,
                            __on: {
                                __typeName: "TextPost",
                                comments: {
                                    __args: {
                                        limit: 10,
                                    },
                                    text: true,
                                },
                            },
                        },
                    },
                },
            )
        })

        it("Inline fragment with aliases", () => {
            const query = `
                query {
                    posts {
                        title
                        ... on TextPost {
                            textContent: content
                            authorName: author {
                                name
                            }
                        }
                    }
                }
            `
            expect(graphQlQueryToJson(query)).toEqual({
                query: {
                    posts: {
                        title: true,
                        __on: {
                            __typeName: "TextPost",
                            textContent: {
                                __aliasFor: "content",
                            },
                            authorName: {
                                __aliasFor: "author",
                                name: true,
                            },
                        },
                    },
                },
            })
        })
    })
})
