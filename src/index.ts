import {parse} from "graphql"
import {EnumType} from "json-to-graphql-query"
import * as mapValues from "lodash.mapvalues"

type variablesObject = {
    [variableName: string]: any
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
        fields?: Argument[]
        name?: {
            kind: string
            value: string
        }
        values?: Argument[]
    }
}

interface Selection {
    kind: string
    alias: {
        kind: string
        value: string
    }
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

const undefinedVariableConst = "undefined_variable"
const isVariableDropinConst = "_____isVariableDropinConst"

const flatMap = (arg, callback) =>
    arg.reduce(
        (callbackFn, initialValue) => callbackFn.concat(callback(initialValue)),
        [],
    )
const isString = (arg: any): boolean => typeof arg === "string"
const isObject = (arg: any): boolean => arg instanceof Object

const getArgumentObject = (argumentFields: Argument[]) => {
    const argObj = {}
    argumentFields.forEach((arg) => {
        if (arg.value.kind === "ObjectValue") {
            argObj[arg.name.value] = getArgumentObject(arg.value.fields)
        } else if (arg.value.kind === "ListValue") {
            argObj[arg.name.value] = arg.value.values
        } else if (arg.value.kind === "IntValue") {
            argObj[arg.name.value] = parseInt(arg.value.value)
        } else if (arg.value.kind === "Variable") {
            argObj[arg.name.value] =
                `${arg.value.name.value}${isVariableDropinConst}`
        } else {
            argObj[arg.name.value] = arg.value.value
        }
    })
    return argObj
}

const getArguments = (args) => {
    const argsObj = {}
    args.forEach((arg) => {
        if (arg.value.kind === "ObjectValue") {
            argsObj[arg.name.value] = getArgumentObject(arg.value.fields)
        } else if (arg.value.kind === "Variable") {
            argsObj[arg.name.value] =
                `${arg.value.name.value}${isVariableDropinConst}`
        } else if (arg.value.kind === "EnumValue") {
            argsObj[arg.name.value] = new EnumType(arg.value.value)
        } else if (arg.value.kind === "IntValue") {
            argsObj[arg.name.value] = parseInt(arg.value.value)
        } else if (arg.value.kind === "ListValue") {
            const values = flatMap(
                arg.value.values,
                (element: any) => element.value,
            )
            argsObj[arg.name.value] = values
        } else {
            argsObj[arg.name.value] = arg.value.value
        }
    })
    return argsObj
}

const getSelections = (selections: Selection[]) => {
    const selObj = {}
    selections.forEach((selection) => {
        const selectionHasAlias = selection.alias
        const selectionName = selectionHasAlias
            ? selection.alias.value
            : selection.name.value
        if (selection.selectionSet) {
            selObj[selectionName] = getSelections(
                selection.selectionSet.selections,
            )
            if (selectionHasAlias) {
                selObj[selection.alias.value].__aliasFor = selection.name.value
            }
        }
        if (selection.arguments.length > 0) {
            if (!selObj[selectionName]) {
                selObj[selectionName] = {}
            }
            selObj[selectionName].__args = getArguments(selection.arguments)
        }
        if (!selection.selectionSet && selection.arguments.length === 0) {
            selObj[selectionName] = true
        }
    })
    return selObj
}

const checkEachVariableInQueryIsDefined = (
    defintion: ActualDefinitionNode,
    variables: variablesObject,
) => {
    const varsList = defintion.variableDefinitions.reduce((prev, curr) => {
        return [
            ...prev,
            {
                key: curr.variable.name.value,
                value: undefinedVariableConst,
            },
        ]
    }, [])
    Object.entries(variables).forEach(([variableKey, variableValue]) => {
        const idx = varsList.findIndex((element) => {
            return element.key === variableKey
        })
        if (idx !== -1) {
            varsList[idx].value = variableValue
        }
    })

    const undefinedVariable = varsList.find((varInQuery) => {
        return varInQuery.value === undefinedVariableConst
    })
    if (undefinedVariable) {
        throw new Error(
            `The query you want to parse is using variables. This means that you have to supply for every variable that is used in the query a corresponding value. You can parse these values as a second parameter on the options object, on the "variables" key.`,
        )
    }

    return varsList
}

const replaceVariables = (obj, variables) => {
    return mapValues(obj, (value) => {
        if (
            isString(value) &&
            new RegExp(`${isVariableDropinConst}$`).test(value)
        ) {
            const variableName = value.replace(isVariableDropinConst, "")
            return variables[variableName]
        } else if (isObject(value) && !Array.isArray(value)) {
            return replaceVariables(value, variables)
        } else {
            return value
        }
    })
}

export const graphQlQueryToJson = (
    query: string,
    options: {
        variables: variablesObject
    } = {
        variables: {},
    },
) => {
    const jsonObject = {}
    const parsedQuery = parse(query)
    if (parsedQuery.definitions.length > 1) {
        throw new Error(`The parsed query has more than one set of definitions`)
    }
    // @ts-ignore
    const firstDefinition = parsedQuery.definitions[0] as ActualDefinitionNode
    const operation = firstDefinition.operation

    checkEachVariableInQueryIsDefined(firstDefinition, options.variables)
    const selections = getSelections(firstDefinition.selectionSet.selections)
    jsonObject[operation] = selections
    const varsReplacedWithValues = replaceVariables(
        jsonObject,
        options.variables,
    )
    return varsReplacedWithValues
}
