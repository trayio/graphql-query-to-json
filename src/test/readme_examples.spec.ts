import {graphQlQueryToJson} from "../index"

describe("README Examples Validation", () => {
    describe("Simple Queries", () => {
        it("Single and multiple fields", () => {
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

            expect(result).toEqual({
                query: {
                    viewer: {
                        name: true,
                        email: true,
                    },
                    user: {
                        profile: {
                            avatar: true,
                            bio: true,
                        },
                    },
                },
            })
        })
    })

    describe("Variables and Arguments", () => {
        it("Query with variables", () => {
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
                    includeProfile: true,
                },
            })

            expect(result).toEqual({
                query: {
                    user: {
                        __args: {id: "123"},
                        name: true,
                        email: true,
                        profile: {
                            bio: true,
                            avatar: true,
                        },
                    },
                },
            })
        })
    })

    describe("Scalar Fields with Arguments", () => {
        it("Scalar fields that accept arguments", () => {
            const query = `
query {
    userCount(filter: "active")
    totalRevenue(currency: "USD", year: 2024)
    averageRating(precision: 2)
}
`

            const result = graphQlQueryToJson(query)

            expect(result).toEqual({
                query: {
                    userCount: {
                        __args: {filter: "active"},
                    },
                    totalRevenue: {
                        __args: {currency: "USD", year: 2024},
                    },
                    averageRating: {
                        __args: {precision: 2},
                    },
                },
            })
        })
    })

    describe("Mutations with Simple Arguments", () => {
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
    })

    describe("Mutations with Complex Arguments", () => {
        it("Mutation with nested object arguments", () => {
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
                    },
                },
            })

            expect(result).toEqual({
                mutation: {
                    createUser: {
                        __args: {
                            input: {
                                name: "John Doe",
                                email: "john@example.com",
                            },
                        },
                        id: true,
                        name: true,
                        profile: {
                            email: true,
                            settings: {
                                theme: true,
                                notifications: true,
                            },
                        },
                    },
                },
            })
        })
    })

    describe("Aliases and Field Renaming", () => {
        it("Multiple aliases for the same field", () => {
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

            expect(result).toEqual({
                query: {
                    currentUser: {
                        __aliasFor: "user",
                        __args: {id: 1},
                        name: true,
                        email: true,
                    },
                    adminUser: {
                        __aliasFor: "user",
                        __args: {id: 2},
                        name: true,
                        permissions: true,
                    },
                    guestUser: {
                        __aliasFor: "user",
                        __args: {id: 3},
                        name: true,
                        status: true,
                    },
                },
            })
        })
    })

    describe("Enum Types", () => {
        it("Enums in arguments", () => {
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

            expect(result).toEqual({
                query: {
                    posts: {
                        __args: {
                            status: {value: "PUBLISHED"},
                            orderBy: {value: "CREATED_DESC"},
                        },
                        title: true,
                        content: true,
                    },
                    users: {
                        __args: {
                            role: {value: "ADMIN"},
                            sortBy: {value: "NAME_ASC"},
                        },
                        name: true,
                        email: true,
                    },
                },
            })
        })
    })

    describe("Array Arguments", () => {
        it("Lists and arrays as arguments", () => {
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

            expect(result).toEqual({
                mutation: {
                    updateUser: {
                        __args: {
                            id: "123",
                            tags: ["developer", "typescript", "graphql"],
                            permissions: ["READ", "WRITE", "ADMIN"],
                        },
                        id: true,
                        tags: true,
                        permissions: true,
                    },
                },
            })
        })
    })

    describe("Empty Values and Edge Cases", () => {
        it("Empty strings, objects, and arrays", () => {
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

            expect(result).toEqual({
                mutation: {
                    createRecord: {
                        __args: {
                            input: {
                                name: "",
                                metadata: {},
                                tags: [],
                                count: 0,
                                isActive: false,
                            },
                        },
                        id: true,
                        status: true,
                    },
                },
            })
        })
    })

    describe("Deeply Nested Objects", () => {
        it("Complex nested structures", () => {
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

            expect(result).toEqual({
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
                                                country: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            })
        })
    })

    describe("Mixed Variable Types", () => {
        it("Various data types as variables", () => {
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
                        tags: ["graphql", "api"],
                    },
                    includeArchived: false,
                },
            })

            expect(result).toEqual({
                query: {
                    search: {
                        __args: {
                            query: "GraphQL tutorial",
                            first: 10,
                            skip: 0,
                            filters: {
                                category: "tutorial",
                                difficulty: "beginner",
                                tags: ["graphql", "api"],
                            },
                            archived: false,
                        },
                        results: {
                            id: true,
                            title: true,
                            excerpt: true,
                        },
                        totalCount: true,
                    },
                },
            })
        })
    })

    describe("Subscriptions", () => {
        it("Basic subscription", () => {
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

            expect(result).toEqual({
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

        it("Subscription with variables and arguments", () => {
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
                    channel: "general",
                },
            })

            expect(result).toEqual({
                subscription: {
                    messageAdded: {
                        __args: {
                            userId: "123",
                            channel: "general",
                        },
                        id: true,
                        content: true,
                        timestamp: true,
                    },
                },
            })
        })

        it("Subscription with aliases and enums", () => {
            const subscription = `
subscription {
    latestMessage: messageAdded(channel: PUBLIC) {
        id
        content
    }
}
`

            const result = graphQlQueryToJson(subscription)

            expect(result).toEqual({
                subscription: {
                    latestMessage: {
                        __aliasFor: "messageAdded",
                        __args: {
                            channel: {value: "PUBLIC"},
                        },
                        id: true,
                        content: true,
                    },
                },
            })
        })
    })
})
