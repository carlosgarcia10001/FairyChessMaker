var move = require('./Move')
var fs = require('fs')
var piece = require('./Piece')
var pieces = ""
var cleanPieceFileRead = require('./CleanPieceFileRead')
fs.readFile(__dirname + "/CustomChessPieces.json", (err, data) =>{
    if (err) throw err
    pieces = JSON.parse(data)
    cleanPieceFileRead.cleanPieces(pieces)
})

var config = {
    pieceTheme: "../images/chesspieces/wikipedia/{piece}.png",
    draggable: true,
    position: "start"
}


