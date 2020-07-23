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