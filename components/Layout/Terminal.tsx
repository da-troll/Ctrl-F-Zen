import React, { useEffect, useRef } from 'react';
import { useEmulatorStore } from '../../store/emulatorStore';

export const Terminal: React.FC = () => {
  const { terminalLogs } = useEmulatorStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  return (
    <div className="h-32 bg-black border-t border-zinc-800 flex flex-col font-mono text-xs">
      <div className="flex items-center justify-between px-4 py-1 bg-zinc-900 border-b border-zinc-800">
        <span className="text-zinc-500">SYSTEM LOG</span>
        <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {terminalLogs.map((log, i) => (
          <div key={i} className="text-green-500/80 hover:text-green-400 transition-colors">
            <span className="mr-2 text-zinc-600">{'>'}</span>
            {log}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};