import React from 'react';
import { useEmulatorStore } from '../../store/emulatorStore';
import { EmulatorState } from '../../types';

export const ControlBar: React.FC = () => {
  const { status, stopGame, toggleCRT, settings, activeGame } = useEmulatorStore();
  const isRunning = status === EmulatorState.RUNNING || status === EmulatorState.BOOTING;

  const handleFullscreen = () => {
    const el = document.getElementById('emulator-container');
    if (el) {
        if (!document.fullscreenElement) {
            el.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen();
        }
    }
  };

  return (
    <div className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {activeGame ? (
             <div className="flex flex-col">
                <span className="text-white font-medium tracking-tight">{activeGame.title}</span>
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                    {status === EmulatorState.RUNNING && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                    {status}
                </span>
             </div>
        ) : (
            <span className="text-zinc-600 font-mono text-sm">NO CARTRIDGE LOADED</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={toggleCRT}
          className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${settings.enableCRT ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}
        >
          CRT FX: {settings.enableCRT ? 'ON' : 'OFF'}
        </button>

        <div className="h-6 w-px bg-zinc-800 mx-2"></div>

        <button 
          onClick={handleFullscreen}
          disabled={!isRunning}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          title="Fullscreen"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
        </button>

        <button 
          onClick={stopGame}
          disabled={!isRunning}
          className="ml-2 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          POWER OFF
        </button>
      </div>
    </div>
  );
};