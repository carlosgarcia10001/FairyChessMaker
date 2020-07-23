(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var boardState = require('./BoardState')
var helper = require('./AttributeModsHelper')
var mods ={
    beacon: {
        name: "Beacon",
        description: "Ally pieces can teleport to within a one square radius of this piece, no matter their location.",
        action: function(board, color){
                    var friendlySquares = boardState.pieceIndex(board, color)
                    for(var i = 0; i < friendlySquares.length; i++){
                        if(!boardState.pieceHasAttributeMod(board, friendlySquares[i],'beacon')){
                            helper.addMoveMod(board, friendlySquares[i], 'teleportToBeacon')
                        }
                    }
        }
    },
    kingly: {
        name: "Kingly",
        description: "This piece must be protected by ally pieces at all costs. Can only be applied to one piece per game.",
        action: function(board, color){
                    var friendlySquares = boardState.pieceIndex(board,color)
                    for(var i = 0; i < friendlySquares.length; i++){
                        if(board[friendlySquares[i]].movmods.indexOf('protectKingly')==-1){
                            helper.addMoveMod(board, friendlySquares[i], 'protectKingly')
                        }
                    }
        } 
    }
}

function parseMods(parsedBoard, parsedSquare, color){
    for(var i = 0; i < parsedBoard[parsedSquare].attrmods.length;i++){
        var mod = parsedBoard[parsedSquare].attrmods[i]
        mods[mod].action(parsedBoard, color)
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

function initializeBoard(parsedBoard){
    for(var i = 0; i < parsedBoard.length; i++){
        var createdPiece = piece.createPiece()
         parsedBoard[i] = createdPiece
     }
}

function placePieceOnBoard(parsedBoard, parsedPiece, parsedSquare){
        parsedBoard[parsedSquare] = parsedPiece
        activateAttributeMods(parsedBoard)
}

function activateAttributeMods(parsedBoard){
    for(var i = 0; i < parsedBoard.length;i++){
        if(boardState.validSquare(i) && parsedBoard[i].attrmods && parsedBoard[i].attrmods.length>0){
            AttributeMods.parseMods(parsedBoard, i, parsedBoard[i].color)
        }
    }
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
            if(i<113){
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
    let number = 8
    var keys = Object.keys(parsedPieces)
    while(FENcopy != ''){
        if(FENcopy.startsWith('/')){
            letter = 97
            number--
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

var game = {
    board: new Array(128),
    turn: 'w',
    pieces: piece.createPieces(),
    FEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
    winCondition: "checkMate"
}

parseFEN(game.board,game.FEN,game.pieces)

exports.game = game
exports.board = board
exports.turn = turn
exports.initializeBoard=initializeBoard
exports.placePieceOnBoard=placePieceOnBoard
exports.boardHistory = boardHistory
exports.createFEN = createFEN
exports.parseFEN = parseFEN
exports.activateAttributeMods = activateAttributeMods
},{"./AttributeMods":1,"./BoardState":3,"./IndexAndCoordinates":7,"./Move":8,"./Piece":9}],5:[function(require,module,exports){
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
},{"./Game":4,"./HtmlBoardControl":6,"./IndexAndCoordinates":7,"./Piece":9,"./abbreviationTranslator":11}],6:[function(require,module,exports){
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

function highlightValidMoves(locateHtmlSquares, moveList){
    var moveset = moveList
    
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

function updateHighlightedMoves(htmlSquares, locateHtmlSquares, moveList){
    unHighlightValidMoves(htmlSquares)
    highlightValidMoves(locateHtmlSquares, moveList)
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
const NP = "NOTPUBLIC"

var mods = {
    ethereal: {
        name: "Ethereal",
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
    teleportToBeacon: 
    {
        name: NP,
        description: NP,
        action: function(board, square, moveList){
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
        }
    },
    protectKingly: {
        name: NP,
        description: NP,
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
    var enemyMoveList = masterMoveList(board, enemyColor, ['protectKingly'])
    for(var i = 0; i < enemyMoveList.length;i++){
        if(boardState.pieceHasAttributeMod(board, enemyMoveList[i], 'kingly') && board[enemyMoveList[i]].color==color){
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
        mods['teleport'+i] = {
            name: NP,
            description: NP,
            action: function(board, square, moveList){
                if(boardState.emptySquare(board,i) || pieceAttack.validAttack(board, square, i)){
                    moveList.push(i)
                }
            }
        }
        mods['removeAbsolute'+i] = {
            name: NP,
            description: NP,
            action: function(board,square, moveList){
                if(boardState.validSquare(i) && moveList.indexOf(i)!=-1){
                    moveList.splice(moveList.indexOf(i),1)
                }
            }
        }
        mods['removeRelative'+i] = {
            name: NP,
            description: NP, 
            action: function(board,square, moveList){
                if(boardState.validSquare(square+i) && moveList.indexOf(square+i)!=-1){
                        moveList.splice(moveList.indexOf(square+i),1)
                    }
                }
            }
        }
}

addTeleportMods()

function validBeaconTeleport(board, square, beaconIndex, offset){
    var parsedSquare = beaconIndex+offset
    return boardState.validSquare(parsedSquare) && (pieceAttack.attackTypes[board[square].atttype](board, square, parsedSquare) || boardState.emptySquare(board, parsedSquare))
}

function parseMoveMods(board, square, moveList, ignoreList = []){
    for(let i = 0; i < board[square].movmods.length;i++){
        var mod = board[square].movmods[i]
        if(ignoreList.indexOf(mod)==-1){
            mods[mod].action(board, square, moveList)
        }
    }
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
},{}],10:[function(require,module,exports){
var boardState = require('./BoardState')
var attackTypes = { 
    normal: {
        name: "Normal",
        description: "This piece can only capture enemy pieces",
        action: function(board, initial, target){ 
            return boardState.enemySquare(board,initial,target)
        }
    },
    friendlyfire: {
        name: "Friendly Fire",
        description: "This piece can capture enemy or ally pieces",
        action: function(board,initial,target){ 
            return boardState.occupiedSquare(board,target)
        }
    },
    pacifist: {
        name: "Pacifist",
        description: "This piece can not capture other pieces",
        action: function(board, initial, target){ 
            return false
        }
    },
    traitor:{
        name: "Traitor",
        desciption: "This piece can only capture ally pieces",
        action: function(board, initial, target){
            return boardState.allySquare(board,initial,target)
        }
    }
}

function validAttack(board, square, target){
    return boardState.occupiedSquare(board, target) && attackTypes[board[square].atttype].action(board, square, target)
}

exports.validAttack = validAttack
exports.attackTypes = attackTypes
},{"./BoardState":3}],11:[function(require,module,exports){
var translate = {
    wP: "White Pawn",
    wK: "White King",
    wQ: "White Queen",
    wR: "White Rook",
    wN: "White Knight",
    wB: "White Bishop",
    bP: "Black Pawn",
    bK: "Black King",
    bQ: "Black Queen",
    bR: "Black Rook",
    bN: "Black Knight",
    bB: "Black Bishop"
}

exports.translate = translate
},{}]},{},[5]);
