# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ctrl+F+Zen is a React-based x86 emulator interface that runs legacy DOS and Windows applications directly in the browser using the v86 emulator. It can boot DOS/Windows operating systems from disk images and run vintage software.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture Overview

### V86 Emulator System

The app uses a single emulator component:

- **V86Screen** (`components/Emulator/V86Screen.tsx`): Full x86 emulation using the v86 library. Boots complete OS images (floppy, CD-ROM, HDA) and can run DOS, Windows 98, and other x86 operating systems.

### State Management

Global state is managed via Zustand with Immer middleware in `store/emulatorStore.ts`:

```typescript
interface EmulatorStore {
  status: EmulatorState;          // STOPPED, BOOTING, RUNNING, PAUSED, ERROR
  activeGame: GameConfig | null;  // Currently loaded game
  settings: EmulatorSettings;     // CRT filter, audio, memory settings
  terminalLogs: string[];         // Max 50 entries, auto-pruned
  customGames: GameConfig[];      // User-uploaded games
}
```

State transitions:
1. User clicks game → `loadGame()` sets `activeGame` and status to `BOOTING`
2. Emulator component detects `BOOTING` → initializes emulator
3. On ready → `setStatus(RUNNING)`
4. Logs are added via `addLog()` throughout the process

### Component Structure

```
App.tsx
├── Library (sidebar)
│   ├── GameCard × N
│   └── File upload button
├── ControlBar (top bar)
├── Emulator Container
│   └── V86Screen
└── Terminal (bottom log panel)
```

### Game Configuration System

Games are defined in `Library.tsx` and follow the `GameConfig` type in `types.ts`:

```typescript
interface GameConfig {
  emulator: 'v86';
  type: 'win98' | 'dos' | 'custom' | 'exe';

  // v86 disk images
  floppyUrl?: string;  // Boot floppy disk image
  cdromUrl?: string;   // CD-ROM image
  hdaUrl?: string;     // Hard disk image

  // For .exe files (boots FreeDOS, exe can be run from DOS prompt)
  executableUrl?: string;
}
```

All games use v86 emulation. For .exe files, FreeDOS is automatically mounted as the boot floppy.

### V86 Integration

The v86 library is loaded via **import map** in `index.html` (lines 34-46), not via npm. This is critical:

```html
<script type="importmap">
{
  "imports": {
    "v86": "https://cdn.jsdelivr.net/npm/v86@latest/build/libv86.js"
  }
}
</script>
```

The v86 assets (WASM, BIOS) are loaded from **jsDelivr CDN** (reliable and fast) defined in `V86Screen.tsx`:

```typescript
const V86_ASSETS = {
  wasmUrl: "https://cdn.jsdelivr.net/npm/v86@latest/build/v86.wasm",
  biosUrl: "https://cdn.jsdelivr.net/npm/v86@latest/bios/seabios.bin",
  vgaUrl: "https://cdn.jsdelivr.net/npm/v86@latest/bios/vgabios.bin"
};
```

**Important**: The original URLs from unpkg.com and copy.sh are no longer functional. All v86 assets now use jsDelivr CDN which is reliable and actively maintained. FreeDOS disk images are loaded from `https://i.copy.sh/freedos722.img` (CORS-enabled). Other disk images (Windows 98, etc.) must be provided by users or sourced from [Internet Archive](https://archive.org/details/FD12CD) or [FreeDOS.org](https://freedos.org/download/).

### File Upload Workflow

Users can upload disk images or executables via the Library component:

1. File input accepts `.iso, .img, .bin, .exe, .com`
2. File is converted to blob URL via `URL.createObjectURL()`
3. File type determines configuration:
   - `.img/.floppy` → Mounted as floppy disk
   - `.iso` → Mounted as CD-ROM
   - `.exe` → FreeDOS boots, .exe tracked for manual execution
4. New `GameConfig` is created and added to `customGames` store
5. Game is immediately loaded

**Important**: Blob URLs are ephemeral. They persist only for the current browser session.

**Note on .exe files**: When uploading a .exe file, the system boots FreeDOS. Users must then run the .exe manually from the DOS prompt. For a better experience, create a floppy disk image containing both FreeDOS and the executable.

### CRT Effect

The CRT overlay (`components/Emulator/CRTOverlay.tsx`) is conditionally rendered when `settings.enableCRT` is true and emulator status is `RUNNING`. Toggle via `toggleCRT()` action in the store.

### Environment Variables

No environment variables are required for this project.

## Important Notes

- **No test suite**: There are no tests configured. When adding tests, you'll need to set up a testing framework.
- **TypeScript strict mode**: The project uses TypeScript 5.8 with standard strictness.
- **Tailwind via CDN**: Tailwind CSS is loaded from CDN in `index.html`, not via PostCSS. This is for development only - production builds should use PostCSS or Tailwind CLI.
- **React 19**: Uses the latest React version with new JSX transform.
- **No routing**: This is a single-page app with no routing library. Navigation is state-based.
- **Mobile blocker**: The app displays a "Desktop Required" overlay on mobile devices (App.tsx:42-47).
- **CDN Dependencies**: All dependencies (React, Zustand, v86) are loaded from CDNs (esm.sh for React/Zustand, jsDelivr for v86). These are reliable but require internet connectivity.

## Adding New Games

1. Add game config to `GAMES` array in `Library.tsx`
2. Ensure URLs point to valid disk images (.img, .iso, .bin)
3. Set appropriate `memorySize` (DOS: 32-64MB, Win98: 128MB+)
4. Set `emulator: 'v86'` (only emulator supported)
5. Test that the game boots correctly and monitor `terminalLogs` for errors

## Working with .exe Files

To run .exe files in v86:
1. Boot FreeDOS (provided automatically when uploading .exe)
2. At the DOS prompt, navigate to drive containing the .exe
3. Run the executable manually

**Better approach**: Create a disk image (.img) containing both FreeDOS and your .exe files using tools like:
- DiskExplorer (Windows)
- dd + mount (Linux/Mac)
- ImDisk (Windows)
