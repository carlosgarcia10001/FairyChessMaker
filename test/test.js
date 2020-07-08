var piece = require('../public/javascripts/Piece')
var game = require('../public/javascripts/Game')
var assert = require('chai').assert
var move = require('../public/javascripts/Move')
var board = game.board
var boardState = require('../public/javascripts/BoardState')
var IndexAndCoordinates = require('../public/javascripts/IndexAndCoordinates')
function equalArray(arr1,arr2){
    if(arr1.length!=arr2.length){
        return false
    }
    for(var i = 0; i < arr1.length; i++){
        var arr1Sorted = arr1.concat().sort()
        var arr2Sorted = arr2.concat().sort()
        if(arr1Sorted[i]!=arr2Sorted[i]){
            return false
        }
    }
    return true
}

const DEFAULTPIECE1INDEX = 34
const DEFAULTPIECE2INDEX = 36
const DEFAULTPIECE3INDEX = 32
function setupTestBoard(){
    game.initializeBoard(board)
    var testBoard = board.slice()
    var piece1 = piece.createPiece('p','w',1,1,
        {
            paths: [[1,8],[-1,-8],[16,112],[-16,-112]],
            space: [[1],[1],[16],[16]],
            attPaths: [[1,8],[-1,-8],[16,112],[-16,-112]],
            attSpace: [[1],[1],[16],[16]]
        }
    )
    var piece2 = piece.createPiece('B','b',1,1,{
        paths: [[1,8]],
        space: [[1]],
        attPaths: [[1,8]],
        attSpace: [[1]]
    })
    var piece3 = piece.createPiece('A','b',1,1)
    var piece4 = piece.createPiece('d', 'w',1,1)
    var piece5 = piece.createPiece('C', 'b', 1, 1)
    game.placePieceOnBoard(testBoard,piece1,34)
    game.placePieceOnBoard(testBoard,piece2,36)
    game.placePieceOnBoard(testBoard,piece3,32)
    game.placePieceOnBoard(testBoard,piece4,2)
    game.placePieceOnBoard(testBoard,piece5,66)
    return testBoard
}

describe('Piece', function () {
  describe('Pacifist', function () {
    it('Should return true when a friendly or enemy unit is an attack square, but it cannot attack', function () {
        let testBoard = setupTestBoard()
        testBoard[DEFAULTPIECE1INDEX].atttype = 'pacifist'
        boardState.printBoard(testBoard)
        console.log(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX))
        assert.isTrue(equalArray(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX),[35, 33, 50, 18]))
    });
  });
  describe('Normal', function() {
    it('Should return true when it can move like a normal piece (empty spaces and enemies)', function(){
        let testBoard = setupTestBoard()
        boardState.printBoard(testBoard)
        console.log(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX))
        assert.isTrue(equalArray(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX), [35, 33, 50, 18, 36, 32, 66]))
    });
  });
  describe('FriendlyFire', function(){
      it('Should return true when it can target friend or foe', function(){
        let testBoard = setupTestBoard()
        testBoard[DEFAULTPIECE1INDEX].atttype = 'friendlyfire'
        boardState.printBoard(testBoard)
        console.log(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX))
        assert.isTrue(equalArray(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX), [35, 33, 50, 18, 36, 32, 66,  2]))
      })
  })
  describe('Traitor', function(){
      it('Should return true when only enemies and empty squares can be moved to, function()', function(){
        let testBoard = setupTestBoard()
        testBoard[DEFAULTPIECE1INDEX].atttype = 'traitor'
        boardState.printBoard(testBoard)
        console.log(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX))
        assert.isTrue(equalArray(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX), [35, 33, 50, 18, 2]))
      })
  })
});

describe('BoardState', function(){
    describe('ValidSquare', function(){
        it('Should return true when the square is a valid index', function(){
            assert.isTrue(boardState.validSquare(7))
            assert.isTrue(boardState.validSquare(16))
        })
        it('Should return false when the square is a invalid index', function(){
            assert.isFalse(boardState.validSquare(8))
            assert.isFalse(boardState.validSquare(125))
        })
    })

    describe('EmptySquare', function(){
        it('Should return true when there is a square on the board at the specified index', function(){
            let testBoard = setupTestBoard()
            assert.isTrue(boardState.emptySquare(testBoard,DEFAULTPIECE1INDEX+1))
            assert.isTrue(boardState.emptySquare(testBoard,DEFAULTPIECE1INDEX-1))
        })
        it('Should return false when there is not a square on the board at the specified index',function(){
            let testBoard = setupTestBoard()
            assert.isFalse(boardState.emptySquare(testBoard,DEFAULTPIECE1INDEX))
            assert.isFalse(boardState.emptySquare(testBoard,DEFAULTPIECE2INDEX))
        })
    })
})

describe('Mods', function(){
    describe('Ethereal Normal', function(){
        it("Should return true when the piece can move through allies", function(){
            let testBoard = setupTestBoard()
            testBoard[DEFAULTPIECE1INDEX].movmods.push('ethereal')
            console.log(testBoard[DEFAULTPIECE1INDEX].movmods)
            testBoard[DEFAULTPIECE2INDEX].color='w'
            testBoard[DEFAULTPIECE2INDEX].id = 'b'
            boardState.printBoard(testBoard)
            console.log(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX))
            assert.isTrue(equalArray(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX), [35, 33, 32, 18, 50, 66, 37, 38, 39]))
        })
    })
    describe('Ethereal Traitor', function(){
        it('Should return true when the piece can move through allies and kill them', function(){
            let testBoard = setupTestBoard()
            testBoard[DEFAULTPIECE1INDEX].movmods.push('ethereal')
            testBoard[DEFAULTPIECE1INDEX].atttype = 'traitor'
            console.log(testBoard[DEFAULTPIECE1INDEX].movmods)
            testBoard[DEFAULTPIECE2INDEX].color='w'
            testBoard[38] = piece.createPiece('z','w')
            boardState.printBoard(testBoard)
            console.log(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX))
            assert.isTrue(equalArray(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX), [35, 36, 33, 18, 2, 50, 37, 38, 39]))
        })
    })
    describe('Beacon',function(){
        it('Should return true if ally pieces can move near it', function(){
            let testBoard = setupTestBoard()
            game.placePieceOnBoard(testBoard,piece.createPiece('l','w',1,1,piece.createMov(),'pacifist',['beacon']),102)
            game.placePieceOnBoard(testBoard,piece.createPiece('E','b'),117)
            game.placePieceOnBoard(testBoard,piece.createPiece('m','w'),118)
            boardState.printBoard(testBoard)
            console.log(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX))
            assert.isTrue(equalArray(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX), [35, 33, 50, 18, 36, 32, 66, 85, 86, 87, 101, 103, 119, 117]))
        })
    })
    describe('Teleport',function(){
        it("Should return true if piece1 can teleport", function(){
            let testBoard = setupTestBoard()
            testBoard[DEFAULTPIECE1INDEX].movmods.push('teleport102')
            boardState.printBoard(testBoard)
            console.log(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX))
            assert.isTrue(equalArray(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX), [35, 33, 50,  18, 36, 32, 66, 102]))
        })
    })
    describe('Teleport Kill',function(){
        it('Should return true if piece1 and kill with teleport', function(){
            let testBoard = setupTestBoard()
            testBoard[DEFAULTPIECE1INDEX].movmods.push('teleport102')
            game.placePieceOnBoard(testBoard,piece.createPiece('L','b'),102)
            boardState.printBoard(testBoard)
            console.log(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX))
            assert.isTrue(equalArray(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX), [35, 36, 33, 32, 18, 50, 66, 102]))    
        })
    })

    describe('Teleport Friendly', function(){
        it("Should return true if piece1 cannot teleport", function(){
            let testBoard = setupTestBoard()
            testBoard[DEFAULTPIECE1INDEX].movmods.push('teleport102')
            game.placePieceOnBoard(testBoard,piece.createPiece('l','w'),102)
            boardState.printBoard(testBoard)
            console.log(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX))
            assert.isTrue(equalArray(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX), [35, 36, 33, 32, 18, 50, 66]))
        })
    })
    describe('Remove Relative', function(){
        it("Should not allow piece1 to move to square 35", function(){
            let testBoard = setupTestBoard()
            testBoard[DEFAULTPIECE1INDEX].movmods.push('removeRelative1')
            game.placePieceOnBoard(testBoard,piece.createPiece('l','w'),102)
            boardState.printBoard(testBoard)
            console.log(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX))
            assert.isTrue(equalArray(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX), [36, 33, 32, 18, 50, 66]))
        })
    })
    describe('Remove Absolute', function(){
        it("Should now allow piece1 to move to square 35", function(){
            let testBoard = setupTestBoard()
            testBoard[DEFAULTPIECE1INDEX].movmods.push('removeAbsolute35')
            game.placePieceOnBoard(testBoard,piece.createPiece('l','w'),102)
            boardState.printBoard(testBoard)
            console.log(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX))
            assert.isTrue(equalArray(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX), [36, 33, 32, 18, 50, 66]))
        })
    })
    describe('Kingly', function(){
        it("Should not allow p to move in any way that would put a in check", function(){
            let testBoard = setupTestBoard()
            testBoard[DEFAULTPIECE2INDEX].dmgmov = [-1]
            testBoard[DEFAULTPIECE2INDEX].dmgdur = [8]
            game.placePieceOnBoard(testBoard,piece.createPiece('a','w',1,1,piece.createMov([[1,1]],[[1]],[[1,1]],[[1]]),'normal',['kingly']),DEFAULTPIECE1INDEX)
            boardState.printBoard(testBoard)
            console.log(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX))
            assert.isTrue(equalArray(move.pieceMoveList(testBoard,DEFAULTPIECE1INDEX), []))
        })
    })
    describe('Check', function(){
        it('Should have p in Bs moveList, and have check return true', function(){
        let testBoard = setupTestBoard()
        game.placePieceOnBoard(testBoard, piece.createPiece('p','w',1,1,piece.createMov(),'pacifist',['kingly']),DEFAULTPIECE1INDEX)
        testBoard[DEFAULTPIECE2INDEX].mov.paths=[[-1,-8]]
        testBoard[DEFAULTPIECE2INDEX].mov.space=[[1]]
        testBoard[DEFAULTPIECE2INDEX].mov.attPaths =[[-1,-8]]
        testBoard[DEFAULTPIECE2INDEX].mov.attSpace = [[1]]
        boardState.printBoard(testBoard)
        console.log(move.pieceMoveList(testBoard,DEFAULTPIECE2INDEX))
        assert.isTrue(move.check(testBoard,testBoard[DEFAULTPIECE1INDEX].color))
        })
    })
})

describe('GAME', function(){
    describe('CreateFEN', function () {
        it('Should give the correct FEN', function(){
            let testBoard = setupTestBoard()
            boardState.printBoard(testBoard)
            var FEN = game.createFEN(testBoard)
            console.log(FEN)
            assert.isTrue(FEN=='2d5/8/A1p1B3/8/2C5/8/8')
            })
        })
    describe('ParseFEN', function() {
        it('Should setup a board based on a given FEN', function(){
            let testBoard = new Array(128)
            var pieces = piece.createPieces()
            let answerBoard = new Array(128)
            game.initializeBoard(answerBoard)
            answerBoard[2] = pieces['bQ']
            answerBoard[19] = pieces['bK']
            answerBoard[21] = pieces['bK']
            answerBoard[113] = pieces['wP']
            answerBoard[115] = pieces['wB']
            answerBoard[116] = pieces['wR']
            answerBoard[117] = pieces['bK']
            answerBoard[118] = pieces['bN']
            answerBoard[119] = pieces['bQ']
            var FEN = '2Q5/3K1K2/8/8/8/8/8/1p1brKNQ'
            game.parseFEN(testBoard, FEN, pieces)
            boardState.printBoard(testBoard)
            console.log(FEN)
        })
    })
   describe('makeMove', function (){
        it('Should allow a piece to move if it is legal, and not allow illegal moves', function(){
            let testBoard = setupTestBoard()
            var moveMade = move.makeMove(testBoard, 'w', 'c6', 35)
            boardState.printBoard(testBoard)
            console.log(moveMade)
            assert.isTrue(moveMade == 'c6-d6',"Valid move not allowed")
            moveMade = move.makeMove(testBoard, 'w', 'd6', 'h1')
            assert.isFalse(moveMade, 'Illegal move not blocked')
        })
    })
})

