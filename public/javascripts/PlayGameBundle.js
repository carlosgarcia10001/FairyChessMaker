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
},{}],3:[function(require,module,exports){
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
        for(var i = moveList.length-1; i >= 0; i--){
            var copyBoard = JSON.parse(JSON.stringify(board))
            var movement = makeMove(copyBoard, square, moveList[i], true)
            if(check(copyBoard, color)){
                moveList.splice(i,1)
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

function parseMoveMods(board, square, moveList, ignoreList = []){
    for(let i = 0; i < board[square].movmods.length;i++){
        var mod = board[square].movmods[i]
        if(ignoreList.indexOf(mod)==-1){
            mods[mod](board, square, moveList)
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
},{"./BoardState":1,"./IndexAndCoordinates":2,"./Piece":4,"./PieceAttack":5}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{"./BoardState":1}],6:[function(require,module,exports){
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
                console.log(keys)
                console.log(data)
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
},{"./htmlBoardControl":7}],7:[function(require,module,exports){
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
},{"./IndexAndCoordinates":2,"./Move":3}]},{},[6]);
