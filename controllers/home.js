let generate = {
    index: (req, res) => {
        res.render('home')
    },

    generate: (req, res) => {

        let { generateSqlCode } = require('../utils/sqlGenerate')
        let schema = req.body.schema || null
        console.log(JSON.stringify(schema))
        let a = generateSqlCode(schema)
        res.send(a)
    }
}

module.exports = generate