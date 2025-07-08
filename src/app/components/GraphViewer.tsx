"use client";
import { Stage, Layer, Line, Circle, Text, Group, Rect } from "react-konva";
import { useGraphStore } from "@/store/useGraphStore";
import { useTheme } from "./ThemeProvider";
import { useRef, useState, useEffect, useCallback } from "react";

const NODE_RADIUS = 28;
const EDGE_WIDTH = 2;
const SELECTED_EDGE_WIDTH = 4;
const LABEL_FONT_SIZE = 14;
const LABEL_PADDING = 8;
const STAGE_MARGIN = 60;

function getNodeColor(selected: boolean, theme: string) {
  if (selected) return theme === "dark" ? "#facc15" : "#d97706";
  return theme === "dark" ? "#60a5fa" : "#2563eb";
}
function getEdgeColor(theme: string) {
  return theme === "dark" ? "#a3a3a3" : "#636363";
}
function getLabelBg(theme: string) {
  return theme === "dark" ? "#18181b" : "#fff";
}
function getLabelColor(theme: string) {
  return theme === "dark" ? "#fff" : "#18181b";
}

export default function GraphViewer() {
  // All hooks at the top, always called
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const setSelected = useGraphStore((s) => s.setSelected as (s: any) => void);
  const selected = useGraphStore((s) => s.selected);
  const { theme } = useTheme();
  const [positions, setPositions] = useState<{ [id: string]: { x: number; y: number } }>({});
  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [dragging, setDragging] = useState<string | null>(null);
  // Restore stageScale for zoom
  const [stageScale, setStageScale] = useState(1);
  // Restore stagePos state for panning
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // Responsive stage size
  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth - 320; // leave space for sidebar
      const h = window.innerHeight - 180; // leave space for editor/console
      setStageSize({ width: Math.max(w, 400), height: Math.max(h, 300) });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initial layout: circle
  useEffect(() => {
    if (!nodes.length) return;
    if (Object.keys(positions).length === nodes.length) return;
    if (hasMoved) return; // Don't auto-layout if user has moved a node
    const angleStep = (2 * Math.PI) / nodes.length;
    const cx = stageSize.width / 2, cy = stageSize.height / 2, r = Math.min(cx, cy) - STAGE_MARGIN;
    const pos: any = {};
    nodes.forEach((n, i) => {
      pos[n.id] = {
        x: cx + r * Math.cos(i * angleStep),
        y: cy + r * Math.sin(i * angleStep),
      };
    });
    setPositions(pos);
  }, [nodes, stageSize, hasMoved]);

  // Fit to screen only after all positions are set and before any node is moved
  useEffect(() => {
    if (!nodes.length) return;
    if (hasMoved) return;
    if (Object.keys(positions).length !== nodes.length) return;
    // fitToScreen(); // Removed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, stageSize.width, stageSize.height, positions, hasMoved]);

  // Handler for manual fit to screen
  const handleFitToScreen = () => {
    // fitToScreen(); // Removed
  };

  // Drag node
  const handleDragMove = (e: any, id: string) => {
    setPositions((prev) => ({ ...prev, [id]: { x: e.target.x(), y: e.target.y() } }));
    setHasMoved(true);
  };

  // Handle stage drag (panning)
  const handleStageDrag = (e: any) => {
    setStagePos({ x: e.target.x(), y: e.target.y() });
  };

  // Handle wheel for zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.08;
    const oldScale = stageScale;
    const pointer = stageRef.current.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  // Remove fitToScreen and manual fit button
  //     {/* Fit to Screen Button */}
  //     <button
  //       onClick={handleFitToScreen}
  //       className="absolute top-4 right-4 z-20 px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors"
  //       style={{ pointerEvents: 'auto' }}
  //     >
  //       Fit to Screen
  //     </button>

  // Only fit to screen when nodes or stage size changes (not positions)
  // useEffect(() => {
  //   fitToScreen();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [nodes.length, stageSize.width, stageSize.height, hasMoved]);

  // Only block rendering, not hook calls
  if (!mounted) {
    return <div className="flex-1 h-full" />; // or a skeleton/loader
  }

  if (!nodes.length && !edges.length) {
    return (
      <div className="flex-1 h-full flex items-center justify-center text-muted-foreground">
        Graph Viewer (Visualization coming soon)
      </div>
    );
  }

  return (
    <div className="">
      {/* Fit to Screen Button */}
      {/* Removed */}
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        draggable={dragging === null}
        onDragEnd={handleStageDrag}
        onWheel={handleWheel}
        style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)", 
          border: "1px solid #e5e7eb",marginTop: 10 }}
      >
        <Layer>
          {/* Edges */}
          {edges.map((edge: any, i: number) => {
            const src = positions[edge.source];
            const tgt = positions[edge.target];
            if (!src || !tgt) return null;
            const isSelected = selected && selected.id === edge.id;
            // Arrow
            const dx = tgt.x - src.x, dy = tgt.y - src.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const normX = dx / len, normY = dy / len;
            const arrowLen = 18, arrowWidth = 8;
            const arrowX = tgt.x - normX * NODE_RADIUS;
            const arrowY = tgt.y - normY * NODE_RADIUS;
            const arrowPoints = [
              arrowX,
              arrowY,
              arrowX - normY * arrowWidth / 2 - normX * arrowLen,
              arrowY + normX * arrowWidth / 2 - normY * arrowLen,
              arrowX + normY * arrowWidth / 2 - normX * arrowLen,
              arrowY - normX * arrowWidth / 2 - normY * arrowLen,
            ];
            // Fix label rendering
            let edgeLabel = edge.label;
            if (typeof edgeLabel === 'object' && edgeLabel !== null) {
              edgeLabel = JSON.stringify(edgeLabel);
            }
            
            return (
              <>
                <Line
                  key={edge.id}
                  points={[src.x, src.y, tgt.x, tgt.y]}
                  stroke={getEdgeColor(theme)}
                  strokeWidth={isSelected ? SELECTED_EDGE_WIDTH : EDGE_WIDTH}
                  opacity={0.9}
                  onClick={() => setSelected(edge)}
                  shadowForStrokeEnabled={false}
                />
                {/* Arrowhead */}
                <Line
                  key={edge.id + "-arrow"}
                  points={arrowPoints}
                  closed
                  fill={getEdgeColor(theme)}
                  opacity={0.9}
                  onClick={() => setSelected(edge)}
                  shadowForStrokeEnabled={false}
                />
                {/* Edge label */}
                {edge.label && (
                  <Text
                    key={edge.id + "-label"}
                    x={(src.x + tgt.x) / 2}
                    y={(src.y + tgt.y) / 2 - 18}
                    text={edgeLabel}
                    fontSize={LABEL_FONT_SIZE}
                    fill={getLabelColor(theme)}
                    align="center"
                    verticalAlign="middle"
                    padding={4}
                    listening={false}
                  />
                )}
              </>
            );
          })}
          {/* Nodes */}
          {nodes.map((node: any) => {
            const pos = positions[node.id];
            if (!pos) return null;
            const isSelected = !!(selected && selected.id === node.id);
            let label = (typeof node.label === 'string' && node.label.length > 0)
              ? node.label
              : (node.name ? node.name : node.id);
            if (typeof label === 'object' && label !== null) {
              label = JSON.stringify(label);
            }
            return (
              <Group
                key={node.id}
                x={pos.x}
                y={pos.y}
                draggable
                onDragMove={e => { handleDragMove(e, node.id); e.cancelBubble = true; }}
                onClick={() => setSelected(node)}
                onDragStart={e => { setDragging(node.id); e.cancelBubble = true; }}
                onDragEnd={e => { setDragging(null); e.cancelBubble = true; }}
                shadowForStrokeEnabled={false}
              >
                <Circle
                  radius={NODE_RADIUS}
                  fill={getNodeColor(isSelected, theme)}
                  stroke={isSelected ? "#facc15" : "#fff"}
                  strokeWidth={isSelected ? 4 : 2}
                  shadowBlur={isSelected ? 12 : 4}
                  shadowColor={isSelected ? "#facc15" : "#000"}
                  shadowOpacity={0.18}
                />
                {/* Label background */}
                <Rect
                  x={-((LABEL_FONT_SIZE * label.length + LABEL_PADDING) / 2)}
                  y={NODE_RADIUS + 8}
                  width={LABEL_FONT_SIZE * label.length + LABEL_PADDING}
                  height={LABEL_FONT_SIZE + 8}
                  fill={getLabelBg(theme)}
                  cornerRadius={6}
                  opacity={0.92}
                />
                <Text
                  x={-((LABEL_FONT_SIZE * label.length + LABEL_PADDING) / 2)}
                  y={NODE_RADIUS + 12}
                  text={label}
                  fontSize={LABEL_FONT_SIZE}
                  fill={getLabelColor(theme)}
                  align="center"
                  width={LABEL_FONT_SIZE * label.length + LABEL_PADDING}
                  height={LABEL_FONT_SIZE + 8}
                  verticalAlign="middle"
                  listening={false}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
