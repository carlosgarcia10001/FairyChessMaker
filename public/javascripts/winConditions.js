var move = require('./Move')
var boardState = require('./BoardState')
var winCondition = { 
    checkMate: function(board, turn){
        var enemyColor = 'w'
        if(turn == 'w'){
            enemyColor = 'b'
        }
        var checkMate = move.checkMate(board,turn)
        if(checkMate){
            return enemyColor
        }
        else if(!checkMate && move.masterMoveList(board, turn).length == 0){
            return 'draw'
        }
        return false
    },
    elimination: function(board, turn){
        var enemyColor = 'b'
        if(turn==enemyColor){
            enemyColor = 'w'
        }
        if(boardState.pieceIndex(board, turn).length==0){
            return enemyColor
        }
        return false
    },
}

exports.winCondition = winCondition