"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bug, Skull, RotateCcw, Trophy, Dice6, Swords } from "lucide-react"

type Player = "marine" | "alien" | null
type GameState = "playing" | "selecting-removal" | "battle-result" | "selecting-counter-attack" | "game-over"

interface BattleResult {
  attackerRoll: number
  defenderRoll: number
  attackerWins: boolean
  attackedIndex: number
}

interface GameBoard {
  board: Player[]
  currentPlayer: Player
  gameState: GameState
  winner: Player
  canRemove: boolean
  removingPlayer: Player
  lastPlacedIndex: number | null
  marineScore: number
  alienScore: number
  battleResult: BattleResult | null
  counterAttackingPlayer: Player | null
}

const WinSign = ({ winner }: { winner: Player }) => {
  if (!winner || winner === "draw") return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="relative">
        {/* Main WIN text */}
        <div className="text-9xl font-black text-red-500 drop-shadow-2xl animate-pulse select-none">WIN</div>

        {/* Dripping paint effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {/* Multiple drip animations */}
          <div
            className="absolute top-16 left-8 w-2 bg-red-600 animate-drip-1"
            style={{
              height: "60px",
              borderRadius: "0 0 50% 50%",
              animation: "drip1 2s ease-out infinite",
            }}
          ></div>
          <div
            className="absolute top-20 left-20 w-1 bg-red-500 animate-drip-2"
            style={{
              height: "40px",
              borderRadius: "0 0 50% 50%",
              animation: "drip2 2.5s ease-out infinite",
            }}
          ></div>
          <div
            className="absolute top-18 left-32 w-1.5 bg-red-700 animate-drip-3"
            style={{
              height: "50px",
              borderRadius: "0 0 50% 50%",
              animation: "drip3 3s ease-out infinite",
            }}
          ></div>
          <div
            className="absolute top-16 right-8 w-2 bg-red-600 animate-drip-4"
            style={{
              height: "70px",
              borderRadius: "0 0 50% 50%",
              animation: "drip4 2.2s ease-out infinite",
            }}
          ></div>
          <div
            className="absolute top-20 right-20 w-1 bg-red-500 animate-drip-5"
            style={{
              height: "35px",
              borderRadius: "0 0 50% 50%",
              animation: "drip5 2.8s ease-out infinite",
            }}
          ></div>
        </div>

        {/* Winner icon */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
          {winner === "marine" ? (
            <Skull className="w-16 h-16 text-amber-400 animate-bounce" />
          ) : (
            <Bug className="w-16 h-16 text-purple-400 animate-bounce" />
          )}
        </div>

        {/* Winner text */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-2xl font-bold text-white">{winner === "marine" ? "SPACE MARINES" : "TYRANID SWARM"}</div>
          <div className="text-lg text-slate-300">VICTORIOUS!</div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes drip1 {
          0% { height: 0px; opacity: 1; }
          50% { height: 60px; opacity: 0.8; }
          100% { height: 80px; opacity: 0; }
        }
        @keyframes drip2 {
          0% { height: 0px; opacity: 1; }
          50% { height: 40px; opacity: 0.9; }
          100% { height: 60px; opacity: 0; }
        }
        @keyframes drip3 {
          0% { height: 0px; opacity: 1; }
          50% { height: 50px; opacity: 0.7; }
          100% { height: 70px; opacity: 0; }
        }
        @keyframes drip4 {
          0% { height: 0px; opacity: 1; }
          50% { height: 70px; opacity: 0.8; }
          100% { height: 90px; opacity: 0; }
        }
        @keyframes drip5 {
          0% { height: 0px; opacity: 1; }
          50% { height: 35px; opacity: 0.9; }
          100% { height: 55px; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function SpaceTacToe() {
  const [game, setGame] = useState<GameBoard>({
    board: Array(9).fill(null),
    currentPlayer: "marine",
    gameState: "playing",
    winner: null,
    canRemove: false,
    removingPlayer: null,
    lastPlacedIndex: null,
    marineScore: 0,
    alienScore: 0,
    battleResult: null,
    counterAttackingPlayer: null,
  })

  const rollDice = (): number => Math.floor(Math.random() * 10) + 1

  const checkTwoInARow = (board: Player[], player: Player): boolean => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // columns
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ]

    return lines.some((line) => {
      const playerCount = line.filter((index) => board[index] === player).length
      const emptyCount = line.filter((index) => board[index] === null).length
      return playerCount === 2 && emptyCount === 1
    })
  }

  const checkWinner = (board: Player[]): Player => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    for (const line of lines) {
      const [a, b, c] = line
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }

    return board.every((cell) => cell !== null) ? ("draw" as Player) : null
  }

  const getAdjacentEnemies = (board: Player[], index: number, currentPlayer: Player): number[] => {
    const adjacentIndices = getAdjacentIndices(index)
    return adjacentIndices.filter((i) => board[i] && board[i] !== currentPlayer)
  }

  const getAdjacentIndices = (index: number): number[] => {
    const row = Math.floor(index / 3)
    const col = index % 3
    const adjacent: number[] = []

    // Check all 8 directions (including diagonals)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue // Skip the center cell

        const newRow = row + dr
        const newCol = col + dc

        if (newRow >= 0 && newRow < 3 && newCol < 3) {
          adjacent.push(newRow * 3 + newCol)
        }
      }
    }

    return adjacent
  }

  const handleBattle = (attackerIndex: number, defenderIndex: number) => {
    const attackerRoll = rollDice()
    const defenderRoll = rollDice()
    const attackerWins = attackerRoll > defenderRoll

    const newBoard = [...game.board]

    if (attackerWins) {
      // Attacker wins - takes the space
      newBoard[defenderIndex] = game.currentPlayer
    } else {
      // Defender wins - check if there are enemy pieces to claim
      const defenderPlayer = game.currentPlayer === "marine" ? "alien" : "marine"
      const enemyPieces = newBoard
        .map((cell, index) => (cell === game.currentPlayer ? index : -1))
        .filter((index) => index !== -1)

      if (enemyPieces.length === 0) {
        // No enemy pieces to claim, get a random empty space
        const emptySpaces = newBoard.map((cell, index) => (cell === null ? index : -1)).filter((index) => index !== -1)
        if (emptySpaces.length > 0) {
          const randomEmptyIndex = emptySpaces[Math.floor(Math.random() * emptySpaces.length)]
          newBoard[randomEmptyIndex] = defenderPlayer
        }
      }
    }

    const winner = checkWinner(newBoard)

    // Only set up counter-attack if defender wins AND there are enemy pieces to claim
    let shouldAllowCounterAttack = false
    let counterAttacker = null

    if (!attackerWins) {
      const defenderPlayer = game.currentPlayer === "marine" ? "alien" : "marine"
      const enemyPieces = newBoard
        .map((cell, index) => (cell === game.currentPlayer ? index : -1))
        .filter((index) => index !== -1)

      if (enemyPieces.length > 0) {
        shouldAllowCounterAttack = true
        counterAttacker = defenderPlayer
      }
    }

    setGame((prev) => ({
      ...prev,
      board: newBoard,
      battleResult: {
        attackerRoll,
        defenderRoll,
        attackerWins,
        attackedIndex: defenderIndex,
      },
      gameState: winner ? "game-over" : shouldAllowCounterAttack ? "selecting-counter-attack" : "battle-result",
      winner,
      counterAttackingPlayer: counterAttacker,
    }))
  }

  const handleCounterAttack = (targetIndex: number) => {
    if (game.board[targetIndex] === game.currentPlayer) {
      const newBoard = [...game.board]
      newBoard[targetIndex] = game.counterAttackingPlayer

      const winner = checkWinner(newBoard)

      setGame((prev) => ({
        ...prev,
        board: newBoard,
        gameState: winner ? "game-over" : "battle-result",
        winner,
        counterAttackingPlayer: null,
      }))
    }
  }

  const continueTurn = () => {
    setGame((prev) => ({
      ...prev,
      gameState: "playing",
      battleResult: null,
      currentPlayer: prev.currentPlayer === "marine" ? "alien" : "marine",
    }))
  }

  const handleCellClick = (index: number) => {
    if (game.gameState === "selecting-removal") {
      // Remove opponent piece - must be adjacent to the last placed piece
      if (game.board[index] && game.board[index] !== game.removingPlayer) {
        const newBoard = [...game.board]
        newBoard[index] = null

        const winner = checkWinner(newBoard)
        setGame((prev) => ({
          ...prev,
          board: newBoard,
          gameState: winner ? "game-over" : "playing",
          winner,
          canRemove: false,
          removingPlayer: null,
          lastPlacedIndex: null,
          currentPlayer: prev.currentPlayer === "marine" ? "alien" : "marine",
        }))
      }
      return
    }

    if (game.gameState === "selecting-counter-attack") {
      // Counter-attack: select one of the attacker's pieces to claim
      if (game.board[index] === game.currentPlayer) {
        handleCounterAttack(index)
      }
      return
    }

    if (game.gameState !== "playing") return

    // If clicking on an enemy piece, initiate battle
    if (game.board[index] && game.board[index] !== game.currentPlayer) {
      handleBattle(index, index)
      return
    }

    // If clicking on empty space, place piece normally
    if (!game.board[index]) {
      const newBoard = [...game.board]
      newBoard[index] = game.currentPlayer

      const winner = checkWinner(newBoard)
      const hasTwoInARow = checkTwoInARow(newBoard, game.currentPlayer)
      const adjacentEnemies = getAdjacentEnemies(newBoard, index, game.currentPlayer)

      if (winner) {
        const newMarineScore = winner === "marine" ? game.marineScore + 1 : game.marineScore
        const newAlienScore = winner === "alien" ? game.alienScore + 1 : game.alienScore

        setGame((prev) => ({
          ...prev,
          board: newBoard,
          gameState: "game-over",
          winner,
          marineScore: newMarineScore,
          alienScore: newAlienScore,
        }))
      } else if (hasTwoInARow && adjacentEnemies.length > 0) {
        setGame((prev) => ({
          ...prev,
          board: newBoard,
          gameState: "selecting-removal",
          canRemove: true,
          removingPlayer: game.currentPlayer,
          lastPlacedIndex: index,
        }))
      } else {
        setGame((prev) => ({
          ...prev,
          board: newBoard,
          currentPlayer: prev.currentPlayer === "marine" ? "alien" : "marine",
        }))
      }
    }
  }

  const resetGame = () => {
    setGame((prev) => ({
      ...prev,
      board: Array(9).fill(null),
      currentPlayer: "marine",
      gameState: "playing",
      winner: null,
      canRemove: false,
      removingPlayer: null,
      lastPlacedIndex: null,
      battleResult: null,
      counterAttackingPlayer: null,
    }))
  }

  const resetScores = () => {
    setGame((prev) => ({
      ...prev,
      marineScore: 0,
      alienScore: 0,
    }))
    resetGame()
  }

  const renderCell = (index: number) => {
    const cell = game.board[index]
    const isClickable = game.gameState === "playing" && !cell
    const isBattleable = game.gameState === "playing" && cell && cell !== game.currentPlayer
    const isCounterAttackable = game.gameState === "selecting-counter-attack" && cell === game.currentPlayer

    // Check if this cell is an adjacent enemy that can be removed
    const isRemovable =
      game.gameState === "selecting-removal" &&
      cell &&
      cell !== game.removingPlayer &&
      game.lastPlacedIndex !== null &&
      getAdjacentIndices(game.lastPlacedIndex).includes(index)

    return (
      <button
        key={index}
        onClick={() => handleCellClick(index)}
        className={`
          aspect-square w-full border-2 border-amber-600 bg-slate-900 
          flex items-center justify-center text-4xl font-bold
          transition-all duration-200 hover:bg-red-950 relative
          ${isClickable ? "hover:border-amber-400 cursor-pointer hover:shadow-lg hover:shadow-amber-400/20" : ""}
          ${isBattleable ? "hover:border-red-500 cursor-pointer hover:shadow-lg hover:shadow-red-500/20" : ""}
          ${isCounterAttackable ? "hover:border-purple-400 cursor-pointer animate-pulse hover:shadow-lg hover:shadow-purple-400/20" : ""}
          ${isRemovable ? "hover:border-red-400 cursor-pointer animate-pulse hover:shadow-lg hover:shadow-red-400/20" : ""}
          ${!isClickable && !isBattleable && !isRemovable && !isCounterAttackable ? "cursor-not-allowed" : ""}
        `}
        disabled={game.gameState === "game-over" || game.gameState === "battle-result"}
      >
        {cell === "marine" && <Skull className="w-8 h-8 text-amber-400" />}
        {cell === "alien" && <Bug className="w-8 h-8 text-purple-400" />}
        {isBattleable && <Swords className="absolute top-1 right-1 w-3 h-3 text-red-400" />}
      </button>
    )
  }

  const getStatusMessage = () => {
    if (game.gameState === "battle-result" && game.battleResult) {
      const attackerName = game.currentPlayer === "marine" ? "Space Marines" : "Tyranid Swarm"
      const defenderName = game.currentPlayer === "marine" ? "Tyranid Swarm" : "Space Marines"

      if (game.battleResult.attackerWins) {
        return `${attackerName} victory! Rolled ${game.battleResult.attackerRoll} vs ${game.battleResult.defenderRoll}`
      } else {
        const defenderPlayer = game.currentPlayer === "marine" ? "alien" : "marine"
        const enemyPieces = game.board.filter((cell) => cell === game.currentPlayer).length

        if (enemyPieces === 0) {
          return `${defenderName} holds the line and claims new territory! Rolled ${game.battleResult.defenderRoll} vs ${game.battleResult.attackerRoll}`
        } else {
          return `${defenderName} holds the line! Rolled ${game.battleResult.defenderRoll} vs ${game.battleResult.attackerRoll}`
        }
      }
    }

    if (game.gameState === "selecting-counter-attack") {
      const counterAttacker = game.counterAttackingPlayer === "marine" ? "Space Marines" : "Tyranid Swarm"
      return `${counterAttacker} counter-attack! Select one of your opponent's pieces to claim.`
    }

    if (game.gameState === "selecting-removal") {
      const playerName = game.removingPlayer === "marine" ? "The Emperor's Finest" : "The Hive Mind"
      return `${playerName} strike with precision! Select an adjacent enemy to eliminate.`
    }

    if (game.winner === "draw") {
      return "Stalemate! The battle rages eternal..."
    }

    if (game.winner) {
      const winnerName = game.winner === "marine" ? "The Imperium of Man" : "The Great Devourer"
      return `${winnerName} claims victory in this engagement!`
    }

    const currentPlayerName = game.currentPlayer === "marine" ? "Space Marines" : "Tyranid Swarm"
    return `${currentPlayerName} advance - Place piece or attack enemy positions`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Add the WinSign component here */}
      <WinSign winner={game.winner} />

      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white mb-4">Space Marines vs Aliens</CardTitle>

            <div className="flex justify-center gap-8 mb-4">
              <div className="flex items-center gap-2">
                <Skull className="w-6 h-6 text-amber-400" />
                <span className="text-amber-400 font-semibold">Marines</span>
                <Badge variant="secondary" className="bg-amber-900 text-amber-100">
                  {game.marineScore}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Bug className="w-6 h-6 text-purple-400" />
                <span className="text-purple-400 font-semibold">Aliens</span>
                <Badge variant="secondary" className="bg-purple-900 text-purple-100">
                  {game.alienScore}
                </Badge>
              </div>
            </div>

            <div className="text-lg text-slate-300 mb-2">{getStatusMessage()}</div>

            {game.gameState === "selecting-removal" && (
              <div className="text-sm text-red-400 animate-pulse">
                Special ability activated! Remove an enemy piece.
              </div>
            )}

            {game.gameState === "selecting-counter-attack" && (
              <div className="text-sm text-purple-400 animate-pulse">
                Defensive victory! Claim an enemy position as your prize.
              </div>
            )}
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-6 max-w-sm mx-auto">
              {Array.from({ length: 9 }, (_, index) => renderCell(index))}
            </div>

            {game.gameState === "battle-result" && (
              <div className="mb-4 p-4 bg-slate-700 rounded-lg text-center">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Dice6 className="w-5 h-5 text-amber-400" />
                    <span className="text-white">Attacker: {game.battleResult?.attackerRoll}</span>
                  </div>
                  <span className="text-slate-400">vs</span>
                  <div className="flex items-center gap-2">
                    <Dice6 className="w-5 h-5 text-purple-400" />
                    <span className="text-white">Defender: {game.battleResult?.defenderRoll}</span>
                  </div>
                </div>
                <Button onClick={continueTurn} className="bg-blue-600 hover:bg-blue-700">
                  Continue Battle
                </Button>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Button
                onClick={resetGame}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Battle
              </Button>

              <Button
                onClick={resetScores}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Reset War
              </Button>
            </div>

            <div className="mt-6 p-4 bg-slate-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Battle Rules:</h3>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Get three in a row to win the battle</li>
                <li>• Get two in a row to remove one adjacent enemy piece</li>
                <li>• Attack enemy pieces with dice rolls (1-10)</li>
                <li>• If attacker wins, they claim the space</li>
                <li>• If defender wins, they can claim one attacker piece</li>
                <li>• Higher roll wins the combat!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
