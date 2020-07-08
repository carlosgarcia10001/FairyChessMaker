function createPiece(id= " ", color = "", hp = 1, dmg = 1, mov = createMov(), atttype = 'normal', attrmods = [], movmods = []){
    var piece = {
        id: id,
        color: color,
        hp: hp,
        dmg: dmg,
        atttype: atttype,
        mov: mov,
        attrmods: attrmods,
        movmods: movmods,
    }
    return piece
}
/*
mov: [
    {
        relativepaths: [[1,8,119]]
        relativespace: [[0,16]]
        relativeattpaths: [[1,8,119]]
        relativeattspace: [[0,16]]
    }
]
}
*/
function createPieces(){
    var pieces = {}
        pieces['wK']=createPiece('k','w')
        pieces['wQ']=createPiece('q','w')
        pieces['wR']=createPiece('r','w')
        pieces['wB']=createPiece('b','w')
        pieces['wN']=createPiece('n','w')
        pieces['wP']=createPiece('p','w')
        pieces['bK']=createPiece('K','b')
        pieces['bQ']=createPiece('Q','b')
        pieces['bR']=createPiece('R','b')
        pieces['bB']=createPiece('B','b')
        pieces['bN']=createPiece('N','b')
        pieces['bP']=createPiece('P','b')
    return pieces
}

function createMov(paths = [], space = [], attPaths = [], attSpace = []){
    return {
        paths: paths,
        space: space,
        attPaths: attPaths,
        attSpace: attSpace
    }
}


exports.createPiece = createPiece
exports.createPieces = createPieces
exports.createMov = createMov