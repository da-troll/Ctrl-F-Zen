# Running TrackWords (1998)

TrackWords is a Win32 executable that requires Windows emulation to run in the browser.

## Current Status

**Boxedwine integration is experimental and not yet working** in the RetroWin web app due to technical complexity. The code exists in the repository but is temporarily disabled.

## How to Run TrackWords Now

### Option 1: Standalone Boxedwine (Recommended)

Download and run Boxedwine locally on your Mac:

1. **Download Boxedwine for macOS:**
   - Visit: https://github.com/danoon2/Boxedwine/releases
   - Or build from source (requires Xcode)

2. **Run TrackWords:**
   ```bash
   # If you have a Boxedwine binary:
   /path/to/boxedwine /Users/danieltollefsen/Downloads/Trkwd122/TrackWords.exe
   ```

### Option 2: Wine on macOS

Use Wine directly (via Homebrew):

```bash
# Install Wine
brew install --cask wine-stable

# Run TrackWords
wine /Users/danieltollefsen/Downloads/Trkwd122/TrackWords.exe
```

## What We Tried

### Boxedwine Web Integration Attempts

1. **Direct Integration (Failed)**
   - Issue: Complex filesystem setup, ZIP file mounting
   - Required: BrowserFS + manual Emscripten FS configuration

2. **Shell.js Integration (Failed)**
   - Issue: shell.js designed for standalone HTML, expects specific DOM structure
   - Required: Many stub elements, Config initialization timing issues

3. **Iframe Embedding (Failed)**
   - Issue: Sandbox restrictions, script conflicts, initialization errors
   - Mount errors: "EBUSY", missing filesystem functions

4. **New Window Approach (Partial Success)**
   - Wine runs successfully in new window
   - **Missing:** File upload UI doesn't appear
   - Shell.js initialization incomplete

## Technical Details

### What Works
- ✅ Boxedwine loads and runs
- ✅ Wine boots and shows Explorer
- ✅ WASM compilation successful
- ✅ Canvas rendering functional

### What Doesn't Work
- ❌ File upload UI (hidden/not initialized)
- ❌ Config initialization timing
- ❌ Shell.js DOM dependencies
- ❌ Filesystem mounting in browser context

### Files Created
- `components/Emulator/BoxedwineScreen.tsx` - React component (new window approach)
- `public/boxedwine-inline.html` - Simplified UI attempt
- `public/boxedwine-example.html` - Fixed standalone demo
- `public/boxedwine.js` - Main WASM runtime (280KB)
- `public/boxedwine.wasm` - Compiled emulator (1.3MB)
- `public/boxedwine_full.zip` - Wine filesystem (60MB)
- `public/files.zip` - App storage

## Future Work

### Approach 1: Custom Boxedwine UI
Build a custom interface without shell.js:
- Direct BrowserFS usage
- Manual Emscripten FS API calls
- Custom file upload handler
- Skip shell.js entirely

### Approach 2: Different Emulator
- **v86 + Windows 3.1**: Lighter, might work
- **JSLinux + Wine**: Alternative approach
- **QEMU.js**: Full system emulation

### Approach 3: Server-Side
- Run Boxedwine on server
- Stream display via VNC/noVNC
- More reliable but requires backend

## Conclusion

**For now, use standalone Wine or Boxedwine** to run TrackWords locally. The web integration remains an interesting technical challenge for future development.

The RetroWin app currently focuses on DOS games via v86, which works reliably.
