// for random data
const DEFAULT_MIN_NUMBER = -5000000
const DEFAULT_MAX_NUMBER = +10000000
const DEFAULT_STRING_LENGTH = 30
const LOWER_CHARACTER = 'abcdefghijklmnopqrstuvwxyz'
const UPPER_CHARACTER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMERIC = '0123456789'
const MAX_APARTMENT_NUMBER = 2000
const NAME_JSON_PATH = '../resource/json/name.json'
const ADDRESS_JSON_PATH = '../resource/json/address.json'

// random float number
let randomFloatNumber = (
    min = DEFAULT_MIN_NUMBER,
    max = DEFAULT_MAX_NUMBER
) => {
    // convert to number if min, max is string
    min = min * 1
    max = max * 1
    return Math.random() * (max - min) + min
}

// random integer number
let randomIntegerNumber = (min, max) => {
    return Math.round(randomFloatNumber(min, max))
}

// random number (general type)
let randomNumber = (min, max, isInt = false) => {
    return (isInt
        ? randomIntegerNumber(min, max)
        : randomFloatNumber(min, max))
}

// random chain (general type)
let randomString = (
    length = DEFAULT_STRING_LENGTH,
    haveLower = true,
    haveUpper = true,
    haveNumeric = true
) => {

    // if length <= 0, set it by 1
    if (length <= 0) length = 1

    // charater types selected
    let patternString = ''
    let randomResult = ''

    if (haveLower) patternString += LOWER_CHARACTER
    if (haveUpper) patternString += UPPER_CHARACTER
    if (haveNumeric) patternString += NUMERIC

    if (patternString == '')
        return ''
    else {
        for (let i = 1; i <= length; i++) {
            randomResult +=
                patternString[randomNumber(0, length - 1, true)];
        }
        return randomResult
    }
}

// random number chain (include character 0 at first)
let randomNumberString = (
    length = DEFAULT_STRING_LENGTH,
    isFloat = false
) => {

    let randomResult = randomString(length, false, false, true)

    // if don't have floating-point number
    if (length < 0 || (isFloat && length < 3)) return ''

    if (isFloat) {
        let positionFloatPoint = randomIntegerNumber(1, size - 2)
        randomResult =
            randomResult.substr(0, positionFloatPoint) +
            '.' + randomResult.substr(positionFloatPoint + 1)
    }
    return randomResult
}

// random date
let randomDate = (minDate, maxDate) => {

    // handle when input not is date type
    minDate = new Date(minDate)
    maxDate = new Date(maxDate)

    // get milliseconds to number random
    // and convert to date
    let minTime = minDate.getTime()
    let maxTime = maxDate.getTime()
    let randomTime =
        Math.floor(randomNumber(minTime, maxTime, true))
    return new Date(randomTime)
}

// random date (whitout hour)
let randomOnlyDate = (minDate, maxDate) => {
    let dateTime = randomDate(minDate, maxDate).getTime()
    let restOfDate = dateTime % (24 * 60 * 60 * 1000)
    return new Date(dateTime - restOfDate)
}

// random name for women
let randomWomenName = () => {

    let { lastNames, womenFirstNames, womenMiddleNames } =
        require(NAME_JSON_PATH)

    let lastName =
        lastNames[randomIntegerNumber(0, lastNames.length - 1)]

    let middleName = ''
    do {
        middleName =
            womenMiddleNames[randomIntegerNumber(0, womenMiddleNames.length - 1)]

        // avoid last name equal first word of middle name
    } while (lastName == middleName.split(' ')[0])

    let firstName =
        womenFirstNames[randomIntegerNumber(0, womenFirstNames.length - 1)]

    return `${lastName} ${middleName} ${firstName}`
}

// random name for men
let randomMenName = () => {

    let { lastNames, menFirstNames, menMiddleNames }
        = require(NAME_JSON_PATH);

    let lastName =
        lastNames[randomIntegerNumber(0, lastNames.length - 1)]

    let middleName = ''

    do {
        middleName =
            menMiddleNames[randomIntegerNumber(0, menMiddleNames.length - 1)]

        // avoid last name equal first word of middle name
    } while (lastName == middleName.split(' ')[0])

    let firstName =
        menFirstNames[randomIntegerNumber(0, menFirstNames.length - 1)]

    return `${lastName} ${middleName} ${firstName}`
}

// random name (general type)
let randomName = (isMale) => {
    if (isMale == true)
        return randomMenName()
    else if (isMale == false)
        return randomWomenName()
    else
        return (Math.random() > 0.5
            ? randomMenName()
            : randomWomenName())
}

// random address
let randomAddress = () => {
    let { streets, provinces } = require(ADDRESS_JSON_PATH)

    let apartmentNumber =
        randomIntegerNumber(1, MAX_APARTMENT_NUMBER)

    let street =
        streets[randomIntegerNumber(0, streets.length - 1)]

    let province =
        provinces[randomIntegerNumber(0, provinces.length - 1)]

    let provinceName = province.name

    let districtName =
        province.districts[randomIntegerNumber(0, province.districts.length - 1)]

    return `${apartmentNumber} ${street}, ${districtName}, ${provinceName}`
}

// random a subset from a set
let randomInASet = (set, amount) => {

    if (!Array.isArray(set))
        return []
    else if (amount > set.length)
        amount = set.length

    const subSet = []
    const selectedIndexes = []
    let randomIndex = 0;
    for (let i = 1; i <= amount; i++) {
        do {
            randomIndex = randomIntegerNumber(0, set.length - 1)
        } while (selectedIndexes.includes(randomIndex))
        selectedIndexes.push(randomIndex)
        subSet.push(set[randomIndex])
    }
    return subSet
}

// random a element from a set
let randomOneInASet = set => randomInASet(set, 1)[0]

/**
 * It does random follow template.
 * Include a array of objects each object as type to random
 * Currently have:
 * number [properties: min, max, isInt]
 * string [properties: size, haveLower, haveUpper, haveNumeric]
 * date [properties: minDate, maxDate]
 * name [properties: isMale]
 * address [not property]
 * set [properties: set]
 * freedom (properties: value)
 */

let randomWithTemplate = (template) => {

    let randomResult = ''

    if (template) {
        if (!Array.isArray(template))
            template = [template]

        for (simpleType of template) {
            let { type, options } = simpleType
            switch (type) {
                case 'number':
                    let { min, max, isInt } = options
                    randomResult += randomNumber(min, max, isInt)
                    break
                case 'string':
                    let { length, haveLower, haveUpper, haveNumeric } = options
                    randomResult +=
                        randomString(length, haveLower, haveUpper, haveNumeric)
                    break
                case 'date':
                    let { minDate, maxDate } = options
                    randomResult += randomDate(minDate, maxDate)
                    break
                case 'name':
                    randomResult += randomName(options.isMale)
                    break
                case 'address':
                    randomResult += randomAddress()
                    break
                case 'set':
                    randomResult += randomOneInASet(options.set)
                    break
                case 'freedom':
                    randomResult += options.value
                    break
                case 'template':
                    randomResult += randomWithTemplate(options.template)
                    break
                default:
                    break
            }
        }
    }
    return randomResult
}


// random for file name
let randomFileName = (length, extension) => {
    return `${Date.now()}${randomString(length)}.${extension}`
}

module.exports = {
    randomWithTemplate,
    randomInASet,
    randomFileName,
    DEFAULT_STRING_LENGTH,
    DEFAULT_MIN_NUMBER,
    DEFAULT_MAX_NUMBER,
    LOWER_CHARACTER,
    UPPER_CHARACTER,
    NUMERIC,
    NAME_JSON_PATH,
    ADDRESS_JSON_PATH
}