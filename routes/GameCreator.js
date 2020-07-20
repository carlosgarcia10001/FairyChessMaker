var express = require('express')
var router = express.Router()
var fs = require('fs')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/"
router.get('/', function (req, res){
    res.render("GameCreator", {
        user: req.session.user
    })
})

router.post('/',function(req, res, next){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log("Database conneceted")
        db.db('FairyChessMaker').collection("Games").findOne({"Name": req.body.name}, function(err,result){
            if (err) throw err;
        if(result == null){
            db.db('FairyChessMaker').collection("Games").insertOne({
                "name": req.body.name,
                "pieces": JSON.stringify(req.body.game),
                "FEN": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
                "winConditionBlack": "Checkmate",
                "winConditionWhite": "Checkmate" 
            })
            console.log('game added')
        }
        else{
            console.log('game add fail')
        }
        db.close();
        res.send('/createaccount')
        })
      });
})

module.exports = router