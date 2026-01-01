import React, { useEffect, useRef, useState } from 'react';
import { useEmulatorStore } from '../../store/emulatorStore';
import { EmulatorState, V86StarterOptions } from '../../types';
import { CRTOverlay } from './CRTOverlay';

// V86 is loaded from CDN as a global variable (window.V86)
declare global {
  interface Window {
    V86: any;
  }
}

const V86_ASSETS = {
  wasmUrl: "https://cdn.jsdelivr.net/npm/v86@latest/build/v86.wasm",
  biosUrl: "https://cdn.jsdelivr.net/npm/v86@latest/bios/seabios.bin",
  vgaUrl: "https://cdn.jsdelivr.net/npm/v86@latest/bios/vgabios.bin",
  // FreeDOS image URL removed - copy.sh is unreachable
  // Users can download FreeDOS from https://freedos.org/download/ or https://archive.org/details/FD12CD
  freeDosUrl: undefined
};

export const V86Screen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const emulatorInstance = useRef<any>(null);
  const { activeGame, status, setStatus, addLog, settings } = useEmulatorStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (emulatorInstance.current) {
        try {
          emulatorInstance.current.destroy();
        } catch (e) {
          console.error("Failed to destroy emulator instance", e);
        }
        emulatorInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (status === EmulatorState.BOOTING && activeGame && containerRef.current) {
      startEmulator();
    } else if (status === EmulatorState.STOPPED && emulatorInstance.current) {
        try {
            emulatorInstance.current.destroy();
        } catch(e) { console.error(e); }
        emulatorInstance.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, activeGame]);

  const startEmulator = async () => {
    setError(null);
    if (emulatorInstance.current) {
        try {
            emulatorInstance.current.destroy();
            emulatorInstance.current = null;
        } catch(e) {}
    }

    try {
      // Check if V86 is available on window object
      if (!window.V86) {
         throw new Error("V86 Engine module not loaded. Please refresh the page.");
      }

      // Verify container is available
      if (!containerRef.current) {
         throw new Error("Screen container not ready. Please try again.");
      }

      // Set up the screen container with required child elements for v86
      containerRef.current.innerHTML = '';

      // v86 expects specific child elements in the container
      const textDiv = document.createElement('div');
      textDiv.style.whiteSpace = 'pre';
      textDiv.style.font = '14px monospace';
      textDiv.style.lineHeight = '14px';

      const canvas = document.createElement('canvas');
      canvas.style.display = 'none';

      containerRef.current.appendChild(textDiv);
      containerRef.current.appendChild(canvas);

      addLog("Initializing V86 Engine...");

      let hda = activeGame?.hdaUrl ? { url: activeGame.hdaUrl, async: true } : undefined;
      let fda = activeGame?.floppyUrl ? { url: activeGame.floppyUrl, async: true } : undefined;
      let fdb = activeGame?.fdbUrl ? { url: activeGame.fdbUrl, async: true } : undefined;
      let cdrom = activeGame?.cdromUrl ? { url: activeGame.cdromUrl, async: true } : undefined;

      // Note: .exe files cannot be directly mounted in v86
      // They need to be packaged in a disk image (.img) first
      if (activeGame?.type === 'exe' && activeGame.executableUrl) {
          addLog("Note: .exe files must be packaged in a disk image to run.");
          addLog("FreeDOS will boot. To run the .exe:");
          addLog("1. Download it from your browser");
          addLog("2. Create a floppy image containing the .exe");
          addLog("3. Upload the .img file instead");
          addLog("");
          addLog("For now, you can explore FreeDOS and built-in games.");
      }

      const v86Options: V86StarterOptions = {
        wasm_path: V86_ASSETS.wasmUrl,
        memory_size: activeGame?.memorySize || 64 * 1024 * 1024,
        vga_memory_size: 8 * 1024 * 1024,
        screen_container: containerRef.current,
        bios: { url: V86_ASSETS.biosUrl },
        vga_bios: { url: V86_ASSETS.vgaUrl },
        cdrom: cdrom,
        hda: hda,
        fda: fda,
        fdb: fdb,
        autostart: true,
        disable_mouse: false,
        disable_keyboard: false,
      };

      addLog("Creating V86 instance...");
      const instance = new window.V86(v86Options);
      emulatorInstance.current = instance;
      addLog("V86 instance created successfully.");

      instance.add_listener("emulator-ready", () => {
        addLog("V86 Core Ready. Booting...");
        setStatus(EmulatorState.RUNNING);
      });

      instance.add_listener("emulator-stopped", () => {
         addLog("V86 Core Stopped.");
      });

    } catch (err: any) {
      console.error("Emulator start error:", err);
      setError(err.message || "Failed to start emulator");
      setStatus(EmulatorState.ERROR);
      addLog(`Error: ${err.message}`);
    }
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <div 
        ref={containerRef} 
        className="w-full h-full relative z-10"
        style={{ imageRendering: 'pixelated' }} 
      />
      {settings.enableCRT && status === EmulatorState.RUNNING && <CRTOverlay />}
      
      {status === EmulatorState.BOOTING && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 text-indigo-500 font-mono">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="animate-pulse">V86 INITIALIZING...</p>
        </div>
      )}
      
      {status === EmulatorState.ERROR && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-900 text-red-500 p-8 text-center">
          <p className="text-xl font-bold mb-2">V86 Error</p>
          <p className="font-mono text-sm">{error}</p>
        </div>
      )}

      {/* Stopped/Idle State - Increased z-index to 40 */}
      {status === EmulatorState.STOPPED && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center text-zinc-600 bg-[#09090b]">
            <div className="w-32 h-32 mb-4 rounded-full border-2 border-zinc-800 flex items-center justify-center bg-zinc-900/50">
                <svg className="w-12 h-12 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </div>
            <p className="font-mono text-sm tracking-wider text-zinc-500">READY TO BOOT</p>
            <p className="text-xs text-zinc-700 mt-2">Select software from the library</p>
        </div>
      )}
    </div>
  );
};