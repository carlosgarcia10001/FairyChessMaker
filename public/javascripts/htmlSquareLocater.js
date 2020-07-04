var squares = []
var highlightMove = '#a9a9a9'
var locateSquares = {}
var pieces = createPieces()
$(document).ready(function(){
    $(document).on('load',function(){
        squares = $('[data-square]')
        for(var i = 0; i < squares.length;i++){
            locateSquares[$(squares[i]).data()['square']] = squares[i]
        }
    })
    $(document).trigger('load')
})