import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { EmulatorState, GameConfig, EmulatorSettings } from '../types';

interface EmulatorStore {
  status: EmulatorState;
  activeGame: GameConfig | null;
  settings: EmulatorSettings;
  terminalLogs: string[];
  customGames: GameConfig[];
  
  // Actions
  setStatus: (status: EmulatorState) => void;
  loadGame: (game: GameConfig) => void;
  addGame: (game: GameConfig) => void;
  stopGame: () => void;
  toggleCRT: () => void;
  addLog: (message: string) => void;
  clearLogs: () => void;
}

export const useEmulatorStore = create<EmulatorStore>()(
  immer((set) => ({
    status: EmulatorState.STOPPED,
    activeGame: null,
    settings: {
      enableAudio: true,
      enableCRT: true,
      memorySize: 128 * 1024 * 1024, // 128MB
      bootOrder: 0x213,
    },
    terminalLogs: [],
    customGames: [],

    setStatus: (status) =>
      set((state) => {
        state.status = status;
      }),

    loadGame: (game) =>
      set((state) => {
        state.activeGame = game;
        state.status = EmulatorState.BOOTING;
        state.terminalLogs = [`Initializing system for ${game.title}...`];
      }),

    addGame: (game) =>
      set((state) => {
        state.customGames.push(game);
        state.terminalLogs.push(`Imported ${game.title} to library.`);
      }),

    stopGame: () =>
      set((state) => {
        state.status = EmulatorState.STOPPED;
        state.activeGame = null;
        state.terminalLogs.push('System halted.');
      }),

    toggleCRT: () =>
      set((state) => {
        state.settings.enableCRT = !state.settings.enableCRT;
      }),

    addLog: (message) =>
      set((state) => {
        state.terminalLogs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
        if (state.terminalLogs.length > 50) state.terminalLogs.shift();
      }),

    clearLogs: () =>
      set((state) => {
        state.terminalLogs = [];
      }),
  }))
);