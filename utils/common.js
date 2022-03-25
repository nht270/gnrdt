
// get index of field in fields set
let getIndexOfField = (fieldName, fieldsSet) => {
    let { fields } = fieldsSet
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].name == fieldName)
            return i
    }
    return -1
}

// get index of fieldsSet in schema
let getIndexOfFieldsSet = (setName, schema) => {
    let { fieldsSets } = schema
    for (let i = 0; i < fieldsSets.length; i++) {
        if (fieldsSets[i].name == setName)
            return i
    }
    return -1
}

// get all referencs of field
let getAllReferencesOfField = (fieldName, fieldsSet) => {
    let { references } = fieldsSet
    if (fieldName && references)
        return references.filter(reference =>
            reference.from == fieldName
        )
    else
        return []
}

// get fields set by set name in schema
let getFieldsSetFromSetName = (setName, schema) => {
    let { fieldsSets } = schema
    if (setName && fieldsSets) {
        let indexOfFieldsSet =
            getIndexOfFieldsSet(setName, schema)
        if (indexOfFieldsSet != -1) {
            return fieldsSets[indexOfFieldsSet]
        } else {
            return null
        }
    } else {
        return null
    }
}

// get field by name
let getFieldFromFieldName = (fieldName, setName, schema) => {
    let fieldsSet = getFieldsSetFromSetName(setName, schema)
    if (!fieldsSet) return null
    let fieldIndex = getIndexOfField(fieldName, fieldsSet)
    if (fieldIndex == -1) return null
    else return fieldsSet.fields[fieldIndex]
}

// check this field name is auto increment
let isAutoIncrement = (fieldName, fieldsSet) => {
    let { autoIncrements } = fieldsSet
    if (!Array.isArray(autoIncrements)) return false
    return autoIncrements.some(autoIncrement =>
        autoIncrement.fieldName == fieldName
    )
}

// check this field name is unique field
let isUnique = (fieldName, fieldsSet) => {
    let { uniques } = fieldsSet
    if (!Array.isArray(uniques)) return false
    return uniques.includes(fieldName)
}

// get array symmerty references from a reference
let getSymmetryReferences = (fromReference, schema) => {
    let { from, to, relation: fromRelation } =
        fromReference

    // get fields set and references
    // of referneced field
    let toFieldsSet =
        getFieldsSetFromSetName(to.setName, schema)
    let allReferences =
        getAllReferencesOfField(to.field, toFieldsSet)
    symmetryRelations = {
        One2Many: 'Many2One',
        One2One: 'One2One',
        Many2One: 'One2Many'
    }

    let toRelation = symmetryRelations[fromRelation]
    if (!toRelation) return []
    return allReferences.filter(
        ({ to, relation }) =>
            relation == toRelation &&
            to.field == from
    )
}

// get position a element in array
// not have return -1
let getIndexInArray = (element, array) => {
    let indexOfElement = -1
    array.forEach((item, index) => {
        if (element == item)
            indexOfElement = index
    })
    return indexOfElement
}

// get position a element in string
// not have return -1
let getIndexInString = (element, string) => {
    return getIndexInArray(element, string.split(''))
}

module.exports = {
    getIndexOfField,
    getIndexOfFieldsSet,
    getAllReferencesOfField,
    getFieldsSetFromSetName,
    getFieldFromFieldName,
    isAutoIncrement,
    isUnique,
    getSymmetryReferences,
    getIndexInArray,
    getIndexInString
}