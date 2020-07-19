var WebSocket = require('ws')
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId; 
var parseCookie = require('cookie-parser')
var url = "mongodb://localhost:27017/"
var cookie = require('cookie')
var gameControl = require('./public/javascripts/Game')
var move = require('./public/javascripts/Move')
var cleanPieceFileRead = require('./public/javascripts/CleanPieceFileRead')
var IndexAndCoordinates = require('./public/javascripts/IndexAndCoordinates')
var blackId
var matchId
var whiteId

function createGameCreatorSocket(){
    var wss = new WebSocket.Server({ noServer: true})
    wss.on('connection', function(ws, req){

    })
}
function createPlaySocket(sessionParser){
    var board = new Array(128)
    var turn = 'w'
    gameControl.initializeBoard(board)
    async function getData(message, ws, req){
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
                    match = await client.db('FairyChessMaker').collection('Matches').findOne(ObjectId(message.matchId))
                }
                else if(!match.black && match.white!=req.session.userId){
                    await client.db('FairyChessMaker').collection('Matches').updateOne({_id: Object(match._id)},{ $set: {black: req.session.userId}})
                    match = await client.db('FairyChessMaker').collection('Matches').findOne(ObjectId(message.matchId))
                }
            }
            if(match.white){
                whiteId = match.white
            }
            if(match.black){
                blackId = match.black
            }
            if(req.session.userId == blackId){
                match.playerColor = 'b'
            }
            else if(req.session.userId == whiteId){
                match.playerColor = 'w'
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

    var messageResponse = {
        matchId: function(message, ws, req){
            getData(message, ws, req).then((response) => {
                ws.send(JSON.stringify(response))
                matchId = message.matchId
            })
        },
        highlightMoveList: function(message, ws, req){
            var highlightMoveList = {
                highlightMoveList: move.moveListCoordinates(move.pieceMoveList(board, message.highlightMoveList))
            }
            ws.send(JSON.stringify(highlightMoveList))
        },
        move: function(message, ws, req){
            var fromColor = board[IndexAndCoordinates.coordinatesToIndex[message.move.from]].color
            if((whiteId == req.session.userId && fromColor == 'w') || (blackId == req.session.userId && fromColor == 'b')){
                if(fromColor == turn){   
                    move.makeMove(board, turn, message.move.from, message.move.to)
                }
            }
            var moveResponse = {
                FEN: gameControl.createFEN(board)
            }
            updateFEN(moveResponse.FEN)
            wss.clients.forEach((client) =>{
                client.send(JSON.stringify(moveResponse))  
            })
        }
    }

    var wss = new WebSocket.Server({ noServer: true})
    wss.on('connection', function (ws, req) {
        sessionParser(req, {}, () => {})

        ws.on('message', function (message) {
            var isJSON = false
            if(message.charAt(0)=='{'){
                message = JSON.parse(message)
                isJSON = true
            }
            if(isJSON){
                messageResponse[Object.keys(message)[0]](message, ws, req)
            }
        })
    })
    return wss
}

exports.createPlaySocket = createPlaySocket