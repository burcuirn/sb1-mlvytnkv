import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Crown, Rotate3D as Rotate, X } from 'lucide-react';

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

interface Piece {
  type: PieceType;
  color: PieceColor;
}

type Board = (Piece | null)[][];

const initialBoard: Board = Array(8).fill(null).map((_, row) => {
  if (row === 0) {
    return [
      { type: 'rook', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'queen', color: 'black' },
      { type: 'king', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'rook', color: 'black' },
    ];
  }
  if (row === 1) {
    return Array(8).fill({ type: 'pawn', color: 'black' });
  }
  if (row === 6) {
    return Array(8).fill({ type: 'pawn', color: 'white' });
  }
  if (row === 7) {
    return [
      { type: 'rook', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'queen', color: 'white' },
      { type: 'king', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'rook', color: 'white' },
    ];
  }
  return Array(8).fill(null);
});

export function RomanChess() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [moves, setMoves] = useState<number>(1);

  const getPieceSymbol = (piece: Piece): string => {
    const symbols: Record<PieceType, string> = {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙'
    };
    return symbols[piece.type];
  };

  const isValidMove = (from: [number, number], to: [number, number]): boolean => {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    const piece = board[fromRow][fromCol];
    
    if (!piece || piece.color !== currentPlayer) return false;
    
    // Basic move validation
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    switch (piece.type) {
      case 'pawn':
        if (piece.color === 'white') {
          return toRow === fromRow - 1 && (
            (colDiff === 0 && !board[toRow][toCol]) ||
            (colDiff === 1 && board[toRow][toCol]?.color === 'black')
          );
        } else {
          return toRow === fromRow + 1 && (
            (colDiff === 0 && !board[toRow][toCol]) ||
            (colDiff === 1 && board[toRow][toCol]?.color === 'white')
          );
        }
      case 'knight':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      case 'bishop':
        return rowDiff === colDiff;
      case 'rook':
        return rowDiff === 0 || colDiff === 0;
      case 'queen':
        return rowDiff === colDiff || rowDiff === 0 || colDiff === 0;
      case 'king':
        return rowDiff <= 1 && colDiff <= 1;
      default:
        return false;
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (!selectedCell) {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer) {
        setSelectedCell([row, col]);
      }
    } else {
      const [selectedRow, selectedCol] = selectedCell;
      
      if (isValidMove([selectedRow, selectedCol], [row, col])) {
        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = board[selectedRow][selectedCol];
        newBoard[selectedRow][selectedCol] = null;
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
        setMoves(moves + 1);
      }
      
      setSelectedCell(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583425921686-c5daf5f49e22?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] opacity-[0.03] bg-fixed"
        style={{ 
          backgroundSize: '300px',
          backgroundRepeat: 'repeat',
          transform: 'rotate(-5deg) scale(1.1)',
          filter: 'contrast(120%) brightness(150%)'
        }}
      />
      
      <header className="relative bg-gradient-to-r from-[#212529] to-[#343a40] shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <Link to="/olympics" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
            <ArrowLeft size={20} />
            <span>Olimpiyatlara Dön</span>
          </Link>
          <div className="mt-4">
            <h1 className="text-3xl font-display text-white tracking-wide font-medium">Roma Satrancı</h1>
            <p className="text-gray-300 mt-1">Antik Roma'nın stratejik satranç oyunu</p>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="grid grid-cols-8 gap-1 aspect-square">
                {board.map((row, rowIndex) => (
                  row.map((piece, colIndex) => {
                    const isSelected = selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex;
                    const isWhiteSquare = (rowIndex + colIndex) % 2 === 0;
                    
                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`
                          aspect-square flex items-center justify-center text-4xl
                          transition-all duration-300 relative
                          ${isWhiteSquare ? 'bg-[#f8f9fa]' : 'bg-[#dee2e6]'}
                          ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                          hover:bg-blue-100
                        `}
                      >
                        {piece && (
                          <span 
                            className={`
                              ${piece.color === 'white' 
                                ? 'text-red-600 drop-shadow-md' 
                                : 'text-blue-600 drop-shadow-md'
                              }
                              transition-all duration-300
                              ${isSelected ? 'scale-110' : ''}
                              transform hover:scale-125
                            `}
                          >
                            {getPieceSymbol(piece)}
                          </span>
                        )}
                      </button>
                    );
                  })
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown size={20} className="text-gray-700" />
                <h2 className="text-xl font-display font-medium text-gray-800">Oyun Durumu</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sıra</span>
                  <span className={`font-medium ${
                    currentPlayer === 'white' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {currentPlayer === 'white' ? 'Kırmızı' : 'Mavi'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Hamle</span>
                  <span className="font-medium text-gray-800">{moves}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => {
                    setBoard(initialBoard);
                    setCurrentPlayer('white');
                    setMoves(1);
                    setSelectedCell(null);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-[#212529] to-[#343a40] text-white rounded-xl hover:from-[#343a40] hover:to-[#212529] transition-all duration-300 font-medium flex items-center justify-center gap-2"
                >
                  <Rotate size={16} />
                  Yeni Oyun
                </button>
                
                <Link
                  to="/olympics"
                  className="w-full py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  Oyundan Çık
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}