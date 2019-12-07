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
})

describe("Mutations", () => {
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
                    ownershipQueryType: new EnumType("ALL"),
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
                    ownershipQueryType: new EnumType("ALL"),
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
})
