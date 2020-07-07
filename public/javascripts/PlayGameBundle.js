(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
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
},{"./AttributeModsHelper":3,"./BoardState":4}],3:[function(require,module,exports){
function addMoveMod(board, square, mod){
    board[square].movmods.push(mod)
}

exports.addMoveMod = addMoveMod
},{}],4:[function(require,module,exports){
var indexToCoordinates = {}
var coordinatesToIndex = {}
var indexToValidIndex = {}
function validSquare(square){
    return ((0x88 & square) == 0) 
}

function emptySquare(board, square){
    return board[square].color==""
}

function occupiedSquare(board,square){
    return board[square].color!=""
}

function allySquare(board, square, parsedSquare){
    return board[square].color==board[parsedSquare].color
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
},{}],5:[function(require,module,exports){
var piece = require('./Piece')
function cleanPieces(pieces){
    var keys = Object.keys(pieces)
    for(var i = 0; i < keys.length;i++){
        cleanPiece(pieces[keys[i]])
    }
}

function cleanPiece(piece){
    piece.hp = Number(piece.hp)
    piece.dmg = Number(piece.dmg)
    var mov = []
    var movdur = []
    var dmgmov = []
    var dmgmovdur = []
    if(typeof(piece.mov) =='undefined'){
        piece.mov = []
        piece.movdur = []
    }
    if(typeof(piece.dmgmov) =='undefined'){
        piece.dmgmov = []
        piece.dmgmovdur = []
    }
    if(typeof(piece.attrmods) == 'undefined'){
        piece.attrmods = []
    }
    if(typeof(piece.movmods) == 'undefined'){
        piece.movmods = []
    }
    for(var i = 0; i < piece.mov.length;i++){
        mov.push(Number(piece.mov[i]))
        movdur.push(Number(piece.movdur[i]))
        if(piece.mov==piece.dmgmov){
            dmgmov.push(Number(piece.dmgmov[i]))
            dmgmovdur.push(Number(piece.dmgmovdur[i]))
        }
    }
    if(piece.mov!=piece.dmgmov){
        for(var i = 0; i < piece.dmgmov.length;i++){
            dmgmov.push(Number(piece.dmgmov[i]))
            dmgmovdur.push(Number(piece.dmgmovdur[i]))
        }
    }
    piece.mov = mov
    piece.movdur = movdur
    piece.dmgmov = dmgmov
    piece.dmgmovdur = dmgmovdur
}

exports.cleanPieces = cleanPieces
exports.cleanPiece = cleanPiece
},{"./Piece":9}],6:[function(require,module,exports){
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
            FENcopy = FENcopy.substring(1)
        }
        else if(!isNaN(Number(FENcopy.charAt(0)))){
            var count = Number(FENcopy.charAt(0))
            for(var i = 0; i < count; i++){
                parsedBoard[indexAndCoordinates.coordinatesToIndex[String.fromCharCode(letter)+number]] = piece.createPiece()
                letter++
            }
            FENcopy = FENcopy.substring(1)
        }
        else{
            for(var i = 0; i < keys.length; i++){
                if(parsedPieces[keys[i]].id == FENcopy.charAt(0)){
                    parsedBoard[indexAndCoordinates.coordinatesToIndex[String.fromCharCode(letter)+number]] = parsedPieces[keys[i]]
                }
            }
            letter++
            FENcopy = FENcopy.substring(1)
        }
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
},{"./AttributeMods":2,"./BoardState":4,"./IndexAndCoordinates":7,"./Move":8,"./Piece":9}],7:[function(require,module,exports){
var indexToCoordinates = {}
var coordinatesToIndex = {}
var mirrorSquares = {}
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
        var position = square
        for(var i = 0; i < board[square].mov.length;i++){
            var parsedSquare = position+board[square].mov[i]
            var j = 0
            while(boardState.validSquare(parsedSquare) && j < board[square].movdur[i]){
                if(boardState.allySquare(board,square,parsedSquare)){ 
                    if(pieceAttack.validAttack(board,square,parsedSquare)){
                        if(moveList.indexOf(parsedSquare)==-1){
                            moveList.push(parsedSquare)
                        }
                    }
                    j++
                    parsedSquare+=board[square].mov[i]
                    continue
                }
                else if(boardState.occupiedSquare(board, parsedSquare) && board[square].color!=board[parsedSquare].color){ 
                    if(pieceAttack.validAttack(board,square,parsedSquare) && moveList.indexOf(parsedSquare)==-1){
                        moveList.push(parsedSquare)
                    }
                    break
                }
                else if(moveList.indexOf(parsedSquare)==-1){
                    moveList.push(parsedSquare)
                }
                parsedSquare+=board[square].mov[i]
                j++
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
    for(let i = 0; i < 119; i++){
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
    for(var i = 0; i < 119; i++){
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
    var position = square
    var movIsDmgMov = board[square].mov==board[square].dmgmov && board[square].movdur==board[square].dmgmovdur
    moveList = []
    for(var i = 0; i < board[square].mov.length;i++){
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
    }
    parseMoveMods(board,square,moveList)
    return moveList
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
    if(typeof(target)=='undefined' || typeof(initial)=='undefined'){
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

},{"./BoardState":4,"./IndexAndCoordinates":7,"./Piece":9,"./PieceAttack":10}],9:[function(require,module,exports){
function createPiece(id= " ", color = "", hp = 1, dmg = 1, mov = [], movdur = [], atttype = 'normal', attrmods = [], movmods = [], dmgmov = mov, dmgmovdur = movdur){
    var piece = {
        id: id,
        color: color,
        hp: hp,
        dmg: dmg,
        atttype: atttype,
        mov: mov,
        movdur: movdur,
        attrmods: attrmods,
        movmods: movmods,
        dmgmov: dmgmov,
        dmgmovdur: dmgmovdur
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

exports.createPiece = createPiece
exports.createPieces = createPieces
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
    return attackTypes[board[square].atttype](board, square, target)
}

exports.validAttack = validAttack
exports.attackTypes = attackTypes
},{"./BoardState":4}],11:[function(require,module,exports){
var move = require('./Move')
var fs = require('fs')
var piece = require('./Piece')
var indexAndCoordinates = require('./IndexAndCoordinates')
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
        var pieceData = {"wK":{"id":"k","color":"w","hp":"1","dmg":"1","atttype":"traitor","mov":["-17","17","-1","1","15","-15","16","-16"],"movdur":["1","1","1","1","1","1","1","1"],"dmgmov":["-17","17","-1","1","15","-15","16","-16"],"dmgmovdur":["1","1","1","1","1","1","1","1"]},"wQ":{"id":"q","color":"w","hp":"1","dmg":"1","atttype":"normal","mov":["-16","16","-32","32","-48","48","-64","64","-80","80","-96","96","-112","112","-15","15","-30","30","-45","45","-60","60","-75","75","-90","90","-105","105","1","-1","2","-2","3","-3","4","-4","5","-5","6","-6","7","-7","17","-17","34","-34","51","-51","68","-68","85","-85","102","-102","119","-119"],"movdur":["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"],"dmgmov":["-16","16","-32","32","-48","48","-64","64","-80","80","-96","96","-112","112","-15","15","-30","30","-45","45","-60","60","-75","75","-90","90","-105","105","1","-1","2","-2","3","-3","4","-4","5","-5","6","-6","7","-7","17","-17","34","-34","51","-51","68","-68","85","-85","102","-102","119","-119"],"dmgmovdur":["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"]},"wR":{"id":"r","color":"w","hp":"1","dmg":"1","atttype":"normal","mov":["1","-1","2","-2","3","-3","4","-4","5","-5","6","-6","7","-7","-16","16","-32","32","-48","48","-64","64","-80","80","-96","96","-112","112"],"movdur":["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"],"dmgmov":["1","-1","2","-2","3","-3","4","-4","5","-5","6","-6","7","-7","-16","16","-32","32","-48","48","-64","64","-80","80","-96","96","-112","112"],"dmgmovdur":["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"]},"wB":{"id":"b","color":"w","hp":"1","dmg":"1","atttype":"normal","mov":["-15","15","-30","30","-45","45","-60","60","-75","75","-90","90","-105","105","17","-17","34","-34","51","-51","68","-68","85","-85","102","-102","119","-119"],"movdur":["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"],"dmgmov":["-15","15","-30","30","-45","45","-60","60","-75","75","-90","90","-105","105","17","-17","34","-34","51","-51","68","-68","85","-85","102","-102","119","-119"],"dmgmovdur":["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"]},"wN":{"id":"n","color":"w","hp":"1","dmg":"1","atttype":"normal","mov":["-31","31","-14","14","18","-18","33","-33"],"movdur":["1","1","1","1","1","1","1","1"],"dmgmov":["-31","31","-14","14","18","-18","33","-33"],"dmgmovdur":["1","1","1","1","1","1","1","1"]},"wP":{"id":"p","color":"w","hp":"1","dmg":"1","atttype":"normal","mov":["-16","-80","-96","-112"],"movdur":["1","1","1","1"],"dmgmov":["-16","-80","-96","-112"],"dmgmovdur":["1","1","1","1"]},"bK":{"id":"K","color":"b","hp":"1","dmg":"1","atttype":"normal","mov":["-17","17","-1","1","15","-15","16","-16"],"movdur":["1","1","1","1","1","1","1","1"],"dmgmov":["-17","17","-1","1","15","-15","16","-16"],"dmgmovdur":["1","1","1","1","1","1","1","1"]},"bQ":{"id":"Q","color":"b","hp":"1","dmg":"1","atttype":"normal","mov":["-1","1","-2","2","-3","3","-4","4","-5","5","-6","6","-7","7","-17","17","-34","34","-51","51","-68","68","-85","85","-102","102","-119","119","-15","15","-30","30","-45","45","-60","60","-75","75","-90","90","-105","105","-16","16","-32","32","-48","48","-64","64","-80","80","-96","96","-112","112"],"movdur":["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"],"dmgmov":["-1","1","-2","2","-3","3","-4","4","-5","5","-6","6","-7","7","-17","17","-34","34","-51","51","-68","68","-85","85","-102","102","-119","119","-15","15","-30","30","-45","45","-60","60","-75","75","-90","90","-105","105","-16","16","-32","32","-48","48","-64","64","-80","80","-96","96","-112","112"],"dmgmovdur":["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"]},"bR":{"id":"R","color":"b","hp":"1","dmg":"1","atttype":"normal","mov":["-16","16","-32","32","-48","48","-64","64","-80","80","-96","96","-112","112","1","-1","2","-2","3","-3","4","-4","5","-5","6","-6","7","-7"],"movdur":["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"],"dmgmov":["-16","16","-32","32","-48","48","-64","64","-80","80","-96","96","-112","112","1","-1","2","-2","3","-3","4","-4","5","-5","6","-6","7","-7"],"dmgmovdur":["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"]},"bB":{"id":"B","color":"b","hp":"1","dmg":"1","atttype":"normal","mov":["-15","15","-30","30","-45","45","-60","60","-75","75","-90","90","-105","105","-17","17","-34","34","-51","51","-68","68","-85","85","-102","102","-119","119"],"movdur":["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"],"dmgmov":["-15","15","-30","30","-45","45","-60","60","-75","75","-90","90","-105","105","-17","17","-34","34","-51","51","-68","68","-85","85","-102","102","-119","119"],"dmgmovdur":["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1"]},"bN":{"id":"N","color":"b","hp":"1","dmg":"1","atttype":"normal","mov":["-31","31","-14","14","18","-18","33","-33"],"movdur":["1","1","1","1","1","1","1","1"],"dmgmov":["-31","31","-14","14","18","-18","33","-33"],"dmgmovdur":["1","1","1","1","1","1","1","1"]},"bP":{"id":"P","color":"b","hp":"1","dmg":"1","atttype":"normal","mov":["-16"],"movdur":["1"],"dmgmov":["-16"],"dmgmovdur":["1"]}}
        pieces = pieceData
        cleanPieceFileRead.cleanPieces(pieces)
        console.log(pieces)
        game.parseFEN(board, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', pieces)
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
        console.log(boardState.printBoard(board))
        if(movement == false){
            return 'snapback'
        }

    }
    var htmlBoard = Chessboard('myBoard',config)
    $(document).trigger('load')
})
},{"./BoardState":4,"./CleanPieceFileRead":5,"./Game":6,"./IndexAndCoordinates":7,"./Move":8,"./Piece":9,"./htmlBoardControl":12,"fs":1}],12:[function(require,module,exports){
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

},{"./IndexAndCoordinates":7,"./Move":8}]},{},[11]);
