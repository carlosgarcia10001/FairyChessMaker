var move = require('./Move')
var attributeMods = require('./AttributeMods')
var pieceAttack = require('./PieceAttack')
var winConditions = require('./winConditions')
const NP = "NOTPUBLIC"
var moveKeys = Object.keys(move.mods)
var attributeKeys = Object.keys(attributeMods.mods)
var attackKeys = Object.keys(pieceAttack.attackTypes)
var winKeys = Object.keys(winConditions.winCondition)

var publicMoveModNames = []
var publicAttributeModNames = []
var publicAttackTypeNames = []
var publicWinConditionNames = []
var publicMoveModDescriptions = []
var publicAttributeModDescriptions = []
var publicAttackTypeDescriptions = []
var publicWinConditionDescriptions = []

createPublic(publicMoveModNames, move.mods, moveKeys, 'name')
createPublic(publicAttributeModNames, attributeMods.mods, attributeKeys, 'name')
createPublic(publicAttackTypeNames, pieceAttack.attackTypes, attackKeys, 'name')
createPublic(publicWinConditionNames, winConditions.winCondition, winKeys, 'name')
createPublic(publicMoveModDescriptions, move.mods, moveKeys, 'description')
createPublic(publicAttributeModDescriptions, attributeMods.mods, attributeKeys, 'description')
createPublic(publicAttackTypeDescriptions, pieceAttack.attackTypes, attackKeys, 'description')
createPublic(publicWinConditionDescriptions, winConditions.winCondition, winKeys, 'description')

function createPublic(arr, mods, keys, item){
    for(var i = 0; i < keys.length;i++){
        var mod = mods[keys[i]][item]
        if(mod!=NP){
            arr.push(mod)
        }
    }
}

exports.publicAttributeModNames = publicAttributeModNames
exports.publicMoveModNames= publicMoveModNames
exports.publicAttackTypeNames = publicAttackTypeNames
exports.publicWinConditionNames = publicWinConditionNames
exports.publicMoveModDescriptions = publicMoveModDescriptions
exports.publicAttributeModDescriptions = publicAttributeModDescriptions
exports.publicAttackTypeDescriptions = publicAttackTypeDescriptions
exports.publicWinConditionDescriptions = publicWinConditionDescriptions