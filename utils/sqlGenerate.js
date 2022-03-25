const { getSymmetryReferences } = require('./common')
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
                // constraint is foreign key field
                let constraints = references.filter(reference => {
                    let symmetryReference =
                        getSymmetryReferences(reference, schema)[0]
                    let levelImportant =
                        compareImportantLevelOfRefs(reference, symmetryReference)
                    if (levelImportant == IMPORTANT_LEVEL_REFERENCE.LOWER)
                        return true
                })
                return codeSqlTable(
                    table, constraints,
                    dataRows, dropTable,
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

    // drop table code if any
    let sqlCreateTable =
        dropTable ? `DROP TABLE IF EXISTS \`${table.name}\`;\n` : ``
    let { primaryKeys, fields, uniques } = table

    // create table code
    sqlCreateTable += `CREATE TABLE IF NOT EXISTS \`${table.name}\` (\n`

    // choice data for fields
    sqlCreateTable += fields.map(
        field => `${TAB}\`${field.name}\` ${choiceSQLDataType(field.datatype)}`
    ).join(',\n')

    // add primary key if any
    if (primaryKeys &&
        primaryKeys.length) {
        sqlCreateTable += `,\n${TAB}PRIMARY KEY (\`${primaryKeys.join('\`, \`')}\`)`
    }

    // add unique if any
    if (uniques && uniques.length)
        sqlCreateTable += `,\n${TAB}` +
            codeUniqueConstraintTable(uniques, `UC_${table.name}`)

    // add references
    if (constraints && constraints.length) {
        let codeConstraints = constraints.map(constraint => {
            return codeConstraintTable(constraint)
        }).join(`,\n${TAB}`)
        sqlCreateTable += `,\n${TAB}${codeConstraints}`
    }

    sqlCreateTable += '\n)ENGINE=InnoDB DEFAULT CHARSET=latin1;\n\n'
    return sqlCreateTable
}

let codeConstraintTable = (reference) => {
    let { from, to } = reference
    return 'CONSTRAINT `' + from + '_' + to.field + '` ' +
        'FOREIGN KEY (`' + from + '`) ' +
        'REFERENCES `' + to.setName + '`' +
        '(`' + to.field + '`) ' +
        'ON DELETE CASCADE ON UPDATE CASCADE'
}

let codeUniqueConstraintTable = (uniqueFields, constraintName) => {
    if (Array.isArray(uniqueFields) &&
        uniqueFields.length > 0) {
        return `CONSTRAINT ${constraintName} ` +
            `UNIQUE (${uniqueFields.join(', ')})`
    } else return ''
}

// code for insert data into created table
let codeInsertTable = (table, dataRows, breakPoint = 0) => {
    let sqlInsert = `INSERT INTO \`${table.name}\``
        + `(\`${table.fields.map(field => field.name).join('\`, \`')}\`) VALUES\n`
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
    if (datatype && datatype.type) {
        let { options } = datatype
        switch (datatype.type) {
            case 'number':
                return options.isInt ? 'int' : 'float'
            case 'name':
            case 'address':
            case 'set':
            case 'freedom':
            case 'template':
            case 'string':
                let stringLength =
                    (options && options.length) ||
                    DEFAULT_STRING_LENGTH
                return `varchar(${stringLength})`
            case 'date':
                return 'datetime'
            default:
                return ''
        }
    }
    return ''
}

module.exports = { generateSqlCode }