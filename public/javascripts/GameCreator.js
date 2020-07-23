var piece = require('./Piece')
var indexAndCoordinates = require('./IndexAndCoordinates')
var game = require('./Game')
var currentPieceBoard = new Array(128)
var htmlBoardControl = require('./HtmlBoardControl')
var abbreviationTranslator = require('./abbreviationTranslator')
const socket = new WebSocket('ws://localhost:3000/gamecreate/')
var horizontalPathLeft = {
 path: [-1,-7],
 space: [1]
}
var horizontalPathRight = {
 path: [1,7],
 space: [1]
}
var verticalPathUp = {
 path: [-16,-112],
 space: [16]
}
var verticalPathDown = {
    path: [16,112],
    space: [16]
}
var diagonalPathUpLeft = {
    path: [-17,-119],
    space: [17]
}
var diagonalPathUpRight = {
    path: [-15, -117],
    space: [15]
}
var diagonalPathDownLeft = {
    path: [15, 117],
    space: [15]
}
var diagonalPathDownRight = {
    path: [17,119],
    space: [17] 
}

var right = [1,1]
var left = [-1,-1]
var down = [16,16]
var downRight = [17,17]
var downLeft = [15,15]
var up = [-16,-16]
var upLeft = [-17,-17]
var upRight = [-15,-15]
var knightUpLeft1 = [-33,-33]
var knightUpLeft2 = [-18,-18]
var knightUpRight1 = [-31,-31]
var knightUpRight2 = [-14,-14]
var knightDownLeft1 = [14,14]
var knightDownLeft2 = [31,31]
var knightDownRight1 = [18,18]
var knightDownRight2 = [33,33]
var verticalSpace = 16
var diagonalSpaceUpLeft = 17
var diagonalSpaceUpRight = 15
var diagonalSpaceDownLeft = 15
var diagonalSpaceDownRight = 17
game.initializeBoard(currentPieceBoard)
$(document).ready(function(){
    var htmlSquares = []
    var htmlFENBoardSquares = []
    var htmlCurrentPieceBoardSquares = []
    var htmlPathBoardSquares = []
    var locateHtmlFENBoardSquares = {}
    var locateHtmlCurrentPieceBoardSquares = {}
    var locateHtmlPathBoardSquares = {}
    var locateHtmlSquares = {}
    var pieces = piece.createPieces()
    var currentPiece = ""
    var currentPiecePosition = -1
    var pathPiecePositoin = -1
    $(document).on('load',function(){
        htmlSquares = htmlBoardControl.createHtmlSquares()
        for(var i = 0; i < htmlSquares.length; i++){
            if($($(htmlSquares[i]).parents()[3])[0]==$("#FENBoard")[0]){
                htmlFENBoardSquares.push($(htmlSquares[i]))
            }
            else if($($(htmlSquares[i]).parents()[3])[0]==$("#currentPieceBoard")[0]){
                htmlCurrentPieceBoardSquares.push($(htmlSquares[i]))
            }
            else{
                htmlPathBoardSquares.push($(htmlSquares[i]))
            }
        }
        locateHtmlCurrentPieceBoardSquares = htmlBoardControl.createLocateHtmlSquares(htmlCurrentPieceBoardSquares)
        locateHtmlFENBoardSquares = htmlBoardControl.createLocateHtmlSquares(htmlFENBoardSquares)
        locateHtmlPathBoardSquares = htmlBoardControl.createLocateHtmlSquares(htmlPathBoardSquares)
    })
    socket.addEventListener('open', function (event) {               
        
    });
    var messageResponse = {
        highlightCurrentPieceMoveList: function(message){
            htmlBoardControl.updateHighlightedMoves(htmlCurrentPieceBoardSquares, locateHtmlCurrentPieceBoardSquares, message.highlightCurrentPieceMoveList)
        },
        highlightPathMoveList: function(message){
            htmlBoardControl.updateHighlightedMoves(htmlPathBoardSquares, locateHtmlPathBoardSquares, message.highlightPathMoveList)
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
    });
    $("input[value='Submit']").click(function(){
        var name = $("#name").val()
        var description = $("#desciption").val()
        $.post("/gamecreate",{
            name: name,
            author: author,
            description: description,
            FEN: htmlFENBoard.position(),
            pieces: pieces
        }).done(function(data){
            window.location.assign(data)
        })
    })
    $("#FENSubmit").click(function(){
        htmlFENBoard.position($("#FEN").val())
    })
    function currentPieceOnDragStart (source, draggedPiece, position, orientation) {
        if(draggedPiece!=currentPiece && source =='spare'){
            htmlCurrentPieceBoard.position({
                d4: draggedPiece
            })
            htmlPathBoard.position({
                d4: draggedPiece
            })
            currentPieceBoard[indexAndCoordinates.coordinatesToIndex[currentPiecePosition]] = piece.createPiece()
            currentPiecePosition = 'd4'
            pathPiecePosition = 'd4'
            currentPiece = draggedPiece
            currentPieceBoard[indexAndCoordinates.coordinatesToIndex['d4']] = pieces[currentPiece]
            $("#pieceName").text(currentPiece)
            htmlBoardControl.updateHighlightedMovesOnGameCreator(currentPieceBoard, currentPiecePosition, htmlSquares, locateHtmlCurrentPieceBoardSquares)
            var currentPieceSend = {
                currentPiece: draggedPiece
            }
            socket.send(JSON.stringify(currentPieceSend))
            return false
        }
        if(draggedPiece==currentPiece && source == 'spare'){
            return false
        }
    }

    function currentPieceOnDrop(source, target, piece, newPos, oldPos, orientation){
        currentPiecePosition = Object.keys(newPos)[0]
        var currentPiecePosition = {
            currentPiecePosition: {
                from: Object.keys(oldPos)[0],
                to: Object.keys(newPos)[0]
            }
        }
        socket.send(JSON.stringify(currentPiecePosition))
    }
    function pathBoardOnDrop(source, target, piece, newPos, oldPos, orientation){
        pathPiecePosition = Object.keys(newPos)[0]
        var pathPiecePosition = {
            pathPiecePosition: {
                from: Object.keys(oldPos)[0],
                to: Object.keys(newPos)[0]
            }
        }
        socket.send(JSON.stringify(pathPiecePosition))
    }

    function htmlFENBoardOnDrop(source, target, piece, newPos, oldPos, orientation){
        currentPiecePosition = Object.keys(newPos)[0]
        $("#FEN").val(ChessBoard.objToFen(newPos))
        var FENSend = {
            FEN: ChessBoard.objToFen(newPos)
        }
        socket.send(JSON.stringify(FENSend))
    }

    var pieceTheme = "../images/chesspieces/wikipedia/{piece}.png"
    
    var FENConfig = {
        pieceTheme: pieceTheme,
        sparePieces: true,
        dropOffBoard: 'trash',
        onDrop: htmlFENBoardOnDrop
    }

    var currentPieceConfig = {
        pieceTheme: pieceTheme, 
        sparePieces: true,
        onDragStart: currentPieceOnDragStart,
        onDrop: currentPieceOnDrop
    }

    var htmlFENBoard = Chessboard('FENBoard', FENConfig)
    var htmlCurrentPieceBoard = Chessboard('currentPieceBoard', currentPieceConfig)
    var htmlPathBoard = Chessboard('pathBoard', {pieceTheme: pieceTheme, onDrop: pathBoardOnDrop, draggable: true})
    $(document).trigger('load')
})