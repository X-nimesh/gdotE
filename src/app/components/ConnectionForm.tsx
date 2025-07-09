"use client";
import { useState } from "react";
import ConnectionModal from "./ConnectionModal";
import { useGraphStore } from "@/store/useGraphStore";
import { gremlinClient } from "@/utils/gremlinClient";

export default function ConnectionForm() {
  const [open, setOpen] = useState(false);
  const isConnected = useGraphStore((s) => s.isConnected);
  const currentConnection = useGraphStore((s) => s.currentConnection);
  const setCurrentConnection = useGraphStore((s) => s.setCurrentConnection);
  const setIsConnected = useGraphStore((s) => s.setIsConnected);
  const setConnectionString = useGraphStore((s) => s.setConnectionString);
  const setConsoleOutput = useGraphStore((s) => s.setConsoleOutput);

  const handleDisconnect = async () => {
    try {
      await gremlinClient.disconnect();
      setCurrentConnection(null);
      setIsConnected(false);
      setConnectionString("");
      setConsoleOutput("Disconnected from Gremlin server");
    } catch (e: any) {
      setConsoleOutput(`Error disconnecting: ${e.message}`);
    }
  };

  return (
    <>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded border border-green-300 bg-green-50 text-green-700 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Connected
          </div>
          <button
            className="px-4 py-1 rounded border border-gray-300 bg-white text-black font-semibold shadow-sm hover:bg-gray-100 transition-colors"
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
        </div>
      ) : (
          <button
            className="px-4 py-1 rounded border border-gray-300 bg-white text-black font-semibold shadow-sm hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(true)}
          >
            Connect
          </button>
      )}
      <ConnectionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
