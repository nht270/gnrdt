require('dotenv').config()
let fs = require('fs')
let path = require('path')
let GeneratedFile = require('../models/GeneratedFile')

let generate = {
    index: (req, res) => {
        res.render('home')
    },

    generate: async (req, res) => {

        let { generateSqlCode } = require('../utils/sqlGenerate')
        let { isCorrectSchema } = require('../utils/constraint')
        let { randomFileName } = require('../utils/random')
        let schema = req.body.schema || null

        if (isCorrectSchema(schema)) {
            try {
                let sql = generateSqlCode(schema)
                let fileName = randomFileName(8, 'sql')
                let buffer = Buffer.from(sql)
                let fd = fs.openSync(
                    path.join('resource', 'generated', fileName)
                    , 'w')
                let numberOfWritedByte = fs.writeSync(fd, buffer)
                fs.close(fd)
                if (numberOfWritedByte > 0) {


                    let generatedFile = new GeneratedFile({ fileName, createAt: new Date(Date.now()) })
                    let rs = await generatedFile.save()
                    console.log(rs)
                    let hostname = process.env.HOSTNAME || 'http://localhost:8080/'
                    res.json({
                        success: true,
                        link: hostname +
                            'resource/'
                            + fileName
                    })
                }
            } catch {
                res.json({ success: false, cause: `Server erorr! :(` })
            }
        } else {
            res.json({ success: false, cause: `Don't right schema format` })
        }

    }
}

module.exports = generate