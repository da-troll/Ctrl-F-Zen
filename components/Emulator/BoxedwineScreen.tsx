import React, { useEffect, useRef, useState } from 'react';
import { useEmulatorStore } from '../../store/emulatorStore';
import { EmulatorState } from '../../types';
import { CRTOverlay } from './CRTOverlay';

// Boxedwine is loaded from public folder as global variables
declare global {
  interface Window {
    Module: any;
    Config: any;
  }
}

export const BoxedwineScreen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emulatorStarted = useRef(false);
  const { activeGame, status, setStatus, addLog, settings } = useEmulatorStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === EmulatorState.BOOTING && activeGame && !emulatorStarted.current) {
      startEmulator();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, activeGame]);

  const startEmulator = async () => {
    setError(null);
    emulatorStarted.current = true;

    try {
      // Check if Boxedwine is available
      if (!window.Module || !window.Config) {
        throw new Error("Boxedwine not loaded. Please refresh the page.");
      }

      // Verify canvas is available
      if (!canvasRef.current) {
        throw new Error("Canvas not ready. Please try again.");
      }

      addLog("Initializing Boxedwine...");

      // Configure Boxedwine
      const executablePath = activeGame?.executableUrl;
      const executableName = executablePath?.split('/').pop()?.split('?')[0] || 'app.exe';

      addLog(`Loading: ${activeGame?.title}`);
      addLog("Preparing Wine environment...");

      // Set Boxedwine configuration
      window.Config.urlParams = `p=${executableName}`;
      window.Config.storageMode = "MEMORY"; // Use memory storage
      window.Config.showUploadDownload = false;
      window.Config.isRunningInline = true;

      // Configure Emscripten Module
      window.Module = {
        canvas: canvasRef.current,
        print: (text: string) => {
          console.log('[Boxedwine]:', text);
          if (text && !text.includes('pre-main') && !text.includes('GL_')) {
            addLog(text);
          }
        },
        printErr: (text: string) => {
          console.error('[Boxedwine ERROR]:', text);
          if (text && !text.includes('warning')) {
            addLog(`Error: ${text}`);
          }
        },
        onRuntimeInitialized: () => {
          addLog("Wine environment ready");
          setStatus(EmulatorState.RUNNING);
        },
      };

      addLog("Starting Wine...");

      // Note: The actual executable loading will need to be handled separately
      // For now, this will boot Wine with the default environment
      // TODO: Implement file upload/injection for TrackWords.exe

      addLog("Wine initialized. Ready to run Windows applications.");

    } catch (err: any) {
      console.error("Boxedwine start error:", err);
      setError(err.message || "Failed to start Boxedwine");
      setStatus(EmulatorState.ERROR);
      addLog(`Error: ${err.message}`);
      emulatorStarted.current = false;
    }
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />

      {settings.enableCRT && status === EmulatorState.RUNNING && <CRTOverlay />}

      {status === EmulatorState.BOOTING && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 text-indigo-500 font-mono">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="animate-pulse">BOXEDWINE INITIALIZING...</p>
          <p className="text-xs text-indigo-600 mt-2">Preparing Wine environment...</p>
        </div>
      )}

      {status === EmulatorState.ERROR && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-900 text-red-500 p-8 text-center">
          <p className="text-xl font-bold mb-2">Boxedwine Error</p>
          <p className="font-mono text-sm">{error}</p>
        </div>
      )}

      {status === EmulatorState.STOPPED && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center text-zinc-600 bg-[#09090b]">
          <div className="w-32 h-32 mb-4 rounded-full border-2 border-zinc-800 flex items-center justify-center bg-zinc-900/50">
            <svg className="w-12 h-12 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <p className="font-mono text-sm tracking-wider text-zinc-500">READY TO RUN</p>
          <p className="text-xs text-zinc-700 mt-2">Select software from the library</p>
        </div>
      )}
    </div>
  );
};
