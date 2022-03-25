let {
    getFieldsSetFromSetName,
    getFieldFromFieldName,
    isAutoIncrement,
    isUnique,
    getSymmetryReferences
} = require('./common')

let {
    NAME_JSON_PATH,
    ADDRESS_JSON_PATH
} = require('./random')

// for database
const DATABASE_TYPE = ['SQL', 'JSON']

// for data random
const {
    LOWER_CHARACTER,
    UPPER_CHARACTER,
    NUMERIC,
    DEFAULT_STRING_LENGTH,
    DEFAULT_MIN_NUMBER,
    DEFAULT_MAX_NUMBER
} = require('./random')

// check is correct schema
let isCorrectSchema = (schema) => {

    if (!schema) return false

    // check database name
    if (schema.databaseName == undefined ||
        schema.databaseName == '')
        return false

    // check database type
    if (!schema.type ||
        !DATABASE_TYPE.includes(schema.type))
        return false

    // check have fields sets
    if (!schema.fieldsSets ||
        schema.fieldsSets.length == 0)
        return false

    // check in fields sets
    return schema.fieldsSets.every(fieldsSet =>
        isCorrectFieldsSet(fieldsSet, schema)
    )
}

// check is correct fields set
let isCorrectFieldsSet = (fieldsSet, schema) => {
    let { name, references } = fieldsSet
    // check set name
    if (!name)
        return false

    // check references
    if (references) {
        return references.every(reference =>
            isCorrectReference(reference, schema))
    }
    return true
}

// check is correct reference
let isCorrectReference = (reference, schema) => {

    // check have values in properties
    let {
        from: currentFieldName,
        to,
        relation: currentRelation
    } = reference

    if (!currentFieldName || !to ||
        !to.setName || !to.field ||
        !currentRelation) {
        return false
    }

    // check have symmetry reference
    let symmetryReferences =
        getSymmetryReferences(reference, schema)
    if (!symmetryReferences ||
        symmetryReferences.length == 0) {
        return false
    }

    // get first symmetry reference
    let symmetryReference = symmetryReferences[0]

    // check unique or auto increment
    // if relation is One2One or One2Many
    // this field have been unique or auto increment
    // and it have possible unique or auto increment (datatype enough to do it)
    // and with this relation row amount have been equal or more referenced field

    if (currentRelation == 'One2One' ||
        currentRelation == 'One2Many') {
        let currentSetName =
            symmetryReference.to.setName
        let currentFieldsSet =
            getFieldsSetFromSetName(currentSetName, schema)
        let currentField =
            getFieldFromFieldName(currentFieldName, currentSetName, schema)
        let referencedFieldsSet =
            getFieldsSetFromSetName(to.setName, schema)

        if (isAutoIncrement(currentFieldName, currentFieldsSet)) {
            let { startAt } =
                currentFieldsSet
                    .autoIncrements
                    .filter(item =>
                        item.fieldName == currentFieldName
                    )[0]
            let { rowAmount } = currentFieldsSet
            if (!possibleAutoIncrement(currentField, startAt, rowAmount)) {
                return false
            }
        }

        if (isUnique(currentFieldName, currentFieldsSet) &&
            !possibleUnique(currentField, currentFieldsSet.rowAmount)) {
            return false
        }

        // if One2One relation both have been equal
        if (currentRelation == 'One2One') {
            return currentFieldsSet.rowAmount == referencedFieldsSet.rowAmount
        }
    }

    return true
}

// check that field enough generate to row amount
let possibleUnique = (field, rowAmount) =>
    countCasesUnique(field.datatype) >= rowAmount ? true : false

let possibleAutoIncrement = (field, startAt, rowAmount) => {
    let { datatype } = field
    if (datatype && datatype.type && rowAmount) {
        let { type, options } = datatype
        switch (type) {
            case 'number':
            case 'string':
            case 'date':
                return true
            case 'name':
            case 'address':
            case 'set':
            case 'freedom':
                return false
            case 'template':
                let { template: simpleTypes } = options
                return simpleTypes.some(simpleType =>
                    possibleAutoIncrement(simpleType, startAt, rowAmount)
                )
            default:
                return false
        }
    }
}

// count cases unique of datatype and it's options
let countCasesUnique = (datatype) => {
    if (datatype && datatype.type) {
        let { type, options } = datatype
        switch (type) {
            case 'number':
                let { min, max, isInt } = options
                if (isInt)
                    return countCasesUniqueOfNumberType(min, max)
                else
                    return Infinity
            case 'string':
                let { length, haveLower, haveUpper, haveNumeric } = options
                return countCasesUniqueOfStringType(
                    length, haveLower, haveUpper, haveNumeric
                )
            case 'date':
                let { minDate, maxDate } = options
                return countCasesUniqueOfDateType(minDate, maxDate)
            case 'name':
                let { isMale } = options
                return countCasesUniqueOfNameType(isMale)
            case 'address':
                return countCasesUniqueOfAddressType()
            case 'set':
                let { set } = options
                return countCasesUniqueOfSetType(set)
            case 'freedom':
                return 1
            case 'template':
                let { template } = options
                return countCasesUniqueOfTemplateType(template)
            default:
                return 0
        }
    } else {
        return 0
    }
}

// COUNT CASE OF DATATYPES WITH OPTIONS

// count cases unique of string type
// use Permutation with repetition
let countCasesUniqueOfStringType = (
    length = DEFAULT_STRING_LENGTH,
    haveLower = true,
    haveUpper = true,
    haveNumeric = true
) => {
    let patternLength = haveLower ? LOWER_CHARACTER.length : 0
    patternLength += haveUpper ? UPPER_CHARACTER.length : 0
    patternLength += haveNumeric ? NUMERIC.length : 0
    return Math.pow(patternLength, length)
}

// count cases unique of number type (only integer)
let countCasesUniqueOfNumberType = (
    min = DEFAULT_MIN_NUMBER,
    max = DEFAULT_MAX_NUMBER
) => max - min + 1

// count cases unique of datetime type
let countCasesUniqueOfDateType = (minDate, maxDate) => {
    let minTime = new Date(minDate).getTime()
    let maxTime = new Date(maxDate).getTime()
    return countCasesUniqueOfNumberType(minTime, maxTime)
}

// count cases unique of name type
let countCasesUniqueOfNameType = (isMale) => {
    let {
        lastNames,
        menMiddleNames,
        menFirstNames,
        womenMiddleNames,
        womenFirstNames
    } = require(NAME_JSON_PATH)

    if (isMale == true) {
        return lastNames.length *
            menMiddleNames.length *
            menFirstNames.length
    } else if (isMale == false) {
        return lastNames.length *
            womenMiddleNames.length *
            womenFirstNames.length
    } else {
        return lastNames.length *
            menMiddleNames.length *
            menFirstNames.length +
            lastNames.length *
            womenMiddleNames.length *
            womenFirstNames.length
    }
}

// count cases unique of address type
let countCasesUniqueOfAddressType = () => {
    let { streets, provinces } = require(ADDRESS_JSON_PATH)
    let lengthOfProvicesAndDistricts = provinces.reduce(
        (total, province) => {
            return total + province.districts.length
        }, 0)
    return MAX_APARTMENT_NUMBER *
        streets.length *
        lengthOfProvicesAndDistricts
}

// count cases unique of set type
let countCasesUniqueOfSetType = (set) => {
    return Array.isArray(set) ? set.length : 0
}

// count cases unique of template type
let countCasesUniqueOfTemplateType = (template) => {
    let countCases = 1
    if (!Array.isArray(template)) template = [template]
    for (simpleType of template) {
        countCases *= countCasesUnique(simpleType)
    }
    return countCases
}
module.exports = {
    isCorrectSchema,
    isCorrectFieldsSet,
    isCorrectReference,
    possibleUnique,
    possibleAutoIncrement,
    countCasesUnique,
    countCasesUniqueOfStringType,
    countCasesUniqueOfNumberType,
    countCasesUniqueOfDateType,
    countCasesUniqueOfNameType,
    countCasesUniqueOfAddressType,
    countCasesUniqueOfSetType,
    countCasesUniqueOfTemplateType
}