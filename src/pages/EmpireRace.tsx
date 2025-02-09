import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building, Coins, Crown, Users, Scroll, Gift, AlertTriangle, Check, X } from 'lucide-react';

interface Square {
  id: number;
  type: 'property' | 'penalty' | 'reward' | 'start';
  name: string;
  position: number;
  details?: {
    price?: number;
    rent?: number;
    description?: string;
  };
  owner?: string | null;
}

interface Player {
  id: string;
  name: string;
  money: number;
  position: number;
  properties: number[];
}

interface CardState {
  type: 'penalty' | 'reward';
  isFlipped: boolean;
  card: { description: string; amount: number } | null;
}

const BOARD_SQUARES: Square[] = [
  // Top row (5 squares)
  { id: 1, type: 'start', name: 'BAŞLANGIÇ', position: 0 },
  { id: 2, type: 'property', name: 'Roma', position: 1, details: { price: 1000, rent: 200 }, owner: null },
  { id: 3, type: 'penalty', name: 'CEZA', position: 2, details: { description: 'Ceza kartı çek' } },
  { id: 4, type: 'property', name: 'Ostia Limanı', position: 3, details: { price: 800, rent: 150 }, owner: null },
  { id: 5, type: 'reward', name: 'ÖDÜL', position: 4, details: { description: 'Ödül kartı çek' } },
  
  // Right side (3 squares)
  { id: 6, type: 'property', name: 'Colosseum', position: 5, details: { price: 1200, rent: 250 }, owner: null },
  { id: 7, type: 'penalty', name: 'CEZA', position: 6, details: { description: 'Ceza kartı çek' } },
  { id: 8, type: 'property', name: 'Pompeii', position: 7, details: { price: 600, rent: 100 }, owner: null },
  
  // Bottom row (5 squares, in reverse order)
  { id: 9, type: 'reward', name: 'ÖDÜL', position: 8, details: { description: 'Ödül kartı çek' } },
  { id: 10, type: 'property', name: 'Forum Romanum', position: 9, details: { price: 900, rent: 180 }, owner: null },
  { id: 11, type: 'penalty', name: 'CEZA', position: 10, details: { description: 'Ceza kartı çek' } },
  { id: 12, type: 'property', name: 'Pantheon', position: 11, details: { price: 1100, rent: 220 }, owner: null },
  { id: 13, type: 'property', name: 'Carthage', position: 12, details: { price: 950, rent: 190 }, owner: null },
  
  // Left side (3 squares)
  { id: 14, type: 'reward', name: 'ÖDÜL', position: 13, details: { description: 'Ödül kartı çek' } },
  { id: 15, type: 'property', name: 'Alexandria', position: 14, details: { price: 1300, rent: 260 }, owner: null },
  { id: 16, type: 'penalty', name: 'CEZA', position: 15, details: { description: 'Ceza kartı çek' } },
];

const PENALTY_CARDS = [
  { description: 'Barbarlar hazineni yağmaladı!', amount: -500 },
  { description: 'Veba salgını tedavi masrafları', amount: -300 },
  { description: 'Askeri sefer başarısız oldu', amount: -400 },
  { description: 'Saray komplonun kurbanı oldun', amount: -600 },
];

const REWARD_CARDS = [
  { description: 'Ticaret yolları güvenli, ekstra gelir!', amount: 500 },
  { description: 'Yeni altın madeni keşfedildi', amount: 400 },
  { description: 'İmparator seni ödüllendirdi', amount: 600 },
  { description: 'Savaş ganimeti kazandın', amount: 300 },
];

export function EmpireRace() {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Sezar', money: 5000, position: 0, properties: [] },
    { id: '2', name: 'Augustus', money: 5000, position: 0, properties: [] },
  ]);
  const [squares, setSquares] = useState<Square[]>(BOARD_SQUARES);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [gameLog, setGameLog] = useState<string[]>(['Oyun başladı!']);
  const [currentCard, setCurrentCard] = useState<{ description: string; amount: number } | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [diceAnimating, setDiceAnimating] = useState(false);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [cardState, setCardState] = useState<CardState | null>(null);

  const rollDice = () => {
    if (isMoving || diceAnimating) return;
    
    setDiceAnimating(true);
    let counter = 0;
    const animationInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      counter++;
      
      if (counter > 10) {
        clearInterval(animationInterval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setDiceRoll(finalRoll);
        setDiceAnimating(false);
        movePlayerStepByStep(finalRoll);
      }
    }, 100);
  };

  const movePlayerStepByStep = async (spaces: number) => {
    setIsMoving(true);
    const player = players[currentPlayer];
    let currentPos = player.position;

    for (let i = 0; i < spaces; i++) {
      currentPos = (currentPos + 1) % squares.length;
      await new Promise(resolve => setTimeout(resolve, 500));
      setPlayers(prev => prev.map((p, idx) =>
        idx === currentPlayer ? { ...p, position: currentPos } : p
      ));
    }

    setIsMoving(false);
    handleSquareAction(currentPos);
  };

  const handleSquareAction = (position: number) => {
    const square = squares[position];
    const player = players[currentPlayer];

    setShowActions(true);
  };

  const handlePropertyAction = (action: 'buy' | 'skip' | 'pay') => {
    const square = squares[players[currentPlayer].position];
    if (!square || square.type !== 'property') return;

    if (action === 'buy') {
      buyProperty(square.id);
    } else if (action === 'pay') {
      payRent(square);
    }
    setShowActions(false);
  };

  const handleCardAction = (type: 'penalty' | 'reward') => {
    const card = type === 'penalty' 
      ? PENALTY_CARDS[Math.floor(Math.random() * PENALTY_CARDS.length)]
      : REWARD_CARDS[Math.floor(Math.random() * REWARD_CARDS.length)];

    setCardState({
      type,
      isFlipped: false,
      card
    });

    setTimeout(() => {
      setCardState(prev => prev ? { ...prev, isFlipped: true } : null);
    }, 100);

    setTimeout(() => {
      updatePlayerMoney(card.amount);
      addToLog(`${players[currentPlayer].name}: ${card.description} (${card.amount} Denarii)`);
    }, 1000);

    setTimeout(() => {
      setCardState(null);
      setShowActions(false);
    }, 3000);
  };

  const updatePlayerMoney = (amount: number) => {
    setPlayers(prev => prev.map((p, idx) =>
      idx === currentPlayer ? { ...p, money: p.money + amount } : p
    ));
  };

  const buyProperty = (squareId: number) => {
    const square = squares.find(s => s.id === squareId);
    if (!square || !square.details?.price) return;

    const player = players[currentPlayer];
    
    if (player.money >= square.details.price) {
      setSquares(prev => prev.map(s =>
        s.id === squareId ? { ...s, owner: player.id } : s
      ));
      
      setPlayers(prev => prev.map(p =>
        p.id === player.id ? {
          ...p,
          money: p.money - square.details.price,
          properties: [...p.properties, squareId]
        } : p
      ));

      addToLog(`${player.name}, ${square.name}'yi satın aldı!`);
    }
  };

  const payRent = (square: Square) => {
    if (!square.details?.rent || !square.owner) return;

    const currentPlayerObj = players[currentPlayer];
    const owner = players.find(p => p.id === square.owner);
    if (!owner) return;

    setPlayers(prev => prev.map(p => {
      if (p.id === currentPlayerObj.id) {
        return { ...p, money: p.money - square.details!.rent! };
      }
      if (p.id === owner.id) {
        return { ...p, money: p.money + square.details!.rent! };
      }
      return p;
    }));

    addToLog(`${currentPlayerObj.name}, ${owner.name}'a ${square.details.rent} Denarii kira ödedi.`);
  };

  const addToLog = (message: string) => {
    setGameLog(prev => [...prev, message]);
  };

  const endTurn = () => {
    setCurrentPlayer((currentPlayer + 1) % players.length);
    setDiceRoll(null);
  };

  const getSquareColor = (type: Square['type']) => {
    switch (type) {
      case 'property': return 'bg-blue-100 border-blue-300';
      case 'penalty': return 'bg-red-100 border-red-300';
      case 'reward': return 'bg-green-100 border-green-300';
      case 'start': return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getSquareIcon = (type: Square['type']) => {
    switch (type) {
      case 'property': return <Building size={20} className="text-blue-600" />;
      case 'penalty': return <AlertTriangle size={20} className="text-red-600" />;
      case 'reward': return <Gift size={20} className="text-green-600" />;
      case 'start': return <Crown size={20} className="text-yellow-600" />;
    }
  };

  const renderActionButtons = () => {
    if (!showActions) return null;

    const currentSquare = squares[players[currentPlayer].position];
    const player = players[currentPlayer];

    if (currentSquare.type === 'property') {
      if (currentSquare.owner === null) {
        const canBuy = player.money >= (currentSquare.details?.price || 0);
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handlePropertyAction('buy')}
              disabled={!canBuy}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check size={16} />
              Satın Al
            </button>
            <button
              onClick={() => handlePropertyAction('skip')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <X size={16} />
              Pas Geç
            </button>
          </div>
        );
      } else if (currentSquare.owner !== player.id) {
        return (
          <button
            onClick={() => handlePropertyAction('pay')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Coins size={16} />
            Kira Öde
          </button>
        );
      }
    }
    return null;
  };

  const renderBoardSquare = (square: Square | undefined) => {
    if (!square) return <div className="border border-gray-200 h-28 bg-white/50"></div>;
    
    return (
      <div 
        key={square.id}
        className={`relative p-4 ${getSquareColor(square.type)} transition-all duration-300 hover:shadow-md h-28 border border-gray-200 flex flex-col items-center justify-center text-center`}
      >
        <div className="flex flex-col items-center gap-1">
          {getSquareIcon(square.type)}
          <h3 className="font-medium text-gray-800 text-sm">{square.name}</h3>
        </div>
        {square.type === 'property' && square.details?.price && (
          <div className="text-xs text-gray-600 mt-1 space-y-0.5">
            <div>{square.details.price} Denarii</div>
            <div className="text-emerald-600">Kira: {square.details.rent} Denarii</div>
          </div>
        )}
        {players.map((player, index) => 
          player.position === square.position && (
            <div 
              key={player.id}
              className={`absolute -top-4 -right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110 ${
                index === 0 
                  ? 'bg-gradient-to-br from-red-400 to-red-600 text-white' 
                  : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
              }`}
            >
              <Crown size={24} className="text-white" />
            </div>
          )
        )}
        {square.owner && (
          <div className="absolute top-2 right-2 text-xs font-medium text-gray-600">
            {players.find(p => p.id === square.owner)?.name}
          </div>
        )}
      </div>
    );
  };

  const renderCenterCards = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Warning Message */}
      {showActions && (
        <div className="mb-8 transform -rotate-[5deg]">
          {squares[players[currentPlayer].position].type === 'penalty' && (
            <div className="bg-red-100 border-2 border-red-300 rounded-lg px-6 py-3 text-red-700 font-medium animate-bounce">
              Ceza Kartı Seç
            </div>
          )}
          {squares[players[currentPlayer].position].type === 'reward' && (
            <div className="bg-green-100 border-2 border-green-300 rounded-lg px-6 py-3 text-green-700 font-medium animate-bounce">
              Ödül Kartı Seç
            </div>
          )}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 gap-8 transform rotate-[-5deg]">
        <div className={`relative w-32 h-48 ${
          cardState?.type === 'penalty' ? 'transform-style-3d transition-transform duration-1000' : ''
        }`}>
          <button
            onClick={() => {
              const currentSquare = squares[players[currentPlayer].position];
              if (currentSquare.type === 'penalty' && showActions) {
                handleCardAction('penalty');
              }
            }}
            disabled={!showActions || squares[players[currentPlayer].position].type !== 'penalty'}
            className={`absolute w-full h-full backface-hidden ${
              cardState?.type === 'penalty' && cardState.isFlipped ? 'rotate-y-180' : ''
            } bg-red-100 rounded-lg border-2 border-red-300 shadow-lg hover:rotate-6 transition-all duration-300 flex flex-col items-center justify-center p-4 ${
              showActions && squares[players[currentPlayer].position].type === 'penalty'
                ? 'cursor-pointer hover:scale-105'
                : 'cursor-not-allowed opacity-75'
            }`}
          >
            <AlertTriangle size={24} className="text-red-600 mb-2" />
            <div className="text-center">
              <div className="font-medium text-red-700 mb-1">Ceza Kartı</div>
              <div className="text-xs text-red-600">Dikkatli ol!</div>
            </div>
          </button>
          {cardState?.type === 'penalty' && cardState.card && (
            <div className={`absolute w-full h-full backface-hidden ${
              cardState.isFlipped ? '' : 'rotate-y-180'
            } bg-red-100 rounded-lg border-2 border-red-300 shadow-lg p-4 flex flex-col items-center justify-center`}>
              <AlertTriangle size={24} className="text-red-600 mb-2" />
              <p className="text-sm text-red-700 text-center mb-2">{cardState.card.description}</p>
              <p className="text-lg font-bold text-red-600">{cardState.card.amount} Denarii</p>
            </div>
          )}
        </div>

        <div className={`relative w-32 h-48 ${
          cardState?.type === 'reward' ? 'transform-style-3d transition-transform duration-1000' : ''
        }`}>
          <button
            onClick={() => {
              const currentSquare = squares[players[currentPlayer].position];
              if (currentSquare.type === 'reward' && showActions) {
                handleCardAction('reward');
              }
            }}
            disabled={!showActions || squares[players[currentPlayer].position].type !== 'reward'}
            className={`absolute w-full h-full backface-hidden ${
              cardState?.type === 'reward' && cardState.isFlipped ? 'rotate-y-180' : ''
            } bg-green-100 rounded-lg border-2 border-green-300 shadow-lg hover:rotate-[-6deg] transition-all duration-300 flex flex-col items-center justify-center p-4 ${
              showActions && squares[players[currentPlayer].position].type === 'reward'
                ? 'cursor-pointer hover:scale-105'
                : 'cursor-not-allowed opacity-75'
            }`}
          >
            <Gift size={24} className="text-green-600 mb-2" />
            <div className="text-center">
              <div className="font-medium text-green-700 mb-1">Ödül Kartı</div>
              <div className="text-xs text-green-600">Şansını dene!</div>
            </div>
          </button>
          {cardState?.type === 'reward' && cardState.card && (
            <div className={`absolute w-full h-full backface-hidden ${
              cardState.isFlipped ? '' : 'rotate-y-180'
            } bg-green-100 rounded-lg border-2 border-green-300 shadow-lg p-4 flex flex-col items-center justify-center`}>
              <Gift size={24} className="text-green-600 mb-2" />
              <p className="text-sm text-green-700 text-center mb-2">{cardState.card.description}</p>
              <p className="text-lg font-bold text-green-600">{cardState.card.amount} Denarii</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
        <div className="max-w-7xl mx-auto px-6 py-5">
          <Link to="/olympics" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300">
            <ArrowLeft size={20} />
            <span>Olimpiyatlara Dön</span>
          </Link>
          <div className="mt-4">
            <h1 className="text-3xl font-display text-white tracking-wide font-medium">İmparatorluk Yarışı</h1>
            <p className="text-gray-300 mt-1">Roma İmparatorluğu'nun en değerli mülklerini topla ve imparator ol!</p>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {players.map((player, index) => (
              <div 
                key={player.id}
                className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border ${
                  index === currentPlayer ? 'border-yellow-400' : 'border-gray-200/50'
                } p-6 ${
                  index === 0 
                    ? 'bg-gradient-to-br from-white/90 to-red-50/90' 
                    : 'bg-gradient-to-br from-white/90 to-blue-50/90'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${
                    index === 0 
                      ? 'bg-gradient-to-br from-red-400 to-red-600' 
                      : 'bg-gradient-to-br from-blue-400 to-blue-600'
                  }`}>
                    <Crown size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-medium text-gray-800">{player.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Coins size={16} />
                      <span>{player.money} Denarii</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Mülkler:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {player.properties.map(propId => {
                      const property = squares.find(s => s.id === propId);
                      if (!property || property.type !== 'property') return null;
                      return (
                        <div 
                          key={propId}
                          className="p-2 rounded-lg border bg-blue-100 border-blue-300"
                        >
                          <div className="text-sm font-medium">{property.name}</div>
                          <div className="text-xs text-gray-600">{property.details?.rent} Denarii/kira</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            <div className="md:col-span-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h2 className="text-xl font-display font-medium text-gray-800 mb-4">Oyun Tahtası</h2>
          
              <div className="flex justify-center items-center">
                <div className="relative w-[600px]">
                  <div className="grid grid-cols-5 gap-0">
                    {squares.slice(0, 5).map(renderBoardSquare)}
                    
                    <div className="contents">
                      <div>{renderBoardSquare(squares[15])}</div>
                      <div className="col-span-3 row-span-3 relative">
                        {renderCenterCards()}
                      </div>
                      <div>{renderBoardSquare(squares[5])}</div>
                      
                      <div>{renderBoardSquare(squares[14])}</div>
                      <div>{renderBoardSquare(squares[6])}</div>
                      <div>{renderBoardSquare(squares[13])}</div>
                      <div>{renderBoardSquare(squares[7])}</div>
                    </div>
                    
                    {squares.slice(8, 13).reverse().map(renderBoardSquare)}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-4">
                {renderActionButtons()}
                
                <div className="flex gap-4">
                  <button
                    onClick={rollDice}
                    disabled={diceRoll !== null || isMoving || showActions}
                    className="px-6 py-3 bg-gradient-to-r from-[#212529] to-[#343a40] text-white rounded-xl hover:from-[#343a40] hover:to-[#212529] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Zar At
                  </button>
                  {diceRoll && !isMoving && !showActions && (
                    <button
                      onClick={endTurn}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300"
                    >
                      Sırayı Bitir
                    </button>
                  )}
                </div>
                {diceValue && (
                  <div className="mt-4 text-center text-lg font-medium text-gray-700">
                    Zar: {diceValue}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {currentCard && (
              <div className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border p-6 ${
                currentCard.amount < 0 ? 'border-red-300' : 'border-green-300'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  {currentCard.amount < 0 ? (
                    <AlertTriangle size={24} className="text-red-500" />
                  ) : (
                    <Gift size={24} className="text-green-500" />
                  )}
                  <h2 className="text-xl font-display font-medium text-gray-800">
                    {currentCard.amount < 0 ? 'Ceza Kartı' : 'Ödül Kartı'}
                  </h2>
                </div>
                <p className="text-gray-700">{currentCard.description}</p>
                <p className={`text-lg font-medium mt-2 ${
                  currentCard.amount < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {currentCard.amount} Denarii
                </p>
              </div>
            )}

            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Scroll size={20} className="text-gray-700" />
                <h2 className="text-xl font-display font-medium text-gray-800">Oyun Günlüğü</h2>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {gameLog.map((log, index) => (
                  <div 
                    key={index}
                    className="p-2 text-sm text-gray-600 border-b border-gray-100 last:border-0"
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}