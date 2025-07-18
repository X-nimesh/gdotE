"use client";
import { useGraphStore } from "@/store/useGraphStore";
import dynamic from "next/dynamic";
import { useCallback, useRef, useEffect, useState } from "react";
import { parseGremlinResults } from "@/utils/gremlinHelpers";
import { gremlinClient } from "@/utils/gremlinClient";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function Editor() {
  const query = useGraphStore((s) => s.query);
  const setQuery = useGraphStore((s) => s.setQuery);
  const connectionString = useGraphStore((s) => s.connectionString);
  const currentConnection = useGraphStore((s) => s.currentConnection);
  const isConnected = useGraphStore((s) => s.isConnected);
  const setNodes = useGraphStore((s) => s.setNodes);
  const setEdges = useGraphStore((s) => s.setEdges);
  const setConsoleOutput = useGraphStore((s) => s.setConsoleOutput);
  const [loading, setLoading] = useState(false);

  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleChange = useCallback((value: string | undefined) => {
    setQuery(value || "");
  }, [setQuery]);

  // Track pixel size of container and update Monaco
  useEffect(() => {
    if (!mounted || typeof window === "undefined" || !containerRef.current) return;
    const updateSize = () => {
      const rect = containerRef.current!.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
      if (editorRef.current) editorRef.current.layout();
    };
    updateSize();
    const observer = new window.ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mounted]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    setTimeout(() => editor.layout(), 0);
  };

  const runQuery = async () => {
    if (!query.trim()) {
      setConsoleOutput("Please enter a query.");
      return;
    }

    if (!isConnected || !currentConnection) {
      setConsoleOutput("Please connect to a Gremlin server first.");
      return;
    }

    setLoading(true);
    setConsoleOutput("Running query...");

    try {
      // Connect to the database
      await gremlinClient.connect(currentConnection);

      // Execute the query
      const result = await gremlinClient.executeQuery(query);

      // Disconnect after query execution
      await gremlinClient.disconnect();

      console.log({ raw: result });
      const { nodes, edges } = parseGremlinResults(result);
      setNodes(nodes);
      setEdges(edges);
      setConsoleOutput(JSON.stringify(result, null, 2));
    } catch (e: any) {
      setConsoleOutput(`Error: ${e.message}`);
      setNodes([]);
      setEdges([]);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col relative bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        {dimensions.width > 0 && dimensions.height > 0 && (
          <>
            <MonacoEditor
              height={dimensions.height}
              width={dimensions.width}
              defaultLanguage="gremlin"
              theme="vs-dark"
              value={query}
              onChange={handleChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                scrollBeyondLastLine: false,
                automaticLayout: false,
              }}
            />
            <button
              className="absolute bottom-4 right-4 z-10 px-5 py-2 rounded-lg shadow-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              style={{ boxShadow: "0 4px 16px 0 rgba(0,0,0,0.12)" }}
              onClick={runQuery}
              disabled={loading || !isConnected}
            >
              {loading ? "Running..." : "Run Query"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
