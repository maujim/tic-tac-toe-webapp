"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, RefreshCw, Cpu, User, RotateCcw, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Player = "X" | "O" | null
type Difficulty = "easy" | "medium" | "hard"

export default function TicTacToeGame() {
  // Game state
  const [squares, setSquares] = useState<Player[]>(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState<boolean>(true)
  const [winner, setWinner] = useState<Player>(null)
  const [winningLine, setWinningLine] = useState<number[] | null>(null)
  const [isDraw, setIsDraw] = useState<boolean>(false)
  const [gameHistory, setGameHistory] = useState<{ x: number; o: number; draw: number }>({
    x: 0,
    o: 0,
    draw: 0,
  })
  const [computerOpponent, setComputerOpponent] = useState<boolean>(true)
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [computerPlayer, setComputerPlayer] = useState<"O" | "X">("O")
  const [isThinking, setIsThinking] = useState<boolean>(false)
  const [moveHistory, setMoveHistory] = useState<Player[][]>([Array(9).fill(null)])
  const [currentMove, setCurrentMove] = useState<number>(0)

  // Separate human player names and computer name
  const [player1Name, setPlayer1Name] = useState<string>("You")
  const [player2Name, setPlayer2Name] = useState<string>("Player 2")
  const [computerName, setComputerName] = useState<string>("Computer")

  const [editingName, setEditingName] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState<string>("")
  const [gameStarted, setGameStarted] = useState<boolean>(false)

  // Check for winner or draw after each move
  useEffect(() => {
    const result = calculateWinner(squares)

    if (result) {
      setWinner(result.winner)
      setWinningLine(result.line)
      setGameHistory((prev) => ({
        ...prev,
        [result.winner!.toLowerCase()]: prev[result.winner!.toLowerCase() as "x" | "o"] + 1,
      }))
    } else if (!squares.includes(null)) {
      setIsDraw(true)
      setGameHistory((prev) => ({
        ...prev,
        draw: prev.draw + 1,
      }))
    }
  }, [squares])

  // Computer move
  useEffect(() => {
    if (
      computerOpponent &&
      !winner &&
      !isDraw &&
      ((computerPlayer === "X" && xIsNext) || (computerPlayer === "O" && !xIsNext))
    ) {
      setIsThinking(true)

      // Add a small delay to simulate "thinking"
      const timeoutId = setTimeout(() => {
        makeComputerMove()
        setIsThinking(false)
      }, 600)

      return () => clearTimeout(timeoutId)
    }
  }, [xIsNext, winner, isDraw, computerOpponent, computerPlayer])

  // Handle square click
  const handleClick = (i: number) => {
    // Return if square is filled or game is over or Computer is thinking
    if (squares[i] || winner || isDraw || isThinking) return

    // Return if it's Computer's turn
    if (computerOpponent && ((computerPlayer === "X" && xIsNext) || (computerPlayer === "O" && !xIsNext))) return

    if (!gameStarted) {
      setGameStarted(true)
    }

    makeMove(i)
  }

  // Make a move
  const makeMove = (i: number) => {
    const newSquares = squares.slice()
    newSquares[i] = xIsNext ? "X" : "O"

    // Update move history
    const newHistory = moveHistory.slice(0, currentMove + 1)
    newHistory.push(newSquares)

    setSquares(newSquares)
    setXIsNext(!xIsNext)
    setMoveHistory(newHistory)
    setCurrentMove(newHistory.length - 1)
  }

  // Computer makes a move
  const makeComputerMove = () => {
    if (!gameStarted) {
      setGameStarted(true)
    }

    const currentPlayer = xIsNext ? "X" : "O"
    let move: number

    switch (difficulty) {
      case "easy":
        move = getRandomMove(squares)
        break
      case "medium":
        // 70% chance of making a smart move, 30% chance of random move
        move = Math.random() < 0.7 ? getBestMove(squares, currentPlayer, 1) : getRandomMove(squares)
        break
      case "hard":
        move = getBestMove(squares, currentPlayer, 3)
        break
      default:
        move = getRandomMove(squares)
    }

    if (move !== -1) {
      makeMove(move)
    }
  }

  // Reset the game
  const resetGame = () => {
    setSquares(Array(9).fill(null))
    setXIsNext(true)
    setWinner(null)
    setWinningLine(null)
    setIsDraw(false)
    setMoveHistory([Array(9).fill(null)])
    setCurrentMove(0)
    setGameStarted(false)

    // Swap X and O players after each game if playing against Computer
    if (computerOpponent && (winner || isDraw)) {
      setComputerPlayer(computerPlayer === "X" ? "O" : "X")
    }
  }

  // Jump to a specific move in history
  const jumpToMove = (moveIndex: number) => {
    setCurrentMove(moveIndex)
    setSquares(moveHistory[moveIndex])
    setXIsNext(moveIndex % 2 === 0)
    setWinner(null)
    setWinningLine(null)
    setIsDraw(false)
  }

  // Render a square
  const renderSquare = (i: number) => {
    return (
      <Button
        variant="outline"
        className={`h-16 sm:h-20 w-16 sm:w-20 text-2xl font-bold transition-all duration-200
          ${squares[i] === "X" ? "text-blue-500" : squares[i] === "O" ? "text-red-500" : ""}
          ${winningLine?.includes(i) ? "bg-green-100 border-green-500" : ""}
          ${isThinking && !squares[i] ? "bg-gray-50" : ""}
          hover:bg-gray-100`}
        onClick={() => handleClick(i)}
        disabled={isThinking}
      >
        {squares[i]}
      </Button>
    )
  }

  // Get status message
  const getStatus = () => {
    // Determine current player names based on X/O assignment and opponent type
    const xPlayerName = computerOpponent
      ? computerPlayer === "X"
        ? computerName
        : player1Name
      : xIsNext
        ? player1Name
        : player2Name

    const oPlayerName = computerOpponent
      ? computerPlayer === "O"
        ? computerName
        : player1Name
      : xIsNext
        ? player2Name
        : player1Name

    const currentPlayerName = xIsNext ? xPlayerName : oPlayerName

    if (winner) {
      const winnerName =
        winner === "X"
          ? computerOpponent
            ? computerPlayer === "X"
              ? computerName
              : player1Name
            : player1Name
          : computerOpponent
            ? computerPlayer === "O"
              ? computerName
              : player1Name
            : player2Name
      return `Winner: ${winnerName}`
    } else if (isDraw) {
      return "Game ended in a draw!"
    } else if (isThinking) {
      return `${computerName} is thinking...`
    } else {
      return `Next player: ${currentPlayerName}`
    }
  }

  const startEditName = (player: "player1" | "player2") => {
    if (computerOpponent && player === "player2") return // Don't allow editing computer name when Computer is on

    setEditingName(player)
    setNameInput(player === "player1" ? player1Name : player2Name)
  }

  const saveName = () => {
    if (editingName === "player1") {
      setPlayer1Name(nameInput || "Player 1")
    } else if (editingName === "player2") {
      setPlayer2Name(nameInput || "Player 2")
    }
    setEditingName(null)
  }

  // Toggle Computer opponent
  const toggleComputerOpponent = () => {
    const newComputerOpponent = !computerOpponent
    setComputerOpponent(newComputerOpponent)
    resetGame()
  }

  // Change Computer player (X or O)
  const changeComputerPlayer = (player: "X" | "O") => {
    setComputerPlayer(player)
    resetGame()
  }

  // Change difficulty
  const changeDifficulty = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty)
  }

  // Determine current display name for player 2 slot
  const getPlayer2DisplayName = () => {
    return computerOpponent ? computerName : player2Name
  }

  // Get player scores based on current mode
  const getPlayerScore = (playerType: "player1" | "player2") => {
    if (playerType === "player1") {
      return computerOpponent ? (computerPlayer === "X" ? gameHistory.o : gameHistory.x) : gameHistory.x
    } else {
      return computerOpponent ? (computerPlayer === "O" ? gameHistory.o : gameHistory.x) : gameHistory.o
    }
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6">
        {/* Controls Panel - Left side on desktop */}
        <div className="w-full lg:w-64 lg:sticky lg:top-4 mb-4 lg:mb-0">
          <Card className="p-4 shadow-md">
            <h1 className="text-2xl font-bold mb-4 text-center">Tic Tac Toe</h1>

            {/* Player Stats */}
            <div className="flex flex-col gap-3 mb-6">
              {editingName === "player1" ? (
                <div className="h-9 flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded h-9"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && saveName()}
                  />
                  <Button size="sm" onClick={saveName} variant="outline">
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center justify-between w-full h-9 ${computerPlayer === "X" ? "bg-red-100" : "bg-blue-100"}`}
                  onClick={() => startEditName("player1")}
                >
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {player1Name}
                  </span>
                  <span>{getPlayerScore("player1")}</span>
                </Button>
              )}

              {editingName === "player2" && !computerOpponent ? (
                <div className="h-9 flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded h-9"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && saveName()}
                  />
                  <Button size="sm" onClick={saveName} variant="outline">
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center justify-between w-full h-9 ${computerPlayer === "O" ? "bg-red-100" : "bg-blue-100"}`}
                  onClick={() => !computerOpponent && startEditName("player2")}
                  style={{ cursor: computerOpponent ? "default" : "pointer" }}
                >
                  <span className="flex items-center gap-1">
                    {computerOpponent ? <Cpu className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {getPlayer2DisplayName()}
                  </span>
                  <span>{getPlayerScore("player2")}</span>
                </Button>
              )}

              <div
                className="flex items-center justify-between w-full h-9 px-3 py-1 bg-gray-100 rounded-md text-sm"
                style={{ cursor: "default" }}
              >
                <span>Draws</span>
                <span>{gameHistory.draw}</span>
              </div>
            </div>

            {/* Game Controls - Fixed height section */}
            <div className="space-y-4 min-h-[220px]">
              <div className="flex items-center space-x-2 h-9">
                <Switch id="computer-mode" checked={computerOpponent} onCheckedChange={toggleComputerOpponent} />
                <Label htmlFor="computer-mode">Play against Computer</Label>
              </div>

              {/* Computer controls - in fixed position container */}
              <div className="min-h-[140px] relative">
                {computerOpponent && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="computer-player">Computer plays as</Label>
                      <Select value={computerPlayer} onValueChange={(val) => changeComputerPlayer(val as "X" | "O")}>
                        <SelectTrigger id="computer-player">
                          <SelectValue placeholder="Select player" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="X">X (First)</SelectItem>
                          <SelectItem value="O">O (Second)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={difficulty} onValueChange={(val) => changeDifficulty(val as Difficulty)}>
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Unbeatable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Warning appears in its own space */}
              <div className="min-h-[80px]">
                {difficulty === "hard" && computerOpponent && !gameStarted && (
                  <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Unbeatable Mode</AlertTitle>
                    <AlertDescription>
                      In this mode, the Computer will never lose. At best, you can force a draw.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={resetGame} className="flex-1" variant={winner || isDraw ? "default" : "outline"}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {winner || isDraw ? "Play Again" : "Restart"}
                </Button>

                {currentMove > 0 && (
                  <Button onClick={() => jumpToMove(currentMove - 1)} variant="outline" title="Undo last move">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Game Board - Right side on desktop */}
        <Card className="flex-1 p-4 sm:p-6 shadow-md">
          {/* Fixed height status container */}
          <div className="h-16 flex items-center justify-center">
            <div
              className={`text-center text-xl font-medium ${winner ? "text-green-600" : isDraw ? "text-orange-500" : ""}`}
            >
              {winner && <Trophy className="inline-block mr-2 h-5 w-5" />}
              {getStatus()}
            </div>
          </div>

          {/* Game board with fixed position */}
          <div className="flex justify-center items-center py-4">
            <div className="grid grid-cols-3 gap-2">
              {renderSquare(0)}
              {renderSquare(1)}
              {renderSquare(2)}
              {renderSquare(3)}
              {renderSquare(4)}
              {renderSquare(5)}
              {renderSquare(6)}
              {renderSquare(7)}
              {renderSquare(8)}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Helper function to calculate winner
function calculateWinner(squares: Player[]): { winner: Player; line: number[] } | null {
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

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] }
    }
  }

  return null
}

// Get a random valid move
function getRandomMove(squares: Player[]): number {
  const availableMoves = squares.map((square, index) => (square === null ? index : -1)).filter((index) => index !== -1)

  if (availableMoves.length === 0) return -1

  return availableMoves[Math.floor(Math.random() * availableMoves.length)]
}

// Get the best move using minimax algorithm
function getBestMove(squares: Player[], player: "X" | "O", depth: number): number {
  // If it's the first move and Computer is X, take center or corner
  if (squares.every((square) => square === null)) {
    const firstMoves = [0, 2, 4, 6, 8]
    return firstMoves[Math.floor(Math.random() * firstMoves.length)]
  }

  // Check for immediate win
  const winMove = findWinningMove(squares, player)
  if (winMove !== -1) return winMove

  // Check for immediate block
  const opponent = player === "X" ? "O" : "X"
  const blockMove = findWinningMove(squares, opponent)
  if (blockMove !== -1) return blockMove

  // If depth is 1, just return a strategic move
  if (depth === 1) {
    return getStrategicMove(squares)
  }

  // Use minimax for harder difficulty
  return minimaxMove(squares, player, opponent)
}

// Find a winning move if available
function findWinningMove(squares: Player[], player: "X" | "O"): number {
  for (let i = 0; i < 9; i++) {
    if (squares[i] === null) {
      const testSquares = [...squares]
      testSquares[i] = player
      if (calculateWinner(testSquares)) {
        return i
      }
    }
  }
  return -1
}

// Get a strategic move (prefer center, then corners, then sides)
function getStrategicMove(squares: Player[]): number {
  // Priority: center, corners, sides
  const movePreference = [4, 0, 2, 6, 8, 1, 3, 5, 7]

  for (const move of movePreference) {
    if (squares[move] === null) {
      return move
    }
  }

  return getRandomMove(squares)
}

// Get the best move using minimax algorithm
function minimaxMove(squares: Player[], player: "X" | "O", opponent: "X" | "O"): number {
  let bestScore = Number.NEGATIVE_INFINITY
  let bestMove = -1

  for (let i = 0; i < 9; i++) {
    if (squares[i] === null) {
      const testSquares = [...squares]
      testSquares[i] = player

      const score = minimax(testSquares, 0, false, player, opponent)

      if (score > bestScore) {
        bestScore = score
        bestMove = i
      }
    }
  }

  return bestMove
}

// Minimax algorithm
function minimax(
  squares: Player[],
  depth: number,
  isMaximizing: boolean,
  player: "X" | "O",
  opponent: "X" | "O",
): number {
  const result = calculateWinner(squares)

  // Terminal states
  if (result?.winner === player) return 10 - depth
  if (result?.winner === opponent) return depth - 10
  if (!squares.includes(null)) return 0

  if (isMaximizing) {
    let bestScore = Number.NEGATIVE_INFINITY
    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        const testSquares = [...squares]
        testSquares[i] = player
        const score = minimax(testSquares, depth + 1, false, player, opponent)
        bestScore = Math.max(score, bestScore)
      }
    }
    return bestScore
  } else {
    let bestScore = Number.POSITIVE_INFINITY
    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        const testSquares = [...squares]
        testSquares[i] = opponent
        const score = minimax(testSquares, depth + 1, true, player, opponent)
        bestScore = Math.min(score, bestScore)
      }
    }
    return bestScore
  }
}

