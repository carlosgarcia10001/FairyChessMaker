function cleanPieces(pieces){
    var keys = Object.keys(pieces)
    for(var i = 0; i < keys.length;i++){
        cleanPiece(pieces[keys[i]])
    }
}

function cleanPiece(piece){
    piece.hp = Number(piece.hp)
    piece.dmg = Number(piece.dmg)
    var mov = []
    var movdur = []
    var dmgmov = []
    var dmgmovdur = []
    for(var i = 0; i < piece.mov.length;i++){
        mov.push(Number(piece.mov[i]))
        movdur.push(Number(piece.movdur[i]))
        if(piece.mov==piece.dmgmov){
            dmgmov.push(Number(piece.dmgmov[i]))
            dmgmovdur.push(Number(piece.dmgmovdur[i]))
        }
    }
    if(piece.mov!=piece.dmgmov){
        for(var i = 0; i < piece.dmgmov.length;i++){
            dmgmov.push(Number(piece.dmgmov[i]))
            dmgmovdur.push(Number(piece.dmgmovdur[i]))
        }
    }
    piece.mov = mov
    piece.movdur = movdur
    piece.dmgmov = dmgmov
    piece.dmgmovdur = dmgmovdur
}

exports.cleanPieces = cleanPieces
exports.cleanPiece = cleanPiece