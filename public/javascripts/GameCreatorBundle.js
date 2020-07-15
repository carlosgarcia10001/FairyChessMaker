(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var boardState = require('./BoardState')
var helper = require('./AttributeModsHelper')
var mods ={
    beacon: function(board, color){
        var friendlySquares = boardState.pieceIndex(board, color)
        for(var i = 0; i < friendlySquares.length; i++){
            if(!boardState.pieceHasAttributeMod(board, friendlySquares[i],'beacon')){
                helper.addMoveMod(board, friendlySquares[i], 'teleportToBeacon')
            }
        }
    },
    kingly: function(board, color){
        var friendlySquares = boardState.pieceIndex(board,color)
        for(var i = 0; i < friendlySquares.length; i++){
            helper.addMoveMod(board, friendlySquares[i], 'protectKingly')
        }
    } 
}

function parseMods(parsedBoard, parsedSquare, color){
    for(var i = 0; i < parsedBoard[parsedSquare].attrmods.length;i++){
        var mod = parsedBoard[parsedSquare].attrmods[i]
        mods[mod](parsedBoard, color)
    }
}
exports.parseMods = parseMods
exports.mods = mods
},{"./AttributeModsHelper":2,"./BoardState":3}],2:[function(require,module,exports){
function addMoveMod(board, square, mod){
    board[square].movmods.push(mod)
}

exports.addMoveMod = addMoveMod
},{}],3:[function(require,module,exports){
var indexToCoordinates = {}
var coordinatesToIndex = {}
var indexToValidIndex = {}
function validSquare(square){
    return ((0x88 & square) == 0) 
}

function emptySquare(board, square){
    return validSquare(square) && board[square].color==""
}

function occupiedSquare(board,square){
    return validSquare(square) && board[square].color!=""
}

function allySquare(board, square, parsedSquare){
    return occupiedSquare(board,parsedSquare) && board[square].color==board[parsedSquare].color
}

function enemySquare(board, square, parsedSquare){
    return occupiedSquare(board,parsedSquare) && !allySquare(board,square,parsedSquare)
}

function pieceHasAttributeMod(board, square, mod){
    return board[square].attrmods.indexOf(mod)!=-1
}

function printBoard(board){
    for(var i = 0; i < 8; i++){
        console.log("|"+board[0+i*16].id+"|"+board[1+i*16].id + "|" + board[2+i*16].id+"|"+board[3+i*16].id + "|" + board[4+i*16].id+"|"+board[5+i*16].id + "|" 
        + board[6+i*16].id+"|"+board[7+i*16].id + "|")
    }
}

function createIndexToValidIndex(){
    var j = 0;
    for(let i = 0; i < 119; i++){
        if(!validSquare(i)){
            i+=8
        }
        indexToValidIndex[j] = i
    }
}

function pieceIndex(board, color){ //Returns the list of indexes where a certain color resides
    var pieceIndex = []
    for(var i = 0; i < 119; i++){
        if(!validSquare(i)){
            i+=8
        }
        if(board[i].color==color){
            pieceIndex.push(i)
        }
    }
    return pieceIndex
}

if(typeof exports != 'undefined'){
    exports.pieceIndex = pieceIndex
    exports.printBoard=printBoard
    exports.validSquare = validSquare
    exports.emptySquare = emptySquare
    exports.occupiedSquare = occupiedSquare
    exports.allySquare = allySquare
    exports.enemySquare = enemySquare
    exports.pieceHasAttributeMod = pieceHasAttributeMod
}
},{}],4:[function(require,module,exports){
var boardState  = require('./BoardState')
var piece = require('./Piece')
var move = require('./Move')
var AttributeMods = require('./AttributeMods')
var indexAndCoordinates = require('./IndexAndCoordinates')
var board = new Array(128)
var turn = 'w'
var boardHistory = []

function addBoardStateToHistory(parsedBoard, parsedTurn){
    parsedBoardHistory.push({
        board: parsedBoard.slice(),
        turn: parsedTurn
    })
}

function initializeBoard(parsedBoard){
    var createdPiece = ""
    if(typeof(piece)=='undefined'){
        createdPiece = createPiece()
    }
    else{
        createdPiece = piece.createPiece() 
    }
    for(var i = 0; i < parsedBoard.length; i++){
         parsedBoard[i] = createdPiece
     }
}

function placePieceOnBoard(parsedBoard, parsedPiece, parsedSquare){
        parsedBoard[parsedSquare] = parsedPiece
        AttributeMods.parseMods(parsedBoard, parsedSquare, parsedPiece.color)
}

function createFEN(parsedBoard){
    var count = 0;
    var FEN = ""
    for(var i = 0; i < 120; i++){
        if(!boardState.validSquare(i)){
            i+=8
            if(count>0){
                FEN+=count
            }
            if(i<112){
                FEN+='/'
            }
            count = 0
        }
        if(boardState.validSquare(i) && boardState.emptySquare(parsedBoard, i)){
            count++
        }
        if(boardState.validSquare(i) && boardState.occupiedSquare(parsedBoard, i)){
            if(count>0){
                FEN+=count
            }
            count = 0
            FEN+=parsedBoard[i].id
        }
    }
    return FEN
}

function parseFEN(parsedBoard, parsedFEN, parsedPieces){
    var FENcopy = parsedFEN.substring(0)
    let letter = 97
    let number = 1
    var keys = Object.keys(parsedPieces)
    while(FENcopy != ''){
        if(FENcopy.startsWith('/')){
            letter = 97
            number++
        }
        else if(!isNaN(Number(FENcopy.charAt(0)))){
            var count = Number(FENcopy.charAt(0))
            for(var i = 0; i < count; i++){
                parsedBoard[indexAndCoordinates.coordinatesToIndex[String.fromCharCode(letter)+number]] = piece.createPiece()
                letter++
            }
        }
        else{
            for(var i = 0; i < keys.length; i++){
                if(parsedPieces[keys[i]].id == FENcopy.charAt(0)){
                    parsedBoard[indexAndCoordinates.coordinatesToIndex[String.fromCharCode(letter)+number]] = parsedPieces[keys[i]]
                }
            }
            letter++
        }
        FENcopy = FENcopy.substring(1)
    }
}

function undoMove(parsedBoard, parsedBoardHistory){
    parsedBoardHistory.splice(parsedBoardHistory.length-1,1)
    parsedBoard = parsedBoardHistory[parsedBoardHistory.length-1].board.slice()
    turn = parsedBoardHistory[parsedBoardHistory.length-1].turn
}

function checkMate(board, color){
    var enemyColor = 'w'
    if(color = 'w'){
        enemyColor = 'b'
    }
    var enemyPositions = boardState.pieceIndex(board, enemyColor)
    for(var i = 0; i < enemyPositions.length;i++){
        enemyMoveList = move.pieceMoveList(board, enemyPositions[i])
        for(var j = 0; j < enemyMoveList.length;j++){
            var copyBoard = board.slice()
            makeMove(copyBoard, color, enemyPositions[i], enemyMoveList[j], true)
            if(!check(copyBoard, color)){
                return false
            }
        }
    }
    return true
}

initializeBoard(board)
exports.board = board
exports.turn = turn
exports.initializeBoard=initializeBoard
exports.placePieceOnBoard=placePieceOnBoard
exports.checkMate = checkMate
exports.boardHistory = boardHistory
exports.createFEN = createFEN
exports.parseFEN = parseFEN
},{"./AttributeMods":1,"./BoardState":3,"./IndexAndCoordinates":7,"./Move":8,"./Piece":9}],5:[function(require,module,exports){
var piece = require('./Piece')
var indexAndCoordinates = require('./IndexAndCoordinates')
var move = require('./Move')
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
        $.post('/gamecreate',pieces)
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
    $("#customMovement").click(function(){
        if(currentPiece!=""){
            var coordinatePath = prompt("Please input the path you would like your piece to be able to move to by the start and end coordinates of each line in the path relative to the piece's current position, separated by commas.")
            coordinatePath = coordinatePath.trim()
            coordinatePath = coordinatePath.toLowerCase()
            var coordinatePathArray = []
            var coordinate = ""
            while(coordinatePath!=""){
                if((coordinatePath.charAt(0)>='a'&& coordinatePath.charAt(0) <= "h") || (coordinatePath.charAt(0) >='1' && coordinatePath.charAt(0) <= '9')){
                    coordinate+=coordinatePath.charAt(0)
                }
                if(coordinate.length==2){
                    coordinatePathArray.push(coordinate.toLowerCase())
                    coordinate = ""
                }              
                coordinatePath = coordinatePath.substring(1)
            }
            var indexPath = []
            var indexSpace = []
            var undefined = false
            console.log(coordinatePathArray)
            for(var i = 0; i < coordinatePathArray.length;i++){
                var index = indexAndCoordinates.coordinatesToIndex[coordinatePathArray[i]]-indexAndCoordinates.coordinatesToIndex[currentPiecePosition]
                indexPath.push(index)
            }
            var space = prompt('Please input the space')
            var spaceAmount = ""
            while(space!=""){
                if(space.charAt(0)<= "9" && space.charAt(0)>="0"){
                    spaceAmount+=space.charAt(0)
                }
                if(space.charAt(0)==',' || (space.length==1 && spaceAmount.length!=0)){
                    spaceAmount.trim()
                    indexSpace.push(Number(spaceAmount))
                    spaceAmount = ""
                }
                space = space.substring(1)
            }
            if(!undefined){
                piece.addPath(pieces[currentPiece],indexPath,indexSpace)
                htmlBoardControl.updateHighlightedMoves(board, currentPiecePosition, htmlSquares, locateHtmlSquares)
            }
            else{
                alert("The input was invalid. Please try again with a valid input.")
            }
        }
    })
        $("#teleportMovement").click(function(){
            if(currentPiece!=""){
                var square = prompt("Input the coordinates of a square to teleport to")
                square.trim()
                square.toLowerCase()
                pieces[currentPiece].movmods.push("teleport"+indexAndCoordinates.coordinatesToIndex[square])
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
},{"./Game":4,"./HtmlBoardControl":6,"./IndexAndCoordinates":7,"./Move":8,"./Piece":9}],6:[function(require,module,exports){
var move = require('./Move')
var indexAndCoordinates = require('./IndexAndCoordinates')
var highlightMove = '#a9a9a9'
function createHtmlSquares(){
    var squares = $('[data-square]')
    return squares
}

function createLocateHtmlSquares(htmlSquares){
    var locateSquares = {}
    for(var i = 0; i < htmlSquares.length;i++){
        locateSquares[$(htmlSquares[i]).data()['square']] = htmlSquares[i]
    }
    return locateSquares
}

function highlightValidMoves(parsedBoard, parsedIndex, locateHtmlSquares){
    var moveset = currentPieceMoveCoordinates(parsedBoard, parsedIndex)
    for(var i = 0; i < moveset.length; i++){
        if(!($(moveset[i]).hasClass('moveset'))){
            $(locateHtmlSquares[moveset[i]]).addClass("moveset")
            $(locateHtmlSquares[moveset[i]]).css('background', highlightMove)
        }
    }
}

function unHighlightValidMoves(htmlSquares){
    for(var i = 0; i < htmlSquares.length; i++){
        if($(htmlSquares[i]).hasClass('moveset')){
            $(htmlSquares[i]).css('background','')
            $(htmlSquares[i]).removeClass('moveset')
        }
    }
}
function updateHighlightedMoves(parsedHtmlBoard, parsedIndex, htmlSquares, locateHtmlSquares){
    unHighlightValidMoves(htmlSquares)
    highlightValidMoves(parsedHtmlBoard, parsedIndex, locateHtmlSquares)
}

function currentPieceMoveCoordinates(parsedHtmlBoard, parsedIndex){
    var coordinates = []
    var moveList = move.pieceMoveList(parsedHtmlBoard, parsedIndex)
    for(var i = 0; i < moveList.length;i++){
        if((0x88 & moveList[i])==0){
            coordinates.push(indexAndCoordinates.indexToCoordinates[moveList[i]])
        }
    }
    return coordinates
}



exports.createHtmlSquares = createHtmlSquares
exports.createLocateHtmlSquares = createLocateHtmlSquares
exports.updateHighlightedMoves = updateHighlightedMoves
exports.highlightValidMoves = highlightValidMoves
exports.unHighlightValidMoves = unHighlightValidMoves

},{"./IndexAndCoordinates":7,"./Move":8}],7:[function(require,module,exports){
var indexToCoordinates = {}
var coordinatesToIndex = {}

function createIndexToCoordinatesAndCoordinatesToIndex(){
    let letter = 97
    let number = 8
    for(let i = 0; i < 120; i++){
        if(!((0x88 & i) == 0)){
            i+=8
            number -= 1
            letter = 97
        }
        let id = (String.fromCharCode(letter)+number).toLowerCase()
        indexToCoordinates[i] = id
        coordinatesToIndex[id] = i
        letter++
    }
    
}
    createIndexToCoordinatesAndCoordinatesToIndex()
if(typeof exports != 'undefined'){
    exports.indexToCoordinates=indexToCoordinates
    exports.coordinatesToIndex=coordinatesToIndex
}
},{}],8:[function(require,module,exports){
var boardState = require('./BoardState')
var pieceAttack = require('./PieceAttack')
var piece = require('./Piece')
var indexAndCoordinates = require('./IndexAndCoordinates')
var mods = {
    ethereal: function(board, square, moveList){
        loop1:
        for(var i = 0; i < board[square].mov.paths.length;i++){
            var parsedSquare = square + board[square].mov.paths[i][0]
            var foundValidSquares = false
            loop2:
            for(var j = 0; j < board[square].mov.paths[i].length-1; j++){
                var add = 1
                var space = board[square].mov.space[i][j]
                if(board[square].mov.paths[i][j]>board[square].mov.paths[i][j+1]){
                    add = -1
                }
                loop3:
                for(var k = 0; k <= Math.abs(board[square].mov.paths[i][j+1]-board[square].mov.paths[i][j]);k+=space){
                    var validSquare = boardState.validSquare(parsedSquare)
                    if(validSquare){
                        foundValidSquares = true
                    }
                    if((foundValidSquares && !validSquare) || boardState.enemySquare(board, square, parsedSquare)){
                        break loop2
                    }
                    else if(boardState.allySquare(board, square, parsedSquare)){
                        parsedSquare+=space*add
                        continue
                    }
                    if(validSquare && moveList.indexOf(parsedSquare)==-1){
                        moveList.push(parsedSquare)
                    }
                    parsedSquare+=space*add
                }
                    parsedSquare-=space*add
            }
        }
        loop1:
        for(var i = 0; i < board[square].mov.attPaths.length;i++){
            var parsedSquare = square + board[square].mov.attPaths[i][0]
            var foundValidSquares = false
            loop2:
            for(var j = 0; j < board[square].mov.attPaths[i].length-1; j++){
                var add = 1
                var space = board[square].mov.attSpace[i][j]
                if(board[square].mov.attPaths[i][j]>board[square].mov.attPaths[i][j+1]){
                    add = -1
                }
                loop3:
                for(var k = 0; k <= Math.abs(board[square].mov.attPaths[i][j+1]-board[square].mov.attPaths[i][j]);k+=space){
                    var validSquare = boardState.validSquare(parsedSquare)
                    var occupiedSquare = boardState.occupiedSquare(board,parsedSquare)
                    if(validSquare){
                        foundValidSquares = true
                    }
                    if(validSquare && pieceAttack.validAttack(board,square,parsedSquare)){ 
                        if(moveList.indexOf(parsedSquare)==-1){
                            moveList.push(parsedSquare)
                        }
                        if(boardState.allySquare(board,square, parsedSquare)){
                            parsedSquare+=space*add
                            continue
                        }
                        break loop2
                    }
                    else if((foundValidSquares && !validSquare) || (occupiedSquare && !pieceAttack.validAttack(board,square,parsedSquare))){
                        break loop2
                    }
                    parsedSquare+=space*add
                }
                    parsedSquare-=space*add
            }
        }
    },

    teleportToBeacon: function(board, square, moveList){
        var friendlySquares = boardState.pieceIndex(board, board[square].color)
        for(var i = 0; i < friendlySquares.length; i++){
            let parsedSquare = friendlySquares[i]
            if(boardState.pieceHasAttributeMod(board,parsedSquare,'beacon')){
                if(validBeaconTeleport(board,square,parsedSquare,-17)){
                    moveList.push(parsedSquare-17)
                }
                if(validBeaconTeleport(board,square,parsedSquare,-16)){
                    moveList.push(parsedSquare-16)
                }
                if(validBeaconTeleport(board,square,parsedSquare,-15)){
                    moveList.push(parsedSquare-15)
                }
                if(validBeaconTeleport(board,square,parsedSquare,-1)){
                    moveList.push(parsedSquare-1)
                }
                if(validBeaconTeleport(board,square,parsedSquare,1)){
                    moveList.push(parsedSquare+1)
                }
                if(validBeaconTeleport(board,square,parsedSquare,17)){
                    moveList.push(parsedSquare+17)
                }
                if(validBeaconTeleport(board,square,parsedSquare,16)){
                    moveList.push(parsedSquare+16)
                }
                if(validBeaconTeleport(board,square,parsedSquare,15)){
                    moveList.push(parsedSquare+15)
                }
            }
        }
    },
    protectKingly: function(board, square, moveList){
        var color = board[square].color
        for(var i = 0; i < moveList.length; i++){
            var copyBoard = board.slice()
            makeMove(copyBoard, color, square, moveList[i], true)
            if(check(copyBoard, color)){
                moveList.splice(i,1)
            }
        }
    }
}

function addTeleportMods(){
    var valid = ""
    for(let i = 0; i < 120; i++){
        if(typeof(boardState)=='undefined'){
            valid = validSquare(i)
        }
        else{
            valid = boardState.validSquare(i)
        }
        if(!valid){
            i+=8
        }
        mods['teleport'+i] = function(board, square, moveList){
            if(boardState.emptySquare(board,i) || pieceAttack.validAttack(board, square, i)){
                moveList.push(i)
            }
        }
        mods['removeAbsolute'+i] = function(board,square, moveList){
            if(boardState.validSquare(i) && moveList.indexOf(i)!=-1){
                moveList.splice(moveList.indexOf(i),1)
            }
        }
        mods['removeRelative'+i] = function(board,square, moveList){
            if(boardState.validSquare(square+i) && moveList.indexOf(square+i)!=-1){
                    moveList.splice(moveList.indexOf(square+i),1)
                }
            }
        }
}

addTeleportMods()

function validBeaconTeleport(board, square, beaconIndex, offset){
    var parsedSquare = beaconIndex+offset
    return boardState.validSquare(parsedSquare) && (pieceAttack.attackTypes[board[square].atttype](board, square, parsedSquare) || boardState.emptySquare(board, parsedSquare))
}

function parseMoveMods(board, square, moveList){
    for(let i = 0; i < board[square].movmods.length;i++){
        var mod = board[square].movmods[i]
        console.log(mod)
        console.log(mods)
        mods[mod](board, square, moveList)
    }
}

var masterMoveList = function(board, color){
    var masterMoveList = []
    for(var i = 0; i < 120; i++){
        if(!boardState.validSquare(i)){
            i+=8
        }
        if(board[i].color==color){
            var moveList = pieceMoveList(board, i)
            for(var j = 0; j < moveList.length;j++){
                if(masterMoveList.indexOf(moveList[j])==-1){
                    masterMoveList.push(moveList[j])
                }
            }
        }
    }
    return masterMoveList
}

var pieceMoveList = function(board, square){  
    if(typeof(square)=='string'){
        square = indexAndCoordinates.coordinatesToIndex[square]
    }
    else if(typeof(square)!='number'){
        return false
    }
    moveList = []
    loop1:
    for(var i = 0; i < board[square].mov.paths.length;i++){
        var parsedSquare = square + board[square].mov.paths[i][0]
        var foundValidSquares = false
        loop2:
        for(var j = 0; j < board[square].mov.paths[i].length-1; j++){
            var add = 1
            var space = board[square].mov.space[i][j]
            if(board[square].mov.paths[i][j]>board[square].mov.paths[i][j+1]){
                add = -1
            }
            loop3:
            for(var k = 0; k <= Math.abs(board[square].mov.paths[i][j+1]-board[square].mov.paths[i][j]);k+=space){
                var validSquare = boardState.validSquare(parsedSquare)
                var occupiedSquare = boardState.occupiedSquare(board,parsedSquare)
                if(validSquare){
                    foundValidSquares = true
                }
                if((foundValidSquares && !validSquare) || occupiedSquare){
                    break loop2
                }
                if(validSquare && moveList.indexOf(parsedSquare)==-1){
                    moveList.push(parsedSquare)
                }
                parsedSquare+=space*add
            }
                parsedSquare-=space*add
        }
    }
    loop1:
    for(var i = 0; i < board[square].mov.attPaths.length;i++){
        var parsedSquare = square + board[square].mov.attPaths[i][0]
        var foundValidSquares = false
        loop2:
        for(var j = 0; j < board[square].mov.attPaths[i].length-1; j++){
            var add = 1
            var space = board[square].mov.attSpace[i][j]
            if(board[square].mov.attPaths[i][j]<0){
                add = -1
            }
            loop3:
            for(var k = 0; k <= Math.abs(board[square].mov.attPaths[i][j+1]-board[square].mov.attPaths[i][j]);k+=space){
                var validSquare = boardState.validSquare(parsedSquare)
                var occupiedSquare = boardState.occupiedSquare(board,parsedSquare)
                if(validSquare){
                    foundValidSquares = true
                }
                if(pieceAttack.validAttack(board,square,parsedSquare)){ 
                    moveList.push(parsedSquare)
                    break loop2
                }
                else if((foundValidSquares && !validSquare) || (occupiedSquare && !pieceAttack.validAttack(board,square,parsedSquare))){
                    break loop2
                }
                parsedSquare+=board[square].mov.attSpace[i][j]*add
            }
                parsedSquare-=space*add
        }
    }
    /*for(var i = 0; i < board[square].mov.length;i++){
        var parsedSquare = position+board[square].mov[i]
        var j = 0
        while(boardState.validSquare(parsedSquare) && j < board[square].movdur[i]){
            if(movIsDmgMov){ //Optimization so that if mov==dmgMov, the program does not do the same evaluations twice
                if(boardState.occupiedSquare(board,parsedSquare) && pieceAttack.validAttack(board,square,parsedSquare)){ 
                    moveList.push(parsedSquare)
                    break  
                }
                else if(boardState.occupiedSquare(board,parsedSquare) && !pieceAttack.validAttack(board,square,parsedSquare)){
                    break
                }
            }
            else if(boardState.occupiedSquare(board,parsedSquare)){ 
                break
            }
            moveList.push(parsedSquare)
            parsedSquare+=board[square].mov[i]
            j++
        }
    }
    if(!movIsDmgMov){
        for(var i = 0; i < board[square].dmgmov.length;i++){
            var parsedSquare = position+board[square].dmgmov[i]
            var j = 0
            while(boardState.validSquare(parsedSquare) && j < board[square].dmgmovdur[i]){
                if(boardState.occupiedSquare(board,parsedSquare) && pieceAttack.validAttack(board,square,parsedSquare)){ 
                    moveList.push(parsedSquare)
                    break  
                }
                else if(boardState.occupiedSquare(board,parsedSquare) && !pieceAttack.validAttack(board,square,parsedSquare)){
                    break
                }
                parsedSquare+=board[square].dmgmov[i]
                j++
            }
        }
    }*/
    parseMoveMods(board,square,moveList)
    return moveList
}

function moveListCoordinates(moveList){
    var coordinates = []
    for(var i = 0; i < moveList.length; i++){
        coordinates.push(indexAndCoordinates.indexToCoordinates[moveList[i]])
    }
    return coordinates
}

function check(board, color){
    var enemyColor = 'w'
    if(color = 'w'){
        enemyColor = 'b'
    }
    var enemyMoveList = masterMoveList(board, enemyColor)
    for(var i = 0; i < enemyMoveList.length;i++){
        if(boardState.pieceHasAttributeMod(board, enemyMoveList[i], 'kingly') && board[enemyMoveList[i]].color==color){
            return true
        }
    }
    return false
}

var makeMove = function(parsedBoard, turn, initial, target, dummyMove = false){
    if(typeof(initial)=='string'){
        initial = indexAndCoordinates.coordinatesToIndex[initial]
    }
    if(typeof(target)=='string'){
        target = indexAndCoordinates.coordinatesToIndex[target]
    }
    if(typeof(target)!='number' || typeof(initial)!='number'){
        return false
    }
    if(dummyMove){ 
        parsedBoard[target] = parsedBoard[initial]
        parsedBoard[initial] = piece.createPiece() 
    }
    else if(pieceMoveList(parsedBoard,initial).indexOf(target)!=-1){
        parsedBoard[target] = parsedBoard[initial]
        parsedBoard[initial] = piece.createPiece() 
        if(turn == 'w'){
            turn = 'b'
        }
        else{
            turn = 'w'
        }
        return indexAndCoordinates.indexToCoordinates[initial].toLowerCase() + "-" + indexAndCoordinates.indexToCoordinates[target].toLowerCase()
    } 
    return false 
}

exports.check = check
exports.makeMove = makeMove
exports.pieceMoveList = pieceMoveList
exports.masterMoveList = masterMoveList
exports.moveListCoordinates = moveListCoordinates

},{"./BoardState":3,"./IndexAndCoordinates":7,"./Piece":9,"./PieceAttack":10}],9:[function(require,module,exports){
function createPiece(id= " ", color = "", hp = 1, dmg = 1, mov = {
    paths: [],
    space: [],
    attPaths: [],
    attSpace: []
}, atttype = 'normal', attrmods = [], movmods = []){
    var piece = {
        id: id,
        color: color,
        hp: hp,
        dmg: dmg,
        atttype: atttype,
        mov: mov,
        attrmods: attrmods,
        movmods: movmods,
    }
    return piece
}

function createPieces(){
    var pieces = {}
        pieces['wK']=createPiece('k','w')
        pieces['wQ']=createPiece('q','w')
        pieces['wR']=createPiece('r','w')
        pieces['wB']=createPiece('b','w')
        pieces['wN']=createPiece('n','w')
        pieces['wP']=createPiece('p','w')
        pieces['bK']=createPiece('K','b')
        pieces['bQ']=createPiece('Q','b')
        pieces['bR']=createPiece('R','b')
        pieces['bB']=createPiece('B','b')
        pieces['bN']=createPiece('N','b')
        pieces['bP']=createPiece('P','b')
    return pieces
}

function createMov(paths = [], space = [], attPaths = paths, attSpace = space){
    return {
        paths: paths,
        space: space,
        attPaths: attPaths,
        attSpace: attSpace
    }
}

function addPath(piece, path,space, attPathsEqualsPaths = true){
    if(piece.mov.paths.indexOf(path)==-1){    
        piece.mov.paths.push(path)
        piece.mov.space.push(space)
    }
    if(attPathsEqualsPaths && piece.mov.attPaths.indexOf(path)==-1){
        piece.mov.attPaths.push(path)
        piece.mov.attSpace.push(space)
    }
}

function addAttPath(piece,path,space){
    if(piece.mov.attPaths.indexOf(path)==-1){
        piece.mov.attPaths.push(path)
        piece.mov.attSpace.push(space)
    }
}

exports.createPiece = createPiece
exports.createPieces = createPieces
exports.createMov = createMov
exports.addPath = addPath
exports.addAttPath = addAttPath
},{}],10:[function(require,module,exports){
var boardState = require('./BoardState')
var attackTypes = { 
    normal: function(board, initial, target){ 
        return boardState.enemySquare(board,initial,target)
    },
    friendlyfire: function(board,initial,target){ 
        return boardState.occupiedSquare(board,target)
    },
    pacifist: function(board, initial, target){ 
        return false
    },
    traitor: function(board, initial, target){
        return boardState.allySquare(board,initial,target)
    }
}

function validAttack(board, square, target){
    return boardState.occupiedSquare(board, target) && attackTypes[board[square].atttype](board, square, target)
}

exports.validAttack = validAttack
exports.attackTypes = attackTypes
},{"./BoardState":3}]},{},[5]);
