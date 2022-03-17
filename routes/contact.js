let express = require('express')
let router = express.Router()
let contact = require('../controllers/contact')

router.get('/', contact.index)

module.exports = router