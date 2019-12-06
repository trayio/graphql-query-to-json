import {parse} from "graphql"
import { EnumType } from "json-to-graphql-query"

type variablesObject = {
    [variableName: string]: string
}

interface SelectionSet {
    kind: string
    selections: {
        kind: string
        name: {
            kind: string
            value: string
        }
        arguments: {
            kind: string
            name: {
                kind: string
                value: string
            }
            value: {
                kind: string
                value: string
                block: boolean
            }
        }[]
    }[]
}

interface ActualDefinitionNode {
    operation: string
    selectionSet: SelectionSet
}

const getArguments = (args, argsObj = {}) => {
    args.forEach((arg) => {
        if (arg.selectionSet) {
            argsObj[arg.name.value] = getSelections(
                arg.selectionSet.selections,
                argsObj
            )
        } else if (arg.value.kind === "EnumValue") {
            argsObj[arg.name.value] = new EnumType(arg.value.value)
        } else {
            argsObj[arg.name.value] = arg.value.value
        }
    })
    return argsObj
}

const getSelections = (selections, selObj = {}) => {
    selections.forEach((selection) => {
        if (selection.selectionSet) {
            // console.warn({gettingSelection: JSON.stringify(selection.selectionSet, undefined, 4)})
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

export const graphQlQueryToJson = (
    query: string,
    options: {
        variables?: variablesObject
    } = {}
) => {
    const jsonObject = {}
    const parsedQuery = parse(query)
    console.log(JSON.stringify(parsedQuery, undefined, 4))
    if (parsedQuery.definitions.length > 1) {
        throw new Error(`The parsed query has more than one set of definitions`)
    }
    // @ts-ignore
    const firstDefinition = parsedQuery.definitions[0] as ActualDefinitionNode
    const operation = firstDefinition.operation

    const selections = getSelections(
        firstDefinition.selectionSet.selections,
        {}
    )

    jsonObject[operation] = selections
    return jsonObject
}
