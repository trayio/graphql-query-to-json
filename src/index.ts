import {parse} from "graphql"
import {EnumType} from "json-to-graphql-query"
import * as isObject from "lodash.isobject"
import * as isString from "lodash.isstring"
import * as mapValues from "lodash.mapvalues"

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
        fields?: Argument[]
        name?: {
            kind: string
            value: string
        }
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

const getArgumentObject = (argumentFields: Argument[]) => {
    const argObj = {}
    argumentFields.forEach((arg) => {
        if (arg.value.kind === "ObjectValue") {
            argObj[arg.name.value] = getArgumentObject(arg.value.fields)
        } else if (arg.value.kind === "Variable") {
            argObj[
                arg.name.value
            ] = `${arg.value.name.value}${isVariableDropinConst}`
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
            argsObj[
                arg.name.value
            ] = `${arg.value.name.value}${isVariableDropinConst}`
        } else if (arg.selectionSet) {
            argsObj[arg.name.value] = getSelections(arg.selectionSet.selections)
        } else if (arg.value.kind === "EnumValue") {
            argsObj[arg.name.value] = new EnumType(arg.value.value)
        } else {
            argsObj[arg.name.value] = arg.value.value
        }
    })
    return argsObj
}

const getSelections = (selections: Selection[]) => {
    const selObj = {}
    selections.forEach((selection) => {
        if (selection.selectionSet) {
            if (selection.alias) {
                selObj[selection.alias.value] = getSelections(
                    selection.selectionSet.selections
                )
                selObj[selection.alias.value].__aliasFor = selection.name.value
            } else {
                selObj[selection.name.value] = getSelections(
                    selection.selectionSet.selections
                )
            }
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

const checkEachVariableInQueryIsDefined = (
    defintion: ActualDefinitionNode,
    variables: variablesObject
) => {
    const varsList = defintion.variableDefinitions.reduce((prev, curr) => {
        return [
            ...prev,
            {
                key: curr.variable.name.value,
                type: curr.type.name.value,
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
            `The query you want to parse is using variables. This means that you have to supply for every variable that is used in the query a corresponding value. You can parse these values as a second parameter on the options object, on the "variables" key.`
        )
    }

    return varsList
}

export const replaceVariables = (obj, variables) => {
    return mapValues(obj, (value) => {
        if (
            isString(value) &&
            new RegExp(`${isVariableDropinConst}$`).test(value)
        ) {
            const variableName = value.replace(isVariableDropinConst, "")
            return variables[variableName]
        } else if (isObject(value)) {
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
    }
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

    checkEachVariableInQueryIsDefined(firstDefinition, options.variables)
    const selections = getSelections(firstDefinition.selectionSet.selections)
    jsonObject[operation] = selections
    const varsReplacedWithValues = replaceVariables(
        jsonObject,
        options.variables
    )
    // console.log(JSON.stringify(varsReplacedWithValues, undefined, 4))
    return varsReplacedWithValues
}
