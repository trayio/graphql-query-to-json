import {EnumType} from "json-to-graphql-query"
import * as mapValues from "lodash.mapvalues"
import * as isString from "lodash.isstring"
import * as isObject from "lodash.isobject"
import {enumTypeDropin} from "./constants"

export const debugLog = (...args: any) => {
    if (process.env.__GQTOJSON_DEBUG === "true") {
        // eslint-disable-next-line no-console
        console.log(...args)
    }
}

export const replaceEnumsInObject = (obj) => {
    return mapValues(obj, (value) => {
        if (isString(value) && new RegExp(`${enumTypeDropin}$`).test(value)) {
            const enumValue = value.replace(enumTypeDropin, "")
            return new EnumType(enumValue)
        } else if (isObject(value)) {
            return replaceEnumsInObject(value)
        } else {
            return value
        }
    })
}
