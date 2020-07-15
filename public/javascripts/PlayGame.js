var move = require('./Move')
var piece = require('./Piece')
var pieces = piece.createPieces()
var cleanPieceFileRead = require('./CleanPieceFileRead')
var game = require('./Game')
var board = new Array(128)
var htmlBoardControl = require('./htmlBoardControl')
var boardState = require('./BoardState')

game.initializeBoard(board)

$(document).ready(function(){
    var htmlSquares = []
    var locateHtmlSquares = {}
    $(document).on('load',function(){
        htmlSquares = htmlBoardControl.createHtmlSquares()
        locateHtmlSquares = htmlBoardControl.createLocateHtmlSquares(htmlSquares)
        var matchId = window.location.pathname.substring(6)
        $.post('/play',
        {
            id: matchId 
        }).done(function(data) {
            pieces = JSON.parse(data)
            if(data == "/browse"){
                window.location.assign(data)
            }
            cleanPieceFileRead.cleanPieces(pieces)
            game.parseFEN(board, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', pieces)
        })
    })
    
    var config = {
        pieceTheme: "../images/chesspieces/wikipedia/{piece}.png",
        draggable: true,
        position: "start",
        onMouseoverSquare: onMouseoverSquare,
        onDrop: onDrop
    }

    function onMouseoverSquare(square, piece){
        if(piece==false){
            htmlBoardControl.unHighlightValidMoves(htmlSquares)
        }
        else{
            htmlBoardControl.updateHighlightedMoves(board,square,htmlSquares,locateHtmlSquares)
        }
    }

    function onDrop(source, target, piece){
        var movement = move.makeMove(board, 'w', source, target)
        boardState.printBoard(board)
        if(movement == false){
            return 'snapback'
        }

    }
    var htmlBoard = Chessboard('myBoard',config)
    $(document).trigger('load')
})