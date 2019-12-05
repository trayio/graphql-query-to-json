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
        query GetThisShit($name: String, $lastName: String) {
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

describe("Simple mutations", () => {
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
                            argumentOne: "ALL___ENUM_TYPE",
                        },
                        personalEnumData: true,
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
