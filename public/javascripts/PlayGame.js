var move = require('./Move')
var fs = require('fs')
var config = {
    pieceTheme: "../images/chesspieces/wikipedia/{piece}.png",
    draggable: true,
    position: "start"
}


var board = Chessboard('myBoard',config)
 

