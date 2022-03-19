require('dotenv').config()
let login = {
    index: (req, res) => {
        if (!req.session.User)
            res.render('admin-login', { layout: false })
        else
            res.redirect('/admin')
    },

    check: (req, res) => {
        let { username, password } = req.body
        if (username == process.env.USER_NAME &&
            password == process.env.PASSWORD) {
            let User = { username, password }
            req.session.User = User
            res.redirect('/admin')
        } else {
            res.redirect('/login')
        }
    },

    logout: (req, res) => {
        req.session.User = null
        res.redirect('/login')
    }
}

module.exports = login