let addfields = (btnAdd) => {
    let countFields = btnAdd.previousElementSibling.value
    let tblDocInfo = btnAdd
        .parentElement
        .parentElement
        .nextElementSibling
    for (let i = 1; i <= countFields; i++) {
        let appendField = document.createElement('div')
        appendField.classList.add('row')
        appendField.style.marginTop = '10px'
        appendField.innerHTML = `
            <div class="col-2">
                <input type="text" name="fieldName" placeholder="Field name" style="width: 150px;">
            </div>
            <div class="col-2">
                <select name="dataType" onchange="changeOptionForSelect(this)">
                    <option value="number">Number</option>
                    <option value="string">String</option>
                    <option value="date">Date</option>
                    <option value="name">Name</option>
                    <option value="address">Address</option>
                    <option value="set">Set</option>
                    <option value="freedom">Freedom</option>
                    <option value="template">Template</option>
                </select>
            </div>
            <div class="col-4 crollable-x">
                <input type="checkbox" class="space-x" name="primaryKey" value="primaryKey"> Primary key
                <input type="checkbox" class="space-x" name="autoIncrement" value="autoIncrement"
                    onclick="onTurnAutoIncrement(this)"> Auto increment
                <input type="checkbox" class="space-x" name="unique" value="unique"> Unique
            </div>
            <div class="col-4 crollable-x">
                <input type="text" class="space-x" name="min" style="width: 70px;" placeholder="Min">
                <input type="text" class="space-x" name="max" style="width: 70px;" placeholder="Max">
                <input type="checkbox" class="space-x" name="isInt"> Is integer
            </div>
        `
        tblDocInfo.appendChild(appendField)
    }
}

let changeOptionForSelect = (select) => {
    let selectedValue = select.value

    let optionForDataType = {
        'number': `
            <input type="text" class="space-x" name="min" style="width: 70px;" placeholder="Min">
            <input type="text" class="space-x" name="max" style="width: 70px;" placeholder="Max">
            <input type="checkbox" class="space-x" name="isInt"> Is integer
            `,
        'string': `
            <input type="text" class="space-x" name="lenght" style="width: 70px;" placeholder="Lenght">
            <input type="checkbox" class="space-x" name="haveLower" checked> Have lower charater
            <input type="checkbox" class="space-x" name="haveUpper"> Have upper charater
            <input type="checkbox" class="space-x" name="haveNumeric"> Have numeric
            `,
        'date': `
            From <input type="date" class="space-x" name="minDate" style="width: 150px;">
            to <input type="date" class="space-x" name="maxDate" style="width: 150px;">
            `,
        'name': `
            <input type="checkbox" class="space-x" name="isMale" checked> Male
            <input type="checkbox" class="space-x" name="isFemale"> Female
            `,
        'address': `Not more options`,
        'set': `
            <textarea name="set" rows="1" cols="40" placeholder="Enter set of values separate by comma"></textarea>
            `,
        'freedom': `
            Fixed value: <input type="text" name="value">
            `,
        'template': `Not yet implement! :)))`
    }

    select
        .parentElement
        .nextElementSibling
        .nextElementSibling
        .innerHTML =
        optionForDataType[selectedValue]
}

let generateBtn = document.querySelector('#generateBtn')
generateBtn.addEventListener('click', () => {

    // get database name
    let databaseName = document.querySelector('input[name="databaseName"]').value

    // get database type
    let dataTypeRads = [...document.querySelectorAll('#database-type input')]
    let databaseType = dataTypeRads.filter(rad => rad.checked)[0].value

    // get fields sets of database
    let fieldsSetsWrapper = [...document.querySelectorAll('.sub-wrapper')]
    const fieldsSets = []

    fieldsSetsWrapper.forEach((wrapper) => {

        // get set name
        let setName = wrapper.querySelector('.pre-fields .tbl-doc-name input').value

        // store primary keys
        let references = []
        let primaryKeys = []
        let unique = []
        let fields = []
        let autoIncrement = []
        let rowAmount = wrapper.querySelector('input[name="rowAmount"]').value || 1

        let allRows = wrapper.querySelectorAll('.tbl-doc-info .row')

        // except fields[0], because it's title row
        let [, ...rows] = allRows

        // get references
        let referenceWrapper = wrapper
            .querySelector('.tbl-doc-references')
        let currentFieldReferences = getReferences(referenceWrapper)
        if (currentFieldReferences)
            references.push(...currentFieldReferences)
        rows.forEach((row) => {

            // get data of field
            let dataField = getField(row)
            fields.push(dataField)

            // get references


            // get constraint wrapper div
            let constraintWrapperDiv = row
                .querySelectorAll('.col-4')[0]

            // get primary keys
            if (isPrimaryKey(constraintWrapperDiv))
                primaryKeys.push(dataField.name)

            // get unique fields
            if (isUniqueField(constraintWrapperDiv))
                unique.push(dataField.name)

            // get auto increment fields
            let autoIncrementData =
                haveAutoIncrement(constraintWrapperDiv)
            if (autoIncrementData)
                autoIncrement.push(
                    {
                        name: dataField.name,
                        ...autoIncrementData
                    }
                )

        })

        fieldsSets.push({
            setName,
            references,
            primaryKeys,
            unique,
            autoIncrement,
            fields,
            rowAmount
        })
    })

    let schema = { databaseName, type: databaseType, fieldsSets }
    console.log(schema)

    // api url for generate
    let API_URL = `generate`
    fetch(API_URL,
        {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schema })
        }).then(rs => rs.text())
        .then(rs => {
            document.querySelector('#req-content').innerHTML = `<pre>${rs}</pre>`
        })
})

// get data of field
let getField = (wrapperDiv) => {

    // get set name
    let name = wrapperDiv
        .querySelector('input[name="fieldName"]').value

    // get data type
    let datatype = getDataType(wrapperDiv)

    return { name, datatype }
}

// get datatype of field
let getDataType = (wrapperDiv) => {

    let type = wrapperDiv
        .querySelector('select[name="dataType"]').value
    let optionsDiv = wrapperDiv.querySelectorAll('.col-4')[1]
    let options = getOptions(optionsDiv, type)

    return { type, options }
}

// get options of datatype (composite)
let getOptions = (wrapperDiv, type) => {
    switch (type) {
        case 'number':
            return getNumberOptions(wrapperDiv)
        case 'string':
            return getStringOptions(wrapperDiv)
        case 'date':
            return getDateOptions(wrapperDiv)
        case 'name':
            return getNameOptions(wrapperDiv)
        case 'address':
            return getAddressOptions(wrapperDiv)
        case 'set':
            return getSetOptions(wrapperDiv)
        case 'freedom':
            return getFreedomOptions(wrapperDiv)
        case 'template':
            return getTemplateOptions(wrapperDiv)
        default:
            break
    }
    return {}
}

// get options of number type
let getNumberOptions = (wrapperDiv) => {
    let min = wrapperDiv.querySelector('input[name="min"]').value
    let max = wrapperDiv.querySelector('input[name="max"]').value
    let isInt = wrapperDiv.querySelector('input[name="isInt"]').checked
    return { min, max, isInt }
}

// get options of string type
let getStringOptions = (wrapperDiv) => {
    let size = wrapperDiv.querySelector('input[name="lenght"]').value
    let haveLower = wrapperDiv.querySelector('input[name="haveLower"]').checked
    let haveUpper = wrapperDiv.querySelector('input[name="haveUpper"]').checked
    let haveNumeric = wrapperDiv.querySelector('input[name="haveNumeric"]').checked
    return { size, haveLower, haveUpper, haveNumeric }
}

let getDateOptions = (wrapperDiv) => {
    let minDate = wrapperDiv.querySelector('input[name="minDate"]').value
    let maxDate = wrapperDiv.querySelector('input[name="maxDate"]').value
    return { minDate, maxDate }
}

let getNameOptions = (wrapperDiv) => {
    let isMale = wrapperDiv.querySelector('input[name="isMale"]').checked
    let isFemale = wrapperDiv.querySelector('input[name="isFemale"]').checked
    if (isMale && isFemale)
        return { isMale: null }
    else
        return { isMale }
}

let getAddressOptions = () => ({})

let getSetOptions = (wrapperDiv) => {
    let set = wrapperDiv
        .querySelector('textarea[name="set"]')
        .value.replace(/\s+/g, ' ').split(',')
        .map(item => item.trim())
    return { set }
}

let getFreedomOptions = (wrapperDiv) => {
    let value = wrapperDiv.querySelector('input[name="value"]').value
    return { value }
}

let getTemplateOptions = () => ({})

// get references
let getReferences = (referencesWrapper) => {
    let references = []
    let referencesDiv = [...referencesWrapper.querySelectorAll('.row')]
    referencesDiv.forEach(referenceDiv => {
        let fromField = referenceDiv.querySelector('input[name="fromField"]').value
        let toSetName = referenceDiv.querySelector('input[name="toSetName"]').value
        let toField = referenceDiv.querySelector('input[name="toField"]').value
        let relation = referenceDiv.querySelector('select[name="relation"]').value
        references.push({ fromField, referenceTo: { toSetName, toField, relation } })
    })
    return references
}

let isPrimaryKey = (wrapperDiv) => {
    return wrapperDiv
        .querySelector('input[name="primaryKey"]')
        .checked
}

let isUniqueField = (wrapperDiv) => {
    return wrapperDiv
        .querySelector('input[name="unique"]')
        .checked
}

let haveAutoIncrement = (wrapperDiv) => {
    let isAutoIncrement = wrapperDiv
        .querySelector('input[name="autoIncrement"]')
        .checked
    if (isAutoIncrement) {
        // TEMP

        // default is 0 (first region)
        let incrementPosition = 0

        let startAt = wrapperDiv
            .querySelector('input[name="startAt"]')
            .value

        let step = wrapperDiv
            .querySelector('input[name="step"]')
            .value
        return { incrementPosition, startAt, step }
    } else { return null }
}

let onTurnAutoIncrement = (autoIncBtn) => {
    if (autoIncBtn.checked) {
        let label = document.createElement('span')
        label.innerHTML = `
        ; Start at:
        <input type="text" class="space-x" style="width: 70px" name="startAt">
        step: 
        <input type="text" class="space-x" style="width: 70px" name="step">
        `
        autoIncBtn.parentElement.appendChild(label)
    } else {
        autoIncBtn.parentElement.lastChild.remove()
    }
}

let addReference = (addReferenceBtn) => {

    let referencesWrapper = addReferenceBtn
        .previousElementSibling
    if (referencesWrapper.innerHTML == '') {
        let label = document.createElement('h5')
        label.innerHTML = 'References:'
        referencesWrapper.appendChild(label)
    }

    let referenceDiv = document.createElement('div')
    referenceDiv.classList.add('row', 'space-y')
    referenceDiv.innerHTML = `
        <div class="col-3">
            From:<input type="text" name="fromField" class="space-x">
        </div>
        <div class="col-3">
            to:<input type="text" name="toSetName" class="space-x">
        </div>
        <div class="col-3">
            at:<input type="text" name="toField" class="space-x">
        </div>
        <div class="col-3">
            with relation:
            <select name="relation" class="space-x">
            <option value="One2One">One2One</option>
            <option value="One2Many">One2Many</option>
            <option value="Many2One">Many2One</option>
            </select>
        </div>
    `
    referencesWrapper.appendChild(referenceDiv)
}

// add fields set
let addFieldsSet = (addFieldsSetBtn) => {
    let fieldsSetWrapper = document.createElement('div')
    fieldsSetWrapper.classList.add('sub-wrapper')
    fieldsSetWrapper.innerHTML = `
        <div class="pre-fields">
            <div class="tbl-doc-name">
                <input type="text" name="tableDocName" placeholder="Tables/ Collections name">
            </div>
            <div class="add-fields">
                Add fiels: <input type="text" name="addFields" value="1">
                <button type="button" onclick="addfields(this)" class="btn btn-primary">Add</button>
            </div>
            Row amount: <input type="text" name="rowAmount" style="width: 50px" value="1">
        </div>
        <div class="tbl-doc-info" style="margin: 0 100px;">
            <div class="row">
                <div class="col-2">Field name</div>
                <div class="col-2">Data type</div>
                <div class="col-4">Constraint</div>
                <div class="col-4">Options</div>
            </div>
            <div class="row" style="margin-top: 10px;">

                <div class="col-2">
                    <input type="text" name="fieldName" placeholder="Field name" style="width: 150px;">
                </div>
                <div class="col-2">
                    <select name="dataType" onchange="changeOptionForSelect(this)">
                        <option value="number">Number</option>
                        <option value="string">String</option>
                        <option value="date">Date</option>
                        <option value="name">Name</option>
                        <option value="address">Address</option>
                        <option value="set">Set</option>
                        <option value="freedom">Freedom</option>
                        <option value="template">Template</option>
                    </select>
                </div>
                <div class="col-4 crollable-x">
                    <input type="checkbox" class="space-x" name="primaryKey" value="primaryKey"> Primary key
                    <input type="checkbox" class="space-x" name="autoIncrement" value="autoIncrement"
                        onclick="onTurnAutoIncrement(this)"> Auto increment
                    <input type="checkbox" class="space-x" name="unique" value="unique"> Unique
                </div>
                <div class="col-4 crollable-x">
                    <input type="text" class="space-x" name="min" style="width: 70px;" placeholder="Min">
                    <input type="text" class="space-x" name="max" style="width: 70px;" placeholder="Max">
                    <input type="checkbox" class="space-x" name="isInt"> Is integer
                </div>
            </div>
        </div>
        <div class="tbl-doc-references" style="margin: 10px 100px;"></div>
        <button class="btn btn-primary" onclick="addReference(this)" style="margin: 10px 100px">
            Add new reference
        </button>
    `
    addFieldsSetBtn.insertAdjacentElement('beforebegin', fieldsSetWrapper)
}