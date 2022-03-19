let GeneratedFile = require('../models/GeneratedFile')
let fs = require('fs')
let path = require('path')

let sharedGeneratedData = {
    index: async (req, res) => {
        let GeneratedFiles = await GeneratedFile.find({})
        console.log({ GeneratedFile })
        let test = []
        try {
            GeneratedFiles.forEach(file => {
                let fileName = file.fileName
                let id = file._id
                let filePath = path.join('resource', 'generated', file.fileName)
                let link = 'resource/' + fileName
                let content = ''
                content = fs.readFileSync(filePath,
                    { encoding: 'utf8', flag: 'r' })

                test.push({ fileName, id, link, content })
            })
        } catch (e) {
            console.log('Error read file: ' + filePath)
            console.log('Cause: ', e)
        } finally {
            fs.close()
        }
        console.log(test)
        res.render('sharedGeneratedData', { test })
    }
}

module.exports = sharedGeneratedData