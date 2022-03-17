// get index of field in fieldsSet
let getIndexOfField = (fieldName, fieldsSets) => {
    for (let i = 0; i < fieldsSets.fields.length; i++) {
        if (fieldsSets.fields[i].name == fieldName)
            return i
    }
    return -1
}

// get index of fieldsSet in schema
let getIndexOfFieldsSet = (setName, schema) => {
    for (let i = 0; i < schema.fieldsSets.length; i++) {
        if (schema.fieldsSets[i].setName == setName) return i
    }
    return -1
}

// get all referencs of field
let getAllReferencesOfField = (fieldName, fieldsSet) => {
    if (fieldName && fieldsSet && fieldsSet.references)
        return fieldsSet.references.filter(reference =>
            reference.fromField == fieldName
        )
    else
        return []
}

// get fields set by set name in schema
let getFieldsSetFromSetName = (setName, schema) => {
    if (setName && schema) {
        let indexOfFieldsSet = getIndexOfFieldsSet(setName, schema)
        if (indexOfFieldsSet != -1) {
            return schema.fieldsSets[indexOfFieldsSet]
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
    if (!fieldsSet) return false
    if (!fieldsSet.autoIncrement) return false
    return fieldsSet.autoIncrement.some(field =>
        field.name == fieldName
    )
}


// check this field name is unique field
let isUnique = (fieldName, fieldsSet) => {
    if (!fieldsSet) return false
    if (!fieldsSet.unique) return false
    return fieldsSet.unique.some(name =>
        name == fieldName
    )
}

// get array symmerty references from a reference
let getSymmetryReference = (fromReference, schema) => {
    let toFieldsSet =
        getFieldsSetFromSetName(fromReference.referenceTo.toSetName, schema)
    let allReferences =
        getAllReferencesOfField(fromReference.referenceTo.toField, toFieldsSet)
    let fromRelation = fromReference.referenceTo.relation
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
    return allReferences.filter(reference =>
        reference.referenceTo.relation == toRelation &&
        reference.referenceTo.toField == fromReference.fromField
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