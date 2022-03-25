let {
    getIndexOfField,
    getIndexOfFieldsSet,
    getAllReferencesOfField,
    getFieldsSetFromSetName,
    isAutoIncrement,
    getSymmetryReferences,
    getIndexInString
} = require('./common')

let {
    isCorrectSchema,
    countCasesUnique,
} = require('./constraint')

let {
    randomWithTemplate,
    randomInASet,
    DEFAULT_STRING_LENGTH
} = require('./random')

// for data random
const {
    LOWER_CHARACTER,
    UPPER_CHARACTER,
    NUMERIC
} = require('./random')

// for compare important level of reference field
const IMPORTANT_LEVEL_REFERENCE = {
    LOWER: -1,
    HIGHER: 1,
    EQUAL: 0,
    UNRELATED: 2
}

// default values for auto increment params
const DEFAULT_START_AT = '000'
const DEFAULT_STEP_BY = 1
const DEFAULT_AMOUNT = 1

let generateRawData = (schema) => {

    // check is correct schema
    if (!isCorrectSchema(schema))
        return []
    // pre generate data by scheme
    let reorganizedReferenceFields =
        reorganizeReferenceFields(schema)

    // skip referenced fields from other fields
    let skipFields = reorganizedReferenceFields
        .filter(reference => reference.point == 0)
        .map(reference => (
            {
                field: reference.from,
                setName: reference.setName
            }
        ))

    // pregenerate fieldssets and skip referenced fields
    let dataFieldsSets = schema.fieldsSets.map(fieldsSet => {
        let currentSkipFields = skipFields
            .filter(skip => skip.setName == fieldsSet.name)
            .map(skip => skip.field)
        return preGenerateData(fieldsSet, currentSkipFields)
    })

    // generate skiped fields
    for (reference of reorganizedReferenceFields) {

        let toFieldsSet =
            getFieldsSetFromSetName(reference.to.setName, schema)
        let toFieldReference =
            getSymmetryReferences(reference, schema)[0]
        let currentFieldsSet =
            getFieldsSetFromSetName(reference.setName, schema)
        let importantLevel = compareImportantLevelOfRefs(
            reference, toFieldReference,
            currentFieldsSet, toFieldsSet
        )

        if (importantLevel == IMPORTANT_LEVEL_REFERENCE.HIGHER ||
            importantLevel == IMPORTANT_LEVEL_REFERENCE.EQUAL) {

            let indexOfSourceFieldsSet =
                getIndexOfFieldsSet(reference.setName, schema)
            let indexOfDestinationFieldsSet =
                getIndexOfFieldsSet(reference.to.setName, schema)

            if (indexOfSourceFieldsSet != -1 &&
                indexOfDestinationFieldsSet != -1) {
                let indexOfSourceField =
                    getIndexOfField(reference.from, currentFieldsSet)
                let indexOfDestinationField =
                    getIndexOfField(reference.to.field, toFieldsSet)

                // get data from data pre generate
                // at index of reference field inportant
                let sourceArray = dataFieldsSets[indexOfSourceFieldsSet]
                    .map(dataLine => dataLine[indexOfSourceField])

                let destinationLenght =
                    dataFieldsSets[indexOfDestinationFieldsSet].length
                let cloneAmount = destinationLenght
                let sourceLength = sourceArray.length
                let randomLoopStep = Math.ceil(cloneAmount / sourceLength)
                let destinationArray = []
                for (let i = 0; i < randomLoopStep; i++) {
                    destinationArray
                        .push(...randomInASet(sourceArray, cloneAmount))
                    cloneAmount -= sourceLength
                }
                for (let i = 0; i < destinationLenght; i++) {
                    dataFieldsSets[indexOfDestinationFieldsSet]
                    [i][indexOfDestinationField] = destinationArray[i]
                }
            }
        }
    }

    return schema.fieldsSets.map((fieldsSet, index) => (
        { fieldsSet, generatedData: dataFieldsSets[index] }
    ))
}

// pre generate data and skip some fields (will generate after)
// because it often is reference field belong to some higher
let preGenerateData = (fieldsSet, skipFields = []) => {

    let preDatas = []

    // find order of unique, auto increment fields
    // and skip list skiped fields
    const autoIncrementFileds = fieldsSet.autoIncrements || []

    // except fields have been auto increment
    const uniqueFields = (fieldsSet.uniques || [])
        .filter(uniqueValue =>
            !autoIncrementFileds.some(({ fieldName }) =>
                fieldName == uniqueValue
            )
        )

    const preValues = {}
    autoIncrementFileds.forEach(autoIcrementField => {
        let { fieldName, incrementPosition, startAt, step } = autoIcrementField
        let { rowAmount } = fieldsSet
        let indexOfField = getIndexOfField(fieldName, fieldsSet)

        if (indexOfField != -1) {
            let datatype = fieldsSet.fields[indexOfField].datatype
            preValues[fieldName] =
                generateAutoIncrementDatasWithTemplate(
                    datatype, incrementPosition,
                    startAt, rowAmount, step
                )
        }
    })

    uniqueFields.forEach(fieldName => {
        let indexOfField = getIndexOfField(fieldName, fieldsSet)
        if (indexOfField != -1) {
            preValues[fieldName] = generateArrayWithTemplate(
                fieldsSet.fields[indexOfField].datatype,
                fieldsSet.rowAmount, true
            )
        }
    })

    for (let i = 0; i < fieldsSet.rowAmount; i++) {
        let valuesInField = []

        for (field of fieldsSet.fields) {
            let {
                name: currentFieldName,
                datatype: { type }
            } = field
            let valueInField = ''
            if (skipFields.includes(currentFieldName)) {
                valuesInField.push(valueInField)
                continue
            }
            if (autoIncrementFileds.some(({ fieldName }) =>
                fieldName == currentFieldName) ||
                uniqueFields.includes(currentFieldName)) {
                valueInField = preValues[currentFieldName][i]
            } else {
                valueInField = randomWithTemplate(field.datatype)
            }
            // add ' ' with fields have data type is string
            valuesInField.push(
                type == 'number' ? valueInField : `'${valueInField}'`
            )
        }
        preDatas.push(valuesInField)
    }

    return preDatas
}

// generate array numbers auto increment
let generateNumbersAutoIncrement = (
    start = DEFAULT_START_AT,
    amount = DEFAULT_AMOUNT,
    step = DEFAULT_STEP_BY
) => {
    const resultArray = []
    start = start * 1
    amount = amount * 1
    step = step * 1
    for (let i = start; i < start + amount * step; i += step) {
        resultArray.push(i)
    }
    return resultArray
}

// generate array numbers auto increment
let generateStringsAutoIncrement = (
    start = DEFAULT_START_AT,
    amount = DEFAULT_AMOUNT,
    step = DEFAULT_STEP_BY,
    options
) => {
    let { length, haveLower, haveUpper, haveNumeric } = options
    length = (length > 0) ? length : DEFAULT_STRING_LENGTH
    haveLower = haveLower == undefined ? true : haveLower
    haveUpper = haveUpper == undefined ? true : haveUpper
    haveNumeric = haveNumeric == undefined ? true : haveNumeric

    const resultArray = [start]
    let hookPoint = start

    let patternString = ''

    if (haveLower) patternString += LOWER_CHARACTER
    if (haveUpper) patternString += UPPER_CHARACTER
    if (haveNumeric) patternString += NUMERIC
    for (let i = 0; i < amount - 1; i++) {
        hookPoint = addUnitForString(hookPoint, patternString, step)
        resultArray.push(hookPoint)
    }
    return resultArray
}

// generate array of increment dates with step (milliseconds)
let generateDatesAutoIncrement = (
    startDate = DEFAULT_START_AT,
    amount = DEFAULT_AMOUNT,
    step = DEFAULT_STEP_BY
) => {
    startDate = new Date(startDate)
    let resultArray = [startDate]
    for (let i = 2; i <= amount; i++) {
        resultArray.push(
            new Date(startDate.getTime() + (i - 1) * step))
    }
    return resultArray
}

// generate array datas with template auto increment
let generateAutoIncrementDatasWithTemplate = (
    template, incrementPosition,
    start, amount, step = 1
) => {
    if (template && typeof (template) == 'object') {

        // div template to 3 part

        // generate 2 part first and last
        // genearte middle part is increment
        // join parts in old order

        // wrapper single data type in template
        if (template.type && template.type != 'template') {
            template = {
                type: 'template',
                options: { template: [template] }
            }
        }

        let templateForFirstArray = {
            type: 'template',
            options: { template: [] }
        }

        let templateForLastArray = {
            type: 'template',
            options: { template: [] }
        }

        // filter single data type not have in incremented position
        for (let i = 0; i < template.options.template.length; i++) {
            if (i < incrementPosition)
                templateForFirstArray.options.template
                    .push(template.options.template[i])
            else if (i > incrementPosition)
                templateForLastArray.options.template
                    .push(template.options.template[i])
        }

        let firstArray =
            generateArrayWithTemplate(templateForFirstArray, amount)
        let lastArray =
            generateArrayWithTemplate(templateForLastArray, amount)

        let incrementSector = template.options.template[incrementPosition]
        let incrementArray = []
        switch (incrementSector.type) {
            case 'number':
                incrementArray =
                    generateNumbersAutoIncrement(start, amount, step)
                break
            case 'string':
                let { options } = incrementSector
                incrementArray =
                    generateStringsAutoIncrement(start, amount, step, options)
                break
            case 'date':
                incrementArray =
                    generateDatesAutoIncrement(start, amount, step)
                break
            case 'set':
                incrementArray = incrementSector.options.set
                break
            case 'name':
            case 'address':
            case 'freedom':
            default:
                incrementArray = []
                break
        }

        let resultArray = incrementArray
            .map((incrementValue, index) =>
                firstArray[index] + (incrementValue || '') + lastArray[index]
            )
        return resultArray
    }
}


// generate datas with a input template
let generateArrayWithTemplate = (template, amount, unique = false) => {

    if (template && typeof (template) == 'object') {
        let resultRandom = ''
        let resultArray = []
        if (!unique || countCasesUnique(template) >= amount) {
            for (let i = 1; i <= amount; i++) {
                do {
                    resultRandom = randomWithTemplate(template)
                } while (resultArray.includes(resultRandom) && unique)
                resultArray.push(resultRandom)
            }
        }
        return resultArray

    } else { return [] }
}


// add unit for string
let addUnitForString = (inputString, patternString, amount) => {

    // convert string to decimal number
    let decNumber = convertStringToDecNumber(inputString, patternString)

    decNumber += amount * 1

    // convert decimal number to string
    // and padding start with lowest value of pattern string
    return convertDecNumberToString(decNumber, patternString)
        .padStart(inputString.length, patternString[0])
}

// convert decimal number to string following pattern string
let convertDecNumberToString = (inputNumber, patternString) => {
    let resultConvert = ''

    // get mapped array (base number of length of pattern string)
    let arrayMapping =
        convertDecNumberArrayToMappingArray(inputNumber, patternString)

    // mapping element in array with character in pattern string
    for (let i = 0; i < arrayMapping.length; i++)
        resultConvert += patternString[arrayMapping[i]]
    return resultConvert
}

// convert string to decimal number following pattern string
let convertStringToDecNumber = (inputString, patternString) => {

    // get mapped array from input string with pattern string
    let arrayMapping =
        mappingStringToArrayNumber(inputString, patternString)

    // filter value
    arrayMapping = arrayMapping.map(value => value < 0 ? 0 : value)

    let resultConvert = 0

    // convert to decimal number
    for (let i = 0; i < arrayMapping.length; i++) {
        resultConvert +=
            arrayMapping[i] *
            Math.pow(patternString.length, inputString.length - 1 - i)
    }
    return resultConvert
}

// mapping a string to array numbers following pattern string
let mappingStringToArrayNumber = (inputString, patternString) => {
    let resultMapping = []
    for (let i = 0; i < inputString.length; i++) {
        resultMapping.push(
            getIndexInString(inputString[i], patternString)
        )
    }
    return resultMapping
}

// coverrt decimal number array to mapping array
let convertDecNumberArrayToMappingArray = (decNumber, patternString) => {
    let arrayMapping = []

    // convert from decimal number to number base of length of pattern string
    do {
        arrayMapping.push(decNumber % patternString.length)
        decNumber = Math.floor(decNumber / patternString.length)
    } while (decNumber > 0)

    return arrayMapping.reverse()
}

// rerange following important level
let reorganizeReferenceFields = (schema) => {
    let allReferences = []

    // get all references and mount set name into
    for (fieldsSet of schema.fieldsSets) {
        if (fieldsSet.references) {
            allReferences.push(...(fieldsSet.references.map(reference => {
                reference.setName = fieldsSet.name
                return reference
            })))
        }
    }

    lengthReferencesOfFields = allReferences.map(reference => {
        reference.point = lengthReferencesOfField(
            reference.from, reference.setName, schema)
        return reference
    })

    return lengthReferencesOfFields.sort((a, b) => b.point - a.point)
}

// compute length of reference chain of field
let lengthReferencesOfField = (fieldName, setName, schema) => {
    let currentFieldsSet =
        getFieldsSetFromSetName(setName, schema)
    let allReferences =
        getAllReferencesOfField(fieldName, currentFieldsSet)

    if (fieldName && allReferences.length > 0) {
        let maxReferenceLength = 0
        for (reference of allReferences) {
            let toFieldsSet =
                getFieldsSetFromSetName(reference.to.setName, schema)
            let toFieldReference =
                getSymmetryReferences(reference, schema)[0]
            let referenceLength = 0

            if (toFieldsSet && toFieldReference) {
                let importantLevel = compareImportantLevelOfRefs(
                    reference, toFieldReference,
                    currentFieldsSet, toFieldsSet
                )

                if (importantLevel == IMPORTANT_LEVEL_REFERENCE.HIGHER) {
                    referenceLength = 1 +
                        lengthReferencesOfField(
                            toFieldReference.from,
                            toFieldsSet.name, schema
                        )
                } else if (importantLevel == IMPORTANT_LEVEL_REFERENCE.EQUAL)
                    referenceLength = 1
            } else {
                referenceLength = 1
            }
            if (referenceLength > maxReferenceLength)
                maxReferenceLength = referenceLength
        }
        return maxReferenceLength
    }

    return 0
}

// compare important level of 2 reference
let compareImportantLevelOfRefs = (stRef, ndRef, stFieldsSet, ndFieldsSet) => {

    if (!ndRef) return IMPORTANT_LEVEL_REFERENCE.HIGHER

    if (stRef.from != ndRef.to.field)
        return IMPORTANT_LEVEL_REFERENCE.UNRELATED

    let {
        from: stRefFieldName,
        relation: stRefRelation
    } = stRef

    let {
        from: ndRefFieldName,
        relation: ndRefRelation
    } = ndRef

    if (stRefRelation == 'One2Many' && ndRefRelation == 'Many2One') {
        return IMPORTANT_LEVEL_REFERENCE.HIGHER
    } else if (stRefRelation == 'Many2One' && ndRefRelation == 'One2Many') {
        return IMPORTANT_LEVEL_REFERENCE.LOWER
    } else if (stRefRelation == 'One2One' && ndRefRelation == 'One2One') {
        // get auto increment of both
        let stRefHaveAutoInc = isAutoIncrement(stRefFieldName, stFieldsSet)
        let ndRefHaveAutoInc = isAutoIncrement(ndRefFieldName, ndFieldsSet)

        if (stRefHaveAutoInc != ndRefHaveAutoInc) {
            return stRefHaveAutoInc
                ? IMPORTANT_LEVEL_REFERENCE.HIGHER
                : IMPORTANT_LEVEL_REFERENCE.LOWER
        } else {
            let stRefHavePrimaryKey =
                stFieldsSet.primaryKeys.includes(stRefFieldName)
            let ndRefHavePrimaryKey =
                ndFieldsSet.primaryKeys.includes(ndRefFieldName)
            if (stRefHavePrimaryKey != ndRefHavePrimaryKey) {
                return stRefHavePrimaryKey
                    ? IMPORTANT_LEVEL_REFERENCE.HIGHER
                    : IMPORTANT_LEVEL_REFERENCE.LOWER
            } else {
                return IMPORTANT_LEVEL_REFERENCE.EQUAL
            }
        }
    }
}

module.exports = {
    generateRawData,
    addUnitForString,
    compareImportantLevelOfRefs,
    IMPORTANT_LEVEL_REFERENCE
}