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