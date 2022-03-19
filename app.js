require('dotenv').config()

let express = require('express')
let session = require('express-session')
let hbs = require('express-handlebars')
let mongoose = require('mongoose')
let path = require('path')
let app = express()

const PORT = process.env.PORT || 8080
let mongodbHost = process.env.MONGODB_HOST || 'localhost'
let mongodbPassword = process.env.MONGODB_PASSWORD || ''
let connectUri = `mongodb+srv://${mongodbHost}:${mongodbPassword}` +
    `@sandbox.zcqjn.mongodb.net/generateData`
// use session
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret:
        process.env.SESSION_SECRET ||
        'none',
    cookie: { maxAge: 60 * 60 * 1000 }
}));



// Handlebars view engine
app.engine('handlebars', hbs.engine())
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// for get params from body(json) or url (urlencoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static file
app.use('/resource', express.static('resource/generated'))
app.use('/', express.static('public'))

// use router
app.use('/', require('./routes'))

// listen
app.listen(PORT, async () => {
    try {
        await mongoose.connect(connectUri)
        console.log('Connect successs')
    } catch (e) {
        console.log('Connect mongogdb failure')
    }
    console.log(`App running at port ${PORT}`)
})

module.exports = mongoose