let {
    getIndexOfField,
    getIndexOfFieldsSet,
    getAllReferencesOfField,
    getFieldsSetFromSetName,
    isAutoIncrement,
    getSymmetryReference,
    getIndexInString
} = require('./common')

let {
    isCorrectSchema,
    countCasesUnique,
} = require('./constraint')

let { randomWithTemplate, randomInASet } = require('./random')

// for data random
const { LOWER_CHARACTER, UPPER_CHARACTER, NUMERIC } = require('./random')

// for compare important level of reference field
const IMPORTANT_LEVEL_REFERENCE = {
    LOWER: -1,
    HIGHER: 1,
    EQUAL: 0,
    UNRELATED: 2
}

let generateRawData = (schema) => {

    // check is correct schema
    if (!isCorrectSchema(schema))
        return []
    // pre generate data by scheme

    let reorganizedReferenceFields = reorganizeReferenceFields(schema)
    let skipFields = reorganizedReferenceFields
        .filter(reference => reference.point == 0)
        .map(reference => (
            {
                'field': reference.fromField,
                'setName': reference.setName
            }
        ))

    let dataFieldsSets = schema.fieldsSets.map(fieldsSet => {
        let currentSkipFields = skipFields
            .filter(skip => skip.setName == fieldsSet.setName)
            .map(skip => skip.field)
        return preGenerateData(fieldsSet, currentSkipFields)
    })

    for (reference of reorganizedReferenceFields) {

        let toFieldsSet =
            getFieldsSetFromSetName(reference.referenceTo.toSetName, schema)
        let toFieldReference =
            getSymmetryReference(reference, schema)[0]
        let currentFieldsSet =
            getFieldsSetFromSetName(reference.setName, schema)
        let importantLevel = compareImportantLevelOfRefs(
            reference,
            toFieldReference,
            currentFieldsSet,
            toFieldsSet
        )

        if (importantLevel == IMPORTANT_LEVEL_REFERENCE.HIGHER ||
            importantLevel == IMPORTANT_LEVEL_REFERENCE.EQUAL) {

            let indexOfSourceFieldsSet =
                getIndexOfFieldsSet(reference.setName, schema)
            let indexOfDestinationFieldsSet =
                getIndexOfFieldsSet(reference.referenceTo.toSetName, schema)

            if (indexOfSourceFieldsSet != -1 && indexOfDestinationFieldsSet != -1) {
                let indexOfSourceField =
                    getIndexOfField(
                        reference.fromField,
                        getFieldsSetFromSetName(reference.setName, schema)
                    )
                let indexOfDestinationField =
                    getIndexOfField(reference.referenceTo.toField,
                        getFieldsSetFromSetName(reference.referenceTo.toSetName, schema)
                    )

                // get data from data pre generate
                // at index of reference field inportant
                let sourceArray = dataFieldsSets[indexOfSourceFieldsSet]
                    .map(dataLine => dataLine[indexOfSourceField])

                let destinationLenght = dataFieldsSets[indexOfDestinationFieldsSet].length
                let cloneAmount = destinationLenght
                let sourceLength = sourceArray.length
                let randomLoopStep = Math.ceil(cloneAmount / sourceLength)
                let destinationArray = []
                for (let i = 0; i < randomLoopStep; i++) {
                    destinationArray.push(...randomInASet(sourceArray, cloneAmount))
                    cloneAmount = cloneAmount - sourceLength
                }
                for (let i = 0; i < destinationLenght; i++) {
                    dataFieldsSets[indexOfDestinationFieldsSet][i][indexOfDestinationField] =
                        destinationArray[i]
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
let preGenerateData = (fieldsSet, skipFields) => {

    if (!skipFields) skipFields = []

    let preDatas = []

    // get reference columns items
    // and skip list skiped fields
    // let references = (fieldsSet.references || [])
    //     .filter(reference => skipFields.includes(reference.fromField))

    // find order of unique, auto increment fields
    // and skip list skiped fields
    const autoIncrementFileds = [...(fieldsSet.autoIncrement || [])]

    // except fields have been auto increment
    const uniqueFields = [...(fieldsSet.unique || [])]
        .filter(uniqueValue =>
            !autoIncrementFileds.some(autoIncrementValue =>
                autoIncrementValue.name == uniqueValue
            )
        )

    const preValues = {}
    autoIncrementFileds.forEach(autoIcrementField => {
        let indexOfField = getIndexOfField(autoIcrementField.name, fieldsSet)

        if (indexOfField != -1) {
            preValues[autoIcrementField.name] =
                generateDatasWithTemplateAutoIncrement(
                    fieldsSet.fields[indexOfField].datatype,
                    autoIcrementField.incrementPosition,
                    autoIcrementField.startAt,
                    fieldsSet.rowAmount,
                    autoIcrementField.step
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
            let valueInField = ''
            if (skipFields.includes(field.name)) {
                valuesInField.push(valueInField)
                continue
            }
            if (autoIncrementFileds.some(autoIcrementField =>
                autoIcrementField.name == field.name)
                || uniqueFields.some(uniqueField =>
                    uniqueField == field.name)
            ) {
                valueInField = preValues[field.name][i]
            } else {
                valueInField = randomWithTemplate(field.datatype)
            }
            // add ' ' with fields have data type is string
            valuesInField.push(
                field.datatype.type == 'number'
                    ? valueInField
                    : `'${valueInField}'`
            )
        }
        preDatas.push(valuesInField)
    }

    return preDatas
}

// generate array numbers auto increment
let generateNumbersAutoIncrement = (start, amount, step = 1) => {
    const resultArray = []
    for (let i = start; i < start + amount * step; i += step) {
        resultArray.push(i)
    }
    return resultArray
}

// generate array numbers auto increment
let generateStringsAutoIncrement = (
    start, amount, step = 1,
    { size, haveLower, haveUpper, haveNumberic }
) => {
    size = (size <= 0 || size == undefined)
        ? DEFAULT_STRING_LENGTH : size
    haveLower = haveLower == undefined ? true : haveLower
    haveUpper = haveUpper == undefined ? true : haveUpper
    haveNumberic = haveNumberic == undefined ? true : haveNumberic

    const resultArray = [start]
    let hookPoint = start

    let patternString = ''

    if (haveLower) patternString += LOWER_CHARACTER
    if (haveUpper) patternString += UPPER_CHARACTER
    if (haveNumberic) patternString += NUMERIC
    for (let i = 0; i < amount - 1; i++) {
        hookPoint = addUnitForString(hookPoint, patternString, step)
        resultArray.push(hookPoint)
    }
    return resultArray
}

// generate array of increment dates with step (milliseconds)
let generateDatesAutoIncrement = (startDate, amount, step) => {
    startDate = new Date(startDate)
    let resultArray = [startDate]
    for (let i = 2; i <= amount; i++) {
        resultArray.push(new Date(startDate.getTime() + (i - 1) * step))
    }
    return resultArray
}

// generate array datas with template auto increment
let generateDatasWithTemplateAutoIncrement =
    (template, incrementPosition, start, amount, step = 1) => {
        if (template && typeof (template) == 'object') {

            // div template to 3 part

            // generate 2 part first and last
            // genearte middle part is increment
            // join parts in old order

            // wrapper single data type in template
            if (template.type && template.type != 'template') {
                template = {
                    'type': 'template',
                    'options': {
                        'template': [template]
                    }
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

            let firstArray = generateArrayWithTemplate(templateForFirstArray, amount)
            let lastArray = generateArrayWithTemplate(templateForLastArray, amount)

            let incrementSector = template.options.template[incrementPosition]
            let incrementArray = []
            switch (incrementSector.type) {
                case 'number':
                    incrementArray = generateNumbersAutoIncrement(start, amount, step)
                    break
                case 'string':
                    let { options } = incrementSector
                    incrementArray = generateStringsAutoIncrement(start, amount, step, options)
                    break
                case 'date':
                    incrementArray = generateDatesAutoIncrement(start, amount, step)
                    break
                case 'set':
                    incrementArray = incrementSector.options.set
                    break
                case 'name':
                case 'address':
                case 'freedom':
                default:
                    break
            }

            let resultArray = incrementArray
                .map((incrementValue, index) =>
                    firstArray[index] + incrementValue + lastArray[index]
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

    decNumber += amount

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
    arrayMapping = arrayMapping.map(v => v < 0 ? 0 : v)

    let resultConvert = 0

    // convert to decimal number
    for (let i = 0; i < arrayMapping.length; i++) {
        resultConvert += arrayMapping[i]
            * Math.pow(patternString.length, inputString.length - 1 - i)
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
    for (fieldsSet of schema.fieldsSets) {
        if (fieldsSet.references) {
            allReferences.push(...(fieldsSet.references.map(reference => {
                reference.setName = fieldsSet.setName
                return reference
            })))
        }
    }

    lengthReferencesOfFields = allReferences.map(reference => {
        reference.point = lengthReferencesOfField(
            reference.fromField, reference.setName, schema)
        return reference
    })

    return lengthReferencesOfFields.sort((a, b) => b.point - a.point)
}

// compute length of reference chain of field
let lengthReferencesOfField = (fieldName, setName, schema) => {
    let currentFieldsSet = getFieldsSetFromSetName(setName, schema)
    let allReferences = getAllReferencesOfField(fieldName, currentFieldsSet)

    if (fieldName && allReferences.length > 0) {
        let maxReferenceLength = 0
        for (reference of allReferences) {
            let toFieldsSet =
                getFieldsSetFromSetName(reference.referenceTo.toSetName, schema)
            let toFieldReference = getSymmetryReference(reference, schema)[0]
            let referenceLength = 0

            if (toFieldsSet && toFieldReference) {
                let importantLevel = compareImportantLevelOfRefs(
                    reference,
                    toFieldReference,
                    currentFieldsSet,
                    toFieldsSet
                )
                if (importantLevel == IMPORTANT_LEVEL_REFERENCE.HIGHER) {
                    referenceLength = 1 +
                        lengthReferencesOfField(
                            toFieldReference.fromField,
                            toFieldsSet.setName,
                            schema
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

    if (stRef.fromField != ndRef.referenceTo.toField)
        return IMPORTANT_LEVEL_REFERENCE.UNRELATED

    let stRefRelation = stRef.referenceTo.relation
    let ndRefRelation = ndRef.referenceTo.relation

    if (stRefRelation == 'One2Many' && ndRefRelation == 'Many2One') {
        return IMPORTANT_LEVEL_REFERENCE.HIGHER
    } else if (stRefRelation == 'Many2One' && ndRefRelation == 'One2Many') {
        return IMPORTANT_LEVEL_REFERENCE.LOWER
    } else if (stRefRelation == 'One2One' && ndRefRelation == 'One2One') {
        // get auto increment of both
        let stRefHaveAutoInc = isAutoIncrement(stRef.fromField, stFieldsSet)
        let ndRefHaveAutoInc = isAutoIncrement(ndRef.fromField, ndFieldsSet)

        if (stRefHaveAutoInc && !ndRefHaveAutoInc) {
            return IMPORTANT_LEVEL_REFERENCE.HIGHER
        } else if (!stRefHaveAutoInc && ndRefHaveAutoInc) {
            return IMPORTANT_LEVEL_REFERENCE.LOWER
        } else {
            let stRefHavePrimaryKey =
                stFieldsSet.primaryKeys.includes(stRef.fromField)
            let ndRefHavePrimaryKey =
                ndFieldsSet.primaryKeys.includes(ndRef.fromField)
            if (stRefHavePrimaryKey && !ndRefHavePrimaryKey) {
                return IMPORTANT_LEVEL_REFERENCE.HIGHER
            } else if (!stRefHavePrimaryKey && ndRefHavePrimaryKey) {
                return IMPORTANT_LEVEL_REFERENCE.LOWER
            } else {
                return IMPORTANT_LEVEL_REFERENCE.EQUAL
            }
        }
    }
}

module.exports = { generateRawData }