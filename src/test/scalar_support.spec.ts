import {
    graphQlQueryToJson,
} from "../index"

describe("Scalar support", () => {
    it("Scalar query", () => {

        const query = `
            query fooBarAlias($name: String!, $lastName: String!) {
                fooBar(name: $name, lastName: $lastName)
            }`;

        const newJson = graphQlQueryToJson(query, {
        variables: {
            name: 'PETER',
            lastName: 'SCHMIDT',
        },
        });

        expect(newJson).toEqual({
            query: {
                fooBar: {
                    __args: {
                        lastName: "SCHMIDT",
                        name: "PETER"
                    }
                }
            }
        });
    })
})
