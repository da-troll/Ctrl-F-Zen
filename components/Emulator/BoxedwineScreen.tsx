import React, { useEffect, useRef } from 'react';
import { useEmulatorStore } from '../../store/emulatorStore';
import { EmulatorState } from '../../types';
import { CRTOverlay } from './CRTOverlay';

export const BoxedwineScreen: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const emulatorStarted = useRef(false);
  const { activeGame, status, setStatus, addLog, settings } = useEmulatorStore();

  useEffect(() => {
    if (status === EmulatorState.BOOTING && activeGame && !emulatorStarted.current) {
      startEmulator();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, activeGame]);

  const startEmulator = async () => {
    emulatorStarted.current = true;

    addLog("Loading Boxedwine environment...");
    addLog(`Game: ${activeGame?.title}`);
    addLog("Boxedwine will open in embedded window");
    addLog("Use the 'Add File(s)' button to upload TrackWords.exe");
    addLog("Then click on TrackWords.exe to run it");

    // Set status to running since iframe will handle everything
    setTimeout(() => {
      setStatus(EmulatorState.RUNNING);
      addLog("Boxedwine ready - upload TrackWords.exe to start");
    }, 1000);
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">

      {status === EmulatorState.RUNNING && (
        <iframe
          ref={iframeRef}
          src="/boxedwine-inline.html"
          className="w-full h-full border-0"
          title="Boxedwine Emulator"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-modals"
        />
      )}

      {settings.enableCRT && status === EmulatorState.RUNNING && <CRTOverlay />}

      {status === EmulatorState.BOOTING && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 text-indigo-500 font-mono">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="animate-pulse">BOXEDWINE INITIALIZING...</p>
          <p className="text-xs text-indigo-600 mt-2">Loading Wine environment...</p>
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
