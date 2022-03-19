let GeneratedFile = require('../models/GeneratedFile')
let fs = require('fs')
let path = require('path')

let admin = {
    index: async (req, res) => {
        let GeneratedFiles = await GeneratedFile.find({})
        let test = []
        GeneratedFiles.forEach(file => {
            let fileName = file.fileName
            let id = file._id
            let filePath = path.join('resource', 'generated', file.fileName)
            let link = 'resource/' + fileName
            let content = fs.readFileSync(filePath,
                { encoding: 'utf8', flag: 'r' })

            test.push({ fileName, id, link, content })
        })
        console.log(test)
        res.render('admin-dashboard', { test })
    },
    deleteGeneratedFile: async (req, res) => {
        let id = req.params.id
        await GeneratedFile.deleteOne({ _id: id })
        res.json({ success: true })
    }
}

module.exports = admin