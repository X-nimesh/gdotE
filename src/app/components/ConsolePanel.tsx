"use client";
import { useGraphStore } from "@/store/useGraphStore";
import JsonView from '@uiw/react-json-view';
import { useEffect, useState } from "react";

export default function ConsolePanel() {
  const consoleOutput = useGraphStore((s) => s.consoleOutput);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  let json: any = null;
  let isJson = false;
  try {
    json = JSON.parse(consoleOutput);
    isJson = typeof json === "object" && json !== null;
  } catch {
    json = null;
    isJson = false;
  }

  if (!mounted) return null;

  return (
    <div className="h-full w-full flex flex-col min-w-0 bg-white border border-gray-200 rounded-lg shadow-md min-w-[160px] ml-2">
      <div className="font-bold text-base px-4 pt-4 pb-2 border-b border-gray-200 bg-white rounded-t-lg sticky top-0 z-10">Console Output</div>
      <div className="flex-1 min-h-0 overflow-auto overflow-x-auto whitespace-pre p-4 text-gray-700 text-sm font-mono">
        {isJson ? (
          <JsonView
            value={json}
            collapsed={false}
            enableClipboard={true}
            style={{ fontSize: 14, fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
          />
        ) : (
          consoleOutput?.length > 0 ? consoleOutput : <span className="text-gray-400">Console Output (Results, errors, logs)</span>
        )}
      </div>
    </div>
  );
}
