import {parse} from "graphql"

const getArguments = (args, argsObj = {}) => {
    args.forEach((arg) => {
        if (arg.selectionSet) {
            argsObj[arg.name.value] = getSelections(
                arg.selectionSet.selections,
                argsObj
            )
        } else {
            argsObj[arg.name.value] = arg.value.value
        }
    })
    return argsObj
}

const getSelections = (selections, selObj = {}) => {
    selections.forEach((selection) => {
        if (selection.selectionSet) {
            selObj[selection.name.value] = getSelections(
                selection.selectionSet.selections
            )
        }
        if (selection.arguments.length > 0) {
            selObj[selection.name.value].__args = getArguments(
                selection.arguments
            )
        }
        if (!selection.selectionSet && !selection.arguments.length) {
            selObj[selection.name.value] = true
        }
    })
    return selObj
}

export const graphQlQueryToJson = (query: string) => {
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

    jsonObject[operation] = selections
    return jsonObject
}
