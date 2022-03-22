
// get index of field in fieldsSet
let getIndexOfField = (fieldName, { fields }) => {
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].name == fieldName)
            return i
    }
    return -1
}

// get index of fieldsSet in schema
let getIndexOfFieldsSet = (setName, { fieldsSets }) => {
    for (let i = 0; i < fieldsSets.length; i++) {
        if (fieldsSets[i].setName == setName) return i
    }
    return -1
}

// get all referencs of field
let getAllReferencesOfField = (fieldName, { references }) => {
    if (fieldName && references)
        return references.filter(reference =>
            reference.fromField == fieldName
        )
    else
        return []
}

// get fields set by set name in schema
let getFieldsSetFromSetName = (setName, { fieldsSets }) => {
    if (setName && fieldsSets) {
        let indexOfFieldsSet = getIndexOfFieldsSet(setName, { fieldsSets })
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
let isAutoIncrement = (fieldName, { autoIncrement }) => {
    if (!Array.isArray(autoIncrement)) return false
    return autoIncrement.some(field =>
        field.name == fieldName
    )
}

// check this field name is unique field
let isUnique = (fieldName, { unique }) => {
    if (!Array.isArray(unique)) return false
    return unique.some(name =>
        name == fieldName
    )
}

// get array symmerty references from a reference
let getSymmetryReference = (fromReference, schema) => {
    let {
        fromField,
        referenceTo: {
            toSetName,
            toField,
            relation: fromRelation
        }
    } = fromReference
    let toFieldsSet =
        getFieldsSetFromSetName(toSetName, schema)
    let allReferences =
        getAllReferencesOfField(toField, toFieldsSet)
    let toRelation = ''
    switch (fromRelation) {
        case 'One2Many':
            toRelation = 'Many2One'
            break
        case 'One2One':
            toRelation = 'One2One'
            break
        case 'Many2One':
            toRelation = 'One2Many'
            break
        default:
            break
    }
    return allReferences.filter(
        ({ referenceTo: { relation, toField } }) =>
            relation == toRelation && toField == fromField
    )
}

// get position a element in array
// not have return -1
let getIndexInArray = (element, array) => {
    let indexOfElement = -1
    array.forEach((v, i) => {
        if (element == v)
            indexOfElement = i
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
    getSymmetryReference,
    getIndexInArray,
    getIndexInString
}