var WebSocket = require('ws')
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId; 
var parseCookie = require('cookie-parser')
var url = "mongodb://localhost:27017/"
var cookie = require('cookie')
var gameControl = require('./public/javascripts/Game')
var move = require('./public/javascripts/Move')
var cleanPieceFileRead = require('./public/javascripts/CleanPieceFileRead')
var matchId

function createGameCreatorSocket(){
    var wss = new WebSocket.Server({ noServer: true})
    wss.on('connection', function(ws, req){

    })
}
function createPlaySocket(sessionParser){
    var board = new Array(128)
    gameControl.initializeBoard(board)
    var wss = new WebSocket.Server({ noServer: true})
    wss.on('connection', function (ws, req) {
        sessionParser(req, {}, () => {})
        async function getData(message){
            var client = await MongoClient.connect(url)
            var match = await client.db('FairyChessMaker').collection('Matches').findOne(ObjectId(message.matchId))
            if(match == null){
                ws.send('/browse')
                client.close()
            }
            else{
                var game = await client.db('FairyChessMaker').collection('Games').findOne(ObjectId(match.gameId))
                if(!match.white || !match.black){
                    if(!match.white && game.black!=req.session.userId){
                        await client.db('FairyChessMaker').collection('Matches').updateOne({_id: ObjectId(match._id)},{ $set: {white: req.session.userId}})
                    }
                    else if(!match.black && match.white!=req.session.userId){
                        await client.db('FairyChessMaker').collection('Matches').updateOne({_id: Object(match._id)},{ $set: {black: req.session.userId}})
                    }
                }
                game.pieces = JSON.parse(game.pieces)
                cleanPieceFileRead.cleanPieces(game.pieces)
                gameControl.parseFEN(board, match.FEN, game.pieces)
                return {
                    game: game,
                    match: match
                }
            }
        }

        async function updateFEN(FEN){
            var client = await MongoClient.connect(url)
            await client.db('FairyChessMaker').collection('Matches').updateOne({_id: ObjectId(matchId)}, { $set: {FEN: FEN}})
        }

        ws.on('message', function (message) {
            var isJSON = false
            if(message.charAt(0)=='{'){
                message = JSON.parse(message)
                isJSON = true
            }
            if(isJSON){
                if(message.matchId){
                    getData(message).then((response) => {
                        ws.send(JSON.stringify(response))
                        matchId = message.matchId
                    })
                }
                if(message.highlightMoveList){
                    var highlightMoveList = {
                        highlightMoveList: move.moveListCoordinates(move.pieceMoveList(board, message.highlightMoveList))
                    }
                    ws.send(JSON.stringify(highlightMoveList))
                }
                if(message.move){
                    move.makeMove(board, 'w', message.move.from, message.move.to)
                    var moveResponse = {
                        FEN: gameControl.createFEN(board)
                    }
                    updateFEN(moveResponse.FEN)
                    wss.clients.forEach((client) =>{
                        client.send(JSON.stringify(moveResponse))
                    })
                }
            }
        })
    })
    return wss
}

exports.createPlaySocket = createPlaySocket