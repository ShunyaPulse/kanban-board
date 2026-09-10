"use client";

import React, { useEffect, useState } from "react";
import { useBoardStore } from "@/store/board-store";

export default function MetricsPanel() {
  const showMetrics = useBoardStore((s) => s.showMetrics);
  const toggleMetrics = useBoardStore((s) => s.toggleMetrics);
  const metrics = useBoardStore((s) => s.metrics);
  const fetchMetrics = useBoardStore((s) => s.fetchMetrics);
  const [loading, setLoading] = useState(false);

  const refreshMetrics = async () => {
    setLoading(true);
    await fetchMetrics();
    setLoading(false);
  };

  useEffect(() => {
    if (showMetrics) {
      refreshMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMetrics]);

  if (!showMetrics) return null;

  // Show last 14 days of throughput
  const recentThroughput = metrics?.throughput?.slice(-14) || [];
  const maxThroughput = Math.max(
    ...recentThroughput.map((d) => d.count),
    1
  );

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={toggleMetrics}
      />
      <div className="fixed top-0 right-0 h-full w-[85vw] sm:w-96 bg-slate-800/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col border-l border-slate-700/60 transition-transform">
        <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Board Metrics
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={refreshMetrics}
              disabled={loading}
              className="text-slate-400 hover:text-blue-400 p-2 rounded-full hover:bg-slate-700 transition-colors"
              title="Refresh"
            >
              ↻
            </button>
            <button
              onClick={toggleMetrics}
              className="text-slate-400 hover:text-red-400 p-2 rounded-full hover:bg-slate-700 transition-colors"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-900/30">
          {loading ? (
            <div className="text-center py-10 text-slate-500 text-sm font-medium animate-pulse">
              Loading metrics...
            </div>
          ) : !metrics ? (
            <div className="text-center py-10 text-slate-500 text-sm font-medium">
              No metrics available.
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 text-center shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-4xl font-black text-slate-100 relative z-10">
                    {metrics.totalCards}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest relative z-10">
                    Total Cards
                  </div>
                </div>
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 text-center shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-4xl font-black text-emerald-400 relative z-10">
                    {metrics.completedCards}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest relative z-10">
                    Completed
                  </div>
                </div>
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 text-center col-span-2 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-3xl font-black text-indigo-400 relative z-10">
                    {metrics.averageLeadTime !== null
                      ? metrics.averageLeadTime < 24
                        ? `${metrics.averageLeadTime.toFixed(1)} hrs`
                        : `${(metrics.averageLeadTime / 24).toFixed(1)} days`
                      : "N/A"}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest relative z-10">
                    Avg Lead Time
                  </div>
                </div>
              </div>

              {/* WIP Alerts */}
              {metrics.wipAlerts && metrics.wipAlerts.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
                    WIP Alerts
                  </h3>
                  <ul className="space-y-3">
                    {metrics.wipAlerts.map((alert) => (
                      <li
                        key={alert.columnId}
                        className="bg-red-900/20 text-red-400 text-sm p-4 rounded-xl border border-red-900/50 flex justify-between items-center shadow-sm"
                      >
                        <span className="font-semibold">
                          {alert.columnTitle}
                        </span>
                        <span className="font-bold bg-slate-800 text-red-400 px-2.5 py-1 rounded-lg border border-red-900/50 shadow-sm text-xs">
                          {alert.current} / {alert.limit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Column Distribution */}
              {metrics.columnDistribution && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
                    Cards per Column
                  </h3>
                  <div className="space-y-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-sm">
                    {metrics.columnDistribution.map((col) => {
                      const max = Math.max(
                        ...metrics.columnDistribution.map(
                          (c) => c.count
                        ),
                        1
                      );
                      const percentage = (col.count / max) * 100;
                      return (
                        <div key={col.columnId}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="truncate w-3/4 font-semibold text-slate-300">
                              {col.title}
                            </span>
                            <span className="font-bold text-slate-100">
                              {col.count}
                            </span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Throughput Chart (Last 14 days) */}
              {recentThroughput.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
                    Throughput (14 Days)
                  </h3>
                  <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-sm">
                    <div className="flex items-end h-32 gap-1.5 relative border-b border-slate-700/50 pb-2">
                      {recentThroughput.map((day, i) => {
                        const height = (day.count / maxThroughput) * 100;
                        return (
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center group relative h-full justify-end"
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-700 text-slate-100 text-[10px] font-medium py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-10 transition-opacity shadow-lg">
                              {day.date}: {day.count}
                            </div>
                            <div
                              className="w-full bg-emerald-500/80 rounded-sm hover:bg-emerald-400 transition-all duration-300"
                              style={{
                                height: `${height}%`,
                                minHeight:
                                  day.count > 0 ? "4px" : "2px",
                                opacity: day.count > 0 ? 1 : 0.3
                              }}
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-semibold tracking-wide">
                      <span>
                        {recentThroughput[0]?.date
                          .split("-")
                          .slice(1)
                          .join("/")}
                      </span>
                      <span>
                        {recentThroughput[recentThroughput.length - 1]?.date
                          .split("-")
                          .slice(1)
                          .join("/")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
