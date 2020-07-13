var createError = require('http-errors');
var express = require('express')
var cookieParser = require('cookie-parser');
var path = require('path')
var bodyParser = require('body-parser')
var gameCreator = require('./routes/GameCreator')
var playGame = require('./routes/PlayGame')
var login = require('./routes/Login')
var ejs = require('ejs')
var fs = require('fs')
const app = express()
const port = 3000

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({parameterLimit: 5000, extended: true}))
app.use(bodyParser.json())
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')))
app.use(cookieParser());
app.use('/', gameCreator)
app.use('/play', playGame)
app.use('/login', login)
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