var move = require('./Move')
var piece = require('./Piece')
var pieces = piece.createPieces()
var cleanPieceFileRead = require('./CleanPieceFileRead')
var game = require('./Game')
var board = new Array(128)
var htmlBoardControl = require('./htmlBoardControl')
var boardState = require('./BoardState')
const socket = new WebSocket('ws://localhost:3000')
var FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
game.initializeBoard(board)

$(document).ready(function(){
    var htmlSquares = []
    var locateHtmlSquares = {}
    $(document).on('load',function(){
        htmlSquares = htmlBoardControl.createHtmlSquares()
        locateHtmlSquares = htmlBoardControl.createLocateHtmlSquares(htmlSquares)
        var matchId = window.location.pathname.substring(6)  

        socket.addEventListener('open', function (event) {
            console.log('matchId sent')                
            socket.send(JSON.stringify({id: matchId}));
        });

        socket.addEventListener('message', function (message) {
            var data = message.data
            console.log(data)
            if(data.charAt(0)=='{'){ //A JSON would imply that the game is being setup or is being updated based on the opposing player's moves
                data = JSON.parse(message.data)
                if(data.FEN){
                    FEN = data.FEN
                }
                if(data.pieces){
                    pieces = data.pieces
                }
                console.log(pieces)
                cleanPieceFileRead.cleanPieces(pieces)
                game.parseFEN(board, FEN, pieces)
                console.log(FEN)
                htmlBoard.position(FEN)
            }
            else if(message.data == "/browse"){ //Only occurs due to an error
                window.location.assign(message)
            }
            else{ //If a move is given 

            }
        });  
    })

    var config = {
        pieceTheme: "../images/chesspieces/wikipedia/{piece}.png",
        draggable: true,
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
        socket.send(movement)
        boardState.printBoard(board)
        if(movement == false){
            return 'snapback'
        }

    }
    var htmlBoard = Chessboard('myBoard',config)
    $(document).trigger('load')
})