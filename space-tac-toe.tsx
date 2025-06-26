"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, RotateCcw, Trophy } from "lucide-react"

type Player = "marine" | "alien" | null
type GameState = "playing" | "selecting-removal" | "game-over"

interface GameBoard {
  board: Player[]
  currentPlayer: Player
  gameState: GameState
  winner: Player
  canRemove: boolean
  removingPlayer: Player
  marineScore: number
  alienScore: number
}

export default function SpaceTacToe() {
  const [game, setGame] = useState<GameBoard>({
    board: Array(9).fill(null),
    currentPlayer: "marine",
    gameState: "playing",
    winner: null,
    canRemove: false,
    removingPlayer: null,
    marineScore: 0,
    alienScore: 0,
  })

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

  const handleCellClick = (index: number) => {
    if (game.gameState === "selecting-removal") {
      // Remove opponent piece
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
          currentPlayer: prev.currentPlayer === "marine" ? "alien" : "marine",
        }))
      }
      return
    }

    if (game.gameState !== "playing" || game.board[index]) return

    const newBoard = [...game.board]
    newBoard[index] = game.currentPlayer

    const winner = checkWinner(newBoard)
    const hasTwoInARow = checkTwoInARow(newBoard, game.currentPlayer)
    const opponentHasPieces = newBoard.some((cell) => cell && cell !== game.currentPlayer)

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
    } else if (hasTwoInARow && opponentHasPieces) {
      setGame((prev) => ({
        ...prev,
        board: newBoard,
        gameState: "selecting-removal",
        canRemove: true,
        removingPlayer: game.currentPlayer,
      }))
    } else {
      setGame((prev) => ({
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === "marine" ? "alien" : "marine",
      }))
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
    const isRemovable = game.gameState === "selecting-removal" && cell && cell !== game.removingPlayer

    return (
      <button
        key={index}
        onClick={() => handleCellClick(index)}
        className={`
          aspect-square w-full border-2 border-slate-600 bg-slate-900 
          flex items-center justify-center text-4xl font-bold
          transition-all duration-200 hover:bg-slate-800
          ${isClickable ? "hover:border-blue-400 cursor-pointer" : ""}
          ${isRemovable ? "hover:border-red-400 cursor-pointer animate-pulse" : ""}
          ${!isClickable && !isRemovable ? "cursor-not-allowed" : ""}
        `}
        disabled={game.gameState === "game-over"}
      >
        {cell === "marine" && <Shield className="w-8 h-8 text-blue-400" />}
        {cell === "alien" && <Zap className="w-8 h-8 text-green-400" />}
      </button>
    )
  }

  const getStatusMessage = () => {
    if (game.gameState === "selecting-removal") {
      const playerName = game.removingPlayer === "marine" ? "Space Marines" : "Aliens"
      return `${playerName} got two in a row! Click an enemy piece to remove it.`
    }

    if (game.winner === "draw") {
      return "It's a draw! The battle continues..."
    }

    if (game.winner) {
      const winnerName = game.winner === "marine" ? "Space Marines" : "Aliens"
      return `${winnerName} win this battle!`
    }

    const currentPlayerName = game.currentPlayer === "marine" ? "Space Marines" : "Aliens"
    return `${currentPlayerName} turn`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white mb-4">Space Marines vs Aliens</CardTitle>

            <div className="flex justify-center gap-8 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-400" />
                <span className="text-blue-400 font-semibold">Marines</span>
                <Badge variant="secondary" className="bg-blue-900 text-blue-100">
                  {game.marineScore}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-green-400" />
                <span className="text-green-400 font-semibold">Aliens</span>
                <Badge variant="secondary" className="bg-green-900 text-green-100">
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
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-6 max-w-sm mx-auto">
              {Array.from({ length: 9 }, (_, index) => renderCell(index))}
            </div>

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
                <li>• Get two in a row to remove one enemy piece</li>
                <li>• Space Marines (shields) vs Aliens (lightning)</li>
                <li>• First to dominate the galaxy wins!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
