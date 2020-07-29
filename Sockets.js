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
var attributeMods = require('./public/javascripts/AttributeMods')
var mirrorPieceSelect = true;
var mirrorPath = true;
var mirrorPiece = "bP"
var attackPath = true;
var movePath = true;
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
                        console.log(playGame.winCondition)
                        var winnerParse = win.winCondition[playGame.winCondition.toUpperCase()].action(playGame.board, playGame.turn)
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
    var currentPiece = "wP"
    var mirrorPiece = "bP"
    var currentPieceBoard = JSON.parse(JSON.stringify(gameControl.game.board))
    currentPieceBoard[indexAndCoordinates.coordinatesToIndex['d4']] = FENGame.pieces['wP']
    var pathPiecePosition = 'd4'
    var currentPiecePosition = 'd4'
    var pathGame = JSON.parse(JSON.stringify(gameControl.game))
    var parsingPath = {
        path: [],
        space: []
    }
    var mirrorParsingPath = {
        path: [],
        space: []
    }
    var messageResponse = {
        FEN: function(message, ws, req){
            gameControl.parseFEN(FENGame.board,message.FEN,FENGame.pieces)
            gameControl.activateAttributeMods(FENGame.board)
            FEN = message.FEN
        },
        currentPiece: function(message, ws, req){
            currentPiece = message.currentPiece
            gameControl.initializeBoard(currentPieceBoard)
            currentPieceBoard[indexAndCoordinates.coordinatesToIndex['d4']] = FENGame.pieces[currentPiece]
            currentPiecePosition = 'd4'
            mirrorPiece = currentPiece
            if(currentPiece.charAt(0) == 'w'){
                mirrorPiece = 'b' + mirrorPiece.substring(1)
            }
            else{
                mirrorPiece = 'w' + mirrorPiece.substring(1)
            }
            
            var moveList = move.pieceMoveList(currentPieceBoard, 'd4')
            var highlightCurrentPieceMoveList = {
                highlightCurrentPieceMoveList: move.moveListCoordinates(moveList),
                highlightCurrentPieceIgnoreList: move.getIgnoreList(FENGame.pieces[currentPiece].movmods),
                getMoveMods: move.getMoveModNames(FENGame.pieces[currentPiece].movmods),
                getAttributeMods: attributeMods.getAttributeModNames(FENGame.pieces[currentPiece].attrmods),
                getAttackType: FENGame.pieces[currentPiece].atttype
            }
            ws.send(JSON.stringify(highlightCurrentPieceMoveList))
        },
        currentPiecePosition: function(message, ws, req){
            var from = indexAndCoordinates.coordinatesToIndex[message.currentPiecePosition.from]
            var to = indexAndCoordinates.coordinatesToIndex[message.currentPiecePosition.to]
            gameControl.initializeBoard(currentPieceBoard)
            currentPieceBoard[to] = FENGame.pieces[currentPiece]
            currentPiecePosition = message.currentPiecePosition.to
            var highlightCurrentPieceMoveList = {
                highlightCurrentPieceMoveList: move.moveListCoordinates(move.pieceMoveList(currentPieceBoard, to)),
                highlightCurrentPieceIgnoreList: move.getIgnoreList(FENGame.pieces[currentPiece].movmods)
            }
            ws.send(JSON.stringify(highlightCurrentPieceMoveList))
        },
        pathPiecePosition: function(message, ws, req){
            var from = indexAndCoordinates.coordinatesToIndex[message.pathPiecePosition.from]
            var to = indexAndCoordinates.coordinatesToIndex[message.pathPiecePosition.to]
            gameControl.initializeBoard(pathGame.board)
            pathGame.board[to] = pathGame.pieces[currentPiece]
            var highlightPathMoveList = {
                highlightPathMoveList: move.moveListCoordinates(move.pieceMoveList(pathGame.board, to))
            }
            pathPiecePosition = message.pathPiecePosition.to
            ws.send(JSON.stringify(highlightPathMoveList))
        },
        pathAddMovement: function(message, ws, req){
            var direction = message.pathAddMovement.direction
            var amount = message.pathAddMovement.amount
            pathAdd[direction.toUpperCase()](parsingPath, amount)
            if(mirrorPath){
                pathAdd[addPathMirror[direction.toUpperCase()]](mirrorParsingPath, amount)
            }
            pathGame.pieces[currentPiece].mov.paths[0]=(parsingPath.path)
            pathGame.pieces[currentPiece].mov.space[0]=(parsingPath.space)
            if(mirrorPath && pathGame.pieces[currentPiece].mov.paths.length < 2){
                pathGame.pieces[currentPiece].mov.paths.push([])
                pathGame.pieces[currentPiece].mov.space.push([])
            }
            if(mirrorPath){
                pathGame.pieces[currentPiece].mov.paths[1] = mirrorParsingPath.path
                pathGame.pieces[currentPiece].mov.space[1] = mirrorParsingPath.space   
            }
            pathGame.board[indexAndCoordinates.coordinatesToIndex[pathPiecePosition]] = pathGame.pieces[currentPiece]
            var highlightPathMoveList = {
                highlightPathMoveList: move.moveListCoordinates(move.pieceMoveList(pathGame.board, pathPiecePosition))
            }
            ws.send(JSON.stringify(highlightPathMoveList))
        },
        submitPath: function(message, ws, req){
            if(currentPiece != "" && parsingPath.path.length > 0){
                if(movePath){
                    FENGame.pieces[currentPiece].mov.paths.push(parsingPath.path)
                    FENGame.pieces[currentPiece].mov.space.push(parsingPath.space)
                    if(mirrorPieceSelect){
                        FENGame.pieces[mirrorPiece].mov.paths.push(parsingPath.path)
                        FENGame.pieces[mirrorPiece].mov.space.push(parsingPath.space)
                    }
                }
                if(attackPath){
                    FENGame.pieces[currentPiece].mov.attPaths.push(parsingPath.path)
                    FENGame.pieces[currentPiece].mov.attSpace.push(parsingPath.space)
                    if(mirrorPieceSelect){
                        FENGame.pieces[mirrorPiece].mov.attPaths.push(parsingPath.path)
                        FENGame.pieces[mirrorPiece].mov.attSpace.push(parsingPath.space)
                    }
                }
                if(mirrorPath){
                    if(movePath){
                        FENGame.pieces[currentPiece].mov.paths.push(mirrorParsingPath.path)
                        FENGame.pieces[currentPiece].mov.space.push(mirrorParsingPath.space)
                        if(mirrorPieceSelect){
                            FENGame.pieces[mirrorPiece].mov.paths.push(mirrorParsingPath.path)
                            FENGame.pieces[mirrorPiece].mov.space.push(mirrorParsingPath.space)
                        }
                    }
                    if(attackPath){
                        FENGame.pieces[currentPiece].mov.attPaths.push(mirrorParsingPath.path)
                        FENGame.pieces[currentPiece].mov.attSpace.push(mirrorParsingPath.space)
                        if(mirrorPieceSelect){
                            FENGame.pieces[mirrorPiece].mov.attPaths.push(mirrorParsingPath.path)
                            FENGame.pieces[mirrorPiece].mov.attSpace.push(mirrorParsingPath.space)
                        }
                    }
                }
            }
            parsingPath.path = []
            parsingPath.space = []
            mirrorParsingPath.path = []
            mirrorParsingPath.space = []
            var highlightCurrentPieceMoveList = {
                highlightCurrentPieceMoveList: move.moveListCoordinates(move.pieceMoveList(currentPieceBoard, currentPiecePosition)),
                highlightCurrentPieceIgnoreList: move.getIgnoreList(FENGame.pieces[currentPiece].movmods)
            }
            var highlightPathMoveList = {
                highlightPathMoveList: []
            }
            ws.send(JSON.stringify(highlightCurrentPieceMoveList))
            ws.send(JSON.stringify(highlightPathMoveList))
        },
        eraseUnsubmittedPath: function(message, ws, req){
                parsingPath.path = []
                parsingPath.space = []
                mirrorParsingPath.path = []
                mirrorParsingPath.space = []
                pathGame.board[indexAndCoordinates.coordinatesToIndex[pathPiecePosition]].mov.paths = [[]]
                pathGame.board[indexAndCoordinates.coordinatesToIndex[pathPiecePosition]].mov.space = [[]]

            var highlightPathMoveList = {
                highlightPathMoveList: move.moveListCoordinates(move.pieceMoveList(pathGame.board, pathPiecePosition))
            }
            ws.send(JSON.stringify(highlightPathMoveList))
        },
        moveModAdd: function(message, ws, req){
            if(FENGame.pieces[currentPiece].movmods.indexOf(message.moveModAdd)==-1){
                FENGame.pieces[currentPiece].movmods.push(message.moveModAdd)
            }
            if(mirrorPiece && FENGame.pieces[mirrorPiece].movmods.indexOf(message.moveModAdd)==-1){
                FENGame.pieces[mirrorPiece].movmods.push(message.moveModAdd)
            }
        },
        moveModRemove: function(message, ws, req){
            if(FENGame.pieces[currentPiece].movmods.indexOf(message.moveModRemove)!=-1){
                FENGame.pieces[currentPiece].movmods.splice(message.moveModAdd,1)
            }
            if(mirrorPieceSelect && FENGame.pieces[mirrorPiece].movmods.indexOf(message.moveModRemove)!=-1){
                FENGame.pieces[mirrorPiece].movmods.splice(message.moveModAdd,1)
            }
        },
        attributeModAdd: function(message, ws, req){
            if(FENGame.pieces[currentPiece].attrmods.indexOf(message.attributeModAdd)==-1){
                FENGame.pieces[currentPiece].attrmods.push(message.attributeModAdd)
            }
            if(mirrorPieceSelect && FENGame.pieces[mirrorPiece].attrmods.indexOf(message.attributeModAdd)==-1){
                FENGame.pieces[mirrorPiece].attrmods.push(message.attributeModAdd)
            }
            gameControl.activateAttributeMods(FENGame.board)
        },
        attributeModRemove: function(message, ws, req){
            if(FENGame.pieces[currentPiece].attrmods.indexOf(message.attributeModRemove)!=-1){
                FENGame.pieces[currentPiece].attrmods.splice(message.attributeModRemove,1)
                attributeMods.mods[message.attributeModRemove].removal(FENGame.board,FENGame.pieces[currentPiece].color)
            }
            if(mirrorPiece && FENGame.pieces[mirrorPiece].attrmods.indexOf(message.attributeModRemove)!=-1){
                FENGame.pieces[mirrorPiece].attrmods.splice(message.attributeModRemove,1)
                attributeMods.mods[message.attributeModRemove].removal(FENGame.board,FENGame.pieces[mirrorPiece].color)
            }
        },
        attackTypeChange: function(message, ws, req){
            FENGame.pieces[currentPiece].atttype = message.attackTypeChange
            if(mirrorPieceSelect){
                FENGame.pieces[mirrorPiece].atttype = message.attackTypeChange
            }
        },
        highlightFENMoveList: function(message, ws, req){
            var highlightFENMoveList = {
                highlightFENMoveList: move.moveListCoordinates(move.pieceMoveList(FENGame.board, message.highlightFENMoveList.square)),
                highlightFENIgnoreList: move.getIgnoreList(FENGame.pieces[currentPiece].movmods)
            }
            ws.send(JSON.stringify(highlightFENMoveList))
        },
        getMoveMods: function(message, ws, req){
            ws.send(JSON.stringify({
                getMoveMods: move.getMoveModNames(FENGame.pieces[currentPiece].movmods),
            }))
        },
        getAttributeMods: function(message, ws, req){
            ws.send(JSON.stringify({
                getAttributeMods: attributeMods.getAttributeModNames(FENGame.pieces[currentPiece].attrmods)
            }))
        },
        getAttackType: function(message,ws,req){
            ws.send(JSON.stringify({
                getAttackType: FENGame.pieces[currentPiece].atttype
            }))
        },
        mirrorPieceSelect: function(message, ws, req){
            if(message.mirrorPieceSelect == "selected"){
                mirrorPieceSelect = true;
            }
            else{
                mirrorPieceSelect = false
            }
        },
        lethalMovePathSelect: function(message, ws, req){
            if(message.lethalMovePathSelect == 'selected'){
                attackPath = true
            }
            else{
                attackPath = false
            }
        },
        nonLethalMovePathSelect: function(message, ws, req){
            if(message.nonLethalMovePathSelect == 'selected'){
                movePath = true
            }
            else{
                movePath = false
            }
        },
        addIndividualSquare: function(message,ws,req){
            if(currentPiece != ""){
                var row = message.addIndividualSquare.row
                var column = message.addIndividualSquare.column
                if(!isNaN(Number(row)) && !isNaN(Number(column))){
                    var squareIndex = Number(row*16)+Number(column)
                    FENGame.pieces[currentPiece].mov.paths.push([squareIndex,squareIndex])
                    FENGame.pieces[currentPiece].mov.space.push([1])
                    if(mirrorPieceSelect){
                        FENGame.pieces[mirrorPiece].mov.paths.push([squareIndex,squareIndex])
                        FENGame.pieces[mirrorPiece].mov.space.push([1])
                    }
                }
                var highlightCurrentPieceMoveList = {
                    highlightCurrentPieceMoveList: move.moveListCoordinates(move.pieceMoveList(currentPieceBoard, currentPiecePosition)),
                    highlightCurrentPieceIgnoreList: move.getIgnoreList(FENGame.pieces[currentPiece].movmods)
                }
                ws.send(JSON.stringify(highlightCurrentPieceMoveList))
            }
        },
        absoluteTeleport: function(message, ws, req){
            var column = message.absoluteTeleport.charAt(0).toLowerCase()
            var row = message.absoluteTeleport.charAt(1)
            var validSquare = column >= 'a' && column <= 'h' && row >= '1' && row <= '8' 
            if(currentPiece != "" && validSquare){
                var index = indexAndCoordinates.coordinatesToIndex[message.absoluteTeleport]
                FENGame.pieces[currentPiece].movmods.push('TELEPORT'+index)
                if(mirrorPieceSelect){
                    FENGame.pieces[mirrorPiece].movmods.push('TELEPORT'+index)
                }
                var highlightCurrentPieceMoveList = {
                    highlightCurrentPieceMoveList: move.moveListCoordinates(move.pieceMoveList(currentPieceBoard, currentPiecePosition)),
                    highlightCurrentPieceIgnoreList: move.getIgnoreList(FENGame.pieces[currentPiece].movmods)
                }
                ws.send(JSON.stringify(highlightCurrentPieceMoveList))
            }
        },
        relativeDenyMovement: function(message, ws, req){
            if(currentPiece != ""){
                var row = message.relativeDenyMovement.row
                var column = message.relativeDenyMovement.column
                if(!isNaN(Number(row)) && !isNaN(Number(column))){
                    var squareIndex = Number(row*16)+Number(column)
                    if(FENGame.pieces[currentPiece].movmods.indexOf("REMOVERELATIVE"+squareIndex)==-1){
                        FENGame.pieces[currentPiece].movmods.push("REMOVERELATIVE"+squareIndex)
                    }
                    if(mirrorPieceSelect && FENGame.pieces[mirrorPiece].movmods.indexOf("REMOVERELATIVE"+squareIndex)==-1){
                        FENGame.pieces[mirrorPiece].movmods.push("REMOVERELATIVE"+squareIndex)
                    }
                }
                var highlightCurrentPieceMoveList = {
                    highlightCurrentPieceMoveList: move.moveListCoordinates(move.pieceMoveList(currentPieceBoard, currentPiecePosition)),
                    highlightCurrentPieceIgnoreList: move.getIgnoreList(FENGame.pieces[currentPiece].movmods)
                }
                ws.send(JSON.stringify(highlightCurrentPieceMoveList))
            }
        },
        absoluteDenyMovement: function(message, ws, req){
            var column = message.absoluteDenyMovement.charAt(0).toLowerCase()
            var row = message.absoluteDenyMovement.charAt(1)
            var validSquare = column >= 'a' && column <= 'h' && row >= '1' && row <= '8' 
            if(currentPiece != "" && validSquare){
                var index = indexAndCoordinates.coordinatesToIndex[message.absoluteDenyMovement]
                FENGame.pieces[currentPiece].movmods.push('REMOVEABSOLUTE'+index)
                if(mirrorPieceSelect){
                    FENGame.pieces[mirrorPiece].movmods.push('REMOVEABSOLUTE'+index)
                }
                var highlightCurrentPieceMoveList = {
                    highlightCurrentPieceMoveList: move.moveListCoordinates(move.pieceMoveList(currentPieceBoard, currentPiecePosition)),
                    highlightCurrentPieceIgnoreList: move.getIgnoreList(FENGame.pieces[currentPiece].movmods)
                }
                ws.send(JSON.stringify(highlightCurrentPieceMoveList))
            }
        },
        gameSubmit: function(message, ws, req){
            var gameSubmit = message.gameSubmit
            var name = gameSubmit.name
            var description = gameSubmit.description
            var winCondition = gameSubmit.winCondition
            if(name==""){
                ws.send(JSON.stringify({
                    gameSubmitFail: "Invalid Name"
                }))
                return
            }
            if(description==""){
                ws.send(JSON.stringify({
                    gameSubmitFail: "Invalid Description"
                }))
                return
            }
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                db.db('FairyChessMaker').collection("Games").findOne({"name": name}, function(err,result){
                    if (err) throw err;
                if(result == null){
                    db.db('FairyChessMaker').collection("Games").insertOne({
                        "name": name,
                        "description": description,
                        "pieces": JSON.stringify(FENGame.pieces),
                        "FEN": FEN,
                        "winCondition": winCondition
                    })
                    console.log('game added')
                    ws.send(JSON.stringify({
                        gameSubmitSuccess: "/browse"
                    }))
                }
                else{
                    ws.send(JSON.stringify({
                        gameSubmitFail: "Name has already been taken"
                    }))
                    console.log('game add fail')
                }
                db.close();
                })
              });
        },
        mirrorPathSelect: function(message, ws, req){
            mirrorPath = Boolean(message.mirrorPathSelect)
        },
        removeCurrentPieceMovement: function(message, ws, req){
            FENGame.pieces[currentPiece].mov = {
                paths: [],
                space: [],
                attPaths: [],
                attSpace: [],
            }
            for(var i = FENGame.pieces[currentPiece].movmods.length-1; i >= 0 && FENGame.pieces[currentPiece].movmods.length>0; i--){
                var currentMod = FENGame.pieces[currentPiece].movmods[i]
                if(currentMod.substring(0,8)==('TELEPORT') || currentMod.substring(0,14)==('REMOVEABSOLUTE') || currentMod.substring(0,14)==('REMOVERELATIVE')){
                    FENGame.pieces[currentPiece].movmods.splice(i,1)
                }
            }
            if(mirrorPieceSelect){
                FENGame.pieces[mirrorPiece].mov = {
                    paths: [],
                    space: [],
                    attPaths: [],
                    attSpace: [],
                }
                for(var i = FENGame.pieces[mirrorPiece].movmods.length-1; i >= 0 && FENGame.pieces[mirrorPiece].movmods.length>0; i--){
                    var currentMod = FENGame.pieces[mirrorPiece].movmods[i]
                    if(currentMod.substring(0,8)==('TELEPORT') || currentMod.substring(0,14)==('REMOVEABSOLUTE') || currentMod.substring(0,14)==('REMOVERELATIVE')){
                        FENGame.pieces[mirrorPiece].movmods.splice(i,1)
                    }
                }
            }
            ws.send(JSON.stringify({
                highlightCurrentPieceMoveList: move.moveListCoordinates(move.pieceMoveList(currentPieceBoard, currentPiecePosition))
            }))
        }
    }

    var pathAdd = {
        UP: function(pathName, amount){
            addToPath(pathName, -16, amount)
        },
        DOWN: function(pathName, amount){
            addToPath(pathName,16, amount)
        },
        LEFT: function (pathName,amount){
           addToPath(pathName,-1, amount)
        },
        RIGHT: function(pathName,amount){
            addToPath(pathName,1, amount)
        },
        UPLEFT: function(pathName,amount){
            addToPath(pathName,-17, amount)
        },
        UPRIGHT: function(pathName,amount){
            addToPath(pathName,-15, amount)
        },
        DOWNLEFT: function(pathName,amount){
            addToPath(pathName,15, amount)
        },
        DOWNRIGHT: function(pathName,amount){
            addToPath(pathName,17, amount)
        }
    }

    var addPathMirror = {
        UP: "DOWN",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
        DOWN: "UP",
        UPLEFT: "DOWNRIGHT",
        UPRIGHT: "DOWNLEFT",
        DOWNLEFT: "UPRIGHT",
        DOWNRIGHT: "UPLEFT"
    }
    function addToPath(pathName, lengthZero, amount){
        if(pathName.path.length==0){
            pathName.path.push(lengthZero)
            pathName.path.push(amount*lengthZero)
        }
        else{
        pathName.path.push(pathName.path[pathName.path.length-1]+amount*lengthZero)
        }
        pathName.space.push(Math.abs(lengthZero))
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