let {
    getFieldsSetFromSetName,
    getFieldFromFieldName,
    isAutoIncrement,
    isUnique,
    getSymmetryReference,
} = require('./common')

let { NAME_JSON_PATH, ADDRESS_JSON_PATH } = require('./random')
// for database
const DATABASE_TYPE = ['SQL', 'JSON']

// for data random
const { LOWER_CHARACTER, UPPER_CHARACTER, NUMERIC } = require('./random')

// check is correct schema
let isCorrectSchema = (schema) => {

    if (!schema) return false

    // check database name
    if (schema.databaseName == undefined ||
        schema.databaseName == '')
        return false

    // check database type
    if (!schema.type ||
        !DATABASE_TYPE.some(type => type == schema.type))
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
    // check set name
    if (!fieldsSet.setName)
        return false
    // check references
    if (fieldsSet.references) {
        return fieldsSet.references.every(reference =>
            isCorrectReference(reference, schema)
        )
    }
    return true
}

// check is correct reference
let isCorrectReference = (reference, schema) => {

    // check have values in properties
    if (!reference.fromField ||
        !reference.referenceTo ||
        !reference.referenceTo.toSetName ||
        !reference.referenceTo.toField ||
        !reference.referenceTo.relation) {
        return false
    }

    // check have symmetry reference
    let symmetryReference = getSymmetryReference(reference, schema)
    if (symmetryReference, symmetryReference.length == 0)
        return false
    // get first symmetry reference
    symmetryReference = symmetryReference[0]

    // check unique or auto increment
    // if relation is One2One or One2Many
    // this field have been unique or auto increment
    // and it have possible unique or auto increment (datatype enough to do it)
    // and with this relation row amount have been equal or more referenced field
    let currentRelation = reference.referenceTo.relation
    if (currentRelation == 'One2One' ||
        currentRelation == 'One2Many') {
        let currentSetName = symmetryReference.referenceTo.toSetName
        let currentFieldsSet = getFieldsSetFromSetName(currentSetName, schema)
        let currentField = getFieldFromFieldName(reference.fromField, currentSetName, schema)
        let referencedFieldsSet = getFieldsSetFromSetName(
            reference.referenceTo.toSetName, schema
        )

        console.log({ field: reference.fromField, passed: '1' })
        if (isAutoIncrement(reference.fromField, currentFieldsSet) &&
            !possibleAutoIncrement(currentField)) {
            return false
        }

        console.log({ field: reference.fromField, passed: '1' })
        if (isUnique(reference.fromField, currentFieldsSet) &&
            !possibleUnique(currentField, currentFieldsSet.rowAmount)) {
            return false
        }

        console.log({ field: reference.fromField, passed: '2' })
        // if One2One relation both have been equal
        if (currentRelation == 'One2One') {
            return currentFieldsSet.rowAmount == referencedFieldsSet.rowAmount
        }

        // if One2Many relation, referenced field have been equal or more
        if (currentRelation == 'One2Many') {
            return currentFieldsSet.rowAmount <= referencedFieldsSet.rowAmount
        }
    }

    return true
}

// check that field enough generate to row amount
let possibleUnique = (field, rowAmount) =>
    countCasesUnique(field.datatype) >= rowAmount ? true : false

let possibleAutoIncrement = ({ datatype }) => {
    if (datatype && datatype.type) {
        let { type, options } = datatype
        switch (type) {
            case 'number':
                return true
            case 'string':
                return
            case 'date':
                return countCasesUniqueOfDateType(options.minDate, options.maxDate)
            case 'name':
                return countCasesUniqueOfNameType(options.isMale)
            case 'address':
                return countCasesUniqueOfAddressType()
            case 'set':
                return countCasesUniqueOfSetType(options.set)
            case 'freedom':
                return 1
            case 'template':
                return countCasesUniqueOfTemplateType(options.template)
            default:
                return 0
        }
    }
}

// count cases unique of datatype and it's options
let countCasesUnique = (datatype) => {
    if (datatype && datatype.type) {
        let { type, options } = datatype
        switch (type) {
            case 'number':
                return countCasesUniqueOfNumberType(options.min, options.max)
            case 'string':
                return countCasesUniqueOfStringType(
                    options.size,
                    options.haveLower,
                    options.haveUpper,
                    options.haveNumberic
                )
            case 'date':
                return countCasesUniqueOfDateType(options.minDate, options.maxDate)
            case 'name':
                return countCasesUniqueOfNameType(options.isMale)
            case 'address':
                return countCasesUniqueOfAddressType()
            case 'set':
                return countCasesUniqueOfSetType(options.set)
            case 'freedom':
                return 1
            case 'template':
                return countCasesUniqueOfTemplateType(options.template)
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
let countCasesUniqueOfStringType = (size, haveLower, haveUpper, haveNumberic) => {

    size = (size <= 0 || size == undefined)
        ? DEFAULT_STRING_LENGTH
        : size
    haveLower = haveLower == undefined ? true : haveLower
    haveUpper = haveUpper == undefined ? true : haveUpper
    haveNumberic = haveNumberic == undefined ? true : haveNumberic

    let patternLength = haveLower ? LOWER_CHARACTER.length : 0
    patternLength += haveUpper ? UPPER_CHARACTER.length : 0
    patternLength += haveNumberic ? NUMERIC.length : 0
    return Math.pow(patternLength, size)
}

// count cases unique of number type (only integer)
let countCasesUniqueOfNumberType = (min, max) => max - min + 1

// count cases unique of datetime type
let countCasesUniqueOfDateType = (minDate, maxDate) => {
    minDate = new Date(minDate)
    maxDate = new Date(maxDate)
    return countCasesUniqueOfNumberType(minDate.getTime(), maxDate.getTime())
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