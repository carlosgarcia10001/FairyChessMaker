var express = require('express')
var router = express.Router()
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/"

router.get('/', function(req, res){
    var games = []
    async function fetchDataAndRender(){
        var client = await MongoClient.connect(url)
        var data = await client.db('FairyChessMaker').collection("Games").find().forEach(function (result) {
            games.push({
                name: result.Name,
                id: result._id
            })
        })
        res.render('Browse', {games: games})
        client.close()
    }
    fetchDataAndRender()
})

router.post('/', function(req, res){
    var id = req.body.id
    async function addMatch(){
        var client = await MongoClient.connect(url)
        var match = await client.db('FairyChessMaker').collection("Matches").insertOne({
            gameid: id
        })
        res.send(match.insertedId)
    }
    addMatch()
})

module.exports = router