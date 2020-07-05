var indexToCoordinates = {}
var coordinatesToIndex = {}
var mirrorSquares = {}
function createIndexToCoordinatesAndCoordinatesToIndex(){
    let letter = 97
    let number = 8
    for(let i = 0; i < 120; i++){
        if(!((0x88 & i) == 0)){
            i+=8
            number -= 1
            letter = 97
        }
        let id = (String.fromCharCode(letter)+number).toLowerCase()
        indexToCoordinates[i] = id
        coordinatesToIndex[id] = i
        letter++
    }
    
}

    createIndexToCoordinatesAndCoordinatesToIndex()
if(typeof exports != 'undefined'){
    exports.indexToCoordinates=indexToCoordinates
    exports.coordinatesToIndex=coordinatesToIndex
}