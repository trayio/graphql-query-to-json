type variablesObject = {
    [variableName: string]: any
}

export const debugLog = (...args: any) => {
    if (process.env.__GQTOJSON_DEBUG === "true") {
        // eslint-disable-next-line no-console
        console.log(...args)
    }
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

export const graphQlQueryToJson = (
    query: string,
    options: {
        variables?: variablesObject
    } = {}
) => {
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

    // TODO: Has to be improved
    // const markEnums = colonsBeforeCurlys.replace(/[A-Z]+: [A-Z]+/gi, (enumMatch) => {
    //     const enumValue = enumMatch.match(/: (.+)/)
    //     if (enumValue) {
    //         return enumMatch.replace(enumValue[1], `new EnumType("${enumValue[1]}")`)
    //     } else {
    //         return enumMatch
    //     }
    // })
    // debugLog(markEnums)

    const withOuterCurlys = normaliseSpaces(`{ ${colonsBeforeCurlys} }`)
    debugLog({withOuterCurlys})

    const doubleQuoteVariableNames = withOuterCurlys.replace(
        /[A-Z_]+:/gi,
        (varName) => {
            return `"${varName.replace(":", '":')}`
        }
    )

    debugLog({doubleQuoteVariableNames})

    const orphanPropertiesMarkedTrue = doubleQuoteVariableNames.replace(
        /(?<!") [A-Z]+/gi,
        (orphan) => {
            return `"${orphan.trim()}": true, `
        }
    )

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
    ).replace(/}"[A-Z]+"/gi, (match) => {
        return match.replace('}"', '}, "')
    })

    const wrapAliasesInAliasForObject = normaliseSpaces(
        concatenatePropertiesAfterObjectOnSameLevel
    ).replace(/"[A-Z]+": "[A-Z]+":.+/gi, (match) => {
        let replacement = match
        const aliasFor = match.match(/"[A-Z]+": "([A-Z]+)"/i)
        const actualProp = aliasFor[1]
        const alias = aliasFor.input.match(/"([A-Z]+)"/i)[1]
        replacement = replacement.replace(new RegExp(`"${actualProp}": `), "")
        replacement = replacement.replace(
            `"${alias}": {`,
            `"${alias}": { "__aliasFor": "${actualProp}", `
        )
        return replacement
    })
    debugLog({wrapAliasesInAliasForObject})

    return JSON.parse(wrapAliasesInAliasForObject)
}
