"use client";
import { useGraphStore } from "@/store/useGraphStore";
import JsonView from '@uiw/react-json-view';
import { useMemo } from "react";

export default function Sidebar() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const selected = useGraphStore((s) => s.selected);

  // Extract unique vertex and edge types from data
  const vertexTypes = useMemo(() => Array.from(new Set(nodes.map(n => n.label || "Vertex"))), [nodes]);
  const edgeTypes = useMemo(() => Array.from(new Set(edges.map(e => e.label || "Edge"))), [edges]);

  return (
    <aside className="bg-white border-r border-gray-200 h-full w-full flex flex-col rounded-l-lg shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <div className="mb-2">
          <label className="block text-xs mb-1">Vertex Type</label>
          <select className="w-full border rounded px-2 py-1">
            {vertexTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Edge Type</label>
          <select className="w-full border rounded px-2 py-1">
            {edgeTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <div className="mb-2 font-semibold text-sm">Selected Properties</div>
        {selected ? (
          <JsonView
            value={selected}
            collapsed={2}
            enableClipboard={true}
            style={{ fontSize: 14, fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
          />
        ) : (
          <div className="text-xs text-muted-foreground">Select a node or edge to inspect properties.</div>
        )}
      </div>
    </aside>
  );
}
