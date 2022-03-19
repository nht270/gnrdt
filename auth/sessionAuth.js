require('dotenv').config()

function checkLogin(req, res, next) {

    let User = req.session?.User || null
    if (User) {
        next()
    } else {
        res.redirect('login')
    }
}

module.exports = checkLogin