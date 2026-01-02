import React, { useEffect, useRef, useState } from 'react';
import { useEmulatorStore } from '../../store/emulatorStore';
import { EmulatorState } from '../../types';
import { CRTOverlay } from './CRTOverlay';

// RetroWin32 types
interface RetroWin32Status {
  Running: void;
  Blocked: void;
  Error: string;
  Exit: number;
}

interface RetroWin32Emulator {
  run(steps: number): number;
  start_exe(cmdLine: string, relocate: boolean): void;
  unblock(): void;
  instr_count: number;
  exit_code: number;
  cpu(): any;
  set_tracing_scheme?(scheme: string): void;
}

interface RetroWin32Host {
  onWindowChanged(): void;
  onError(msg: string): void;
  onStdOut(stdout: string): void;
  onStopped(status: any): void;
  onEvent(event: Event): void;
}

interface RetroWin32Module {
  default: (wasmUrl: string | URL) => Promise<void>;
  new_emulator: (host: RetroWin32Host) => RetroWin32Emulator;
  Status: typeof RetroWin32Status;
}

declare global {
  interface Window {
    retrowin32: RetroWin32Module | undefined;
  }
}

export const RetroWin32Screen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const emulatorInstance = useRef<RetroWin32Emulator | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const { activeGame, status, setStatus, addLog, settings } = useEmulatorStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      isRunningRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      emulatorInstance.current = null;
      canvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (status === EmulatorState.BOOTING && activeGame && containerRef.current) {
      startEmulator();
    } else if (status === EmulatorState.STOPPED) {
      isRunningRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      emulatorInstance.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, activeGame]);

  const loadRetroWin32Module = async (): Promise<RetroWin32Module> => {
    // Load the RetroWin32 WASM module
    const module = await import('../../src/emulators/retrowin32/glue.js') as unknown as RetroWin32Module;

    // Initialize WASM
    await module.default();

    window.retrowin32 = module;
    return module;
  };

  const fetchExeFile = async (url: string): Promise<Uint8Array> => {
    addLog(`Fetching ${url}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  };

  const startEmulator = async () => {
    setError(null);

    if (emulatorInstance.current) {
      emulatorInstance.current = null;
    }

    try {
      if (!containerRef.current || !activeGame) {
        throw new Error("Container or game not ready");
      }

      addLog("Loading RetroWin32 emulator...");

      // Load the WASM module
      const module = await loadRetroWin32Module();
      addLog("RetroWin32 module loaded");

      // Create canvas for rendering
      containerRef.current.innerHTML = '';
      const canvas = document.createElement('canvas');

      // Set initial canvas size (will be updated by emulator)
      canvas.width = 640;
      canvas.height = 480;

      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.imageRendering = 'pixelated';
      canvas.style.objectFit = 'contain';
      canvas.style.backgroundColor = '#000';

      containerRef.current.appendChild(canvas);
      canvasRef.current = canvas;

      addLog(`Canvas created: ${canvas.width}x${canvas.height}`);

      // Load the executable
      const exeUrl = activeGame.executableUrl || '/TrackWords.exe';
      const exeBytes = await fetchExeFile(exeUrl);

      // Create file map for the emulator
      const files = new Map<string, Uint8Array>();
      const exeName = exeUrl.split('/').pop() || 'program.exe';
      files.set(exeName.toLowerCase(), exeBytes);

      // Load TrackWords data files
      if (exeName.toLowerCase() === 'trackwords.exe') {
        try {
          addLog('Loading wordplay.dic...');
          const dicBytes = await fetchExeFile('/wordplay.dic');
          files.set('wordplay.dic', dicBytes);
          addLog(`Loaded dictionary: ${dicBytes.length} bytes`);

          addLog('Loading TRACKW.HLP...');
          const hlpBytes = await fetchExeFile('/TRACKW.HLP');
          files.set('trackw.hlp', hlpBytes);
          addLog(`Loaded help file: ${hlpBytes.length} bytes`);
        } catch (err) {
          addLog(`Warning: Could not load data files: ${err}`);
        }
      }

      // Create host interface
      const host: RetroWin32Host = {
        onWindowChanged: () => {
          // Window size or canvas changed
          if (canvasRef.current && emulatorInstance.current) {
            // The emulator will manage canvas updates
          }
        },
        onError: (msg: string) => {
          addLog(`ERROR: ${msg}`);
          setError(msg);
          setStatus(EmulatorState.ERROR);
        },
        onStdOut: (stdout: string) => {
          addLog(stdout);
        },
        onStopped: (statusCode: any) => {
          addLog(`Emulator stopped: ${JSON.stringify(statusCode)}`);
          isRunningRef.current = false;
          setStatus(EmulatorState.STOPPED);
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
          }
        },
        onEvent: (event: Event) => {
          // Handle DOM events forwarded to emulator
        }
      };

      // Create emulator with host wrapper that includes file access
      const emuHost = {
        ...host,
        open: (path: string, options: any) => {
          console.log(`[FILE OPEN] "${path}" - options:`, options);
          const lowerPath = path.toLowerCase();
          const fileBytes = files.get(lowerPath);

          if (!fileBytes) {
            console.warn(`[FILE NOT FOUND] "${path}" (tried: ${lowerPath})`);
            console.log('Available files:', Array.from(files.keys()));
            return null;
          }

          console.log(`[FILE OPENED] "${path}" - ${fileBytes.length} bytes`);

          // Create a simple file object
          let ofs = 0;
          return {
            info: () => fileBytes.length,
            seek: (from: number, offset: number) => {
              switch (from) {
                case 0: ofs = offset; break; // start
                case 1: ofs = fileBytes.length + offset; break; // end
                case 2: ofs = ofs + offset; break; // cur
              }
              return ofs;
            },
            read: (buf: Uint8Array) => {
              const n = Math.min(buf.length, fileBytes.length - ofs);
              buf.set(fileBytes.subarray(ofs, ofs + n));
              ofs += n;
              return n;
            },
            write: (buf: Uint8Array) => {
              console.warn('write not implemented');
              return buf.length;
            }
          };
        },
        log: (level: number, msg: string) => {
          const levelName = ['', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'][level] || 'LOG';
          console.log(`[${levelName}] ${msg}`);

          if (level === 1) {
            addLog(`ERROR: ${msg}`);
          } else if (level <= 3) {
            addLog(msg);
          }
        },
        create_window: (hwnd: number) => {
          addLog(`Window created (hwnd: ${hwnd})`);
          const windowObj = {
            title: '',
            canvas: canvas,
            size: [640, 480] as [number, number],
            is_fullscreen: false,
            set_size: (w: number, h: number) => {
              addLog(`Window resized: ${w}x${h}`);
              canvas.width = w;
              canvas.height = h;

              // Set up canvas context for pixel-perfect rendering
              const ctx = canvas.getContext('2d')!;
              ctx.imageSmoothingEnabled = false;

              host.onWindowChanged();
            },
            fullscreen: () => {
              addLog('Fullscreen requested');
            }
          };

          // Initialize with default size
          windowObj.set_size(640, 480);
          return windowObj;
        },
        screen: () => {
          return canvas.getContext('2d')!;
        },
        audio: (buf: Int16Array) => {
          // TODO: implement audio
        },
        stdout: (buf: Uint8Array) => {
          const text = new TextDecoder().decode(buf);
          host.onStdOut(text);
        },
        ensure_timer: (when: number) => {
          // TODO: implement timer
        },
        get_event: () => {
          return undefined;
        },
        win32_trace: (context: string, msg: string) => {
          console.log(`[TRACE ${context}] ${msg}`);
          if (context === 'user32' || context === 'gdi32') {
            addLog(`${context}: ${msg}`);
          }
        },
        stat: (path: string) => {
          console.log(`[FILE STAT] "${path}"`);
          const lowerPath = path.toLowerCase().replace(/\\/g, '/');
          const fileName = lowerPath.split('/').pop() || lowerPath;

          if (files.has(fileName)) {
            console.log(`[FILE EXISTS] "${path}" -> ${fileName}`);
            const nowNanos = Date.now() * 1000000; // Convert ms to nanoseconds
            return {
              kind: 0, // File (0 = File, 1 = Directory, 2 = Symlink)
              size: files.get(fileName)!.length,
              atime: nowNanos, // Access time in nanoseconds
              ctime: nowNanos, // Creation time in nanoseconds
              mtime: nowNanos  // Modification time in nanoseconds
            };
          }

          console.warn(`[FILE NOT EXISTS] "${path}"`);
          throw new Error(`File not found: ${path}`);
        }
      } as any;

      addLog("Creating emulator instance...");
      const emu = module.new_emulator(emuHost);
      emulatorInstance.current = emu;

      // Enable tracing to see what APIs are being called
      if (emu.set_tracing_scheme) {
        emu.set_tracing_scheme('-');
        addLog('Tracing enabled');
      }

      // Start the executable
      const cmdLine = exeName;
      addLog(`Starting ${cmdLine}...`);
      console.log('About to call start_exe with:', cmdLine);
      emu.start_exe(cmdLine, false);
      console.log('start_exe returned successfully');

      addLog("RetroWin32 started successfully");
      isRunningRef.current = true;
      setStatus(EmulatorState.RUNNING);

      // Start the execution loop
      let frameCount = 0;
      const runLoop = () => {
        if (!isRunningRef.current || !emulatorInstance.current) {
          return;
        }

        try {
          // Run a batch of instructions
          emulatorInstance.current.run(10000);

          // Log every 60 frames for debugging
          frameCount++;
          if (frameCount % 60 === 0) {
            console.log(`Emulator running, frame ${frameCount}`);
          }

          animationRef.current = requestAnimationFrame(runLoop);
        } catch (err: any) {
          // Check if this is a normal program exit
          const errMsg = err.message || '';
          if (errMsg.includes('jmp to null page') || errMsg.includes('addr=0')) {
            const exitCode = emulatorInstance.current?.exit_code ?? 0;
            console.log(`Program exited with code ${exitCode} (null page jump)`);
            addLog(`Program exited with code ${exitCode}`);
            isRunningRef.current = false;
            setStatus(EmulatorState.STOPPED);
          } else {
            console.error('Emulator run error:', err);
            isRunningRef.current = false;
            host.onError(err.message);
          }
        }
      };

      runLoop();

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
      />
      {settings.enableCRT && status === EmulatorState.RUNNING && <CRTOverlay />}

      {status === EmulatorState.BOOTING && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 text-indigo-500 font-mono">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="animate-pulse">RETROWIN32 INITIALIZING...</p>
        </div>
      )}

      {status === EmulatorState.ERROR && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-900 text-red-500 p-8 text-center">
          <p className="text-xl font-bold mb-2">RetroWin32 Error</p>
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
          <p className="font-mono text-sm tracking-wider text-zinc-500">READY TO BOOT</p>
          <p className="text-xs text-zinc-700 mt-2">Select software from the library</p>
        </div>
      )}
    </div>
  );
};
