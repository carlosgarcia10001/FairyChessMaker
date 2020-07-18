var express = require('express')
var router = express.Router()
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId; 
var url = "mongodb://localhost:27017/"

router.get('/', function (req, res){
    res.render("PlayGame", {
        user: req.session.user
    })
})

router.get('/:matchid', function(req, res){ //Look to see if id is in the database, if not, redirect to browse
    res.render("PlayGame", {
        user: req.session.user
    })
})

router.post('/', function (req, res){
    async function getMatch(){
        var client = await MongoClient.connect(url)
        var result = await client.db('FairyChessMaker').collection('Matches').findOne(ObjectId(req.body.id))
        if(result == null){
            res.send('/browse')
            client.close()
        }
        else{
            var game = await client.db('FairyChessMaker').collection('Games').findOne(ObjectId(result.gameid))
            res.send(game.Game)
            client.close()
        }
    }
    if(req.body.id !=""){
        getMatch()   
    }
    else{
        res.send('hi')
    }
})


module.exports = router