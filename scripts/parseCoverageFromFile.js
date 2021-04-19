const fs = require("fs")
const path = require("path")

const readCoverageHTML = () => {
    const fileToRead = path.join(
        __dirname,
        "./../coverage/lcov-report/index.html"
    )
    try {
        return fs.readFileSync(fileToRead, "utf-8")
    } catch (error) {
        throw new Error(
            `We were unable to read the ${fileToRead} file. Are you sure it has been written?`
        )
    }
}

const retrievePercentageStatistics = (match, returnUnknown) => {
    let percentage
    const percentageMatches = match.match(/>(.+)% </)
    if (!percentageMatches) {
        if (returnUnknown) {
            percentage = "Unknown"
        } else {
            throw new Error(`Unable to retrieve the percentages from the HTML`)
        }
    } else {
        percentage = percentageMatches[1]
    }
    return percentage
}

const retrieveNumberStatistics = (match, returnUnknown) => {
    let numbers
    const numberMatches = match.match(/>([0-9]+\/[0-9]+)</)
    if (!numberMatches) {
        if (returnUnknown) {
            numbers = "Unknown"
        } else {
            throw new Error(
                `Unable to retrieve the number matches from the HTML`
            )
        }
    } else {
        numbers = numberMatches[1]
    }
    return numbers
}

const retrieveCoverageStatistics = (html, type, returnUnknown = false) => {
    const matches = html.match(new RegExp(`.*\n.+>${type}<.+\n.+/`, "gmi"))
    if (!matches) {
        throw new Error(
            `Unable to parse coverage statistics in the HTML for type $"{type}".`
        )
    }
    const match = matches[0]
    const percentage = retrievePercentageStatistics(match, returnUnknown)
    const numbers = retrieveNumberStatistics(match, returnUnknown)
    return {
        percentage,
        numbers,
    }
}

exports.parseCoverageFromFile = (options = {}) => {
    const htmlFile = readCoverageHTML()
    const statementData = retrieveCoverageStatistics(
        htmlFile,
        "statements",
        options.returnUnknown
    )
    const branchesData = retrieveCoverageStatistics(
        htmlFile,
        "branches",
        options.returnUnknown
    )
    const functionsData = retrieveCoverageStatistics(
        htmlFile,
        "functions",
        options.returnUnknown
    )
    const linesData = retrieveCoverageStatistics(
        htmlFile,
        "lines",
        options.returnUnknown
    )
    return {
        statementData,
        branchesData,
        functionsData,
        linesData,
    }
}
