let express = require('express')
let router = express.Router()
let sharedGeneratedData =
    require('../controllers/sharedGeneratedData')

router.get('/', sharedGeneratedData.index)

module.exports = router