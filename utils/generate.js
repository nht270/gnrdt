const MIN_NUMBER = -5000000
const MAX_NUMBER = +10000000
const DEFAULT_STRING_LENGTH = 30

// random so thuc
let randomFloatNumber = (min = MIN_NUMBER, max = MAX_NUMBER) =>
    Math.random() * (max + 1 - min) + min

// random so nguyen
let randomIntegerNumber = (min = MIN_NUMBER, max = MAX_NUMBER) =>
    Math.floor(randomFloatNumber(min, max))

let randomNumber = (min = MIN_NUMBER, max = MAX_NUMBER, isInt = false) =>
    isInt ? randomIntegerNumber(min, max) : randomFloatNumber(min, max)

// random chuoi
let randomString = (size = DEFAULT_STRING_LENGTH, haveLower = true,
    haveUpper = true, haveNumberic = true) => {
    const LOWER_CHARACTER = 'abcdefghijklmnopqrstuvwxyz'
    const UPPER_CHARACTER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const NUMERIC = '123456789'

    let patternString = ''
    let newString = ''

    if (haveLower) patternString += LOWER_CHARACTER
    if (haveUpper) patternString += UPPER_CHARACTER
    if (haveNumberic) patternString += NUMERIC

    if (patternString == '')
        return patternString
    else {
        for (let i = 1; i <= size; i++) {
            newString +=
                patternString[Math.floor(Math.random() * patternString.length)];
        }
        return newString
    }
}

// random chuoi so
let randomNumberString = (size = DEFAULT_STRING_LENGTH, isFloat = false) => {
    let randomResult = randomString(size, false, false, true)
    if (size < 0 || (isFloat && size < 3)) return ''
    if (isFloat) {
        let positionForDot = randomIntegerNumber(1, size - 2)
        randomResult = randomResult.substr(0, positionForDot) + '.' +
            randomResult.substr(positionForDot + 1)
    }
    return randomResult
}

// random date
let randomDate = (minDate, maxDate) => {
    let maxTime = maxDate.getTime()
    let minTime = minDate.getTime()
    let randomTime = Math.floor(Math.random() * (maxTime + 1 - minTime) + minTime);
    return new Date(randomTime)
}

let randomOnlyDate = (minDate, maxDate) => {
    // phan con lai cua ngay (phan gio, phut giay)
    let dateTime = randomDate(minDate, maxDate).getTime()
    let restOfDate = dateTime % (24 * 60 * 60 * 1000)
    return new Date(dateTime - restOfDate)
}

// loai bo cac phan tu trung trong mang
function filter(array) {
    if (!Array.isArray(array)) return array
    let tempArray = [];
    for (item of array) {
        if (!tempArray.some(value => value == item)) {
            tempArray.push(item);
        }
    }
    return tempArray
}

// random ten cho nu
let randomNameForWomen = () => {

    let {
        lastNames,
        firstNamesForWomen,
        middleNamesForWomen }
        = require('./name.json');
    let lastName = lastNames[
        randomIntegerNumber(0, lastNames.length - 1)
    ]

    let middleNameForWomen = ''
    do {

        middleNameForWomen = middleNamesForWomen[
            randomIntegerNumber(0, middleNamesForWomen.length - 1)
        ]

    } while (lastName == middleNameForWomen.split(' ')[0])

    let firstNameForWomen = firstNamesForWomen[
        randomIntegerNumber(0, firstNamesForWomen.length - 1)
    ]

    return lastName + ' ' + middleNameForWomen + ' ' + firstNameForWomen
}
// random ten cho nam
let randomNameForMen = () => {

    let {
        lastNames,
        firstNamesForMen,
        middleNamesForMen }
        = require('./name.json');
    let lastName = lastNames[
        randomIntegerNumber(0, lastNames.length - 1)
    ]

    let middleNameForMen = ''
    do {

        middleNameForMen = middleNamesForMen[
            randomIntegerNumber(0, middleNamesForMen.length - 1)
        ]

    } while (lastName == middleNameForMen.split(' ')[0])

    let firstNameForMen = firstNamesForMen[
        randomIntegerNumber(0, firstNamesForMen.length - 1)
    ]

    return lastName + ' ' + middleNameForMen + ' ' + firstNameForMen
}

// random ten
let randomName = (isMale = null) => {
    return Math.random() > 0.5
        ? randomNameForMen()
        : randomNameForWomen()
}

// random dia chi
let randomAddress = () => {
    let { streets, provinces } = require('./address.json')

    let apartmentNumber = randomIntegerNumber(1, 2000);
    let street = streets[
        randomIntegerNumber(0, streets.length - 1)
    ]

    let province = provinces[
        randomIntegerNumber(0, provinces.length - 1)
    ]

    let provinceName = province.name;
    let districtName = province.districts[
        randomIntegerNumber(0, province.districts.length - 1)
    ]

    return `${apartmentNumber} ${street}, ${districtName}, ${provinceName}`
}


// random 1 tap con tu 1 tap
let randomInASet = (set, quality) => {
    if (!Array.isArray(set) || quality > set.length) return [set]

    const tempSet = []
    const selectedIndexes = []
    let randomIndex = 0;
    for (let i = 1; i <= quality; i++) {
        do {
            randomIndex = randomIntegerNumber(0, set.length - 1)
        } while (selectedIndexes.some(value => value == randomIndex))
        selectedIndexes.push(randomIndex)
        tempSet.push(set[randomIndex])
    }
    return tempSet
}


// random 1 phan tu tu 1 tap
let randomOneInASet = (set) => randomInASet(set, 1)[0]

// random theo mau
/**
 * gom 1 mang cac object
 * moi oject chua 1 kieu random
 * hien tai co:
 * number (thuoc tinh: min, max, isInt)
 * string (thuoc tinh: size, haveLower, haveUpper, haveNumeric)
 * date (thuoc tinh: minDate, maxDate)
 * name (khong co thuoc tinh)
 * address (khong co thuoc tinh)
 * set (thuoc tinh: set)
 * freedom (thuoc tinh: value)
 */

let randomWithTemplate = (template) => {
    // kiem tra template dau vao
    let randomResult = ''
    if (template && typeof (template) == 'object') {
        if (!Array.isArray(template)) template = [template]
        for (simpleType of template) {
            switch (simpleType.type) {
                case 'number':
                    randomResult += randomNumber(simpleType.min,
                        simpleType.max, simpleType.isInt)
                    break
                case 'string':
                    randomResult += randomString(simpleType.size,
                        simpleType.haveLower, simpleType.haveUpper,
                        simpleType.haveNumberic)
                    break
                case 'date':
                    randomResult += randomDate(simpleType.minDate, simpleType.maxDate)
                    break
                case 'name':
                    randomResult += randomName()
                    break
                case 'address':
                    randomResult += randomAddress()
                    break
                case 'set':
                    randomResult += randomOneInASet(simpleType.set)
                    break
                case 'freedom':
                    randomResult += simpleType.value
                    break
                case 'template':
                    randomResult += randomWithTemplate(simpleType.template)
                    break
                default:
                    break
            }
        }

    }
    return randomResult
}

/**
 * 
 * @param {*} schema 
 * included:
 * tableName
 * fields and datatypes
 * primary key
 * @param {*} countRow 
 */

// tao code sql tu schema va countRow (so dong)
let generateSqlCode = (schema, countRow) => {

    let sqlCode = createSqlTableCode(schema)
    sqlCode += generateSqlFiledsCode(schema, countRow)
    return sqlCode
}

// tao code sql insert gia tri tu schema va countRow
let generateSqlFiledsCode = (schema, countRow) => {
    let sqlInsertFiledsCode = `INSERT INTO '${schema.tableName}'
    (${schema.fields.map(field => field.name).join(', ')}) VALUES\n`
    let rows = []

    // gia tri unique/auto increment tao truoc
    const preValues = {}

    for (let i = 1; i <= countRow; i++) {
        let valuesInField = []
        for (field of schema.fields) {
            valuesInField.push(randomWithTemplate(field.datatype))
        }
        rows.push(`(${valuesInField.join(', ')})`)
    }

    return sqlInsertFiledsCode + rows.join(',\n') + ';\n'
}

// tao code tao bang tu schema
let createSqlTableCode = (schema) => {
    let sqlTableCode =
        `CREATE TABLE IF NOT EXISTS '${schema.tableName}' (`
    for (field of schema.fields) {
        sqlTableCode += `\n\t${field.name}`
        switch (field.datatype.type) {
            case 'number':
                sqlTableCode += ` ${field.datatype.isInt ? 'int' : 'float'}, `
                break
            case 'name':
            case 'address':
            case 'set':
            case 'freedom':
            case 'string':
                sqlTableCode += ` varchar(${field.datatype.size || DEFAULT_STRING_LENGTH}), `
                break
            case 'date':
                sqlTableCode += ` datetime, `
                break
            default:
                break
        }
    }
    if (schema.primaryKeys) {
        sqlTableCode += `\n\tPRIMARY KEY (${schema.primaryKeys.reduce((t, v) => t += ', ' + v)})`
    }
    sqlTableCode = sqlTableCode.replace(/, $/, '');
    sqlTableCode += '\n);\n'
    return sqlTableCode
}

// pimary key
// auto increment
// unique

// tao mang number unique
let createNumbersUnique = (min, max, amount) => {
    if (amount > max - min + 1)
        throw `Don't create array numbers integer have ${amount} elements in [${min}, ${max}]`
    const resultArray = []
    let resultRandom
    for (let i = 1; i <= amount; i++) {
        do {
            resultRandom = randomIntegerNumber(min, max)
        } while (resultArray.some(v => v == resultRandom))
        resultArray.push(resultRandom)
    }
    return resultArray
}

// tao mang number auto increment
let createNumbersAutoIncrement = (start, amount) => {
    const resultArray = []
    for (let i = start; i < start + amount; i++) {
        resultArray.push(i)
    }
    return resultArray
}

// tao mang string unique
let createStringsUnique =
    (
        size = DEFAULT_STRING_LENGTH,
        haveLower = true,
        haveUpper = true,
        haveNumberic = true,
        amount
    ) => {
        const LOWER_CHARACTER = 'abcdefghijklmnopqrstuvwxyz'
        const UPPER_CHARACTER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const NUMERIC = '123456789'

        let patternString = ''

        if (haveLower) patternString += LOWER_CHARACTER
        if (haveUpper) patternString += UPPER_CHARACTER
        if (haveNumberic) patternString += NUMERIC
        if (patternString == '' || amount == 0 || size <= 0) return []
        if (amount > Math.pow(patternString.length, size))
            throw `Don't create array strings have ${amount} elements
        with length is ${size} by ${patternString.length} charaters`
        const resultArray = []
        let resultRandom
        for (let i = 1; i <= amount; i++) {
            do {
                resultRandom = randomString(size, haveLower, haveUpper, haveNumberic)
            } while (resultArray.some(v => v == resultRandom))
            resultArray.push(resultRandom)
        }
        return resultArray
    }

module.exports = generateSqlCode