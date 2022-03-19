let mongoose = require('mongoose')
let Schema = mongoose.Schema

let GeneratedFile = new Schema({
    fileName: String,
    createAt: Date
})

module.exports = mongoose.model('GeneratedFile', GeneratedFile)