var move = require('./Move')
var fs = require('fs')
var piece = require('./Piece')
var indexAndCoordinates = require('./IndexAndCoordinates')
var pieces = piece.createPieces()
var cleanPieceFileRead = require('./CleanPieceFileRead')
var game = require('./Game')
var board = new Array(128)
var htmlBoardControl = require('./htmlBoardControl')
var boardState = require('./BoardState')
game.initializeBoard(board)

$(document).ready(function(){
    var htmlSquares = []
    var locateHtmlSquares = {}
    $(document).on('load',function(){
        htmlSquares = htmlBoardControl.createHtmlSquares()
        locateHtmlSquares = htmlBoardControl.createLocateHtmlSquares(htmlSquares)
        var pieceData = {"wK":{"id":"k","color":"w","hp":"1","dmg":"1","atttype":"normal","mov":{"paths":[["1","2"],["-1","-2"],["16","17"],["17","18"],["15","16"],["-16","-17"],["-17","-18"],["-15","-16"]],"space":[["1"],["1"],["1"],["1"],["1"],["1"],["1"],["1"]],"attPaths":[["1","2"],["-1","-2"],["16","17"],["17","18"],["15","16"],["-16","-17"],["-17","-18"],["-15","-16"]],"attSpace":[["1"],["1"],["1"],["1"],["1"],["1"],["1"],["1"]]}},"wQ":{"id":"q","color":"w","hp":"1","dmg":"1","atttype":"normal","mov":{"paths":[["-16","-112"],["16","112"],["-1","-8"],["1","8"],["-17","-119"],["-15","-117"],["15","117"],["17","119"]],"space":[["16"],["16"],["1"],["1"],["17"],["15"],["15"],["17"]],"attPaths":[["-16","-112"],["16","112"],["-1","-8"],["1","8"],["-17","-119"],["-15","-117"],["15","117"],["17","119"]],"attSpace":[["16"],["16"],["1"],["1"],["17"],["15"],["15"],["17"]]}},"wR":{"id":"r","color":"w","hp":"1","dmg":"1","atttype":"normal","mov":{"paths":[["-1","-8"],["1","8"],["-16","-112"],["16","112"]],"space":[["1"],["1"],["16"],["16"]],"attPaths":[["-1","-8"],["1","8"],["-16","-112"],["16","112"]],"attSpace":[["1"],["1"],["16"],["16"]]}},"wB":{"id":"b","color":"w","hp":"1","dmg":"1","atttype":"normal","mov":{"paths":[["-17","-119"],["-15","-117"],["15","117"],["17","119"]],"space":[["17"],["15"],["15"],["17"]],"attPaths":[["-17","-119"],["-15","-117"],["15","117"],["17","119"]],"attSpace":[["17"],["15"],["15"],["17"]]}},"wN":{"id":"n","color":"w","hp":"1","dmg":"1","atttype":"normal","mov":{"paths":[["-33","-34"],["-18","-19"],["-31","-32"],["-14","-15"],["14","15"],["31","32"],["18","19"],["33","34"]],"space":[["1"],["1"],["1"],["1"],["1"],["1"],["1"],["1"]],"attPaths":[["-33","-34"],["-18","-19"],["-31","-32"],["-14","-15"],["14","15"],["31","32"],["18","19"],["33","34"]],"attSpace":[["1"],["1"],["1"],["1"],["1"],["1"],["1"],["1"]]}},"wP":{"id":"p","color":"w","hp":"1","dmg":"1","atttype":"normal","mov":{"paths":[["-16","-17"]],"space":[["1"]],"attPaths":[["-17","-18"],["-15","-16"]],"attSpace":[["1"],["1"]]}},"bK":{"id":"K","color":"b","hp":"1","dmg":"1","atttype":"normal","mov":{"paths":[["1","2"],["-1","-2"],["16","17"],["17","18"],["15","16"],["-16","-17"],["-17","-18"],["-15","-16"]],"space":[["1"],["1"],["1"],["1"],["1"],["1"],["1"],["1"]],"attPaths":[["1","2"],["-1","-2"],["16","17"],["17","18"],["15","16"],["-16","-17"],["-17","-18"],["-15","-16"]],"attSpace":[["1"],["1"],["1"],["1"],["1"],["1"],["1"],["1"]]}},"bQ":{"id":"Q","color":"b","hp":"1","dmg":"1","atttype":"normal","mov":{"paths":[["-16","-112"],["16","112"],["-1","-8"],["1","8"],["-17","-119"],["-15","-117"],["15","117"],["17","119"]],"space":[["16"],["16"],["1"],["1"],["17"],["15"],["15"],["17"]],"attPaths":[["-16","-112"],["16","112"],["-1","-8"],["1","8"],["-17","-119"],["-15","-117"],["15","117"],["17","119"]],"attSpace":[["16"],["16"],["1"],["1"],["17"],["15"],["15"],["17"]]}},"bR":{"id":"R","color":"b","hp":"1","dmg":"1","atttype":"normal","mov":{"paths":[["-1","-8"],["1","8"],["-16","-112"],["16","112"]],"space":[["1"],["1"],["16"],["16"]],"attPaths":[["-1","-8"],["1","8"],["-16","-112"],["16","112"]],"attSpace":[["1"],["1"],["16"],["16"]]}},"bB":{"id":"B","color":"b","hp":"1","dmg":"1","atttype":"normal","mov":{"paths":[["-17","-119"],["-15","-117"],["15","117"],["17","119"]],"space":[["17"],["15"],["15"],["17"]],"attPaths":[["-17","-119"],["-15","-117"],["15","117"],["17","119"]],"attSpace":[["17"],["15"],["15"],["17"]]}},"bN":{"id":"N","color":"b","hp":"1","dmg":"1","atttype":"normal","mov":{"paths":[["-33","-34"],["-18","-19"],["-31","-32"],["-14","-15"],["14","15"],["31","32"],["18","19"],["33","34"]],"space":[["1"],["1"],["1"],["1"],["1"],["1"],["1"],["1"]],"attPaths":[["-33","-34"],["-18","-19"],["-31","-32"],["-14","-15"],["14","15"],["31","32"],["18","19"],["33","34"]],"attSpace":[["1"],["1"],["1"],["1"],["1"],["1"],["1"],["1"]]}},"bP":{"id":"P","color":"b","hp":"1","dmg":"1","atttype":"normal","mov":{"paths":[["16","17"]],"space":[["1"]],"attPaths":[["15","16"],["17","18"]],"attSpace":[["1"],["1"]]}}}
        pieces = pieceData
        cleanPieceFileRead.cleanPieces(pieces)
        pieces['bR'].atttype = 'friendlyfire'
        console.log(pieces)
        game.parseFEN(board, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', pieces)
    })
    
    var config = {
        pieceTheme: "../images/chesspieces/wikipedia/{piece}.png",
        draggable: true,
        position: "start",
        onMouseoverSquare: onMouseoverSquare,
        onDrop: onDrop
    }

    function onMouseoverSquare(square, piece){
        if(piece==false){
            htmlBoardControl.unHighlightValidMoves(htmlSquares)
        }
        else{
            htmlBoardControl.updateHighlightedMoves(board,square,htmlSquares,locateHtmlSquares)
        }
    }

    function onDrop(source, target, piece){
        var movement = move.makeMove(board, 'w', source, target)
        console.log(boardState.printBoard(board))
        if(movement == false){
            return 'snapback'
        }

    }
    var htmlBoard = Chessboard('myBoard',config)
    $(document).trigger('load')
})