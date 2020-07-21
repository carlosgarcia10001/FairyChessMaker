var boardState  = require('./BoardState')
var piece = require('./Piece')
var move = require('./Move')
var AttributeMods = require('./AttributeMods')
var indexAndCoordinates = require('./IndexAndCoordinates')
var board = new Array(128)
var turn = 'w'
var boardHistory = []

function initializeBoard(parsedBoard){
    for(var i = 0; i < parsedBoard.length; i++){
        var createdPiece = piece.createPiece()
         parsedBoard[i] = createdPiece
     }
}

function placePieceOnBoard(parsedBoard, parsedPiece, parsedSquare){
        parsedBoard[parsedSquare] = parsedPiece
        activateAttributeMods(parsedBoard)
}

function activateAttributeMods(parsedBoard){
    for(var i = 0; i < parsedBoard.length;i++){
        if(boardState.validSquare(i) && parsedBoard[i].attrmods && parsedBoard[i].attrmods.length>0){
            AttributeMods.parseMods(parsedBoard, i, parsedBoard[i].color)
        }
    }
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
            if(i<113){
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
    let number = 8
    var keys = Object.keys(parsedPieces)
    while(FENcopy != ''){
        if(FENcopy.startsWith('/')){
            letter = 97
            number--
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

var game = {
    board: new Array(128),
    turn: 'w',
    pieces: piece.createPieces(),
    FEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
    winCondition: "checkMate"
}

parseFEN(game.board,game.FEN,game.pieces)

exports.game = game
exports.board = board
exports.turn = turn
exports.initializeBoard=initializeBoard
exports.placePieceOnBoard=placePieceOnBoard
exports.boardHistory = boardHistory
exports.createFEN = createFEN
exports.parseFEN = parseFEN
exports.activateAttributeMods = activateAttributeMods