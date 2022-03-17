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
let randomFloatNumber = (min, max) => {
    min = min == undefined ? DEFAULT_MIN_NUMBER : min
    max = max == undefined ? DEFAULT_MAX_NUMBER : max
    return Math.random() * (max + 1 - min) + min
}

// random integer number
let randomIntegerNumber = (min, max) => {
    min = min == undefined ? DEFAULT_MIN_NUMBER : min
    max = max == undefined ? DEFAULT_MAX_NUMBER : max
    return Math.floor(randomFloatNumber(min, max))
}

// random number (general type)
let randomNumber = (min, max, isInt) => {
    min = min == undefined ? DEFAULT_MIN_NUMBER : min
    max = max == undefined ? DEFAULT_MAX_NUMBER : max
    isInt = isInt || false
    return (isInt
        ? randomIntegerNumber(min, max)
        : randomFloatNumber(min, max))
}

// random chain (general type)
let randomString = (size, haveLower, haveUpper, haveNumberic) => {

    size = (size <= 0 || size == undefined)
        ? DEFAULT_STRING_LENGTH : size
    haveLower = haveLower == undefined ? true : haveLower
    haveUpper = haveUpper == undefined ? true : haveUpper
    haveNumberic = haveNumberic == undefined ? true : haveNumberic

    // charater types selected
    let patternString = ''

    let randomString = ''

    if (haveLower) patternString += LOWER_CHARACTER
    if (haveUpper) patternString += UPPER_CHARACTER
    if (haveNumberic) patternString += NUMERIC

    if (patternString == '')
        return patternString
    else {
        for (let i = 1; i <= size; i++) {
            randomString += patternString[
                Math.floor(Math.random() * patternString.length)
            ];
        }
        return randomString
    }
}

// random number chain (include character 0 at first)
let randomNumberString = (size, isFloat) => {

    size = size == undefined ? DEFAULT_STRING_LENGTH : size
    isFloat = isFloat == undefined ? false : isFloat

    let randomResult = randomString(size, false, false, true)

    // if don't have floating-point number
    if (size < 0 || (isFloat && size < 3)) return ''

    if (isFloat) {
        let positionFloatPoint = randomIntegerNumber(1, size - 2)
        randomResult = randomResult.substr(0, positionFloatPoint) +
            '.' + randomResult.substr(positionFloatPoint + 1)
    }
    return randomResult
}

// random date
let randomDate = (minDate, maxDate) => {

    // handle when input not is date type
    minDate = new Date(minDate)
    maxDate = new Date(maxDate)

    // get milliseconds to random to number
    // and convert to date
    let maxTime = maxDate.getTime()
    let minTime = minDate.getTime()
    let randomTime = Math.floor(
        Math.random() * (maxTime + 1 - minTime) + minTime
    );
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
        require(NAME_JSON_PATH);

    let lastName = lastNames[randomIntegerNumber(0, lastNames.length - 1)]
    let middleName = ''

    // avoid last name equal first word of middle name
    do {
        middleName = womenMiddleNames[randomIntegerNumber(0, womenMiddleNames.length - 1)]

    } while (lastName == middleName.split(' ')[0])

    let firstName = womenFirstNames[randomIntegerNumber(0, womenFirstNames.length - 1)]

    return lastName + ' ' + middleName + ' ' + firstName
}

// random name for men
let randomMenName = () => {

    let { lastNames, menFirstNames, menMiddleNames }
        = require(NAME_JSON_PATH);

    let lastName = lastNames[randomIntegerNumber(0, lastNames.length - 1)]

    let middleName = ''

    // avoid last name equal first word of middle name
    do {
        middleName = menMiddleNames[randomIntegerNumber(0, menMiddleNames.length - 1)]
    } while (lastName == middleName.split(' ')[0])

    let firstName = menFirstNames[randomIntegerNumber(0, menFirstNames.length - 1)]

    return lastName + ' ' + middleName + ' ' + firstName
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

    let apartmentNumber = randomIntegerNumber(1, MAX_APARTMENT_NUMBER);

    let street = streets[randomIntegerNumber(0, streets.length - 1)]

    let province = provinces[randomIntegerNumber(0, provinces.length - 1)]

    let provinceName = province.name;

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
        } while (selectedIndexes.some(index => index == randomIndex))
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

    if (template && typeof (template) == 'object') {
        if (!Array.isArray(template)) template = [template]
        for (simpleType of template) {
            switch (simpleType.type) {
                case 'number':
                    randomResult += randomNumber(
                        simpleType.options.min,
                        simpleType.options.max,
                        simpleType.options.isInt
                    )
                    break
                case 'string':
                    randomResult += randomString(
                        simpleType.options.size,
                        simpleType.options.haveLower,
                        simpleType.options.haveUpper,
                        simpleType.options.haveNumberic
                    )
                    break
                case 'date':
                    randomResult += randomDate(
                        simpleType.options.minDate,
                        simpleType.options.maxDate
                    )
                    break
                case 'name':
                    randomResult += randomName(simpleType.options.isMale)
                    break
                case 'address':
                    randomResult += randomAddress()
                    break
                case 'set':
                    randomResult += randomOneInASet(simpleType.options.set)
                    break
                case 'freedom':
                    randomResult += simpleType.options.value
                    break
                case 'template':
                    randomResult += randomWithTemplate(simpleType.options.template)
                    break
                default:
                    break
            }
        }
    }
    return randomResult
}

module.exports = {
    randomWithTemplate,
    randomInASet,
    DEFAULT_STRING_LENGTH,
    LOWER_CHARACTER,
    UPPER_CHARACTER,
    NUMERIC
}