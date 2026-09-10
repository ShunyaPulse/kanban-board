"use client";

import React, { useRef, useState } from "react";
import { useBoardStore } from "@/store/board-store";

export default function ImportExport() {
  const exportBoard = useBoardStore((s) => s.exportBoard);
  const importBoard = useBoardStore((s) => s.importBoard);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const handleExport = async () => {
    try {
      const data = await exportBoard();
      if (!data) {
        setStatus({ type: "error", message: "Export failed" });
        setTimeout(() => setStatus(null), 3000);
        return;
      }
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kanban-board-export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus({ type: "success", message: "Exported successfully" });
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus({ type: "error", message: "Export failed" });
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        const parsed = JSON.parse(json);
        const success = await importBoard(parsed);
        if (success) {
          setStatus({
            type: "success",
            message: "Imported successfully",
          });
        } else {
          setStatus({
            type: "error",
            message: "Import failed: validation error",
          });
        }
      } catch {
        setStatus({
          type: "error",
          message: "Import failed: Invalid JSON format",
        });
      }
      setTimeout(() => setStatus(null), 3000);
    };
    reader.onerror = () => {
      setStatus({ type: "error", message: "Failed to read file" });
      setTimeout(() => setStatus(null), 3000);
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center space-x-2 relative">
      <button
        onClick={handleExport}
        className="px-4 py-2 text-sm font-semibold text-slate-200 bg-slate-800/80 border border-slate-700/60 rounded-xl hover:bg-slate-700 transition-all shadow-sm backdrop-blur-sm"
      >
        Export
      </button>
      <button
        onClick={handleImportClick}
        className="px-4 py-2 text-sm font-semibold text-slate-200 bg-slate-800/80 border border-slate-700/60 rounded-xl hover:bg-slate-700 transition-all shadow-sm backdrop-blur-sm"
      >
        Import
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {status && (
        <div
          className={`absolute top-full mt-2 right-0 px-3 py-1.5 rounded shadow text-xs font-bold whitespace-nowrap z-20 ${
            status.type === "error"
              ? "bg-red-100 text-red-800 border border-red-200"
              : "bg-green-100 text-green-800 border border-green-200"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
