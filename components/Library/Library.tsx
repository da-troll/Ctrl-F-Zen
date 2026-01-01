import React, { useRef } from 'react';
import { GameCard } from './GameCard';
import { useEmulatorStore } from '../../store/emulatorStore';
import { GameConfig } from '../../types';

// Mock Data representing what would come from Supabase
const GAMES: GameConfig[] = [
  {
    id: 'trackwords-98',
    title: 'TrackWords (1998)',
    year: 1998,
    description: 'Win32 word game. Boots FreeDOS from A:, TrackWords.exe on C: drive. Type "C:" then "TRACKWORDS.EXE" to run.',
    coverImage: 'https://picsum.photos/seed/trackwords/200/200',
    type: 'dos',
    emulator: 'v86',
    memorySize: 64 * 1024 * 1024,
    floppyUrl: '/freedos722.img',
    hdaUrl: '/trackwords-hd.img',
    hdaSize: 20971520
  },
  {
    id: 'freedos-demo',
    title: 'FreeDOS 1.3 (Boot Demo)',
    year: 2021,
    description: 'FreeDOS 1.3 minimal bootable system. A free DOS-compatible operating system. You can upload .exe files to run them.',
    coverImage: 'https://picsum.photos/seed/freedos/200/200',
    type: 'dos',
    emulator: 'v86',
    memorySize: 32 * 1024 * 1024,
    floppyUrl: '/freedos722.img'
  },
  {
    id: 'doom-shareware',
    title: 'DOOM (Shareware)',
    year: 1993,
    description: 'Space marines, demons, and shotguns. The game that defined the FPS genre. Running on DOS.',
    coverImage: 'https://picsum.photos/seed/doom/200/200',
    type: 'dos',
    emulator: 'v86',
    memorySize: 32 * 1024 * 1024,
    // Note: copy.sh is unreachable. Download disk images from https://archive.org/details/FD12CD
    floppyUrl: undefined
  },
  {
    id: 'win98-os',
    title: 'Windows 98 SE',
    year: 1998,
    description: 'Full Windows 98 Second Edition environment. Slow boot but high compatibility.',
    coverImage: 'https://picsum.photos/seed/win98/200/200',
    type: 'win98',
    emulator: 'v86',
    memorySize: 128 * 1024 * 1024,
    // Note: copy.sh is unreachable. Users need to provide their own OS images
    hdaUrl: undefined
  }
];

export const Library: React.FC = () => {
  const { loadGame, activeGame, addGame, customGames } = useEmulatorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const lowerName = file.name.toLowerCase();
    const isExe = lowerName.endsWith('.exe');
    const isDos = lowerName.endsWith('.com') || lowerName.endsWith('.bat');
    const isImg = lowerName.endsWith('.img') || lowerName.endsWith('.floppy');
    const isIso = lowerName.endsWith('.iso');

    const newGame: GameConfig = {
      id: `custom-${Date.now()}`,
      title: file.name,
      year: 2024,
      description: isExe
        ? 'Custom executable. Note: Boot FreeDOS first, then you can run .exe files from the DOS prompt.'
        : isIso
        ? 'Custom CD-ROM image imported from local machine.'
        : isImg
        ? 'Custom floppy disk image imported from local machine.'
        : 'Custom disk image imported from local machine.',
      coverImage: 'https://picsum.photos/seed/custom/200/200',
      type: isExe ? 'exe' : (isDos ? 'dos' : 'custom'),
      emulator: 'v86',
      memorySize: isIso ? 128 * 1024 * 1024 : 64 * 1024 * 1024,

      // For .exe files, mount FreeDOS as boot and the exe as a data floppy
      floppyUrl: isImg ? url : (isExe ? '/freedos722.img' : undefined),
      cdromUrl: isIso ? url : undefined,
      hdaUrl: undefined,
      executableUrl: isExe ? url : undefined, // Track exe URL for potential future use
    };

    addGame(newGame);
    loadGame(newGame);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-r border-zinc-800 w-80 md:w-96">
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
            RetroWin
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Multi-Core Architecture</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2 px-1">Installed Software</div>
        {GAMES.map((game) => (
          <GameCard 
            key={game.id} 
            game={game} 
            onSelect={loadGame}
            isActive={activeGame?.id === game.id}
          />
        ))}

        {customGames.length > 0 && (
          <>
             <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2 mt-6 px-1">Imported</div>
             {customGames.map((game) => (
               <GameCard 
                 key={game.id} 
                 game={game} 
                 onSelect={loadGame}
                 isActive={activeGame?.id === game.id}
               />
             ))}
          </>
        )}

        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          accept=".iso,.img,.bin,.exe,.com"
          onChange={handleFileUpload}
        />

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="mt-8 p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all cursor-pointer group text-center"
        >
            <div className="w-10 h-10 mx-auto bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-indigo-600 transition-colors mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </div>
            <h4 className="text-sm font-medium text-zinc-300">Upload Software</h4>
            <p className="text-xs text-zinc-600 mt-1">Support for .ISO, .IMG, .BIN, .EXE</p>
            <p className="text-[10px] text-zinc-700 mt-2">Max size: 2GB (Browser limit)</p>
        </div>
      </div>
      
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500"></div>
            <div>
                <div className="text-sm font-medium text-white">Guest User</div>
                <div className="text-xs text-green-500">● Online</div>
            </div>
        </div>
      </div>
    </div>
  );
};