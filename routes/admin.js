let express = require('express')
let router = express.Router()

let admin = require('../controllers/admin')

router.get('/', admin.index)

module.exports = router