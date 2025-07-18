import { create } from "zustand";
import { GremlinConnection } from "@/utils/gremlinClient";

export interface NodeData {
  id: string;
  label?: string;
  [key: string]: any;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  [key: string]: any;
}

interface GraphStore {
  query: string;
  setQuery: (q: string) => void;
  connectionString: string;
  setConnectionString: (s: string) => void;
  currentConnection: GremlinConnection | null;
  setCurrentConnection: (connection: GremlinConnection | null) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  nodes: NodeData[];
  setNodes: (n: NodeData[]) => void;
  edges: EdgeData[];
  setEdges: (e: EdgeData[]) => void;
  selected: NodeData | EdgeData | null;
  setSelected: (s: NodeData | EdgeData | null) => void;
  consoleOutput: string;
  setConsoleOutput: (o: string) => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
  query: "",
  setQuery: (q) => set({ query: q }),
  connectionString: "",
  setConnectionString: (s) => set({ connectionString: s }),
  currentConnection: null,
  setCurrentConnection: (connection) => set({ currentConnection: connection }),
  isConnected: false,
  setIsConnected: (connected) => set({ isConnected: connected }),
  nodes: [],
  setNodes: (n) => set({ nodes: n }),
  edges: [],
  setEdges: (e) => set({ edges: e }),
  selected: null,
  setSelected: (s) => set({ selected: s }),
  consoleOutput: "",
  setConsoleOutput: (o) => set({ consoleOutput: o }),
}));
