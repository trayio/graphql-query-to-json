import {graphQlQueryToJson} from "../index"

describe("Simple queries", () => {
    it("Single property", () => {
        const query = `
            query {
                viewer {
                    theOnlyPropertyIWant
                }
            }
        `
        expect(graphQlQueryToJson(query)).toEqual({
            query: {
                viewer: {
                    theOnlyPropertyIWant: true,
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
})

describe("Simple mutations", () => {
    it("Simple mutation using string arguments with sibling queries", () => {
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
})

/* eslint-disable */
const body = {
    operationName: "GetAuthenticationsPrivate",
    variables: {ownership: "ALL", name: ""},
    query:
        "query GetAuthenticationsPrivate($name: String, $ownership: OwnershipQueryType!) {\n  viewer {\n    userAuthentications(criteria: {name: $name, ownershipQueryType: $ownership}) {\n      edges {\n        node {\n          id\n          name\n          created\n          creator {\n            name\n            id\n            __typename\n          }\n          service {\n            icon\n            __typename\n          }\n          owner {\n            ownerType\n            __typename\n          }\n          customFields\n          scopes\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    count: userAuthentications(criteria: {ownershipQueryType: ALL}) {\n      edges {\n        node {\n          id\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
}
