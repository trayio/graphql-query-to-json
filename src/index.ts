import {parse} from "graphql"

type variablesObject = {
    [variableName: string]: any
}

const getSelections = (selections, selObj = {}) => {
    if (selections) {
        selections.forEach((selection) => {
            if (selection.selectionSet) {
                selObj[selection.name.value] = getSelections(
                    selection.selectionSet.selections
                )
            } else {
                selObj[selection.name.value] = true
            }
        })
    }
    return selObj
}

const transformGraphqlQueryToJsonString = (
    query: string,
    options: {
        variables?: variablesObject
    } = {}
): any => {
    const jsonObject = {}
    const parsedQuery = parse(query)
    // console.log(JSON.stringify(parsedQuery, undefined, 4))
    if (parsedQuery.definitions.length > 1) {
        throw new Error(`The parsed query has more than one set of definitions`)
    }
    const operation = parsedQuery.definitions[0].operation

    const selections = getSelections(
        parsedQuery.definitions[0].selectionSet.selections,
        {}
    )
    console.log({selections})

    jsonObject[operation] = selections
    return jsonObject
}

const throwParsingError = () => {
    throw new Error(
        `We were unable to parse your graphQL query into a JSON object. Are you sure that it has been valid JSON?`
    )
}

export const graphQlQueryToJson = (
    query: string,
    options: {
        variables?: variablesObject
    } = {}
) => {
    // try {
    const jsonedQuery = transformGraphqlQueryToJsonString(query)
    return jsonedQuery
    // } catch (error) {
    //     throwParsingError()
    // }
}
