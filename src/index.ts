import {debugLog, replaceEnumsInObject} from "./utils"
import {enumTypeDropin} from "./constants"

type variablesObject = {
    [variableName: string]: any
}

const moveVariablesIntoNormalisedQuery = (
    normalisedQuery: string,
    variables: variablesObject
) => {
    let variablesMovedIntoQuery = normalisedQuery
    Object.entries(variables).forEach((variable) => {
        const variableType = variablesMovedIntoQuery.match(
            new RegExp(`\\$${variable[0]}: .+?(?:,|\\))`)
        )
        if (variableType) {
            const valueToReplace = variableType[0].includes("String")
                ? `"${variable[1]}"`
                : variable[1]
            variablesMovedIntoQuery = variablesMovedIntoQuery.replace(
                new RegExp(`: \\$${variable[0]}`, "g"),
                `: ${valueToReplace}`
            )
        }
    })
    const firstVariableName = Object.keys(variables)[0]
    variablesMovedIntoQuery = variablesMovedIntoQuery.replace(
        new RegExp(`\\(.*?\\$${firstVariableName}.*?\\)`, "g"),
        ""
    )
    variablesMovedIntoQuery = normaliseSpaces(variablesMovedIntoQuery)
    return variablesMovedIntoQuery
}

const removeQueryName = (queryWithVariablesMovedIn: string) => {
    let withoutQueryName = `${queryWithVariablesMovedIn}`
    const hasQueryName = ["query {", "mutation {"].every((queryTypeMarker) => {
        return !withoutQueryName.includes(queryTypeMarker)
    })
    if (hasQueryName) {
        const queryName = withoutQueryName.match(/(?:query|mutation) (.+? ){/)
        if (queryName) {
            withoutQueryName = withoutQueryName.replace(queryName[1], "")
        }
        withoutQueryName = normaliseSpaces(withoutQueryName)
    }
    return withoutQueryName
}

const normaliseQuery = (sourceQuery: string) => {
    return sourceQuery
        .replace(/\n/g, " ")
        .replace(/\t/g, " ")
        .replace(/ +/g, " ")
        .replace(/,/g, "")
}

const normaliseSpaces = (string) => {
    return string.replace(/ +/g, " ")
}

const removeDanglingCommas = (stringQuery: string) => {
    const normalised = normaliseSpaces(stringQuery)
    const noDangling = normalised.replace(/, }/g, " }")
    return normaliseSpaces(noDangling)
}

const placeMutationsArgumentsInsideArgsObject = (stringQuery: string) => {
    const argumentsAsArgs = stringQuery.replace(/\(.+?\)/g, (match) => {
        const replacement = match.replace("(", " { __args { ").replace(")", "}")
        return replacement
    })

    const removeImpossibleBracketCombinations = normaliseSpaces(
        argumentsAsArgs
    ).replace(/} {/g, "} ")

    const normalised = normaliseSpaces(removeImpossibleBracketCombinations)

    return normalised
}

const transformGraphqlQueryToJsonString = (
    query: string,
    options: {
        variables?: variablesObject
    } = {}
): string => {
    debugLog("-------------")
    const normalisedQuery = normaliseQuery(query)
    debugLog({normalisedQuery})
    const variablesMovedIntoQuery = options.variables
        ? moveVariablesIntoNormalisedQuery(normalisedQuery, options.variables)
        : normalisedQuery
    const withoutQueryName = removeQueryName(variablesMovedIntoQuery)
    debugLog({withoutQueryName})
    const argumentsAsArgs = placeMutationsArgumentsInsideArgsObject(
        withoutQueryName
    )
    debugLog({argumentsAsArgs})

    const colonsBeforeCurlys = argumentsAsArgs.replace(
        /(?:[A-Z]+) {/gi,
        (match) => {
            return match.replace(" {", ": {")
        }
    )
    debugLog({colonsBeforeCurlys})

    const withOuterCurlys = normaliseSpaces(`{ ${colonsBeforeCurlys} }`)
    debugLog({withOuterCurlys})

    const markEnums = normaliseSpaces(withOuterCurlys).replace(
        /[A-Z_]+: [A-Z_]+}/gi,
        (propAndEnumValue) => {
            const enumMarkedWithSuffix = propAndEnumValue.replace(
                /: [A-Z]+/i,
                (colonAndEnumValue) => {
                    const withoutColon = colonAndEnumValue.replace(/: /, "")
                    return `: "${withoutColon}${enumTypeDropin}" `
                }
            )
            return enumMarkedWithSuffix
        }
    )
    debugLog({markEnums})

    const doubleQuoteVariableNames = normaliseSpaces(markEnums).replace(
        /[A-Z_]+:/gi,
        (varName) => {
            return `"${varName.replace(":", '":')}`
        }
    )
    debugLog({doubleQuoteVariableNames})

    const orphanPropertiesMarkedTrue = normaliseSpaces(
        doubleQuoteVariableNames
    ).replace(/(?<!") [A-Z_]+/gi, (orphan) => {
        return `"${orphan.trim()}": true, `
    })
    debugLog({orphanPropertiesMarkedTrue})

    const withoutDanglingCommas = removeDanglingCommas(
        orphanPropertiesMarkedTrue
    )
    debugLog({withoutDanglingCommas})

    const concatenateObjectsOnSameLevel = withoutDanglingCommas.replace(
        /} "/g,
        '}, "'
    )
    debugLog({concatenateObjectsOnSameLevel})

    const concatenatePropertiesOnSameLevel = normaliseSpaces(
        concatenateObjectsOnSameLevel
    ).replace(/" "/g, '", "')
    debugLog({concatenatePropertiesOnSameLevel})

    const concatenatePropertiesAfterObjectOnSameLevel = normaliseSpaces(
        concatenatePropertiesOnSameLevel
    ).replace(/}"[A-Z_]+"/gi, (match) => {
        return match.replace('}"', '}, "')
    })

    const wrapAliasesInAliasForObject = normaliseSpaces(
        concatenatePropertiesAfterObjectOnSameLevel
    ).replace(/"[A-Z_]+": "[A-Z_]+":.+/gi, (match) => {
        let replacement = match
        const aliasFor = match.match(/"[A-Z_]+": "([A-Z_]+)"/i)
        const actualProp = aliasFor[1]
        const alias = aliasFor.input.match(/"([A-Z_]+)"/i)[1]
        replacement = replacement.replace(new RegExp(`"${actualProp}": `), "")
        replacement = replacement.replace(
            `"${alias}": {`,
            `"${alias}": { "__aliasFor": "${actualProp}", `
        )
        return replacement
    })
    debugLog({wrapAliasesInAliasForObject})

    return wrapAliasesInAliasForObject
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
    const jsonedQuery = transformGraphqlQueryToJsonString(query, options)
    try {
        const parsedObject = JSON.parse(jsonedQuery)
        return replaceEnumsInObject(parsedObject)
    } catch (error) {
        throwParsingError()
    }
}
