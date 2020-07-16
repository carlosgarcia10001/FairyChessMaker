var WebSocket = require('ws')
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId; 
var url = "mongodb://localhost:27017/"

function createPlaySocket(){

    var ws = new WebSocket.Server({ noServer: true})

    ws.on('connection', function (connect) {
        async function getMatch(message){
            var client = await MongoClient.connect(url)
            var result = await client.db('FairyChessMaker').collection('Matches').findOne(ObjectId(message.id))
            if(result == null){
                connect.send('/browse')
                client.close()
            }
            else{
                var game = await client.db('FairyChessMaker').collection('Games').findOne(ObjectId(result.gameid))
                return {name: game.Name, pieces: JSON.parse(game.Game), FEN: game.FEN}
            }
        }
        connect.on('message', function (message) {
            var isJSON = false
            if(message.charAt(0)=='{'){
                message = JSON.parse(message)
                isJSON = true
            }
            if(isJSON){
                getMatch(message).then((response) => {
                    connect.send(JSON.stringify(response))
                })
            }
        })
    })
    return ws
}

exports.createPlaySocket = createPlaySocket