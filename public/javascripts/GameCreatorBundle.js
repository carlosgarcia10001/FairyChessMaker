(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){

var htmlBoardControl = require('./HtmlBoardControl')
const socket = new WebSocket('ws://localhost:3000/gamecreate/')

$(document).ready(function(){
    var htmlSquares = []
    var htmlFENBoardSquares = []
    var htmlCurrentPieceBoardSquares = []
    var htmlPathBoardSquares = []
    var locateHtmlFENBoardSquares = {}
    var locateHtmlCurrentPieceBoardSquares = {}
    var locateHtmlPathBoardSquares = {}
    var currentPiece = "wP"
    var currentPiecePosition = 'd4'
    var pathPiecePosition = 'd4'
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
    $(".submitAmount").click(function(){
        if(currentPiece!=""){
            var direction = $(this).attr('id').replace('MoveSubmit',"")
            var amount = $("#"+direction+"MoveAmount").val()
            if(amount > 7){
                amount = 7
            }
            else if(amount < 1){
                amount = 1
            }
            var pathAddMovement = {
                pathAddMovement: {
                    direction: direction,
                    amount: amount
                }
            }
            socket.send(JSON.stringify(pathAddMovement))
        }
    })

    var messageResponse = {
        highlightCurrentPieceMoveList: function(message){
            console.log(message.highlightCurrentPieceIgnoreList)
            htmlBoardControl.updateHighlightedMoves(htmlCurrentPieceBoardSquares, locateHtmlCurrentPieceBoardSquares, message.highlightCurrentPieceMoveList, message.highlightCurrentPieceIgnoreList)
        },
        highlightPathMoveList: function(message){
            htmlBoardControl.updateHighlightedMoves(htmlPathBoardSquares, locateHtmlPathBoardSquares, message.highlightPathMoveList)
        },
        highlightFENMoveList: function(message){
            htmlBoardControl.updateHighlightedMoves(htmlFENBoardSquares, locateHtmlFENBoardSquares, message.highlightFENMoveList, message.highlightFENIgnoreList)
        },
        getAttributeMods: function(message){
            var attributeMods = message.getAttributeMods
            $(".attributeMods").prop("checked", false)
            for(var i = 0; i < attributeMods.length; i++){
                $("#"+attributeMods[i]).prop("checked", true)
            }
        },
        getMoveMods: function(message){
            var moveMods = message.getMoveMods
            $(".moveMods").prop("checked", false)
            for(var i = 0; i < moveMods.length; i++){
                $("#"+moveMods[i]).prop("checked", true)
            }
        },
        getAttackType: function(message){
            var attackType = message.getAttackType
            console.log(attackType == 'NORMAL')
            switch(attackType){
                case 'NORMAL': 
                    $("#attackTypesOptions").val('Normal')
                break;
                case 'FRIENDLY FIRE':
                    $("#attackTypesOptions").val('Friendly Fire')
                break;
                case 'PACIFIST':
                    $("#attackTypesOptions").val('Pacifist')
                break;
                case 'TRAITOR':
                    $("#attackTypesOptions").val('Traitor')
            }
        },
        gameSubmitSuccess: function(message){
            window.location.assign(message.gameSubmitSuccess)
        },
        gameSubmitFail: function(message){
            $("#gameSubmitFailText").text(message.gameSubmitFail)
        }
    }

    socket.addEventListener('message', function (message) {               
        var data = message.data
            if(data.charAt(0)=='{'){ 
                data = JSON.parse(message.data)
                var keys = Object.keys(data)
                for(var i = 0; i < keys.length; i++){
                    if(messageResponse[keys[i]]){
                        messageResponse[keys[i]](data)
                    }
                }
            }
    });
    $("#gameSubmit").click(function(){
        socket.send(JSON.stringify({
            gameSubmit: {
                name: $("#nameTextBox").val(),
                description: $("#descriptionTextBox").val(),
                winCondition: $("#winConditionsOptions").val(),
            }
        }))
    })
    $("#FENSubmit").click(function(){
        htmlFENBoard.position($("#FEN").val())
        socket.send(JSON.stringify({
            FEN: htmlFENBoard.position('FEN')
        }))
    })
    $("#submitPath").click(function(){
        var message = {
            submitPath: "submitPath"
        }
        socket.send(JSON.stringify(message))
    })
    $("#submitEraseUnsubmittedPath").click(function(){
        var message = {
            eraseUnsubmittedPath: "removePath"
        }
        socket.send(JSON.stringify(message))
    })
    $('input[class*="Mods"]').change(function(){
        var id = $(this).attr('id')
        var name = $(this).attr('class')
        if(currentPiece!=""){
            if(name =="moveMods"){
                if($(this).prop('checked')){
                    socket.send(JSON.stringify({
                        moveModAdd: id.toUpperCase()
                    }))
                }
                else{
                    socket.send(JSON.stringify({
                        moveModRemove: id.toUpperCase()
                    }))
                }
            }
            else if(name == "attributeMods"){
                if($(this).prop('checked')){
                    socket.send(JSON.stringify({
                        attributeModAdd: id.toUpperCase()
                    }))
                }
                else{
                    socket.send(JSON.stringify({
                        attributeModRemove: id.toUpperCase()
                    }))
                }
            }
        }
    })
    
    $('#attackTypesOptions').change(function(){
        var message = $(this).val().toUpperCase()
        if(currentPiece!=""){
            socket.send(JSON.stringify({
                attackTypeChange: message
            }))
        }
    })
    $('#lethalMovePath').attr('title', 'Allows movement on occupied squares that the piece can attack');
    $('#nonLethalMovePath').attr('title', 'Allows movement on unoccupied squares')
    $('#mirrorPieceSelect').change(function(){
        if($(this).prop('checked')){
            socket.send(JSON.stringify({
                mirrorPieceSelect: "selected"
            }))
        }
        else{
            socket.send(JSON.stringify({
                mirrorPieceSelect: "unselected"
            }))
        }
    })
    $('#lethalMovePathSelect').change(function(){
        if($(this).prop('checked')){
            socket.send(JSON.stringify({
                lethalMovePathSelect: "selected"
            }))
        }
        else{
            socket.send(JSON.stringify({
                lethalMovePathSelect: "unselected"
            }))
        }
    })
    $('#nonLethalMovePathSelect').change(function(){
        if($(this).prop('checked')){
            socket.send(JSON.stringify({
                nonLethalMovePathSelect: "selected"
            }))
        }
        else{
            socket.send(JSON.stringify({
                nonLethalMovePathSelect: "unselected"
            }))
        }
    })
    $('#addIndividualSquareSubmit').click(function(){
        var row = $('#addIndividualSquareRowAmount').val()
        var column = $('#addIndividualSquareColumnAmount').val()
        socket.send(JSON.stringify({
            addIndividualSquare: {
                row: row,
                column: column
            }
        }))
    })
    $('#absoluteTeleportSubmit').click(function(){
        var teleport = $('#absoluteTeleportAmount').val()
        console.log(typeof(teleport))
        socket.send(JSON.stringify({
            absoluteTeleport: teleport
        }))
    })
    $('#relativeDenyMovementSubmit').click(function(){
        var row = $('#relativeDenyMovementRowAmount').val()
        var column = $('#relativeDenyMovementColumnAmount').val()
        socket.send(JSON.stringify({
            relativeDenyMovement: {
                row: row,
                column: column
            }
        }))
    })
    $('#absoluteDenyMovementSubmit').click(function(){
        socket.send(JSON.stringify({
                absoluteDenyMovement: $('#absoluteDenyMovementAmount').val()
        }))
    })
    $('#mirrorPathSelect').change(function(){
        socket.send(JSON.stringify({
            mirrorPathSelect: $('#mirrorPathSelect').prop('checked')
        }))
        console.log($('#mirrorPathSelect').prop('checked'))
    })
    $('#removeCurrentPiecePathsButton').click(function(){
        socket.send(JSON.stringify({
            removeCurrentPieceMovement: "removeCurrentPieceMovement"
        }))
    })
    function currentPieceOnDrop(source, target, piece, newPos, oldPos, orientation){
        if(target != 'offboard'){
            currentPiecePosition = Object.keys(newPos)[0]
            var currentPiecePosition = {
                currentPiecePosition: {
                    from: Object.keys(oldPos)[0],
                    to: Object.keys(newPos)[0]
                }
            }
            socket.send(JSON.stringify(currentPiecePosition))
        }
    }
    function pathBoardOnDrop(source, target, piece, newPos, oldPos, orientation){
        if(target != 'offboard'){
            pathPiecePosition = Object.keys(newPos)[0]
            var pathPiecePosition = {
                pathPiecePosition: {
                    from: Object.keys(oldPos)[0],
                    to: Object.keys(newPos)[0]
                }
            }
            socket.send(JSON.stringify(pathPiecePosition))
        }
    }

    function htmlFENBoardOnDrop(source, target, piece, newPos, oldPos, orientation){
        currentPiecePosition = Object.keys(newPos)[0]
        $("#FEN").val(ChessBoard.objToFen(newPos))
        var FENSend = {
            FEN: ChessBoard.objToFen(newPos)
        }
        socket.send(JSON.stringify(FENSend))
    }

    function htmlFENBoardOnMouseoverSquare(square, piece){
        if(piece!=false){
            var highlightFENMoveList = {
                highlightFENMoveList: {
                    square: square,
                    piece: piece
                }
            }
            socket.send(JSON.stringify(highlightFENMoveList))
        }
    }

    function FENBoardOnMouseoutSquare(){
        htmlBoardControl.unHighlightValidMoves(htmlFENBoardSquares)
    }

    function htmlFENBoardOnDragStart(source, draggedPiece, position, orientation){
        htmlCurrentPieceBoard.position({
            d4: draggedPiece
        })
        htmlPathBoard.position({
            d4: draggedPiece
        })
        currentPiecePosition = 'd4'
        pathPiecePosition = 'd4'
        currentPiece = draggedPiece
        $("#pieceName").text(currentPiece)
        var currentPieceSend = {
            currentPiece: draggedPiece,
        }
        socket.send(JSON.stringify(currentPieceSend))
        socket.send(JSON.stringify({
            getMoveMods: ""
        }))
        socket.send(JSON.stringify({
            getAttributeMods: ""
        }))
    }
    var pieceTheme = "../images/chesspieces/wikipedia/{piece}.png"
    
    var FENConfig = {
        pieceTheme: pieceTheme,
        sparePieces: true,
        dropOffBoard: 'trash',
        onDrop: htmlFENBoardOnDrop,
        onDragStart: htmlFENBoardOnDragStart,
        onMouseoverSquare: htmlFENBoardOnMouseoverSquare,
        onMouseoutSquare: FENBoardOnMouseoutSquare
    }

    var currentPieceConfig = {
        pieceTheme: pieceTheme, 
        sparePieces: false,
        draggable: true,
        onDrop: currentPieceOnDrop,
        position: {
            d4: "wP"
        }
    }

    var htmlFENBoard = Chessboard('FENBoard', FENConfig)
    var htmlCurrentPieceBoard = Chessboard('currentPieceBoard', currentPieceConfig)
    var htmlPathBoard = Chessboard('pathBoard', {pieceTheme: pieceTheme, onDrop: pathBoardOnDrop, draggable: true, position: {d4: "wP"}})
    $(document).trigger('load')
})
},{"./HtmlBoardControl":3}],3:[function(require,module,exports){
var move = require('./Move')
var indexAndCoordinates = require('./IndexAndCoordinates')
var highlightMove = '#a9a9a9'

function createHtmlSquares(board){
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

function highlightValidMoves(locateHtmlSquares, moveList, ignoreList = []){
    var moveset = moveList
    console.log(ignoreList)
    for(var i = 0; i < moveset.length; i++){
        if(!($(locateHtmlSquares[moveset[i]]).hasClass('moveset'))){
            $(locateHtmlSquares[moveset[i]]).addClass("moveset")
            $(locateHtmlSquares[moveset[i]]).css('background', highlightMove)
        }
    }
    for(var i = 0; i < ignoreList.length; i++){
        if(!($(locateHtmlSquares[ignoreList[i]]).hasClass('moveset'))){
            $(locateHtmlSquares[ignoreList[i]]).addClass("moveset")
            $(locateHtmlSquares[ignoreList[i]]).css('background', 'red')
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

function updateHighlightedMoves(htmlSquares, locateHtmlSquares, moveList, ignoreList){
    unHighlightValidMoves(htmlSquares)
    highlightValidMoves(locateHtmlSquares, moveList, ignoreList)
}

function updateHighlightedMovesOnGameCreator(parsedHtmlBoard, parsedIndex, htmlSquares, locateHtmlSquares){
    unHighlightValidMoves(htmlSquares)
    highlightValidMovesOnGameCreator(parsedHtmlBoard, parsedIndex, locateHtmlSquares)
}

function highlightSquare(locateHtmlSquares, square){
    if(typeof(square)=='number'){
        square = indexAndCoordinates.indexToCoordinates[square]
    }
    $(locateHtmlSquares[square]).addClass('moveset')
    $(locateHtmlSquares[square]).css('background', highlightMove)
}

function highlightValidMovesOnGameCreator(parsedBoard, parsedIndex, locateHtmlSquares){
    var moveset = currentPieceMoveCoordinates(parsedBoard, parsedIndex)
    for(var i = 0; i < moveset.length; i++){
        if(!($(moveset[i]).hasClass('moveset'))){
            $(locateHtmlSquares[moveset[i]]).addClass("moveset")
            $(locateHtmlSquares[moveset[i]]).css('background', highlightMove)
        }
    }
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
exports.updateHighlightedMovesOnGameCreator = updateHighlightedMovesOnGameCreator
exports.highlightValidMovesOnGameCreator = highlightValidMovesOnGameCreator
exports.highlightSquare = highlightSquare
},{"./IndexAndCoordinates":4,"./Move":5}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
var boardState = require('./BoardState')
var pieceAttack = require('./PieceAttack')
var piece = require('./Piece')
var indexAndCoordinates = require('./IndexAndCoordinates')
const NP = "NOTPUBLIC"

var mods = {
    ETHEREAL: {
        name: "Ethereal",
        priority: 0,
        description: "This piece does not get blocked by ally pieces",
        action: function(board, square, moveList){
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
        }
    },  
    TELEPORTTOBEACON: 
    {
        name: NP,
        description: NP,
        priority: 0,
        action: function(board, square, moveList){
            var friendlySquares = boardState.pieceIndex(board, board[square].color)
            for(var i = 0; i < friendlySquares.length; i++){
                let parsedSquare = friendlySquares[i]
                if(boardState.pieceHasAttributeMod(board,parsedSquare,'BEACON')){
                    if(moveList.indexOf(parsedSquare-17) == -1 && validBeaconTeleport(board,square,parsedSquare,-17)){
                        moveList.push(parsedSquare-17)
                    }
                    if(moveList.indexOf(parsedSquare-16) == -1 && validBeaconTeleport(board,square,parsedSquare,-16)){
                        moveList.push(parsedSquare-16)
                    }
                    if(moveList.indexOf(parsedSquare-15) == -1 && validBeaconTeleport(board,square,parsedSquare,-15)){
                        moveList.push(parsedSquare-15)
                    }
                    if(moveList.indexOf(parsedSquare-1) == -1 && validBeaconTeleport(board,square,parsedSquare,-1)){
                        moveList.push(parsedSquare-1)
                    }
                    if(moveList.indexOf(parsedSquare+1) == -1 && validBeaconTeleport(board,square,parsedSquare,1)){
                        moveList.push(parsedSquare+1)
                    }
                    if(moveList.indexOf(parsedSquare+17) == -1 && validBeaconTeleport(board,square,parsedSquare,17)){
                        moveList.push(parsedSquare+17)
                    }
                    if(moveList.indexOf(parsedSquare+16) == -1 && validBeaconTeleport(board,square,parsedSquare,16)){
                        moveList.push(parsedSquare+16)
                    }
                    if(moveList.indexOf(parsedSquare+15) == -1 && validBeaconTeleport(board,square,parsedSquare,15)){
                        moveList.push(parsedSquare+15)
                    }
                }
            }
        }
    },
    PROTECTKINGLY: {
        name: NP,
        description: NP,
        priority: 1,
        action: function(board, square, moveList){
                var color = board[square].color
                for(var i = moveList.length-1; i >= 0; i--){
                    var copyBoard = JSON.parse(JSON.stringify(board))
                    var movement = makeMove(copyBoard, square, moveList[i], true)
                    if(check(copyBoard, color)){
                        moveList.splice(i,1)
                    }
                }
            }    
        }
}

function check(board, color){
    var enemyColor = 'w'
    if(color == 'w'){
        enemyColor = 'b'
    }
    var enemyMoveList = masterMoveList(board, enemyColor, ['PROTECTKINGLY'])
    for(var i = 0; i < enemyMoveList.length;i++){
        if(boardState.pieceHasAttributeMod(board, enemyMoveList[i], 'KINGLY') && board[enemyMoveList[i]].color==color){
            return true
        }
    }
    return false
}

function checkMate(board, color){
    var enemyColor = 'w'
    if(color = 'w'){
        enemyColor = 'b'
    }
    var possibleMoves = masterMoveList(board, color)
    if(possibleMoves.length==0 && check(board, color)){
        return true
    }
    return false
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
        mods['TELEPORT'+i] = {
            name: NP,
            description: NP,
            priority: 0,
            action: function(board, square, moveList){
                if(boardState.emptySquare(board,i) || pieceAttack.validAttack(board, square, i)){
                    moveList.push(i)
                }
            }
        }
        mods['REMOVEABSOLUTE'+i] = {
            name: NP,
            description: NP,
            priority: 1,
            action: function(board,square, moveList){
                if(boardState.validSquare(i) && moveList.indexOf(i)!=-1){
                    moveList.splice(moveList.indexOf(i),1)
                }
            }
        }
    }
    for(let i = 0; i < 120; i++){
        mods['REMOVERELATIVE'+i] = {
            name: NP,
            description: NP, 
            priority: 1,
            action: function(board,square, moveList){
                if(boardState.validSquare(square+i) && moveList.indexOf(square+i)!=-1){
                        moveList.splice(moveList.indexOf(square+i),1)
                    }
                }
            }
    }

    for(let i = -120; i < 0; i++){
        mods['REMOVERELATIVE'+i] = {
            name: NP,
            description: NP, 
            priority: 1, 
            action: function(board,square, moveList){
                if(boardState.validSquare(square+i) && moveList.indexOf(square+i)!=-1){
                    moveList.splice(moveList.indexOf(square+i),1)
                }
            }
        }
    }
}
addTeleportMods()

function getIgnoreList(mods){
    var ignoreList = []
    for(var i = 0; i < mods.length; i++){
        if(mods[i].substring(0,14)=='REMOVEABSOLUTE'){
            ignoreList.push(indexAndCoordinates.indexToCoordinates[mods[i].substring(14)])
        }
    }
    return ignoreList
}
function validBeaconTeleport(board, square, beaconIndex, offset){
    var parsedSquare = beaconIndex+offset
    return boardState.validSquare(parsedSquare) && (pieceAttack.attackTypes[board[square].atttype].action(board, square, parsedSquare) || boardState.emptySquare(board, parsedSquare))
}

function parseMoveMods(board, square, moveList, ignoreList = []){ //Make this more efficient late, a double for loop is most likely not necessary
    for(let i = 0; i < 2;i++){
        for(let j = 0; j < board[square].movmods.length; j++){
            var mod = board[square].movmods[j]
            if(ignoreList.indexOf(mod)==-1 && mods[mod].priority==i){
                mods[mod].action(board, square, moveList)
            }
        }
    }
}

function getMoveModNames(moveModList){
    var modNames = []
    for(var i = 0; i < moveModList.length; i++){
        var modName = mods[moveModList[i]].name
        if(modName!="NP"){
            modNames.push(mods[moveModList[i]].name)
        }
    }
    return modNames
}

var masterMoveList = function(board, color, ignoreList){
    var masterMoveList = []
    for(var i = 0; i < 120; i++){
        if(!boardState.validSquare(i)){
            i+=8
        }
        if(board[i].color==color){
            var moveList = pieceMoveList(board, i, ignoreList)
            for(var j = 0; j < moveList.length;j++){
                if(masterMoveList.indexOf(moveList[j])==-1){
                    masterMoveList.push(moveList[j])
                }
            }
        }
    }
    return masterMoveList
}

var pieceMoveList = function(board, square, ignoreList){  
    if(typeof(square)=='string'){
        square = indexAndCoordinates.coordinatesToIndex[square]
    }
    else if(typeof(square)!='number'){
        return false
    }
    var moveList = []
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
    parseMoveMods(board,square,moveList, ignoreList)
    return moveList
}

function moveListCoordinates(moveList){
    var coordinates = []
    for(var i = 0; i < moveList.length; i++){
        coordinates.push(indexAndCoordinates.indexToCoordinates[moveList[i]])
    }
    return coordinates
}

var makeMove = function(parsedBoard, initial, target, dummyMove = false){
    if(initial.length == 5){
        target = initial.substring(3)
        initial = initial.substring(0,2)
    }
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
        return indexAndCoordinates.indexToCoordinates[initial].toLowerCase() + "-" + indexAndCoordinates.indexToCoordinates[target].toLowerCase()
    } 
    return false 
}

exports.check = check
exports.makeMove = makeMove
exports.pieceMoveList = pieceMoveList
exports.masterMoveList = masterMoveList
exports.moveListCoordinates = moveListCoordinates
exports.checkMate = checkMate
exports.mods = mods
exports.getMoveModNames = getMoveModNames
exports.getIgnoreList = getIgnoreList
},{"./BoardState":1,"./IndexAndCoordinates":4,"./Piece":6,"./PieceAttack":7}],6:[function(require,module,exports){
function createPiece(id= " ", color = "", hp = 1, dmg = 1, mov = {
    paths: [],
    space: [],
    attPaths: [],
    attSpace: []
}, atttype = 'NORMAL', attrmods = [], movmods = []){
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
        pieces['wK']=createPiece('K','w')
        pieces['wQ']=createPiece('Q','w')
        pieces['wR']=createPiece('R','w')
        pieces['wB']=createPiece('B','w')
        pieces['wN']=createPiece('N','w')
        pieces['wP']=createPiece('P','w')
        pieces['bK']=createPiece('k','b')
        pieces['bQ']=createPiece('q','b')
        pieces['bR']=createPiece('r','b')
        pieces['bB']=createPiece('b','b')
        pieces['bN']=createPiece('n','b')
        pieces['bP']=createPiece('p','b')
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
},{}],7:[function(require,module,exports){
var boardState = require('./BoardState')
var attackTypes = { 
    NORMAL: {
        name: "Normal",
        description: "This piece can only capture enemy pieces",
        action: function(board, initial, target){ 
            return boardState.enemySquare(board,initial,target)
        }
    },
    FRIENDLYFIRE: {
        name: "Friendly Fire",
        description: "This piece can capture enemy or ally pieces",
        action: function(board,initial,target){ 
            return boardState.occupiedSquare(board,target)
        }
    },
    PACIFIST: {
        name: "Pacifist",
        description: "This piece can not capture other pieces",
        action: function(board, initial, target){ 
            return false
        }
    },
    TRAITOR:{
        name: "Traitor",
        description: "This piece can only capture ally pieces",
        action: function(board, initial, target){
            return boardState.allySquare(board,initial,target)
        }
    }
}

function validAttack(board, square, target){
    return boardState.occupiedSquare(board, target) && attackTypes[board[square].atttype.toUpperCase()].action(board, square, target)
}

exports.validAttack = validAttack
exports.attackTypes = attackTypes
},{"./BoardState":1}]},{},[2]);
