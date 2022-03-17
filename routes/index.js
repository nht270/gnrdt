let express = require('express')
let router = express.Router()

router.use('/admin', require('./admin'))
router.use('/shared-generated-data', require('./sharedGeneratedData'))
router.use('/about', require('./about'))
router.use('/contact', require('./contact'))
router.use('/', require('./home'))

module.exports = router