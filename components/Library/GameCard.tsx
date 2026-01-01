import React from 'react';
import { GameConfig } from '../../types';

interface GameCardProps {
  game: GameConfig;
  onSelect: (game: GameConfig) => void;
  isActive: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect, isActive }) => {
  return (
    <div 
      onClick={() => onSelect(game)}
      className={`
        group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer
        ${isActive 
          ? 'bg-zinc-900 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
          : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'}
      `}
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-950 flex-shrink-0 relative">
            <img 
                src={game.coverImage} 
                alt={game.title} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
            />
            {game.type === 'win98' && (
                <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-[10px] px-1 font-bold">W98</div>
            )}
            {game.type === 'dos' && (
                <div className="absolute bottom-0 right-0 bg-orange-600 text-white text-[10px] px-1 font-bold">DOS</div>
            )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold truncate ${isActive ? 'text-indigo-400' : 'text-zinc-100'}`}>
            {game.title}
          </h3>
          <p className="text-xs text-zinc-500 mb-2">{game.year}</p>
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>
      </div>
      
      <div className={`
        absolute inset-0 border-2 border-indigo-500 rounded-xl opacity-0 transition-opacity pointer-events-none
        ${isActive ? 'opacity-100' : 'group-hover:opacity-10'}
      `} />
    </div>
  );
};