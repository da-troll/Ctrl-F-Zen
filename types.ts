export type EmulatorType = 'v86';

export interface GameConfig {
  id: string;
  title: string;
  year: number;
  description: string;
  coverImage: string;
  type: 'win98' | 'dos' | 'custom' | 'exe';
  emulator: EmulatorType;

  // v86 disk images
  floppyUrl?: string;
  fdbUrl?: string;
  cdromUrl?: string;
  hdaUrl?: string;
  hdaSize?: number; // size in bytes for hda
  biosUrl?: string;
  vgaUrl?: string;
  memorySize: number; // in bytes

  // For tracking .exe files (will boot FreeDOS and exe can be run manually)
  executableUrl?: string;
  cmdArgs?: string[];
}

export enum EmulatorState {
  STOPPED = 'STOPPED',
  BOOTING = 'BOOTING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR'
}

export interface EmulatorSettings {
  enableAudio: boolean;
  enableCRT: boolean;
  memorySize: number;
  bootOrder: number; // 0x213 = CD, Floppy, HD
}

// Minimal typing for the V86 constructor options
export interface V86StarterOptions {
  wasm_path: string;
  memory_size: number;
  vga_memory_size: number;
  screen_container: HTMLElement | null;
  bios: { url: string };
  vga_bios: { url: string };
  cdrom?: { url: string; async?: boolean };
  hda?: { url: string; size?: number; async?: boolean };
  fda?: { url: string; async?: boolean };
  fdb?: { url: string; async?: boolean };
  autostart: boolean;
  disable_keyboard?: boolean;
  disable_mouse?: boolean;
  network_relay_url?: string;
}

export interface V86Instance {
  destroy: () => void;
  stop: () => void;
  run: () => void;
  save_state: () => Promise<ArrayBuffer>;
  restore_state: (state: ArrayBuffer) => Promise<void>;
  add_listener: (event: string, callback: (data: any) => void) => void;
  remove_listener: (event: string, callback: (data: any) => void) => void;
  lock_mouse: () => void;
  keyboard_send_scancodes: (codes: number[]) => void;
}
