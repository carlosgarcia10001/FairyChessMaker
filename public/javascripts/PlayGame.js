var move = require('./Move')
var fs = require('fs')
var piece = require('./Piece')
var indexAndCoordinates = require('./IndexAndCoordinates')
var pieces = piece.createPieces()
var cleanPieceFileRead = require('./CleanPieceFileRead')
var game = require('./Game')
var board = new Array(128)
var htmlBoardControl = require('./htmlBoardControl')
game.initializeBoard(board)

$(document).ready(function(){
    var htmlSquares = []
    var locateHtmlSquares = {}
    $(document).on('load',function(){
        htmlSquares = htmlBoardControl.createHtmlSquares()
        locateHtmlSquares = htmlBoardControl.createLocateHtmlSquares(htmlSquares)
        var pieceData = fs.readFileSync(__dirname + "/CustomChessPieces.json")
        pieces = JSON.parse(pieceData)
        cleanPieceFileRead.cleanPieces(pieces)
        console.log(pieces)
        game.parseFEN(board, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', pieces)
    })
    
    var config = {
        pieceTheme: "../images/chesspieces/wikipedia/{piece}.png",
        draggable: true,
        position: "start",
        onMouseoverSquare: onMouseoverSquare
    }

    function onMouseoverSquare(square, piece){
        if(piece==false){
            htmlBoardControl.unHighlightValidMoves(htmlSquares)
        }
        else{
            htmlBoardControl.updateHighlightedMoves(board,square,htmlSquares,locateHtmlSquares)
        }
    }

    var htmlBoard = Chessboard('myBoard',config)
    $(document).trigger('load')
})