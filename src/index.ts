type variablesObject = {
    [variableName: string]: any
}

const moveVariablesIntoNormalisedQuery = (
    normalisedQuery: string,
    variables: variablesObject
) => {
    let variablesMovedIntoQuery = normalisedQuery
    // @ts-ignore // TODO: This should not be ignored
    Object.entries(variables).forEach((variable) => {
        const variableType = variablesMovedIntoQuery.match(
            new RegExp(`\\$${variable[0]}: .+?(?:,|\\))`)
        )
        if (variableType) {
            // @ts-ignore // TODO: This should not be ignored
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
    if (
        !withoutQueryName.includes("query {") &&
        !withoutQueryName.includes("mutation {")
    ) {
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
    console.warn({normalised})
    return normalised.replace(/, }/g, " }")
}

export const graphQlQueryToJson = (
    query: string,
    options: {
        variables?: variablesObject
    } = {}
) => {
    const normalisedQuery = normaliseQuery(query)
    console.warn({normalisedQuery})
    const variablesMovedIntoQuery = options.variables
        ? moveVariablesIntoNormalisedQuery(normalisedQuery, options.variables)
        : normalisedQuery
    const withoutQueryName = removeQueryName(variablesMovedIntoQuery)
    console.warn({withoutQueryName})

    console.warn()

    const argumentsAsArgs = withoutQueryName.replace(/\(.+?\)/g, (match) => {
        console.warn(match)
        return match.replace("(", " { __args { ").replace(")", " }")
        // return match.replace("(", ": { __args: { ").replace(")", " }")
    })
    console.log({argumentsAsArgs})

    const argumentsAsArgsBracketFix = normaliseSpaces(argumentsAsArgs).replace(
        /__args {.+?{/g,
        (match) => {
            return match.replace(/{$/, " ")
        }
    )
    console.warn({argumentsAsArgsBracketFix})

    console.warn()

    const colonsBeforeCurlys = argumentsAsArgsBracketFix.replace(
        /(?:[A-Z]+) {/gi,
        (match) => {
            return match.replace(" {", ": {")
        }
    )
    console.warn({colonsBeforeCurlys})

    // TODO: Has to be improved
    // const markEnums = colonsBeforeCurlys.replace(/[A-Z]+: [A-Z]+/gi, (enumMatch) => {
    //     const enumValue = enumMatch.match(/: (.+)/)
    //     if (enumValue) {
    //         return enumMatch.replace(enumValue[1], `new EnumType("${enumValue[1]}")`)
    //     } else {
    //         return enumMatch
    //     }
    // })
    // console.warn(markEnums)

    const withOuterCurlys = normaliseSpaces(`{ ${colonsBeforeCurlys} }`)
    console.warn({withOuterCurlys})

    const doubleQuoteVariableNames = withOuterCurlys.replace(
        /[A-Z_]+:/gi,
        (varName) => {
            return `"${varName.replace(":", '":')}`
        }
    )

    console.warn({doubleQuoteVariableNames})

    const orphanPropertiesMarkedTrue = doubleQuoteVariableNames.replace(
        /(?<!") [A-Z]+/gi,
        (orphan) => {
            return `"${orphan.trim()}": true, `
        }
    )

    console.warn({orphanPropertiesMarkedTrue})

    const withoutDanglingCommas = removeDanglingCommas(
        orphanPropertiesMarkedTrue
    )
    console.warn({withoutDanglingCommas})

    const concatenateObjectsOnSameLevel = withoutDanglingCommas.replace(
        /} "/g,
        '}, "'
    )
    console.warn({concatenateObjectsOnSameLevel})

    return JSON.parse(concatenateObjectsOnSameLevel)
}
