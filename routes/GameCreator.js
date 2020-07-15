var express = require('express')
var router = express.Router()
var fs = require('fs')
var MongoClient = require('mongodb').MongoClient;

router.get('/', function (req, res){
    res.render("GameCreator", {
        user: req.session.user
    })
})

router.post('/',function(req, res, next){
    
    fs.appendFile('CustomChessPieces.txt',JSON.stringify(req.body), function(err){
        if (err) throw err;
        console.log("File saved")
    })
    res.redirect('/')
});

module.exports = router