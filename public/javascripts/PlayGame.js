var htmlBoardControl = require('./htmlBoardControl')
const socket = new WebSocket('ws://localhost:3000/play/'+window.location.pathname.substring(6))
var FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
var highlightedMoves
var playerColor
var turn
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
                    if(data.match.FENHistory){
                        FEN = data.match.FENHistory[data.match.FENHistory.length-1]
                        htmlBoard.position(FEN)  
                    }
                    if(data.match.playerColor){
                        playerColor = data.match.playerColor
                    }
                    if(data.match.turn){
                        turn = data.match.turn
                        changeGameStatus(turn)
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
                if(data.turn){
                    turn = data.turn
                    changeGameStatus(turn)
                }
                if(data.winner){
                    changeGameStatus(data.winner)
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
        onDrop: onDrop,
    }

    var gameStatus = {
        w: "White's Turn",
        b: "Black's Turn",
        whiteWin: "White Won",
        blackWin: "Black Won"
    }

    function changeGameStatus(status){
        $("#gameStatus").text(gameStatus[status])
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
        if(highlightedMoves.indexOf(target)==-1 || turn!=playerColor || piece.charAt(0)!=playerColor){
            return 'snapback'
        }
        socket.send(JSON.stringify(parsedMove))

    }
    var htmlBoard = Chessboard('myBoard',config)
    $(document).trigger('load')
})