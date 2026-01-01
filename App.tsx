import React from 'react';
import { Library } from './components/Library/Library';
import { V86Screen } from './components/Emulator/V86Screen';
import { BoxedwineScreen } from './components/Emulator/BoxedwineScreen';
import { ControlBar } from './components/Layout/ControlBar';
import { Terminal } from './components/Layout/Terminal';
import { useEmulatorStore } from './store/emulatorStore';

export default function App() {
  const { activeGame } = useEmulatorStore();

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">

      {/* Left Sidebar: Game Library */}
      <aside className="hidden md:block shadow-xl z-20">
        <Library />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">

        {/* Top Control Bar */}
        <ControlBar />

        {/* Emulator Viewport */}
        <div className="flex-1 p-6 flex flex-col min-h-0 bg-[#0c0c0e]">
            <div id="emulator-container" className="flex-1 relative rounded-lg overflow-hidden shadow-2xl ring-1 ring-zinc-800">
                {activeGame?.emulator === 'boxedwine' ? <BoxedwineScreen /> : <V86Screen />}
            </div>
        </div>

        {/* Bottom Terminal Log */}
        <Terminal />
      </main>
      
      {/* Mobile Disclaimer (Hidden on desktop) */}
      <div className="md:hidden absolute inset-0 bg-black z-50 flex items-center justify-center p-8 text-center">
        <div>
            <h1 className="text-2xl font-bold mb-2">Desktop Required</h1>
            <p className="text-zinc-500">x86 Emulation requires significant resources and a physical keyboard. Please visit on a desktop computer.</p>
        </div>
      </div>
    </div>
  );
}