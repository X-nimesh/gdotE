"use client";
import React, { useState, useRef, useCallback } from "react";

interface ResizableLayoutProps {
  children: [React.ReactNode, React.ReactNode];
  direction?: "horizontal" | "vertical";
  defaultSize?: number;
  minSize?: number;
  className?: string;
}

export default function ResizableLayout({
  children,
  direction = "vertical",
  defaultSize = 50,
  minSize = 20,
  className = "",
}: ResizableLayoutProps) {
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      let newSize: number;
      if (direction === "vertical") {
        const totalHeight = rect.height;
        const mouseY = e.clientY - rect.top;
        newSize = (mouseY / totalHeight) * 100;
      } else {
        const totalWidth = rect.width;
        const mouseX = e.clientX - rect.left;
        newSize = (mouseX / totalWidth) * 100;
      }

      // Clamp to min/max sizes
      newSize = Math.max(minSize, Math.min(100 - minSize, newSize));
      setSize(newSize);
    },
    [isDragging, direction, minSize]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const isVertical = direction === "vertical";
  const containerClass = isVertical ? "flex-col" : "flex-row";
  const handleClass = isVertical 
    ? "h-1 cursor-ns-resize bg-gray-200 hover:bg-gray-300 rounded" 
    : "w-1 cursor-ew-resize bg-gray-200 hover:bg-gray-300 rounded";

  return (
    <div
      ref={containerRef}
      className={`flex ${containerClass} ${className}`}
      style={{ userSelect: isDragging ? "none" : "auto" }}
    >
      <div style={{ [isVertical ? "height" : "width"]: `${size}%` }}>
        {children[0]}
      </div>
      <div
        className={`transition-colors ${handleClass}`}
        onMouseDown={handleMouseDown}
      />
      <div style={{ [isVertical ? "height" : "width"]: `${100 - size}%` }}>
        {children[1]}
      </div>
    </div>
  );
} 