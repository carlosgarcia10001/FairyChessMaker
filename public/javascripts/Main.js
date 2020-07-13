var piece = require("./Piece")
var game = require("./Game")
var move = require("./Move")
var boardState = require("./BoardState")
var board = game.board
var express = require('express')
var path = require('path')
const app = express()
const port = 3000
var testPath = path.join('node_modules','@chrisoakman','chessboardjs','dist')
app.use(express.static("html"));

app.use(express.static(__dirname))
app.get('/', (req, res) => {
    res.sendFile(__dirname+"/html/test.html")
    console.log(__dirname)
})


app.listen(port, () => console.log(testPath))