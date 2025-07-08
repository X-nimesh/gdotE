# gdotV()


## Overview

gdotV() is a modern, interactive web application for visualizing, editing, and querying property graphs using Gremlin. It provides a beautiful, user-friendly interface for connecting to Gremlin-compatible databases (like Cosmos DB, JanusGraph, TinkerPop, etc.), running queries, and exploring graph data visually and in JSON format.

---

## Features

- **Gremlin Query Editor:**
  - Monaco-based code editor with syntax highlighting for Gremlin.
  - Run queries directly against your Gremlin-compatible database.
  - Connection modal for Cosmos DB and local Gremlin servers.

- **Graph Visualization:**
  - Interactive, draggable, and zoomable graph viewer (Konva-based).
  - Nodes and edges are labeled and color-coded.
  - Resizable and pannable graph area.
  - Vertex and edge types are clearly displayed.

- **JSON Output & Inspector:**
  - Console output panel shows query results as formatted, color-coded, collapsible JSON (using react-json-view).
  - Sidebar "Selected Properties" panel for inspecting node/edge details in JSON.
  - Both panels are resizable and scrollable.

- **Modern UI/UX:**
  - Clean, light theme with subtle shadows, rounded corners, and soft colors.
  - Responsive layout with resizable panels (Editor, Console, Graph, Sidebar).
  - No dark mode for simplicity and clarity.

- **Other Features:**
  - Connection string management.
  - Error handling and validation for queries and connections.
  - JSON formatting and validation for connection input.

---

## Tech Stack

- **Frontend:** React 19, Next.js 14, TypeScript
- **Graph Visualization:** react-konva
- **JSON Viewer:** react-json-view
- **Editor:** @monaco-editor/react
- **State Management:** Zustand
- **Styling:** Tailwind CSS, custom CSS

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
npm install
```

### Running the App
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. **Connect to a Gremlin Database:**
   - Click "Connect" and enter your Cosmos DB JSON or local Gremlin server URL.
2. **Write and Run Queries:**
   - Use the Monaco editor to write Gremlin queries (e.g., `g.V()`, `g.E()`, etc.).
   - Click "Run Query" to execute.
3. **Explore the Graph:**
   - Drag, pan, and zoom the graph.
   - Click nodes/edges to inspect properties in the sidebar.
4. **View Results:**
   - See formatted JSON output in the Console Output panel.
   - Resize panels as needed for your workflow.

---

## Screenshots

> _Add screenshots here to showcase the UI and features._

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

MIT
