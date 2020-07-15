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
function cleanPieces(pieces){
    var keys = Object.keys(pieces)
    for(var i = 0; i < keys.length;i++){
        cleanPiece(pieces[keys[i]])
    }
}

function cleanPiece(piece){
    piece.hp = Number(piece.hp)
    piece.dmg = Number(piece.dmg)
    var mov = {
        paths: [],
        space: [],
        attPaths: [],
        attSpace: []
    }
    if(typeof(piece.attrmods) == 'undefined'){
        piece.attrmods = []
    }
    if(typeof(piece.movmods) == 'undefined'){
        piece.movmods = []
    }
    for(var i = 0; i < piece.mov.paths.length; i++){
        mov.paths.push([])
        for(var j = 0; j < piece.mov.paths[i].length; j++){
            mov.paths[i].push(Number(piece.mov.paths[i][j]))
        }
    }
    for(var i = 0; i < piece.mov.space.length; i++){
        mov.space.push([])
        for(var j = 0; j < piece.mov.space[i].length; j++){
            mov.space[i].push(Number(piece.mov.space[i][j]))
        }
    }
    for(var i = 0; i < piece.mov.attPaths.length; i++){
        mov.attPaths.push([])
        for(var j = 0; j < piece.mov.attPaths[i].length; j++){
            mov.attPaths[i].push(Number(piece.mov.attPaths[i][j]))
        }
    }
    for(var i = 0; i < piece.mov.attSpace.length; i++){
        mov.attSpace.push([])
        for(var j = 0; j < piece.mov.attSpace[i].length; j++){
            mov.attSpace[i].push(Number(piece.mov.attSpace[i][j]))
        }
    }
    piece.mov = mov
}

exports.cleanPieces = cleanPieces
exports.cleanPiece = cleanPiece
},{}],5:[function(require,module,exports){
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
},{"./AttributeMods":1,"./BoardState":3,"./IndexAndCoordinates":6,"./Move":7,"./Piece":8}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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

},{"./BoardState":3,"./IndexAndCoordinates":6,"./Piece":8,"./PieceAttack":9}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{"./BoardState":3}],10:[function(require,module,exports){
var move = require('./Move')
var piece = require('./Piece')
var pieces = piece.createPieces()
var cleanPieceFileRead = require('./CleanPieceFileRead')
var game = require('./Game')
var board = new Array(128)
var htmlBoardControl = require('./htmlBoardControl')
var boardState = require('./BoardState')

game.initializeBoard(board)

$(document).ready(function(){
    var htmlSquares = []
    var locateHtmlSquares = {}
    $(document).on('load',function(){
        htmlSquares = htmlBoardControl.createHtmlSquares()
        locateHtmlSquares = htmlBoardControl.createLocateHtmlSquares(htmlSquares)
        var matchId = window.location.pathname.substring(6)
        $.post('/play',
        {
            id: matchId 
        }).done(function(data) {
            pieces = JSON.parse(data)
            if(data == "/browse"){
                window.location.assign(data)
            }
            cleanPieceFileRead.cleanPieces(pieces)
            game.parseFEN(board, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', pieces)
        })
    })
    
    var config = {
        pieceTheme: "../images/chesspieces/wikipedia/{piece}.png",
        draggable: true,
        position: "start",
        onMouseoverSquare: onMouseoverSquare,
        onDrop: onDrop
    }

    function onMouseoverSquare(square, piece){
        if(piece==false){
            htmlBoardControl.unHighlightValidMoves(htmlSquares)
        }
        else{
            htmlBoardControl.updateHighlightedMoves(board,square,htmlSquares,locateHtmlSquares)
        }
    }

    function onDrop(source, target, piece){
        var movement = move.makeMove(board, 'w', source, target)
        boardState.printBoard(board)
        if(movement == false){
            return 'snapback'
        }

    }
    var htmlBoard = Chessboard('myBoard',config)
    $(document).trigger('load')
})
},{"./BoardState":3,"./CleanPieceFileRead":4,"./Game":5,"./Move":7,"./Piece":8,"./htmlBoardControl":11}],11:[function(require,module,exports){
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

},{"./IndexAndCoordinates":6,"./Move":7}]},{},[10]);
