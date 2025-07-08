"use client";
import { useState } from "react";
import ConnectionModal from "./ConnectionModal";

export default function ConnectionForm() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="px-4 py-1 rounded border border-gray-300 bg-white text-black font-semibold shadow-sm hover:bg-gray-100 transition-colors"
        onClick={() => setOpen(true)}
      >
        Connect
      </button>
      <ConnectionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
