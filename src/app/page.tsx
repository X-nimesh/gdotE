"use client";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import dynamic from "next/dynamic";
const GraphViewer = dynamic(() => import("./components/GraphViewer"), { ssr: false });
import ConsolePanel from "./components/ConsolePanel";
import ConnectionForm from "./components/ConnectionForm";
import ResizableLayout from "./components/ResizableLayout";

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Top Controls */}
      <div className="flex justify-end items-center p-4 border-b bg-background gap-2">
        <ConnectionForm />
      </div>
      {/* Main Resizable Layout */}
      <ResizableLayout direction="horizontal" className="h-full" defaultSize={20} minSize={15}>
        <Sidebar />
        <ResizableLayout direction="vertical" className="h-full" defaultSize={60} minSize={20}>
          <ResizableLayout direction="horizontal" className="h-full" defaultSize={70} minSize={20} key="editor-console">
            <Editor />
            <ConsolePanel />
          </ResizableLayout>
          <GraphViewer />
        </ResizableLayout>
      </ResizableLayout>
    </div>
  );
}
