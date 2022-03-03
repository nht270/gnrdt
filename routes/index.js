let express = require('express')
let router = express.Router()

router.use('/admin', require('./admin'))
router.use('/', require('./home'))

module.exports = router