const { getSymmetryReference } = require('./common')
let {
    generateRawData,
    compareImportantLevelOfRefs,
    IMPORTANT_LEVEL_REFERENCE
} = require('./preGenerate')

const { DEFAULT_STRING_LENGTH } = require('./random')

// for decoration
// number of spaces for a tab
const TAB = '  '

// generate sql code for database
let generateSqlCode = (schema, dropDatabase, dropTable, breakPoint) => {
    let sqlCreateDatabase = codeCreateDatabase(schema, dropDatabase)
    let sqlUseDatabase = codeUseDatabase(schema)
    let sqlTables = ''
    let rawData = generateRawData(schema)
    if (rawData.length) {
        sqlTables = rawData
            .map(block => {

                let {
                    fieldsSet: table,
                    generatedData: dataRows
                } = block
                let { references } = table
                let constraints = references.filter(reference => {
                    let symmetryReference =
                        getSymmetryReference(reference, schema)[0]
                    let levelImportant =
                        compareImportantLevelOfRefs(reference, symmetryReference)
                    if (levelImportant == IMPORTANT_LEVEL_REFERENCE.LOWER)
                        return true
                })
                return codeSqlTable(
                    table,
                    constraints,
                    dataRows,
                    dropTable,
                    breakPoint
                )
            }).join('\n')
    }
    let sqlCode =
        `${sqlCreateDatabase}\n${sqlUseDatabase}\n${sqlTables}`
    return sqlCode
}

// code for create database (SQL)
let codeCreateDatabase = (schema, dropDatabase) =>
    `${dropDatabase ? `DROP DATABASE IF EXISTS \`${schema.databaseName}\`;` : ``}` +
    `\nCREATE DATABASE IF NOT EXISTS \`${schema.databaseName}\`;\n`

// code for select database (SQL)
let codeUseDatabase = (schema) =>
    `USE \`${schema.databaseName}\`;\n`

let codeSqlTable = (table, constraints, dataRows, dropTable, breakPoint) =>
    codeCreateTable(table, constraints, dropTable) +
    codeInsertTable(table, dataRows, breakPoint)

// code for part create table (SQL)
let codeCreateTable = (table, constraints, dropTable) => {

    let sqlCreateTable =
        dropTable ? `DROP TABLE IF EXISTS \`${table.setName}\`;\n` : ``
    let { primaryKeys, fields } = table

    sqlCreateTable += `CREATE TABLE IF NOT EXISTS \`${table.setName}\` (\n`

    sqlCreateTable += fields.map(
        field => `${TAB}\`${field.name}\` ${choiceSQLDataType(field.datatype)}`
    ).join(',\n')

    if (primaryKeys &&
        primaryKeys.length) {
        sqlCreateTable += `,\n${TAB}PRIMARY KEY (\`${primaryKeys.join('\`, \`')}\`)`
    }

    if (constraints && constraints.length) {
        let codeConstraints = constraints.map(constraint => {
            return codeConstraintTable(constraint)
        }).join(`,\n${TAB}`)
        sqlCreateTable += `,\n${TAB}${codeConstraints}`
    }

    sqlCreateTable += '\n);\n\n'
    return sqlCreateTable
}

let codeConstraintTable = (reference) => {
    let {
        fromField,
        referenceTo: {
            toSetName,
            toField
        }
    } = reference
    return 'CONSTRAINT `' +
        fromField + '_' + toField +
        '` FOREIGN KEY (`' + fromField +
        '`) REFERENCES `' + toSetName +
        '` (`' + toField +
        '`) ON DELETE CASCADE ON UPDATE CASCADE'
}

// code for insert data into created table
let codeInsertTable = (table, dataRows, breakPoint = 0) => {
    let sqlInsert = `INSERT INTO \`${table.setName}\`(\`${table.fields.map(field => field.name).join('\`, \`')}\`) VALUES\n`
    let sqlInsertRows = ''
    if (!breakPoint) breakPoint = dataRows.length
    if (breakPoint > 0) {

        let countLoopStep = Math.ceil(dataRows.length / breakPoint)
        for (let i = 0; i < countLoopStep; i++) {
            sqlInsertRows += sqlInsert
            let rows = []
            for (j = i * breakPoint; (j < (i + 1) * breakPoint && j < dataRows.length); j++) {
                let row = `(${dataRows[j]})`
                rows.push(row)
            }
            sqlInsertRows += rows.join(',\n') + ';\n\n'
        }
    }
    return sqlInsertRows
}

// choice datatype (in SQL) for type (in project)
let choiceSQLDataType = (datatype) => {
    if (datatype && datatype.type)
        switch (datatype.type) {
            case 'number':
                return datatype.options.isInt ? 'int' : 'float'
            case 'name':
            case 'address':
            case 'set':
            case 'freedom':
            case 'template':
            case 'string':
                return `varchar(${(datatype.options && datatype.options.size) || DEFAULT_STRING_LENGTH})`
            case 'date':
                return 'datetime'
            default:
                return ''
        }
    return ''
}

module.exports = { generateSqlCode }