let express = require('express')
let router = express.Router()
let login = require('../controllers/login')

router.get('/', login.index)
router.post('/', login.check)

module.exports = router