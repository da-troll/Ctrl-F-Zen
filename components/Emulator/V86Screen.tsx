import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore - v86 is resolved via importmap in index.html
import { V86Starter } from 'v86';
import { useEmulatorStore } from '../../store/emulatorStore';
import { EmulatorState, V86StarterOptions } from '../../types';
import { CRTOverlay } from './CRTOverlay';

const V86_ASSETS = {
  wasmUrl: "https://unpkg.com/v86@0.4.9/build/v86.wasm",
  biosUrl: "https://unpkg.com/v86@0.4.9/bios/seabios.bin",
  vgaUrl: "https://unpkg.com/v86@0.4.9/bios/vgabios.bin",
  freeDosUrl: "https://copy.sh/v86/images/freedos722.img"
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
      if (!V86Starter) {
         throw new Error("V86 Engine module not loaded.");
      }

      addLog("Initializing V86 Engine...");
      
      let hda = activeGame?.hdaUrl ? { url: activeGame.hdaUrl, async: true } : undefined;
      let fda = activeGame?.floppyUrl ? { url: activeGame.floppyUrl, async: true } : undefined;
      let cdrom = activeGame?.cdromUrl ? { url: activeGame.cdromUrl, async: true } : undefined;

      // Special handling: if we have an executable but are forced to use v86,
      // we try to mount it as a floppy if no floppy exists, or rely on HDA.
      if (activeGame?.type === 'exe' && activeGame.executableUrl) {
          addLog("Running .exe in v86 requires a bootable OS image.");
          if (!hda) {
              addLog("Mounting FreeDOS fallback...");
              hda = { url: V86_ASSETS.freeDosUrl, async: true }; 
          }
          if (!fda) {
              addLog("Mounting executable as floppy...");
              fda = { url: activeGame.executableUrl, async: true };
          }
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
        autostart: true,
        disable_mouse: false,
        disable_keyboard: false,
      };

      const instance = new V86Starter(v86Options);
      emulatorInstance.current = instance;

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