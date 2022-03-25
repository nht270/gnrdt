let GeneratedFile = require('../models/GeneratedFile')
let fs = require('fs')
let path = require('path')

let admin = {
    index: async (req, res) => {
        let GeneratedFiles = await GeneratedFile.find({})
        let remapGeneratedFiles = []
        GeneratedFiles.forEach(file => {

            let fileName = file.fileName

            let id = file._id

            let filePath = path.join('resource', 'generated', file.fileName)

            let link = 'resource/' + fileName

            // check exists file
            try {
                if (fs.existsSync(filePath)) {
                    let content = fs.readFileSync(filePath,
                        { encoding: 'utf8', flag: 'r' })
                    remapGeneratedFiles.push({ fileName, id, link, content })
                }
            } catch (error) {
                console.log(`File ${fieldName} not exists!`)
            }
        })
        res.render('admin-dashboard', { remapGeneratedFiles })
    },
    deleteGeneratedFile: async (req, res) => {
        let id = req.params.id
        let { fileName } = await GeneratedFile.findById(id)
        await GeneratedFile.deleteOne({ _id: id })
        let filePath = path.join('resource', 'generated', fileName)
        fs.rmSync(filePath, { force: true })
        res.json({ success: true })
    }
}

module.exports = admin