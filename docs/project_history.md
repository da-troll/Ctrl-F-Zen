# Project History & Developer Guide

## Overview
This document summarizes the development history, architectural pivots, and technical challenges encountered in the Ctrl+F+Zen project. It serves as a guide to prevent future AI agents or developers from repeating unsuccessful experiments or encountering solved issues.

## 1. Evolution of Emulation Strategy

The project has evolved through three distinct phases of emulation strategy:

### Phase 1: V86 & Full OS Emulation (Foundation)
- **Goal:** Run DOS and Windows 98 disk images.
- **Implementation:** Integrated `v86` (x86 emulator in WASM).
- **Status:** **Active**. Used for DOS games (e.g., Doom) and full OS images.
- **Key Learnings:**
    - **Asset Loading:** V86 requires specific `bios` and `vga_bios` files.
    - **Performance:** Good for DOS, heavy for Windows 98.

### Phase 2: The "RetroWin32" Experiment (Deprecated)
- **Goal:** Run standalone Windows `.exe` files directly without booting a full OS.
- **Attempt:** Tried to integrate `retrowin32` (a Rust-based Win32 emulator).
- **Outcome:** **Failed/Abandoned**.
    - `retrowin32` is not available as a standard npm package or easily embeddable library.
    - It requires a complex Rust toolchain to build from source.
    - A "mock" component was temporarily created but removed.
    - **Lesson:** Do not attempt to use `retrowin32` unless you are prepared to build custom WASM binaries from Rust sources.

### Phase 3: Boxedwine Integration (Current Standard for Win32)
- **Goal:** Run Windows applications (Win32) efficiently in the browser.
- **Implementation:** Integrated `Boxedwine` (Wine compiled to WASM).
- **Status:** **Active**. This is the preferred solution for running Windows applications (.exe) as it simulates the Win32 API rather than emulating full hardware for an OS.
- **Benefits:** Lighter weight than booting Windows 98 in V86; runs standard Windows apps.

## 2. Technical Challenges & Solutions

### A. CDN & Asset Delivery (Critical)
*   **Issue:** Relying on `unpkg.com` for v86 files caused `404 Not Found` errors (version mismatch).
*   **Issue:** Relying on `copy.sh` for disk images caused **CORS errors** (Cross-Origin Resource Sharing blocked requests from localhost).
*   **Solution:**
    *   **Libraries:** Use `jsDelivr` (`cdn.jsdelivr.net`) for stable library access.
    *   **Assets:** **Do not** link directly to `copy.sh` or `archive.org` from the client-side code unless you are certain they send CORS headers.
    *   **Best Practice:** Host essential assets (BIOS, small disk images) locally in `public/` or use a verified CORS-enabled CDN.

### B. V86 Module Loading
*   **Issue:** `import { V86Starter } from 'v86'` failed because the library exposes a global variable, not a standard ES module export in some builds.
*   **Solution:** Load the script via a `<script>` tag in `index.html` and access it via `window.V86`.
    ```typescript
    // In V86Screen.tsx
    const instance = new (window as any).V86(options);
    ```

### C. React StrictMode & Double Logging
*   **Issue:** Console logs were duplicated, and emulators tried to boot twice.
*   **Cause:** React 18/19 `StrictMode` unmounts and remounts components in development.
*   **Solution:** `StrictMode` was disabled in `index.tsx` to prevent emulator state conflicts during development.

## 3. Current Architecture

*   **App.tsx**: The main router/layout.
*   **Library**: Manages game selection. Configures which emulator to use based on the `type`:
    *   `type: 'dos'` -> **V86** (boots FreeDOS/Doom).
    *   `type: 'win32'` / `.exe` -> **Boxedwine** (runs Windows binaries).
*   **Store**: `emulatorStore.ts` manages global state (running, stopped, logs).

## 4. Development Guidelines for Future Agents

1.  **Do NOT re-implement RetroWin32.** It has been investigated and rejected due to integration complexity.
2.  **Verify CORS.** Before adding a new remote URL for a disk image, verify it allows CORS. If not, the feature will fail.
3.  **Emulator Selection:**
    *   Use **V86** for DOS games and raw disk images (`.img`, `.iso`).
    *   Use **Boxedwine** for Windows executables (`.exe`).
4.  **Asset Locations:** Check `public/` for available BIOS and test images before trying to fetch them from external sources.
