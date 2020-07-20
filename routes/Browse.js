var express = require('express')
var router = express.Router()
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId; 
var url = "mongodb://localhost:27017/"

router.get('/', function(req, res){
    var games = []
    async function fetchDataAndRender(){
        var client = await MongoClient.connect(url)
        var data = await client.db('FairyChessMaker').collection("Games").find().forEach(function (result) {
            games.push({
                name: result.name,
                id: String(result._id)
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
        var game = await client.db('FairyChessMaker').collection('Games').findOne(ObjectId(id))
        var match = await client.db('FairyChessMaker').collection("Matches").insertOne({
            gameId: id,
            turn: 'w',
            moveHistory: [],
            FENHistory: [game.FEN]
        })
        res.send(match.insertedId)
    }
    addMatch()
})

module.exports = router