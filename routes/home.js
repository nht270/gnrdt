let express = require('express')
let router = express.Router()
let home = require('../controllers/home')

router.get('/', home.index)

// generate data

router.post('/generate', home.generate)

module.exports = router