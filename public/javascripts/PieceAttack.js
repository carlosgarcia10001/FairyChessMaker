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