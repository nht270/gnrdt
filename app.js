require('dotenv').config()

let express = require('express')
let app = express()
let hbs = require('express-handlebars')
let path = require('path')

const PORT = process.env.PORT || 8080

// Handlebars view engine
app.engine('handlebars', hbs.engine())
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// for get params from body(json) or url (urlencoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static file
app.use(express.static('public'))

// use router
app.use('/', require('./routes'))

// listen
app.listen(PORT, () => {
    console.log(`App running at port ${PORT}`)
})