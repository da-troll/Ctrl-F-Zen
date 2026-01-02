import React, { useEffect, useRef } from 'react';
import { useEmulatorStore } from '../../store/emulatorStore';
import { EmulatorState } from '../../types';

export const BoxedwineScreen: React.FC = () => {
  const emulatorStarted = useRef(false);
  const { activeGame, status, setStatus, addLog } = useEmulatorStore();

  useEffect(() => {
    if (status === EmulatorState.BOOTING && activeGame && !emulatorStarted.current) {
      startEmulator();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, activeGame]);

  const startEmulator = async () => {
    emulatorStarted.current = true;

    addLog("Opening Boxedwine in new window...");
    addLog(`Game: ${activeGame?.title}`);
    addLog("Instructions:");
    addLog("1. Click 'Add File(s)' in the Boxedwine window");
    addLog("2. Select TrackWords.exe from your Downloads folder");
    addLog("3. Click on the uploaded file to run it");

    // Open Boxedwine in a new window/tab
    const boxedwineWindow = window.open('/boxedwine-example.html', 'boxedwine', 'width=1024,height=768');

    if (!boxedwineWindow) {
      addLog("ERROR: Popup blocked! Please allow popups for this site.");
      setStatus(EmulatorState.ERROR);
      return;
    }

    setStatus(EmulatorState.RUNNING);
    addLog("Boxedwine window opened - follow instructions there");
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">

      {status === EmulatorState.RUNNING && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/20 to-purple-900/20 text-white p-8">
          <div className="max-w-2xl text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-indigo-300">Boxedwine Opened in New Window</h2>

            <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-6 text-left">
              <h3 className="font-bold mb-3 text-indigo-400">How to Run TrackWords:</h3>
              <ol className="space-y-2 text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">1.</span>
                  <span>Look for the new Boxedwine window that opened</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">2.</span>
                  <span>Click the <strong>"Add File(s)"</strong> button</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">3.</span>
                  <span>Navigate to: <code className="text-xs bg-zinc-800 px-2 py-1 rounded">~/Downloads/Trkwd122/TrackWords.exe</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">4.</span>
                  <span>Select and upload the file</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">5.</span>
                  <span>Click on <strong>TrackWords.exe</strong> in the file list to run it!</span>
                </li>
              </ol>
            </div>

            <p className="text-xs text-zinc-500">
              If the window didn't open, check that popups are allowed for this site.
            </p>
          </div>
        </div>
      )}

      {status === EmulatorState.BOOTING && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 text-indigo-500 font-mono">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="animate-pulse">OPENING BOXEDWINE...</p>
          <p className="text-xs text-indigo-600 mt-2">Preparing Wine environment...</p>
        </div>
      )}

      {status === EmulatorState.ERROR && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-900 text-red-500 p-8 text-center">
          <p className="text-xl font-bold mb-2">Popup Blocked</p>
          <p className="font-mono text-sm">Please allow popups for this site and try again.</p>
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
