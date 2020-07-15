var express = require('express')
var router = express.Router()
var bcrypt = require('bcryptjs')
var MongoClient = require('mongodb').MongoClient;
var session = require('express-session')
var url = "mongodb://localhost:27017/"

router.get('/', (req, res) =>{
    var send = req.session.loginResponse
    console.log("Message: " + send)
    delete req.session.loginResponse
    res.render('login', {message: send})
})

router.post('/', (req,res) => {
    var username = req.body.username
    var password = req.body.password
    var messageSuccess = "Login successful"
    var messageFail = "Login Failed"
    var redirection = "/play"
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("Database conneceted")
        db.db('FairyChessMaker').collection("Users").findOne({'username': username}, function(err,result){
        if (err) throw err;
        if(result == null){
            console.log("Incorrect username")
            redirection = '/'
            req.session.logingResponse = messageFail
        }
        else{
            var validPassword = bcrypt.compareSync(password, result.password) && username!=""
            if(validPassword){
                console.log('Successful login')
                req.session.loginResponse = messageSuccess
                req.session.user = username
            }
            else{
                console.log("Incorrect password")
                console.log('login failed')
                req.session.loginResponse = messageFail
                redirection = '/'
            }
        }
            db.close();
            console.log(req.session.user)
            res.redirect(redirection)
        })
      });
})

module.exports = router