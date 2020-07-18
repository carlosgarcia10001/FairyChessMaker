var express = require('express')
var router = express.Router()
var bcrypt = require('bcryptjs')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/"

router.get('/', (req, res) =>{
    res.render('CreateAccount', {
        user: req.session.user
    })
})

router.post('/', (req,res) => {
    var username = req.body.username
    var password = req.body.password
    var message = 'Account creation successful'
    var salt = bcrypt.genSaltSync(10)
    var hashedPassword = bcrypt.hashSync(password, salt)
    var redirection = "/play"
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("Database conneceted")
        db.db('FairyChessMaker').collection("Users").findOne({'username': username}, function(err,result){
            if (err) throw err;
        if(result == null){
            var user = db.db('FairyChessMaker').collection("Users").insertOne({
                'username': username,
                'password': hashedPassword
            }).then((response) => {
                console.log('user added')
                req.session.userId = String(response.insertedId)
                console.log(response.insertedId)
            })
        }
        else{
            console.log('user creation failed')
            message = 'Account creation failed'
            redirection = '/createaccount'
        }
        db.close();
        res.redirect(redirection)
        })
      });
})

module.exports = router