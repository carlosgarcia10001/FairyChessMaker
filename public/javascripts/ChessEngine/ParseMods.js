var moveMods = require('./MoveMods')
var AttributeMods = require('./AttributeMods')
function parseMoveMods(board, square, moveList){
    for(let i = 0; i < board[square].movmods.length;i++){
        var mod = board[square].movmods[i]
        moveMods.mods[mod](board, square, moveList)
    }
}

function parseAttributeMods(parsedBoard, parsedSquare, color){
    for(var i = 0; i < parsedBoard[parsedSquare].attrmods.length;i++){
        var mod = parsedBoard[parsedSquare].attrmods[i]
        AttributeMods.mods[mod](parsedBoard, color)
    }
}

exports.parseMoveMods = parseMoveMods
exports.parseAttributeMods = parseAttributeMods