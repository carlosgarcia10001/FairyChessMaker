var move = require('./Move')
var indexAndCoordinates = require('./IndexAndCoordinates')
var highlightMove = '#a9a9a9'
function createHtmlSquares(){
    var squares = $('[data-square]')
    return squares
}

function createLocateHtmlSquares(htmlSquares){
    var locateSquares = {}
    for(var i = 0; i < htmlSquares.length;i++){
        locateSquares[$(htmlSquares[i]).data()['square']] = htmlSquares[i]
    }
    return locateSquares
}

function highlightValidMoves(locateHtmlSquares, moveList){
    var moveset = moveList
    
    for(var i = 0; i < moveset.length; i++){
        if(!($(moveset[i]).hasClass('moveset'))){
            $(locateHtmlSquares[moveset[i]]).addClass("moveset")
            $(locateHtmlSquares[moveset[i]]).css('background', highlightMove)
        }
    }
}

function unHighlightValidMoves(htmlSquares){
    for(var i = 0; i < htmlSquares.length; i++){
        if($(htmlSquares[i]).hasClass('moveset')){
            $(htmlSquares[i]).css('background','')
            $(htmlSquares[i]).removeClass('moveset')
        }
    }
}

function updateHighlightedMoves(htmlSquares, locateHtmlSquares, moveList){
    unHighlightValidMoves(htmlSquares)
    highlightValidMoves(locateHtmlSquares, moveList)
}

function updateHighlightedMovesOnGameCreator(parsedHtmlBoard, parsedIndex, htmlSquares, locateHtmlSquares){
    unHighlightValidMoves(htmlSquares)
    highlightValidMovesOnGameCreator(parsedHtmlBoard, parsedIndex, locateHtmlSquares)
}

function highlightSquare(locateHtmlSquares, square){
    if(typeof(square)=='number'){
        square = indexAndCoordinates.indexToCoordinates[square]
    }
    $(locateHtmlSquares[square]).addClass('moveset')
    $(locateHtmlSquares[square]).css('background', highlightMove)
}

function highlightValidMovesOnGameCreator(parsedBoard, parsedIndex, locateHtmlSquares){
    var moveset = currentPieceMoveCoordinates(parsedBoard, parsedIndex)
    for(var i = 0; i < moveset.length; i++){
        if(!($(moveset[i]).hasClass('moveset'))){
            $(locateHtmlSquares[moveset[i]]).addClass("moveset")
            $(locateHtmlSquares[moveset[i]]).css('background', highlightMove)
        }
    }
}


function currentPieceMoveCoordinates(parsedHtmlBoard, parsedIndex){
    var coordinates = []
    var moveList = move.pieceMoveList(parsedHtmlBoard, parsedIndex)
    for(var i = 0; i < moveList.length;i++){
        if((0x88 & moveList[i])==0){
            coordinates.push(indexAndCoordinates.indexToCoordinates[moveList[i]])
        }
    }
    return coordinates
}



exports.createHtmlSquares = createHtmlSquares
exports.createLocateHtmlSquares = createLocateHtmlSquares
exports.updateHighlightedMoves = updateHighlightedMoves
exports.highlightValidMoves = highlightValidMoves
exports.unHighlightValidMoves = unHighlightValidMoves
exports.updateHighlightedMovesOnGameCreator = updateHighlightedMovesOnGameCreator
exports.highlightValidMovesOnGameCreator = highlightValidMovesOnGameCreator
exports.highlightSquare = highlightSquare