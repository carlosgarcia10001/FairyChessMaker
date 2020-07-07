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

function highlightValidMoves(parsedBoard, parsedIndex, locateHtmlSquares){
    var moveset = currentPieceMoveCoordinates(parsedBoard, parsedIndex)
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
function updateHighlightedMoves(parsedBoard, parsedIndex, htmlSquares, locateHtmlSquares){
    unHighlightValidMoves(htmlSquares)
    highlightValidMoves(parsedBoard, parsedIndex, locateHtmlSquares)
}

function currentPieceMoveCoordinates(parsedBoard, parsedIndex){
    var coordinates = []
    var moveList = move.pieceMoveList(parsedBoard, parsedIndex)
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
