var htmlBoardControl = require('./htmlBoardControl')
const socket = new WebSocket('ws://localhost:3000')
var FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
var highlightedMoves

$(document).ready(function(){
    var htmlSquares = []
    var locateHtmlSquares = {}
    $(document).on('load',function(){
        htmlSquares = htmlBoardControl.createHtmlSquares()
        locateHtmlSquares = htmlBoardControl.createLocateHtmlSquares(htmlSquares)
        var matchId = window.location.pathname.substring(6)  
        socket.addEventListener('open', function (event) {               
            socket.send(JSON.stringify({matchId: matchId}));
        });

        socket.addEventListener('message', function (message) {
            var data = message.data
            if(data.charAt(0)=='{'){ //A JSON would imply that the game is being setup or is being updated based on the opposing player's moves
                data = JSON.parse(message.data)
                if(data.match){
                    if(data.match.FEN){
                        FEN = data.match.FEN
                        htmlBoard.position(FEN)  
                    }
                }
                if(data.FEN){
                    if(FEN!=data.FEN){
                        htmlBoard.position(data.FEN)
                    }
                    FEN = data.FEN 
                }
                if(data.highlightMoveList){
                    var moveList = data.highlightMoveList
                    var square = ""
                    highlightedMoves = moveList
                    htmlBoardControl.updateHighlightedMoves(htmlSquares,locateHtmlSquares, moveList)
                }
            }
            else if(message.data == "/browse"){ //Only occurs due to an error
                window.location.assign(message.data)
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
        var highlightMoveList = {
            highlightMoveList: square
        }
        socket.send(JSON.stringify(highlightMoveList))
        if(piece==false){
            htmlBoardControl.unHighlightValidMoves(htmlSquares)
        }
    }

    function onDrop(source, target, piece){
        var parsedMove = {
            move: {
                from: source,
                to: target
            }
        }
        if(highlightedMoves.indexOf(target)==-1){
            return 'snapback'
        }
        socket.send(JSON.stringify(parsedMove))

    }
    var htmlBoard = Chessboard('myBoard',config)
    $(document).trigger('load')
})