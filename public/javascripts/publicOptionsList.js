var move = require('./Move')
var attributeMods = require('./AttributeMods')
var pieceAttack = require('./PieceAttack')
var winConditions = require('./winConditions')
const NP = "NOTPUBLIC"
var moveKeys = Object.keys(move.mods)
var attributeKeys = Object.keys(attributeMods.mods)
var attackKeys = Object.keys(pieceAttack.attackTypes)
var winKeys = Object.keys(winConditions.winCondition)

var publicMoveMods = []
var publicAttributeMods = []
var publicAttackTypes = []
var publicWinConditions = []

createPublic(publicMoveMods, move.mods, moveKeys)
createPublic(publicAttributeMods, attributeMods.mods, attributeKeys)
createPublic(publicAttackTypes, pieceAttack.attackTypes, attackKeys)
createPublic(publicWinConditions, winConditions.winCondition, winKeys)

function createPublic(arr, mods, keys){
    for(var i = 0; i < keys.length;i++){
        var mod = mods[keys[i]].name
        if(mod!=NP){
            arr.push(mod)
        }
    }
}

exports.publicAttributeMods = publicAttributeMods
exports.publicMoveMods = publicMoveMods
exports.publicAttackTypes = publicAttackTypes
exports.publicWinConditions = publicWinConditions