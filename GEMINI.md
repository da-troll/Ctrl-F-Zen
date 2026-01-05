# Ctrl+F+Zen Context

## Project Overview
Ctrl+F+Zen is a React-based x86 emulator interface designed to run legacy DOS and Windows applications directly in the browser. It leverages WebAssembly (WASM) to integrate emulators like **v86**, **Boxedwine**, and **RetroWin32**, offering a seamless, client-side retro computing experience.

**Key Technologies:**
- **Frontend:** React 19, Vite 6, TypeScript 5.8
- **State Management:** Zustand (with Immer middleware)
- **Styling:** Tailwind CSS
- **Emulation:** WebAssembly (WASM) integrations for v86, Boxedwine, and RetroWin32

## Architecture
The application follows a standard React component structure, orchestrated by a central Zustand store.

- **Entry Point:** `src/index.tsx` mounts the application.
- **Main Layout:** `App.tsx` handles the primary layout, including the sidebar (Library), top bar (ControlBar), main emulator viewport, and bottom terminal.
- **State Management:** `store/emulatorStore.ts` holds the global state, including:
  - `status`: Current emulator state (STOPPED, BOOTING, RUNNING, ERROR).
  - `activeGame`: Configuration for the currently loaded software.
  - `settings`: User preferences (audio, CRT effect, memory).
  - `terminalLogs`: System logs displayed in the terminal component.

## Key Directories & Files

### `src/`
- **`components/`**: UI components broken down by function.
  - **`Emulator/`**: Screen components for specific emulators (`RetroWin32Screen.tsx`, `V86Screen.tsx`, `BoxedwineScreen.tsx`) and effects (`CRTOverlay.tsx`).
  - **`Layout/`**: Structural components like `ControlBar.tsx` and `Terminal.tsx`.
  - **`Library/`**: Game selection interface (`Library.tsx`, `GameCard.tsx`).
- **`store/`**: Contains `emulatorStore.ts` for global state management.
- **`emulators/`**: Contains glue code and type definitions for emulator integrations (e.g., `retrowin32/glue.js`).

### `public/`
Contains static assets served directly:
- **Emulator Binaries:** WASM files (`boxedwine.wasm`, `glue_bg.wasm`), emulator scripts (`boxedwine.js`).
- **Disk Images:** OS images (`freedos722.img`).
- **Executables:** Sample DOS/Windows executables (`TrackWords.exe`, `SimpleWindow.exe`) and data files.

## Emulator Integration
Emulators are integrated as React components that manage the WASM lifecycle.

**Example: `RetroWin32Screen.tsx`**
- **WASM Loading:** Dynamically imports the glue code and initializes the WASM module.
- **File System:** Fetches executables and data files from `public/` and maps them into the emulator's virtual file system.
- **Host Interface:** Implements a `host` object to handle emulator callbacks (stdout, errors, window changes).
- **Render Loop:** Uses `requestAnimationFrame` to drive the emulator's execution loop (`run(steps)`).
- **Canvas:** Renders the emulator's video output to a `<canvas>` element.

## Development

**Prerequisites:** Node.js

**Setup:**
```bash
npm install
```

**Development Server:**
```bash
npm run dev
```
Runs Vite on `http://localhost:3000`.

**Build:**
```bash
npm run build
```
Generates a production build.

## Common Patterns
- **Logging:** Use `addLog(message)` from `useEmulatorStore` to write to the on-screen terminal.
- **State Updates:** State is immutable but updated mutably via Immer in Zustand actions.
- **Emulator Props:** Emulator components generally listen to `activeGame` and `status` from the store to trigger boot/shutdown sequences.
