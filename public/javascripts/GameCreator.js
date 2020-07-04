$(document).ready(function(){
    var currentPiece = ""
    var currentPiecePosition = -1
    var mouseDown = false
    var individualSquares = false
    var highlightMove = '#a9a9a9'
    var addingSquares = true //Used to make sure you only add squares or delete them during a single drag
    var mirror = false
    var board = new Array(128)
    board = initializeBoard(board)
    $(document).on('load',function(){
        squares = $('[data-square]')
        $('input[name="mirror"]').change(function(){
            mirror=!mirror
        })
        $('input[name="attackType"]').change(function(){
            var value = $(this).val()
            if(currentPiece!=""){
                pieces[currentPiece].atttype = value
            }
        })
        $('input[name*="mods"]').change(function(){
            var value = $(this).val()
            if(currentPiece!=""){
                var list
                if($(this).attr('name')=='movemods'){
                    list = pieces[currentPiece].movmods
                }
                else {
                    list = pieces[currentPiece].attrmods
                }
                if($(this).prop('checked')){
                    if(list.indexOf(value)==-1){
                        list.push(value)
                    }
                }
                else{
                    if(list.indexOf(value)!=-1){
                        list.splice(list.indexOf(value),1)
                    }
                }
            }
        })
        $('input[name="squareSelection"]').click(function(){
            var value = $(this).val()
            if(currentPiece!="" && $(this).prop('checked')){
                if(value == 'sectioned'){
                    individualSquares = false
                }
                else{
                    individualSquares = true
                }
            }
        })
        for(var i = 0; i < squares.length;i++){
            locateSquares[$(squares[i]).data()['square']] = squares[i]
            $(squares[i]).mousedown(function(){
                var leftClick = event.button==0
                var coordinate = $(this).data()['square']
                var index = coordinatesToIndex[coordinate]
                var move = index-coordinatesToIndex[currentPiecePosition]
                if(leftClick && individualSquares){
                    if(currentPiece!=""){
                        var alreadyInMove = pieces[currentPiece].mov.indexOf(move)!=-1
                        if(move!=0){
                            if(alreadyInMove){
                                pieces[currentPiece].mov.splice(pieces[currentPiece].mov.indexOf(move),1)
                                pieces[currentPiece].movdur.splice(pieces[currentPiece].mov.indexOf(move),1)
                                if(mirror){
                                    pieces[currentPiece].mov.splice(pieces[currentPiece].mov.indexOf(-move),1)
                                    pieces[currentPiece].movdur.splice(pieces[currentPiece].mov.indexOf(-move),1)
                                }
                                updateHighlightedPieces()
                                addingSquares = false
                            }
                            else{
                                pieces[currentPiece].mov.push(move)
                                pieces[currentPiece].movdur.push(1)
                                if(mirror){
                                    pieces[currentPiece].mov.push(-move)
                                    pieces[currentPiece].movdur.push(1)
                                }
                                updateHighlightedPieces()
                                addingSquares = true
                            }
                        }
                    }
                }
            })
            $(squares[i]).click(function(){
                var leftClick = event.button==0
                var coordinate = $(this).data()['square']
                var index = coordinatesToIndex[coordinate]
                var move = index-coordinatesToIndex[currentPiecePosition]
                if(leftClick && !individualSquares){
                    if(currentPiece!=""){
                        var addMoves = true
                        if(pieces[currentPiece].mov.indexOf(move)!=-1){
                            addMoves = false
                        }
                        if(move<8 && move >0){
                            sectionedMovement(pieces[currentPiece], 1, addMoves,mirror)
                        }
                        else if(move<0 && move>-8){
                            sectionedMovement(pieces[currentPiece], -1, addMoves,mirror)
                        }
                        else if(move%16==0){
                            if(move<0){
                                sectionedMovement(pieces[currentPiece], -16, addMoves,mirror)
                            }
                            else{
                                sectionedMovement(pieces[currentPiece], 16, addMoves,mirror)
                            }
                        }
                        else if(move%15==0){
                            if(move<0){
                                sectionedMovement(pieces[currentPiece], -15, addMoves,mirror)
                            }
                            else{
                                sectionedMovement(pieces[currentPiece], 15, addMoves,mirror)
                            }
                        }
                        else if(move%17==0){
                            if(move<0){
                                sectionedMovement(pieces[currentPiece], -17, addMoves,mirror)
                            }
                            else{
                                sectionedMovement(pieces[currentPiece], 17, addMoves,mirror)
                            }
                        }
                    }
                }
            })
            $(squares[i]).mousedown(function(){
                if(event.button == 0 && !($(this).data()['square']==currentPiecePosition)){
                    mouseDown=true
                }
            })
        }
    })
    $("body").mouseup(function(){
        mouseDown=false
        addingSquares = false
    })
    window.onfocus = function() {
        mouseDown = false
    }
    $("input[value='Submit']").click(function(){
        console.log(pieces)
        $.post('/',pieces)
    })
    var config = {
        sparePieces: true,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoverSquare: onMouseoverSquare,
        pieceTheme: "../images/chesspieces/wikipedia/{piece}.png"
    }
    function loadCheckboxes(){
        var mods = $('input[name*="mods"]')
        var attackType = $('input[name=attackType]')
        for(var i = 0; i < mods.length; i++){
            if(pieces[currentPiece].movmods.indexOf($(mods[i]).val())!=-1 || pieces[currentPiece].attrmods.indexOf($(mods[i]).val())!=-1){
                $(mods[i]).prop('checked',true)
            }
            else{
                $(mods[i]).prop('checked',false)
            }
        }
        for(var i = 0; i < attackType.length;i++){
            if(pieces[currentPiece].atttype == $(attackType[i]).val()){
                $(attackType[i]).prop('checked',true)
            }
        }
    }
    function sectionedMovement(piece, value, addMoves = true, mirrored = false){
        var index = value
        for(var i = 0; i < 7; i++){
            var indexNotInList = piece.mov.indexOf(index)==-1
            var mirrorIndexNotInList = piece.mov.indexOf(-index)==-1
            if(addMoves){
                if(indexNotInList){
                    piece.mov.push(index)
                    piece.movdur.push(1)
                }
                if(mirror && mirrorIndexNotInList){
                    piece.mov.push(-index)
                    piece.movdur.push(1)
                }
            }
            else{
                if(!indexNotInList){
                    piece.mov.splice(piece.mov.indexOf(index),1)
                    piece.movdur.splice(piece.mov.indexOf(index),1)
                }
                if(mirror && !mirrorIndexNotInList){
                    piece.mov.splice(piece.mov.indexOf(-index),1)
                    piece.movdur.splice(piece.mov.indexOf(-index),1)
                }
            }
            index+=value
        }
        updateHighlightedPieces()
    }

    function onDragStart (source, piece, position, orientation) {
        if(piece!=currentPiece && source =='spare'){
            board.position({
                d4: piece
            })
            currentPiecePosition = 'd4'
            currentPiece = piece
            updateHighlightedPieces()
            loadCheckboxes()
            console.log(pieces[piece])
            return false
        }
        if(piece==currentPiece && source == 'spare'){
            return false
        }

    }
    
    function onDrop(source, target, piece, newPos, oldPos, orientation){
        if(target!='offboard'){
            currentPiecePosition = Object.keys(newPos)[0]
            updateHighlightedPieces()
        }
    }

    function onMouseoverSquare(square, piece){
        if(currentPiece!="" && mouseDown && individualSquares){   
            var index = coordinatesToIndex[square]
            var move = index - coordinatesToIndex[currentPiecePosition]
            var alreadyInMove = pieces[currentPiece].mov.indexOf(move)!=-1
            if(move!=0){
                if(alreadyInMove && !addingSquares){
                    pieces[currentPiece].mov.splice(pieces[currentPiece].mov.indexOf(move),1)
                    pieces[currentPiece].movdur.splice(pieces[currentPiece].mov.indexOf(move),1)
                    if(mirror){
                        pieces[currentPiece].mov.splice(pieces[currentPiece].mov.indexOf(-move),1)
                        pieces[currentPiece].movdur.splice(pieces[currentPiece].mov.indexOf(-move),1)
                    }
                    updateHighlightedPieces(currentPiece)
                }
                else if(!alreadyInMove && addingSquares){
                    pieces[currentPiece].mov.push(move)
                    pieces[currentPiece].movdur.push(1)
                    if(mirror){
                        pieces[currentPiece].mov.push(-move)
                        pieces[currentPiece].movdur.push(1)
                    }
                    updateHighlightedPieces()
                    lastHighlightedSquare = currentPiece
                }
            }
        }
    }

    function highlightPieces(){
        var moveset = currentPieceMoveCoordinates()
        for(var i = 0; i < moveset.length; i++){
            if(!($(moveset[i]).hasClass('moveset'))){
                $(locateSquares[moveset[i]]).addClass("moveset")
                $(locateSquares[moveset[i]]).css('background', highlightMove)
            }
        }
    }

    function unHighlightPieces(){
        for(var i = 0; i < squares.length; i++){
            if($(squares[i]).hasClass('moveset')){
                $(squares[i]).css('background','')
                $(squares[i]).removeClass('moveset')
            }
        }
    }
    function updateHighlightedPieces(){
        unHighlightPieces()
        highlightPieces()
    }
    function currentPieceMoveCoordinates(){
        var coordinates = []
        for(var i = 0; i < pieces[currentPiece].mov.length;i++){
            var currentPiecePositionIndex = coordinatesToIndex[currentPiecePosition]
            var move = currentPiecePositionIndex+pieces[currentPiece].mov[i]
            if((0x88 & move)==0){
                coordinates.push(indexToCoordinates[move])
            }
        }
        return coordinates
    }
    $(document).trigger('load')
    var board = Chessboard('myBoard',config)
})