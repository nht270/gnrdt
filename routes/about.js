let express = require('express')
let router = express.Router()
let about = require('../controllers/about')

router.get('/', about.index)

module.exports = router