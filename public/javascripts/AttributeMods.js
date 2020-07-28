var boardState = require('./BoardState')
var helper = require('./AttributeModsHelper')
var mods ={
    BEACON: {
        name: "Beacon",
        description: "Ally pieces can teleport to within a one square radius of this piece, no matter their location.",
        action: function(board, color){
                    var friendlySquares = boardState.pieceIndex(board, color)
                    for(var i = 0; i < friendlySquares.length; i++){
                        if(!boardState.pieceHasAttributeMod(board, friendlySquares[i],'BEACON')){
                            helper.addMoveMod(board, friendlySquares[i], 'TELEPORTTOBEACON')
                        }
                    }
        },
        removal: function(board, color){
                    var friendlySquares = boardState.pieceIndex(board,color)
                    for(var i = 0; i < friendlySquares.length; i++){
                        if(board[friendlySquares[i]].movmods.indexOf('TELEPORTTOBEACON')!=-1){
                            board[friendlySquares[i]].movmods.splice(board[friendlySquares[i]].movmods.indexOf('TELEPORTTOBEACON'),1)
                        }
                    }
        }
    },
    KINGLY: {
        name: "Kingly",
        description: "This piece must be protected by ally pieces at all costs. Can only be applied to one piece per game.",
        action: function(board, color){
                    var friendlySquares = boardState.pieceIndex(board,color)
                    for(var i = 0; i < friendlySquares.length; i++){
                        if(board[friendlySquares[i]].movmods.indexOf('PROTECTKINGLY')==-1){
                            helper.addMoveMod(board, friendlySquares[i], 'PROTECTKINGLY')
                        }
                    }
        },
        removal: function(board, color){
                    var friendlySquares = boardState.pieceIndex(board,color)
                    for(var i = 0; i < friendlySquares.length; i++){
                        if(board[friendlySquares[i]].movmods.indexOf('PROTECTKINGLY')!=-1){
                            board[friendlySquares[i]].movmods.splice(board[friendlySquares[i]].movmods.indexOf('PROTECTKINGLY'),1)
                        }
                    }
        }
    }
}

function parseMods(parsedBoard, parsedSquare, color){
    for(var i = 0; i < parsedBoard[parsedSquare].attrmods.length;i++){
        var mod = parsedBoard[parsedSquare].attrmods[i].toUpperCase()
        mods[mod].action(parsedBoard, color)
    }
}

function getAttributeModNames(attributeModList){
    attributeNameList = []
    for(var i = 0; i < attributeModList.length; i++){
        var modName = mods[attributeModList[i]].name
        if(modName!= "NP"){
            attributeNameList.push(modName)
        }
    }
    return attributeNameList
}

exports.parseMods = parseMods
exports.mods = mods
exports.getAttributeModNames = getAttributeModNames