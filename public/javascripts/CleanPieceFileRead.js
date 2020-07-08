function cleanPieces(pieces){
    var keys = Object.keys(pieces)
    for(var i = 0; i < keys.length;i++){
        cleanPiece(pieces[keys[i]])
    }
}

function cleanPiece(piece){
    piece.hp = Number(piece.hp)
    piece.dmg = Number(piece.dmg)
    var mov = {
        paths: [],
        space: [],
        attPaths: [],
        attSpace: []
    }
    if(typeof(piece.attrmods) == 'undefined'){
        piece.attrmods = []
    }
    if(typeof(piece.movmods) == 'undefined'){
        piece.movmods = []
    }
    for(var i = 0; i < piece.mov.paths.length; i++){
        mov.paths.push([])
        for(var j = 0; j < piece.mov.paths[i].length; j++){
            mov.paths[i].push(Number(piece.mov.paths[i][j]))
        }
    }
    for(var i = 0; i < piece.mov.space.length; i++){
        mov.space.push([])
        for(var j = 0; j < piece.mov.space[i].length; j++){
            mov.space[i].push(Number(piece.mov.space[i][j]))
        }
    }
    for(var i = 0; i < piece.mov.attPaths.length; i++){
        mov.attPaths.push([])
        for(var j = 0; j < piece.mov.attPaths[i].length; j++){
            mov.attPaths[i].push(Number(piece.mov.attPaths[i][j]))
        }
    }
    for(var i = 0; i < piece.mov.attSpace.length; i++){
        mov.attSpace.push([])
        for(var j = 0; j < piece.mov.attSpace[i].length; j++){
            mov.attSpace[i].push(Number(piece.mov.attSpace[i][j]))
        }
    }
    piece.mov = mov
}

exports.cleanPieces = cleanPieces
exports.cleanPiece = cleanPiece