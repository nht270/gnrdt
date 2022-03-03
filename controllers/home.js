let generate = {
    index: (req, res) => {
        res.render('home')
    },

    generate: (req, res) => {

        // tam thoi
        let schema = req.body.schema.tables[0]
        res.send(require('../utils/generate')(schema, 5))
    }
}

module.exports = generate