"use client";
import { useState } from "react";
import { useGraphStore } from "@/store/useGraphStore";

interface ConnectionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ConnectionModal({ open, onClose }: ConnectionModalProps) {
  const [type, setType] = useState<"cosmos" | "local">("cosmos");
  const [endpoint, setEndpoint] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [testing, setTesting] = useState(false);
  const setConnectionString = useGraphStore((s) => s.setConnectionString);
  const setConsoleOutput = useGraphStore((s) => s.setConsoleOutput);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setJsonError("");
    let testPayload: any = {};
    if (type === "cosmos") {
      let parsed: any;
      try {
        parsed = JSON.parse(jsonInput);
      } catch {
        setJsonError("Invalid JSON");
        setTesting(false);
        return;
      }
      const { gremlinEndpoint, key, database, collection } = parsed || {};
      if (!gremlinEndpoint || !key || !database || !collection) {
        setJsonError("All fields (gremlinEndpoint, key, database, collection) are required.");
        setTesting(false);
        return;
      }
      testPayload = {
        connectionString: gremlinEndpoint,
        cosmosKey: key,
        cosmosDatabase: database,
        cosmosCollection: collection,
      };
    } else {
      if (!endpoint) {
        setConsoleOutput("Please enter the Gremlin server URL.");
        setTesting(false);
        return;
      }
      testPayload = { connectionString: endpoint };
    }
    try {
      const res = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });
      const data = await res.json();
      if (data.success) {
        setConnectionString(testPayload.connectionString);
        setConsoleOutput(`✅ Connected to: ${testPayload.connectionString}`);
        onClose();
      } else {
        setConsoleOutput(`❌ Connection failed: ${data.error}`);
      }
    } catch (e: any) {
      setConsoleOutput(`❌ Connection error: ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="bg-white rounded-xl shadow-lg p-8 min-w-[680px] max-w-[90vw] border border-gray-200">
        <h2 className="text-lg font-bold mb-4">Connect to Gremlin Database</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Connection Type</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={type}
              onChange={e => setType(e.target.value as any)}
            >
              <option value="cosmos">Azure Cosmos DB (JSON)</option>
              <option value="local">Local/Other Gremlin Server</option>
            </select>
          </div>
          {type === "cosmos" ? (
            <div>
              <label className="block text-sm font-medium mb-1">Connection JSON</label>
              <div className="flex gap-2 items-start">
                <textarea
                  className="w-full border rounded px-3 py-2 font-mono text-sm min-h-[180px] bg-gray-50 focus:bg-white transition-all"
                  placeholder={`{
  "gremlinEndpoint": "wss://...gremlin.cosmos.azure.com:443/",
  "key": "...",
  "database": "...",
  "collection": "..."
}`}
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                  spellCheck={false}
                />
                <button
                  type="button"
                  className="ml-2 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-semibold border border-gray-300 shadow-sm"
                  onClick={() => {
                    try {
                      setJsonInput(JSON.stringify(JSON.parse(jsonInput), null, 2));
                    } catch {}
                  }}
                  title="Format JSON"
                >
                  Format
                </button>
              </div>
              {jsonError && <div className="text-red-500 text-xs mt-1">{jsonError}</div>}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">Gremlin Server URL</label>
              <input
                className="w-full border rounded px-2 py-1"
                type="text"
                placeholder="ws://localhost:8182"
                value={endpoint}
                onChange={e => setEndpoint(e.target.value)}
              />
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-secondary px-4 py-1 rounded"
              onClick={onClose}
              disabled={testing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 py-1 rounded disabled:opacity-50"
              disabled={testing}
            >
              {testing ? "Testing..." : "Connect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 