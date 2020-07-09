var piece = require('./Piece')
var indexAndCoordinates = require('./IndexAndCoordinates')
var move = require('./Move')
var game = require('./Game')
var board = new Array(128)
var htmlBoardControl = require('./htmlBoardControl')
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

game.initializeBoard(board)
$(document).ready(function(){
    var htmlSquares = []
    var locateHtmlSquares = {}
    var pieces = piece.createPieces()
    var currentPiece = ""
    var currentPiecePosition = -1
    console.log(pieces)
    $(document).on('load',function(){
        htmlSquares = htmlBoardControl.createHtmlSquares()
        locateHtmlSquares = htmlBoardControl.createLocateHtmlSquares(htmlSquares)
        $('input[name="attackType"]').change(function(){
            var value = $(this).val()
            if(currentPiece!=""){ 
                pieces[currentPiece].atttype = value
            }
        })
        $('input[name*="mods"]').change(function(){
            var value = $(this).val()
            if(currentPiece!=""){
                var list
                if($(this).attr('name')=='movemods'){
                    list = pieces[currentPiece].movmods
                }
                else {
                    list = pieces[currentPiece].attrmods
                }
                if($(this).prop('checked')){
                    if(list.indexOf(value)==-1){
                        list.push(value)
                    }
                }
                else{
                    if(list.indexOf(value)!=-1){
                        list.splice(list.indexOf(value),1)
                    }
                }
            }
        })
    })
    $("input[value='Submit']").click(function(){
        $.post('/',pieces)
    })
    $("#queenMovement").click(function(){
        if(currentPiece!=""){
            piece.addPath(pieces[currentPiece], verticalPathUp.path, verticalPathUp.space)
            piece.addPath(pieces[currentPiece], verticalPathDown.path, verticalPathDown.space)
            piece.addPath(pieces[currentPiece], horizontalPathLeft.path, horizontalPathLeft.space)
            piece.addPath(pieces[currentPiece], horizontalPathRight.path, horizontalPathRight.space)
            piece.addPath(pieces[currentPiece], diagonalPathUpLeft.path, diagonalPathUpLeft.space)
            piece.addPath(pieces[currentPiece], diagonalPathUpRight.path, diagonalPathUpRight.space)
            piece.addPath(pieces[currentPiece], diagonalPathDownLeft.path, diagonalPathDownLeft.space)
            piece.addPath(pieces[currentPiece], diagonalPathDownRight.path, diagonalPathDownRight.space)
            console.log(board[indexAndCoordinates.coordinatesToIndex[currentPiecePosition]])
            htmlBoardControl.updateHighlightedMoves(board, currentPiecePosition, htmlSquares, locateHtmlSquares)
        }
    })
    $("#kingMovement").click(function(){
        if(currentPiece!="")
            piece.addPath(pieces[currentPiece], right,[1])
            piece.addPath(pieces[currentPiece], left,[1])
            piece.addPath(pieces[currentPiece], down,[1])
            piece.addPath(pieces[currentPiece], downRight,[1])
            piece.addPath(pieces[currentPiece], downLeft,[1])
            piece.addPath(pieces[currentPiece], up,[1])
            piece.addPath(pieces[currentPiece], upLeft,[1])
            piece.addPath(pieces[currentPiece], upRight,[1])
            console.log(board[indexAndCoordinates.coordinatesToIndex[currentPiecePosition]])
            htmlBoardControl.updateHighlightedMoves(board, currentPiecePosition, htmlSquares, locateHtmlSquares)
    })
    $("#bishopMovement").click(function(){
        if(currentPiece!=""){
            piece.addPath(pieces[currentPiece], diagonalPathUpLeft.path,diagonalPathUpLeft.space)
            piece.addPath(pieces[currentPiece], diagonalPathUpRight.path,diagonalPathUpRight.space)
            piece.addPath(pieces[currentPiece], diagonalPathDownLeft.path,diagonalPathDownLeft.space)
            piece.addPath(pieces[currentPiece], diagonalPathDownRight.path,diagonalPathDownRight.space)
            htmlBoardControl.updateHighlightedMoves(board, currentPiecePosition, htmlSquares, locateHtmlSquares)
        }
    })
    $("#rookMovement").click(function(){
        if(currentPiece!=""){
            piece.addPath(pieces[currentPiece], horizontalPathLeft.path,horizontalPathLeft.space)
            piece.addPath(pieces[currentPiece], horizontalPathRight.path,horizontalPathRight.space)
            piece.addPath(pieces[currentPiece], verticalPathUp.path,verticalPathUp.space)
            piece.addPath(pieces[currentPiece], verticalPathDown.path,verticalPathDown.space)
            htmlBoardControl.updateHighlightedMoves(board, currentPiecePosition, htmlSquares, locateHtmlSquares)
        }
    })
    $("#knightMovement").click(function(){
        if(currentPiece!=""){
            piece.addPath(pieces[currentPiece], knightUpLeft1,[1])
            piece.addPath(pieces[currentPiece], knightUpLeft2,[1])
            piece.addPath(pieces[currentPiece], knightUpRight1,[1])
            piece.addPath(pieces[currentPiece], knightUpRight2,[1])
            piece.addPath(pieces[currentPiece], knightDownLeft1,[1])
            piece.addPath(pieces[currentPiece], knightDownLeft2,[1])
            piece.addPath(pieces[currentPiece], knightDownRight1,[1])
            piece.addPath(pieces[currentPiece], knightDownRight2,[1])
            htmlBoardControl.updateHighlightedMoves(board, currentPiecePosition, htmlSquares, locateHtmlSquares)
          }
    })
    $("#pawnMovement").click(function(){
        if(currentPiece!=""){
            if(currentPiece.charAt(0)=='w'){
                piece.addPath(pieces[currentPiece], up, [1], false)
                piece.addAttPath(pieces[currentPiece],upLeft,[1])
                piece.addAttPath(pieces[currentPiece], upRight,[1])
            }
            else{
                piece.addPath(pieces[currentPiece], down, [1], false)
                piece.addAttPath(pieces[currentPiece], downLeft,[1])
                piece.addAttPath(pieces[currentPiece], downRight,[1])
            }
            console.log(pieces[currentPiece])
            htmlBoardControl.updateHighlightedMoves(board, currentPiecePosition, htmlSquares, locateHtmlSquares)
        }
    })
    var config = {
        sparePieces: true,
        onDragStart: onDragStart,
        onDrop: onDrop,
        pieceTheme: "../images/chesspieces/wikipedia/{piece}.png"
    }
    function loadCheckboxes(){
        var mods = $('input[name*="mods"]')
        var attackType = $('input[name=attackType]')
        for(var i = 0; i < mods.length; i++){
            if(pieces[currentPiece].movmods.indexOf($(mods[i]).val())!=-1 || pieces[currentPiece].attrmods.indexOf($(mods[i]).val())!=-1){
                $(mods[i]).prop('checked',true)
            }
            else{
                $(mods[i]).prop('checked',false)
            }
        }
        for(var i = 0; i < attackType.length;i++){
            if(pieces[currentPiece].atttype == $(attackType[i]).val()){
                $(attackType[i]).prop('checked',true)
            }
        }
    }

    function onDragStart (source, draggedPiece, position, orientation) {
        if(draggedPiece!=currentPiece && source =='spare'){
            htmlBoard.position({
                d4: draggedPiece
            }
        )
            board[indexAndCoordinates.coordinatesToIndex[currentPiecePosition]] = piece.createPiece()
            currentPiecePosition = 'd4'
            currentPiece = draggedPiece
            board[indexAndCoordinates.coordinatesToIndex['d4']] = pieces[currentPiece]
            htmlBoardControl.updateHighlightedMoves(board, currentPiecePosition, htmlSquares, locateHtmlSquares)
            loadCheckboxes()
            return false
        }
        if(draggedPiece==currentPiece && source == 'spare'){
            return false
        }

    }
    
    function onDrop(source, target, droppedPiece, newPos, oldPos, orientation){
        if(target!='offboard'){
            board[indexAndCoordinates.coordinatesToIndex[currentPiecePosition]] = piece.createPiece()
            currentPiecePosition = Object.keys(newPos)[0]
            board[indexAndCoordinates.coordinatesToIndex[currentPiecePosition]] = pieces[currentPiece]
            console.log(currentPiecePosition)
            htmlBoardControl.updateHighlightedMoves(board, currentPiecePosition, htmlSquares, locateHtmlSquares)
        }
    }

    var htmlBoard = Chessboard('myBoard',config)
    $(document).trigger('load')
})