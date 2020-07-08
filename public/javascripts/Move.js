var boardState = require('./BoardState')
var pieceAttack = require('./PieceAttack')
var piece = require('./Piece')
var indexAndCoordinates = require('./IndexAndCoordinates')
var mods = {
    ethereal: function(board, square, moveList){
        for(var i = 0; i < board[square].mov.paths.length;i++){
            var parsedSquare = square + board[square].mov.paths[i][0]
            for(var j = 0; j < board[square].mov.paths[i].length-1; j++){
                var add = 1
                if(board[square].mov.paths[i][j]<0){
                    add = -1
                }
                for(var k = board[square].mov.paths[i][j]; Math.abs(k) < Math.abs(board[square].mov.paths[i][j+1]);k+=add){
                    if(!boardState.validSquare(parsedSquare) || boardState.enemySquare(board, square, parsedSquare)){
                        break
                    }
                    else if(boardState.allySquare(board, square, parsedSquare)){
                        parsedSquare+=board[square].mov.attSpace[i][j]*add
                        continue
                    }
                    if(moveList.indexOf(parsedSquare)==-1){
                        moveList.push(parsedSquare)
                    }
                    parsedSquare+=board[square].mov.space[i][j]*add
                }
            }
        }
        for(var i = 0; i < board[square].mov.attPaths.length;i++){
            var parsedSquare = square + board[square].mov.attPaths[i][0]
            for(var j = 0; j < board[square].mov.attPaths[i].length-1; j++){
                var add = 1
                if(board[square].mov.paths[i][j]<0){
                    add = -1
                }
                for(var k = board[square].mov.attPaths[i][j]; Math.abs(k) < Math.abs(board[square].mov.attPaths[i][j+1]);k+=add){
                    if(boardState.validSquare(parsedSquare) && boardState.occupiedSquare(board,parsedSquare) && pieceAttack.validAttack(board,square,parsedSquare)){ 
                        if(moveList.indexOf(parsedSquare)==-1){
                            moveList.push(parsedSquare)
                        }
                        if(boardState.allySquare(board,square, parsedSquare)){
                            parsedSquare+=board[square].mov.attSpace[i][j]*add
                            continue
                        }
                        break  
                    }
                    else if(!boardState.validSquare(parsedSquare) || (boardState.occupiedSquare(board,parsedSquare) && !pieceAttack.validAttack(board,square,parsedSquare))){
                        break
                    }
                    parsedSquare+=board[square].mov.attSpace[i][j]*add
                }
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
    moveList = []
    for(var i = 0; i < board[square].mov.paths.length;i++){
        var parsedSquare = square + board[square].mov.paths[i][0]
        for(var j = 0; j < board[square].mov.paths[i].length-1; j++){
            var add = 1
            if(board[square].mov.paths[i][j]<0){
                add = -1
            }
            for(var k = board[square].mov.paths[i][j]; Math.abs(k) < Math.abs(board[square].mov.paths[i][j+1]);k+=add){
                if(!boardState.validSquare(parsedSquare) || boardState.occupiedSquare(board,parsedSquare)){
                    break
                }
                if(moveList.indexOf(parsedSquare)==-1){
                    moveList.push(parsedSquare)
                }
                parsedSquare+=board[square].mov.space[i][j]*add
            }
        }
    }
    for(var i = 0; i < board[square].mov.attPaths.length;i++){
        var parsedSquare = square + board[square].mov.attPaths[i][0]
        for(var j = 0; j < board[square].mov.attPaths[i].length-1; j++){
            var add = 1
            if(board[square].mov.paths[i][j]<0){
                add = -1
            }
            for(var k = board[square].mov.attPaths[i][j]; Math.abs(k) < Math.abs(board[square].mov.attPaths[i][j+1]);k+=add){
                if(boardState.validSquare(parsedSquare) && boardState.occupiedSquare(board,parsedSquare) && pieceAttack.validAttack(board,square,parsedSquare)){ 
                    moveList.push(parsedSquare)
                    break  
                }
                else if(!boardState.validSquare(parsedSquare) || (boardState.occupiedSquare(board,parsedSquare) && !pieceAttack.validAttack(board,square,parsedSquare))){
                    break
                }
                parsedSquare+=board[square].mov.attSpace[i][j]*add
            }
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
