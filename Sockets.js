var WebSocket = require('ws')
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId; 
var parseCookie = require('cookie-parser')
var url = "mongodb://localhost:27017/"
var cookie = require('cookie')
function createPlaySocket(sessionParser){

    var wss = new WebSocket.Server({ noServer: true})
    wss.on('connection', function (ws, req) {

        sessionParser(req, {}, () => {})

        async function getMatch(match){
            var client = await MongoClient.connect(url)
            var result = await client.db('FairyChessMaker').collection('Matches').findOne(ObjectId(match.id))
            if(result == null){
                ws.send('/browse')
                client.close()
            }
            else{
                var game = await client.db('FairyChessMaker').collection('Games').findOne(ObjectId(result.gameid))
              
                if(!result.white && game.black!=req.session.userId){
                    await client.db('FairyChessMaker').collection('Matches').updateOne({_id: ObjectId(result._id)},{ $set: {white: req.session.userId}})
                }
                else if(!result.black && result.white!=req.session.userId){
                    await client.db('FairyChessMaker').collection('Matches').updateOne({_id: Object(result._id)},{ $set: {black: req.session.userId}})
                }
                
                game.Game = JSON.parse(game.Game)
                return game
            }
        }

        ws.on('message', function (message) {
            var isJSON = false
            if(message.charAt(0)=='{'){
                message = JSON.parse(message)
                isJSON = true
            }
            if(isJSON){
                if(message.id){
                    getMatch(message).then((response) => {
                        ws.send(JSON.stringify(response))
                    })
                }
            }
        })
    })
    return wss
}

exports.createPlaySocket = createPlaySocket