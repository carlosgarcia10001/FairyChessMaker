function createPiece(id= " ", color = "", hp = 1, dmg = 1, mov = [], movdur = [], atttype = 'normal', attrmods = [], movmods = [], dmgmov = mov, dmgmovdur = movdur){
    var piece = {
        id: id,
        color: color,
        hp: hp,
        dmg: dmg,
        atttype: atttype,
        mov: mov,
        movdur: movdur,
        attrmods: attrmods,
        movmods: movmods,
        dmgmov: dmgmov,
        dmgmovdur: dmgmovdur
    }
    return piece
}

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

exports.createPiece = createPiece
exports.createPieces = createPieces