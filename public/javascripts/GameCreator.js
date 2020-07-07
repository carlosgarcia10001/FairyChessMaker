var piece = require('./Piece')
var indexAndCoordinates = require('./IndexAndCoordinates')
var move = require('./Move')
var game = require('./Game')
var board = new Array(128)
var htmlBoardControl = require('./htmlBoardControl')
game.initializeBoard(board)
$(document).ready(function(){
    var htmlSquares = []
    var locateHtmlSquares = {}
    var pieces = piece.createPieces()
    var currentPiece = ""
    var currentPiecePosition = -1
    var mouseDown = false
    var individualSquares = false
    var addingSquares = true //Used to make sure you only add squares or delete them during a single drag
    var mirror = false
    $(document).on('load',function(){
        htmlSquares = htmlBoardControl.createHtmlSquares()
        locateHtmlSquares = htmlBoardControl.createLocateHtmlSquares(htmlSquares)
        $('input[name="mirror"]').change(function(){
            mirror=!mirror
        })
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
        $('input[name="squareSelection"]').click(function(){
            var value = $(this).val()
            if(currentPiece!="" && $(this).prop('checked')){
                if(value == 'sectioned'){
                    individualSquares = false
                }
                else{
                    individualSquares = true
                }
            }
        })
        for(var i = 0; i < htmlSquares.length;i++){
            $(htmlSquares[i]).mousedown(function(){
                var leftClick = event.button==0
                var coordinate = $(this).data()['square']
                var index = indexAndCoordinates.coordinatesToIndex[coordinate]
                var targetIndex = index-indexAndCoordinates.coordinatesToIndex[currentPiecePosition]
                if(leftClick && individualSquares){
                    if(currentPiece!=""){
                        var alreadyInMove = pieces[currentPiece].mov.indexOf(targetIndex)!=-1
                        if(targetIndex!=0){
                            if(alreadyInMove){
                                pieces[currentPiece].mov.splice(pieces[currentPiece].mov.indexOf(targetIndex),1)
                                pieces[currentPiece].movdur.splice(pieces[currentPiece].mov.indexOf(targetIndex),1)
                                if(mirror){
                                    pieces[currentPiece].mov.splice(pieces[currentPiece].mov.indexOf(-targetIndex),1)
                                    pieces[currentPiece].movdur.splice(pieces[currentPiece].mov.indexOf(-targetIndex),1)
                                }
                                htmlBoardControl.updateHighlightedMoves(board, currentPiecePosition, htmlSquares, locateHtmlSquares)
                                addingSquares = false
                            }
                            else{
                                pieces[currentPiece].mov.push(targetIndex)
                                pieces[currentPiece].movdur.push(1)
                                if(mirror){
                                    pieces[currentPiece].mov.push(-targetIndex)
                                    pieces[currentPiece].movdur.push(1)
                                }
                                htmlBoardControl.updateHighlightedMoves(board, currentPiecePosition, htmlSquares, locateHtmlSquares)
                                addingSquares = true
                            }
                        }
                    }
                }
            })
            $(htmlSquares[i]).click(function(){
                var leftClick = event.button==0
                var coordinate = $(this).data()['square']
                var index = indexAndCoordinates.coordinatesToIndex[coordinate]
                var targetIndex = index-indexAndCoordinates.coordinatesToIndex[currentPiecePosition]
                if(leftClick && !individualSquares){
                    if(currentPiece!=""){
                        var addMoves = true
                        if(pieces[currentPiece].mov.indexOf(targetIndex)!=-1){
                            addMoves = false
                        }
                        if(targetIndex<8 && targetIndex >0){
                            sectionedMovement(pieces[currentPiece], 1, addMoves,mirror)
                        }
                        else if(targetIndex<0 && targetIndex>-8){
                            sectionedMovement(pieces[currentPiece], -1, addMoves,mirror)
                        }
                        else if(targetIndex%16==0){
                            if(targetIndex<0){
                                sectionedMovement(pieces[currentPiece], -16, addMoves,mirror)
                            }
                            else{
                                sectionedMovement(pieces[currentPiece], 16, addMoves,mirror)
                            }
                        }
                        else if(targetIndex%15==0){
                            if(targetIndex<0){
                                sectionedMovement(pieces[currentPiece], -15, addMoves,mirror)
                            }
                            else{
                                sectionedMovement(pieces[currentPiece], 15, addMoves,mirror)
                            }
                        }
                        else if(targetIndex%17==0){
                            if(targetIndex<0){
                                sectionedMovement(pieces[currentPiece], -17, addMoves,mirror)
                            }
                            else{
                                sectionedMovement(pieces[currentPiece], 17, addMoves,mirror)
                            }
                        }
                    }
                }
            })
            $(htmlSquares[i]).mousedown(function(){
                if(event.button == 0 && !($(this).data()['square']==currentPiecePosition)){
                    mouseDown=true
                }
            })
        }
    })
    $("body").mouseup(function(){
        mouseDown=false
        addingSquares = false
    })
    window.onfocus = function() {
        mouseDown = false
    }
    $("input[value='Submit']").click(function(){
        $.post('/',pieces)
    })
    var config = {
        sparePieces: true,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoverSquare: onMouseoverSquare,
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
    function sectionedMovement(piece, value, addMoves = true, mirrored = false){
        var index = value
        for(var i = 0; i < 7; i++){
            var indexNotInList = piece.mov.indexOf(index)==-1
            var mirrorIndexNotInList = piece.mov.indexOf(-index)==-1
            if(addMoves){
                if(indexNotInList){
                    piece.mov.push(index)
                    piece.movdur.push(1)
                }
                if(mirror && mirrorIndexNotInList){
                    piece.mov.push(-index)
                    piece.movdur.push(1)
                }
            }
            else{
                if(!indexNotInList){
                    piece.mov.splice(piece.mov.indexOf(index),1)
                    piece.movdur.splice(piece.mov.indexOf(index),1)
                }
                if(mirror && !mirrorIndexNotInList){
                    piece.mov.splice(piece.mov.indexOf(-index),1)
                    piece.movdur.splice(piece.mov.indexOf(-index),1)
                }
            }
            index+=value
        }
        htmlBoardControl.updateHighlightedMoves(board, currentPiecePosition, htmlSquares, locateHtmlSquares)
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

    function onMouseoverSquare(square, piece){
        if(currentPiece!="" && mouseDown && individualSquares){   
            var index = indexAndCoordinates.coordinatesToIndex[square]
            var targetIndex = index - indexAndCoordinates.coordinatesToIndex[currentPiecePosition]
            var alreadyInMove = pieces[currentPiece].mov.indexOf(targetIndex)!=-1
            if(targetIndex!=0){
                if(alreadyInMove && !addingSquares){
                    pieces[currentPiece].mov.splice(pieces[currentPiece].mov.indexOf(targetIndex),1)
                    pieces[currentPiece].movdur.splice(pieces[currentPiece].mov.indexOf(targetIndex),1)
                    if(mirror){
                        pieces[currentPiece].mov.splice(pieces[currentPiece].mov.indexOf(-targetIndex),1)
                        pieces[currentPiece].movdur.splice(pieces[currentPiece].mov.indexOf(-targetIndex),1)
                    }
                    htmlBoardControl.updateHighlightedMoves(board, currentPiecePosition, htmlSquares, locateHtmlSquares)
                }
                else if(!alreadyInMove && addingSquares){
                    pieces[currentPiece].mov.push(targetIndex)
                    pieces[currentPiece].movdur.push(1)
                    if(mirror){
                        pieces[currentPiece].mov.push(-targetIndex)
                        pieces[currentPiece].movdur.push(1)
                    }
                    htmlBoardControl.updateHighlightedMoves(board, currentPiecePosition, htmlSquares, locateHtmlSquares)
                    lastHighlightedSquare = currentPiece
                }
            }
        }
    }

    var htmlBoard = Chessboard('myBoard',config)
    $(document).trigger('load')
})