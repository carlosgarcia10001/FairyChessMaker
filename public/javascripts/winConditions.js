var move = require('./Move')
var boardState = require('./BoardState')
var winCondition = {
    checkMate: function(board, color){
        var enemyColor = 'w'
        if(color == 'w'){
            enemyColor = 'b'
        }
        return move.checkMate(board, enemyColor)
    },
    elimination: function(board, color){
        var enemyColor = 'b'
        if(color==enemyColor){
            enemyColor = 'w'
        }
        for(var i = 0; i < board.length; i++){
            if(boardState.validSquare(i) && board[i].color==enemyColor){
                return false
            }
        }
        return true
    },
}
