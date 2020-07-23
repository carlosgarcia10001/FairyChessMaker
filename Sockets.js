var WebSocket = require('ws')
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId; 
var parseCookie = require('cookie-parser')
var url = "mongodb://localhost:27017/"
var win = require('./public/javascripts/winConditions')
var cookie = require('cookie')
var gameControl = require('./public/javascripts/Game')
var move = require('./public/javascripts/Move')
var cleanPieceFileRead = require('./public/javascripts/CleanPieceFileRead')
var indexAndCoordinates = require('./public/javascripts/IndexAndCoordinates')
var boardState = require('./public/javascripts/BoardState')

function createPlaySocket(sessionParser){
    var blackId
    var matchId
    var whiteId
    var winner
    var playGame = JSON.parse(JSON.stringify(gameControl.game))
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
                if(!match.white && game.black!=req.session.userId && req.session.userId){
                    await client.db('FairyChessMaker').collection('Matches').updateOne({_id: ObjectId(match._id)},{$set: {white: req.session.userId}})
                    match = await client.db('FairyChessMaker').collection('Matches').findOne(ObjectId(message.matchId))
                }
                else if(!match.black && match.white!=req.session.userId && req.session.userId){
                    await client.db('FairyChessMaker').collection('Matches').updateOne({_id: Object(match._id)},{$set: {black: req.session.userId}})
                    match = await client.db('FairyChessMaker').collection('Matches').findOne(ObjectId(message.matchId))
                }
            }
            if(match.white){
                whiteId = match.white
                delete match.white
            }
            if(match.black){
                blackId = match.black
                delete match.black
            }
            if(typeof(match.winner) == 'boolean' && !match.winner){
                winner = match.winner
            }
            if(req.session.userId == blackId && req.session.userId){
                match.playerColor = 'b'
            }
            else if(req.session.userId == whiteId && req.session.userId){
                match.playerColor = 'w'
            }
            if(match.turn){
                playGame.turn = match.turn
            }
            if(game.winCondition){
                playGame.winCondition = game.winCondition
            }

            game.pieces = JSON.parse(game.pieces)
            cleanPieceFileRead.cleanPieces(game.pieces)
            playGame.pieces = game.pieces
            gameControl.parseFEN(playGame.board, match.FENHistory[match.FENHistory.length-1], game.pieces)
            gameControl.activateAttributeMods(playGame.board)
            return {
                match: match
            }
        }
    }

    async function updateMatch(move, FEN, color, winner){
        var client = await MongoClient.connect(url)
        await client.db('FairyChessMaker').collection('Matches').updateOne({_id: ObjectId(matchId)}, {$set: {turn: color, winner: winner}, $push: {moveHistory: move, FENHistory: FEN}})
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
                highlightMoveList: move.moveListCoordinates(move.pieceMoveList(playGame.board, message.highlightMoveList))
            }
            ws.send(JSON.stringify(highlightMoveList))
        },
        move: function(message, ws, req){
            var FEN = gameControl.createFEN(playGame.board)
            var fromColor = playGame.board[indexAndCoordinates.coordinatesToIndex[message.move.from]].color
            if(winner == false &&((whiteId == req.session.userId && fromColor == 'w') || (blackId == req.session.userId && fromColor == 'b'))){
                if(fromColor == playGame.turn){   
                    var movement = move.makeMove(playGame.board, message.move.from, message.move.to)
                    if(movement!=false){
                        if(playGame.turn == 'w'){
                            playGame.turn = 'b'
                        }
                        else{
                            playGame.turn = 'w'
                        }
                        FEN = gameControl.createFEN(playGame.board)
                        var winnerParse = win.winCondition[playGame.winCondition].action(playGame.board, playGame.turn)
                        if(winnerParse!=false){
                            winner = winnerParse
                        }
                        updateMatch(movement, FEN, playGame.turn, winner)
                    }
                }
            }
            var moveResponse = {
                FEN: FEN,
                turn: playGame.turn,
                winner: winner
            }
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

function createGameCreateSocket(sessionParser){
    var FEN = "8/8/8/8/8/8/8/8"
    var FENGame = JSON.parse(JSON.stringify(gameControl.game))
    var currentPiece = ""
    var currentPieceBoard = JSON.parse(JSON.stringify(gameControl.game.board))
    var pathGame = JSON.parse(JSON.stringify(gameControl.game))
    var parsingPath = {
        path: [],
        space: []
    }
    var messageResponse = {
        FEN: function(message, ws, req){
            gameControl.parseFEN(FENGame.board,message.FEN,FENGame.pieces)
        },
        currentPiece: function(message, ws, req){
            currentPiece = message.currentPiece
            gameControl.initializeBoard(currentPieceBoard)
            currentPieceBoard[indexAndCoordinates.coordinatesToIndex['d4']] = FENGame.pieces[currentPiece]
            var moveList = move.pieceMoveList(currentPieceBoard, 'd4')
            var highlightCurrentPieceMoveList = {
                highlightCurrentPieceMoveList: move.moveListCoordinates(moveList)
            }
            ws.send(JSON.stringify(highlightCurrentPieceMoveList))
        },
        currentPiecePosition: function(message, ws, req){
            var from = indexAndCoordinates.coordinatesToIndex[message.currentPiecePosition.from]
            var to = indexAndCoordinates.coordinatesToIndex[message.currentPiecePosition.to]
            gameControl.initializeBoard(currentPieceBoard)
            currentPieceBoard[to] = FENGame.pieces[currentPiece]
            var highlightCurrentPieceMoveList = {
                highlightCurrentPieceMoveList: move.moveListCoordinates(move.pieceMoveList(currentPieceBoard, to))
            }
            ws.send(JSON.stringify(highlightCurrentPieceMoveList))
        },
        pathPiecePosition: function(message, ws, req){
            var from = indexAndCoordinates.coordinatesToIndex[message.pathPiecePosition.from]
            var to = indexAndCoordinates.coordinatesToIndex[message.pathPiecePosition.to]
            gameControl.initializeBoard(pathGame.board)
            currentPieceBoard[to] = pathGame.pieces[currentPiece]
            var highlightPathMoveList = {
                highlightPathMoveList: move.moveListCoordinates(move.pieceMoveList(pathGame.board, to))
            }
            ws.send(JSON.stringify(highlightPathMoveList))
        },
        pathAddMovement: function(message, ws, req){
            var direction = message.direction
            var amount = direction.amount

        }
    }

    var pathAdd = {
        UP: function(amount){
        
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
exports.createGameCreateSocket = createGameCreateSocket
exports.createPlaySocket = createPlaySocket