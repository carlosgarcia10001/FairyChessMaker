var piece = require('./Piece')
var indexAndCoordinates = require('./IndexAndCoordinates')
var game = require('./Game')
var board = new Array(128)
var htmlBoardControl = require('./HtmlBoardControl')
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
game.initializeBoard(board)
$(document).ready(function(){
    var htmlSquares = []
    var htmlFENBoardSquares = []
    var htmlCurrentPieceBoardSquares = []
    var locateHtmlFENBoardSquares = {}
    var locateHtmlCurrentPieceBoardSquares = {}
    var locateHtmlSquares = {}
    var pieces = piece.createPieces()
    var currentPiece = ""
    var currentPiecePosition = -1
    $(document).on('load',function(){
        htmlSquares = htmlBoardControl.createHtmlSquares()
        for(var i = 0; i < htmlSquares.length; i++){
            if($($(htmlSquares[i]).parents()[3])[0]==$("#FENBoard")[0]){
                htmlFENBoardSquares.push($(htmlSquares[i]))
            }
            else{
                htmlCurrentPieceBoardSquares.push($(htmlSquares[i]))
            }
        }
        locateHtmlCurrentPieceBoardSquares = htmlBoardControl.createLocateHtmlSquares(htmlCurrentPieceBoardSquares)
        locateHtmlFENBoardSquares = htmlBoardControl.createLocateHtmlSquares(htmlFENBoardSquares)
    })
    $("input[value='Submit']").click(function(){
        var name = $("#name").val()
        $.post("/gamecreate",{
            name: name,
            game: pieces
        }).done(function(data){
            window.location.assign(data)
        })
    })

    var FENBoard = Chessboard('FENBoard')
    var currentPieceBoard = Chessboard('currentPieceBoard')
    $(document).trigger('load')
})