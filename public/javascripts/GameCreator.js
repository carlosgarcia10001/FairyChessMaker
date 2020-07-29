
var htmlBoardControl = require('./HtmlBoardControl')
const socket = new WebSocket('ws://localhost:3000/gamecreate/')

$(document).ready(function(){
    var htmlSquares = []
    var htmlFENBoardSquares = []
    var htmlCurrentPieceBoardSquares = []
    var htmlPathBoardSquares = []
    var locateHtmlFENBoardSquares = {}
    var locateHtmlCurrentPieceBoardSquares = {}
    var locateHtmlPathBoardSquares = {}
    var currentPiece = "wP"
    var currentPiecePosition = 'd4'
    var pathPiecePosition = 'd4'
    $(document).on('load',function(){
        htmlSquares = htmlBoardControl.createHtmlSquares()
        for(var i = 0; i < htmlSquares.length; i++){
            if($($(htmlSquares[i]).parents()[3])[0]==$("#FENBoard")[0]){
                htmlFENBoardSquares.push($(htmlSquares[i]))
            }
            else if($($(htmlSquares[i]).parents()[3])[0]==$("#currentPieceBoard")[0]){
                htmlCurrentPieceBoardSquares.push($(htmlSquares[i]))
            }
            else{
                htmlPathBoardSquares.push($(htmlSquares[i]))
            }
        }
        locateHtmlCurrentPieceBoardSquares = htmlBoardControl.createLocateHtmlSquares(htmlCurrentPieceBoardSquares)
        locateHtmlFENBoardSquares = htmlBoardControl.createLocateHtmlSquares(htmlFENBoardSquares)
        locateHtmlPathBoardSquares = htmlBoardControl.createLocateHtmlSquares(htmlPathBoardSquares)
    })
    $(".submitAmount").click(function(){
        if(currentPiece!=""){
            var direction = $(this).attr('id').replace('MoveSubmit',"")
            var amount = $("#"+direction+"MoveAmount").val()
            if(amount > 7){
                amount = 7
            }
            else if(amount < 1){
                amount = 1
            }
            var pathAddMovement = {
                pathAddMovement: {
                    direction: direction,
                    amount: amount
                }
            }
            socket.send(JSON.stringify(pathAddMovement))
        }
    })

    var messageResponse = {
        highlightCurrentPieceMoveList: function(message){
            console.log(message.highlightCurrentPieceIgnoreList)
            htmlBoardControl.updateHighlightedMoves(htmlCurrentPieceBoardSquares, locateHtmlCurrentPieceBoardSquares, message.highlightCurrentPieceMoveList, message.highlightCurrentPieceIgnoreList)
        },
        highlightPathMoveList: function(message){
            htmlBoardControl.updateHighlightedMoves(htmlPathBoardSquares, locateHtmlPathBoardSquares, message.highlightPathMoveList)
        },
        highlightFENMoveList: function(message){
            htmlBoardControl.updateHighlightedMoves(htmlFENBoardSquares, locateHtmlFENBoardSquares, message.highlightFENMoveList, message.highlightFENIgnoreList)
        },
        getAttributeMods: function(message){
            var attributeMods = message.getAttributeMods
            $(".attributeMods").prop("checked", false)
            for(var i = 0; i < attributeMods.length; i++){
                $("#"+attributeMods[i]).prop("checked", true)
            }
        },
        getMoveMods: function(message){
            var moveMods = message.getMoveMods
            $(".moveMods").prop("checked", false)
            for(var i = 0; i < moveMods.length; i++){
                $("#"+moveMods[i]).prop("checked", true)
            }
        },
        getAttackType: function(message){
            var attackType = message.getAttackType
            console.log(attackType == 'NORMAL')
            switch(attackType){
                case 'NORMAL': 
                    $("#attackTypesOptions").val('Normal')
                break;
                case 'FRIENDLY FIRE':
                    $("#attackTypesOptions").val('Friendly Fire')
                break;
                case 'PACIFIST':
                    $("#attackTypesOptions").val('Pacifist')
                break;
                case 'TRAITOR':
                    $("#attackTypesOptions").val('Traitor')
            }
        },
        gameSubmitSuccess: function(message){
            window.location.assign(message.gameSubmitSuccess)
        },
        gameSubmitFail: function(message){
            $("#gameSubmitFailText").text(message.gameSubmitFail)
        }
    }

    socket.addEventListener('message', function (message) {               
        var data = message.data
            if(data.charAt(0)=='{'){ 
                data = JSON.parse(message.data)
                var keys = Object.keys(data)
                for(var i = 0; i < keys.length; i++){
                    if(messageResponse[keys[i]]){
                        messageResponse[keys[i]](data)
                    }
                }
            }
    });
    $("#gameSubmit").click(function(){
        socket.send(JSON.stringify({
            gameSubmit: {
                name: $("#nameTextBox").val(),
                description: $("#descriptionTextBox").val(),
                winCondition: $("#winConditionsOptions").val(),
            }
        }))
    })
    $("#FENSubmit").click(function(){
        htmlFENBoard.position($("#FEN").val())
        socket.send(JSON.stringify({
            FEN: htmlFENBoard.position('FEN')
        }))
    })
    $("#submitPath").click(function(){
        var message = {
            submitPath: "submitPath"
        }
        socket.send(JSON.stringify(message))
    })
    $("#submitEraseUnsubmittedPath").click(function(){
        var message = {
            eraseUnsubmittedPath: "removePath"
        }
        socket.send(JSON.stringify(message))
    })
    $('input[class*="Mods"]').change(function(){
        var id = $(this).attr('id')
        var name = $(this).attr('class')
        if(currentPiece!=""){
            if(name =="moveMods"){
                if($(this).prop('checked')){
                    socket.send(JSON.stringify({
                        moveModAdd: id.toUpperCase()
                    }))
                }
                else{
                    socket.send(JSON.stringify({
                        moveModRemove: id.toUpperCase()
                    }))
                }
            }
            else if(name == "attributeMods"){
                if($(this).prop('checked')){
                    socket.send(JSON.stringify({
                        attributeModAdd: id.toUpperCase()
                    }))
                }
                else{
                    socket.send(JSON.stringify({
                        attributeModRemove: id.toUpperCase()
                    }))
                }
            }
        }
    })
    
    $('#attackTypesOptions').change(function(){
        var message = $(this).val().toUpperCase()
        if(currentPiece!=""){
            socket.send(JSON.stringify({
                attackTypeChange: message
            }))
        }
    })
    $('#lethalMovePath').attr('title', 'Allows movement on occupied squares that the piece can attack');
    $('#nonLethalMovePath').attr('title', 'Allows movement on unoccupied squares')
    $('#mirrorPieceSelect').change(function(){
        if($(this).prop('checked')){
            socket.send(JSON.stringify({
                mirrorPieceSelect: "selected"
            }))
        }
        else{
            socket.send(JSON.stringify({
                mirrorPieceSelect: "unselected"
            }))
        }
    })
    $('#lethalMovePathSelect').change(function(){
        if($(this).prop('checked')){
            socket.send(JSON.stringify({
                lethalMovePathSelect: "selected"
            }))
        }
        else{
            socket.send(JSON.stringify({
                lethalMovePathSelect: "unselected"
            }))
        }
    })
    $('#nonLethalMovePathSelect').change(function(){
        if($(this).prop('checked')){
            socket.send(JSON.stringify({
                nonLethalMovePathSelect: "selected"
            }))
        }
        else{
            socket.send(JSON.stringify({
                nonLethalMovePathSelect: "unselected"
            }))
        }
    })
    $('#addIndividualSquareSubmit').click(function(){
        var row = $('#addIndividualSquareRowAmount').val()
        var column = $('#addIndividualSquareColumnAmount').val()
        socket.send(JSON.stringify({
            addIndividualSquare: {
                row: row,
                column: column
            }
        }))
    })
    $('#absoluteTeleportSubmit').click(function(){
        var teleport = $('#absoluteTeleportAmount').val()
        console.log(typeof(teleport))
        socket.send(JSON.stringify({
            absoluteTeleport: teleport
        }))
    })
    $('#relativeDenyMovementSubmit').click(function(){
        var row = $('#relativeDenyMovementRowAmount').val()
        var column = $('#relativeDenyMovementColumnAmount').val()
        socket.send(JSON.stringify({
            relativeDenyMovement: {
                row: row,
                column: column
            }
        }))
    })
    $('#absoluteDenyMovementSubmit').click(function(){
        socket.send(JSON.stringify({
                absoluteDenyMovement: $('#absoluteDenyMovementAmount').val()
        }))
    })
    $('#mirrorPathSelect').change(function(){
        socket.send(JSON.stringify({
            mirrorPathSelect: $('#mirrorPathSelect').prop('checked')
        }))
        console.log($('#mirrorPathSelect').prop('checked'))
    })
    $('#removeCurrentPiecePathsButton').click(function(){
        socket.send(JSON.stringify({
            removeCurrentPieceMovement: "removeCurrentPieceMovement"
        }))
    })
    function currentPieceOnDrop(source, target, piece, newPos, oldPos, orientation){
        if(target != 'offboard'){
            currentPiecePosition = Object.keys(newPos)[0]
            var currentPiecePosition = {
                currentPiecePosition: {
                    from: Object.keys(oldPos)[0],
                    to: Object.keys(newPos)[0]
                }
            }
            socket.send(JSON.stringify(currentPiecePosition))
        }
    }
    function pathBoardOnDrop(source, target, piece, newPos, oldPos, orientation){
        if(target != 'offboard'){
            pathPiecePosition = Object.keys(newPos)[0]
            var pathPiecePosition = {
                pathPiecePosition: {
                    from: Object.keys(oldPos)[0],
                    to: Object.keys(newPos)[0]
                }
            }
            socket.send(JSON.stringify(pathPiecePosition))
        }
    }

    function htmlFENBoardOnDrop(source, target, piece, newPos, oldPos, orientation){
        currentPiecePosition = Object.keys(newPos)[0]
        $("#FEN").val(ChessBoard.objToFen(newPos))
        var FENSend = {
            FEN: ChessBoard.objToFen(newPos)
        }
        socket.send(JSON.stringify(FENSend))
    }

    function htmlFENBoardOnMouseoverSquare(square, piece){
        if(piece!=false){
            var highlightFENMoveList = {
                highlightFENMoveList: {
                    square: square,
                    piece: piece
                }
            }
            socket.send(JSON.stringify(highlightFENMoveList))
        }
    }

    function FENBoardOnMouseoutSquare(){
        htmlBoardControl.unHighlightValidMoves(htmlFENBoardSquares)
    }

    function htmlFENBoardOnDragStart(source, draggedPiece, position, orientation){
        htmlCurrentPieceBoard.position({
            d4: draggedPiece
        })
        htmlPathBoard.position({
            d4: draggedPiece
        })
        currentPiecePosition = 'd4'
        pathPiecePosition = 'd4'
        currentPiece = draggedPiece
        $("#pieceName").text(currentPiece)
        var currentPieceSend = {
            currentPiece: draggedPiece,
        }
        socket.send(JSON.stringify(currentPieceSend))
        socket.send(JSON.stringify({
            getMoveMods: ""
        }))
        socket.send(JSON.stringify({
            getAttributeMods: ""
        }))
    }
    var pieceTheme = "../images/chesspieces/wikipedia/{piece}.png"
    
    var FENConfig = {
        pieceTheme: pieceTheme,
        sparePieces: true,
        dropOffBoard: 'trash',
        onDrop: htmlFENBoardOnDrop,
        onDragStart: htmlFENBoardOnDragStart,
        onMouseoverSquare: htmlFENBoardOnMouseoverSquare,
        onMouseoutSquare: FENBoardOnMouseoutSquare
    }

    var currentPieceConfig = {
        pieceTheme: pieceTheme, 
        sparePieces: false,
        draggable: true,
        onDrop: currentPieceOnDrop,
        position: {
            d4: "wP"
        }
    }

    var htmlFENBoard = Chessboard('FENBoard', FENConfig)
    var htmlCurrentPieceBoard = Chessboard('currentPieceBoard', currentPieceConfig)
    var htmlPathBoard = Chessboard('pathBoard', {pieceTheme: pieceTheme, onDrop: pathBoardOnDrop, draggable: true, position: {d4: "wP"}})
    $(document).trigger('load')
})