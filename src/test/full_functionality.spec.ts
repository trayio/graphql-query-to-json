import {
    graphQlQueryToJson,
    flatMap,
    isString,
    isObject,
    isArray,
} from "../index"
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

describe("Helpers", () => {
    it("flatMap", () => {
        const result = flatMap([1, 2, 3], (x) => [x, x + 1])
        expect(result).toEqual([1, 2, 2, 3, 3, 4])
    })
    it("isString", () => {
        expect(isString("asdf")).toBe(true)
        expect(isString(1)).toBe(false)
    })
    it("isObject", () => {
        expect(isObject({})).toBe(true)
        expect(isObject(1)).toBe(false)
    })
    it("isArray", () => {
        expect(isArray([])).toBe(true)
        expect(isArray(1)).toBe(false)
    })
})
