import {parse} from "graphql"
import {EnumType} from "json-to-graphql-query"

type variablesObject = {
    [variableName: string]: string
}

interface Argument {
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
}

interface Selection {
    kind: string
    name: {
        kind: string
        value: string
    }
    arguments?: Argument[]
    selectionSet?: SelectionSet
}

interface SelectionSet {
    kind: string
    selections: Selection[]
}

interface VariableDefinition {
    kind: string
    variable: {
        kind: string
        name: {
            kind: string
            value: string
        }
    }
    type: {
        kind: string
        name: {
            kind: string
            value: string
        }
    }
}

interface ActualDefinitionNode {
    operation: string
    selectionSet: SelectionSet
    variableDefinitions?: VariableDefinition[]
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

const getSelections = (selections: Selection[], selObj = {}) => {
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

interface Variable {
    key: string
    type: string
    value: any
}

const getVariables = (defintion: ActualDefinitionNode): Variable[] => {
    if (!defintion.variableDefinitions.length) {
        return []
    } else {
        return defintion.variableDefinitions.reduce((prev, curr) => {
            return [...prev, {
                key: curr.variable.name.value,
                type: curr.type.name.value,
                value: "Dummy_Value"
            }]
        }, [])
    }
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

    // const variablesUsedInQuery = getVariables(firstDefinition)
    const selections = getSelections(
        firstDefinition.selectionSet.selections,
        {}
    )

    jsonObject[operation] = selections
    return jsonObject
}
