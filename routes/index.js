let checkLogin = require('../auth/sessionAuth')
let express = require('express')
let router = express.Router()

router.use('/admin', checkLogin)
router.use('/admin', require('./admin'))
router.use('/login', require('./login'))
// temp
router.get('/logout', require('../controllers/login').logout)
router.use('/shared-generated-data', require('./sharedGeneratedData'))
router.use('/about', require('./about'))
router.use('/contact', require('./contact'))
router.use('/', require('./home'))

module.exports = router