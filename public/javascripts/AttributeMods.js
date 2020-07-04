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