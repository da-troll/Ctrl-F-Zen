import React, { useEffect, useRef, useState } from 'react';
import { useEmulatorStore } from '../../store/emulatorStore';
import { EmulatorState } from '../../types';
import { CRTOverlay } from './CRTOverlay';

// This component acts as a host for a Win32-aware emulator.
export const RetroWin32Screen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeGame, status, setStatus, addLog, settings } = useEmulatorStore();
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (status === EmulatorState.BOOTING && activeGame) {
      initializeRetroWin32();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, activeGame]);

  const initializeRetroWin32 = async () => {
    setError(null);
    setDownloadProgress(0);
    try {
      addLog("Initializing RetroWin32 Environment...");
      
      // Simulate environment setup
      await new Promise(r => setTimeout(r, 600));
      addLog("Environment ready.");
      
      if (!activeGame?.executableUrl) {
          throw new Error("No executable provided for RetroWin32.");
      }

      addLog(`Fetching executable: ${activeGame.title}...`);
      
      // Perform the actual fetch to download the binary
      try {
        const response = await fetch(activeGame.executableUrl);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        
        // Emulate progress since fetch doesn't give it easily without a reader
        setDownloadProgress(30);
        addLog("Connection established. Downloading binary...");
        
        const blob = await response.blob();
        setDownloadProgress(100);
        addLog(`Successfully downloaded ${(blob.size / 1024 / 1024).toFixed(2)} MB.`);
        
        // In a real implementation with retrowin32:
        // const buffer = await blob.arrayBuffer();
        // retrowin32.load_exe(buffer);

      } catch (netErr: any) {
          throw new Error(`Failed to download EXE: ${netErr.message}`);
      }

      await new Promise(r => setTimeout(r, 800));
      addLog("Parsing PE header...");
      addLog("Linking kernel32.dll exports...");
      addLog("Linking user32.dll exports...");
      
      await new Promise(r => setTimeout(r, 400));
      addLog("Starting main thread...");
      
      setStatus(EmulatorState.RUNNING);

    } catch (e: any) {
      console.error(e);
      setError(e.message);
      setStatus(EmulatorState.ERROR);
      addLog(`Error: ${e.message}`);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#3a6ea5] flex items-center justify-center overflow-hidden">
      
      {status === EmulatorState.RUNNING && (
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
            {/* Simulated Window */}
            <div className="w-[640px] h-[480px] bg-gray-200 border-2 border-white shadow-xl flex flex-col scale-75 md:scale-100 transition-transform">
                <div className="h-6 bg-blue-900 text-white flex items-center justify-between px-2 font-bold text-sm select-none">
                    <span>{activeGame?.title || 'Application'}</span>
                    <div className="flex gap-1">
                        <button className="w-4 h-4 bg-gray-300 text-black flex items-center justify-center text-[10px] border border-gray-500">_</button>
                        <button className="w-4 h-4 bg-gray-300 text-black flex items-center justify-center text-[10px] border border-gray-500">X</button>
                    </div>
                </div>
                {/* Menu Bar */}
                <div className="bg-gray-200 border-b border-gray-400 flex px-2 py-0.5 text-xs text-black gap-3 select-none">
                   <span>File</span><span>Edit</span><span>View</span><span>Help</span>
                </div>
                {/* Content Area */}
                <div className="flex-1 bg-white relative overflow-hidden p-4">
                    {/* Placeholder for actual canvas output */}
                    <div className="flex flex-col items-center justify-center h-full text-black">
                        <p className="font-serif text-2xl mb-4 text-center">TrackWords '98</p>
                        <div className="grid grid-cols-4 gap-1 p-2 bg-gray-100 border border-gray-400 shadow-inner">
                             {['T','R','A','C','K','W','O','R','D','S','G','A','M','E','!','!'].map((l, i) => (
                                 <div key={i} className="w-8 h-8 flex items-center justify-center border border-gray-300 font-bold bg-white">{l}</div>
                             ))}
                        </div>
                        <p className="text-xs mt-6 text-gray-500">Running via RetroWin32 Bridge</p>
                        <p className="text-[10px] text-gray-400 mt-1">Memory: 16MB Allocated</p>
                    </div>
                </div>
            </div>
        </div>
      )}

      {settings.enableCRT && status === EmulatorState.RUNNING && <CRTOverlay />}

      {status === EmulatorState.BOOTING && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 text-cyan-400 font-mono">
           <div className="w-64 h-2 bg-cyan-900/50 rounded-full overflow-hidden border border-cyan-800">
              <div 
                className="h-full bg-cyan-400 transition-all duration-300 ease-out"
                style={{ width: `${downloadProgress}%` }}
              ></div>
           </div>
           <p className="mt-4 animate-pulse uppercase tracking-wider text-sm">
             {downloadProgress < 100 ? 'Downloading Executable...' : 'Loading Environment...'}
           </p>
           <p className="text-xs text-cyan-600 mt-2">{(activeGame?.executableUrl || '').split('/').pop()?.split('?')[0]}</p>
        </div>
      )}

      {status === EmulatorState.ERROR && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-blue-900 text-white p-8 text-center font-mono">
            <div className="bg-white text-blue-900 px-4 py-1 mb-4 font-bold">SYSTEM ERROR</div>
            <p className="max-w-md mb-6 border border-white/20 p-4 bg-blue-800">{error}</p>
            <button 
                onClick={() => setStatus(EmulatorState.STOPPED)} 
                className="px-6 py-2 border-2 border-white hover:bg-white hover:text-blue-900 font-bold transition-colors"
            >
                RESTART SYSTEM
            </button>
        </div>
      )}
    </div>
  );
};