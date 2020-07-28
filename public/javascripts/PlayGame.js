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

        var messageResponse = {
            match: function(data){
                if(data.match.FENHistory){
                    FEN = data.match.FENHistory[data.match.FENHistory.length-1]
                    htmlBoard.position(FEN)  
                }
                if(data.match.playerColor){
                    playerColor = data.match.playerColor
                    var orientation
                    if(playerColor == 'w'){
                        orientation = 'white'
                    }
                    else{
                        orientation = 'black'
                    }
                    htmlBoard.orientation(orientation)
                    htmlSquares = htmlBoardControl.createHtmlSquares()
                    locateHtmlSquares = htmlBoardControl.createLocateHtmlSquares(htmlSquares)
                }
                if(data.match.turn){
                    console.log(data)
                    turn = data.match.turn
                    changeGameStatus(turn)
                }
                if(data.match.winner && data.match.winner!=false){
                    var winner = 'draw'
                    if(data.match.winner=='w'){
                        winner = 'whiteWin'
                    }
                    else if (data.match.winner=='b'){
                        winner = 'blackWin'
                    }
                    var player 
                    playerColor = player
                    changeGameStatus(winner)
                }
            },
            FEN: function(data){
                if(FEN!=data.FEN){
                    htmlBoard.position(data.FEN)
                }
                FEN = data.FEN 
            },
            highlightMoveList: function(data){
                console.log(data.highlightMoveList)
                var moveList = data.highlightMoveList
                highlightedMoves = moveList
                htmlBoardControl.updateHighlightedMoves(htmlSquares,locateHtmlSquares, moveList)
            },
            turn: function(data){
                turn = data.turn
                changeGameStatus(turn)
            },
            winner: function(data){
                if(data.winner!=false){
                    var winner = 'draw'
                    if(data.winner=='w'){
                        winner = 'whiteWin'
                    }
                    else if (data.winner=='b'){
                        winner = 'blackWin'
                    }
                    var player 
                    playerColor = player
                    changeGameStatus(winner)
                }
            }
        }
        socket.addEventListener('message', function (message) {
            var data = message.data
            if(data.charAt(0)=='{'){ 
                data = JSON.parse(message.data)
                var keys = Object.keys(data)
                for(var i = 0; i < keys.length; i++){
                    messageResponse[keys[i]](data)
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
        blackWin: "Black Won",
        draw: "It's a draw"
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