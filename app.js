var createError = require('http-errors');
var express = require('express')
var cookieParser = require('cookie-parser');
var path = require('path')
var bodyParser = require('body-parser')
var gameCreator = require('./routes/GameCreator')
var playGame = require('./routes/PlayGame')
var login = require('./routes/Login')
var logout = require('./routes/Logout')
var createAccount = require('./routes/CreateAccount')
var session = require('express-session')
var MongoDBStore = require('connect-mongodb-session')(session)
var ejs = require('ejs')
var fs = require('fs')
const app = express()
const port = 3000
var url = "mongodb://localhost:27017/"
var store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/FairyChessMaker',
    collection: 'Sessions'
  });

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({parameterLimit: 5000,extended: true }))
app.use(bodyParser.json())
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')))
app.use(cookieParser());
app.use(session({ secret: 'asldkvhwdvhw', cookie: { 
    maxAge: 1000 * 60 * 60 * 24 * 100,
    httpOnly: true,
}, 
store: store,
resave: true,
saveUninitialized: true
}))

app.use('/', login)
app.use('/play', playGame)
app.use('/gamecreate', gameCreator)
app.use('/createaccount', createAccount)
app.use('/logout', logout)
app.get('/ejs', (req, res) => {
    res.render('index', {
        username: 'anon'
    })
})

app.use(function(req, res, next) {
    next(createError(404));
  });

 // error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

app.listen(port, () => console.log("app running"))