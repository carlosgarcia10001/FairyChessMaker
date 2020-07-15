var boardState  = require('./BoardState')
var piece = require('./Piece')
var move = require('./Move')
var AttributeMods = require('./AttributeMods')
var indexAndCoordinates = require('./IndexAndCoordinates')
var board = new Array(128)
var turn = 'w'
var boardHistory = []

function addBoardStateToHistory(parsedBoard, parsedTurn){
    parsedBoardHistory.push({
        board: parsedBoard.slice(),
        turn: parsedTurn
    })
}

function initializeBoard(parsedBoard){
    var createdPiece = ""
    if(typeof(piece)=='undefined'){
        createdPiece = createPiece()
    }
    else{
        createdPiece = piece.createPiece() 
    }
    for(var i = 0; i < parsedBoard.length; i++){
         parsedBoard[i] = createdPiece
     }
}

function placePieceOnBoard(parsedBoard, parsedPiece, parsedSquare){
        parsedBoard[parsedSquare] = parsedPiece
        AttributeMods.parseMods(parsedBoard, parsedSquare, parsedPiece.color)
}

function createFEN(parsedBoard){
    var count = 0;
    var FEN = ""
    for(var i = 0; i < 120; i++){
        if(!boardState.validSquare(i)){
            i+=8
            if(count>0){
                FEN+=count
            }
            if(i<112){
                FEN+='/'
            }
            count = 0
        }
        if(boardState.validSquare(i) && boardState.emptySquare(parsedBoard, i)){
            count++
        }
        if(boardState.validSquare(i) && boardState.occupiedSquare(parsedBoard, i)){
            if(count>0){
                FEN+=count
            }
            count = 0
            FEN+=parsedBoard[i].id
        }
    }
    return FEN
}

function parseFEN(parsedBoard, parsedFEN, parsedPieces){
    var FENcopy = parsedFEN.substring(0)
    let letter = 97
    let number = 1
    var keys = Object.keys(parsedPieces)
    while(FENcopy != ''){
        if(FENcopy.startsWith('/')){
            letter = 97
            number++
        }
        else if(!isNaN(Number(FENcopy.charAt(0)))){
            var count = Number(FENcopy.charAt(0))
            for(var i = 0; i < count; i++){
                parsedBoard[indexAndCoordinates.coordinatesToIndex[String.fromCharCode(letter)+number]] = piece.createPiece()
                letter++
            }
        }
        else{
            for(var i = 0; i < keys.length; i++){
                if(parsedPieces[keys[i]].id == FENcopy.charAt(0)){
                    parsedBoard[indexAndCoordinates.coordinatesToIndex[String.fromCharCode(letter)+number]] = parsedPieces[keys[i]]
                }
            }
            letter++
        }
        FENcopy = FENcopy.substring(1)
    }
}

function undoMove(parsedBoard, parsedBoardHistory){
    parsedBoardHistory.splice(parsedBoardHistory.length-1,1)
    parsedBoard = parsedBoardHistory[parsedBoardHistory.length-1].board.slice()
    turn = parsedBoardHistory[parsedBoardHistory.length-1].turn
}

function checkMate(board, color){
    var enemyColor = 'w'
    if(color = 'w'){
        enemyColor = 'b'
    }
    var enemyPositions = boardState.pieceIndex(board, enemyColor)
    for(var i = 0; i < enemyPositions.length;i++){
        enemyMoveList = move.pieceMoveList(board, enemyPositions[i])
        for(var j = 0; j < enemyMoveList.length;j++){
            var copyBoard = board.slice()
            makeMove(copyBoard, color, enemyPositions[i], enemyMoveList[j], true)
            if(!check(copyBoard, color)){
                return false
            }
        }
    }
    return true
}

initializeBoard(board)
exports.board = board
exports.turn = turn
exports.initializeBoard=initializeBoard
exports.placePieceOnBoard=placePieceOnBoard
exports.checkMate = checkMate
exports.boardHistory = boardHistory
exports.createFEN = createFEN
exports.parseFEN = parseFEN