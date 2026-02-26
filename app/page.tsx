"use client";

import { useState } from "react";

interface PipelineResult {
  message: string;
  summary?: string;
  classification?: string;
  response?: {
    reply: string;
    username: string | null;
    orderNumber: string | null;
  };
  critic?: {
    approved: boolean;
    critique: string;
  };
  revisions?: {
    approved: boolean;
    critique: string;
  }[];
  timings?: Record<string, number>;
  totalDurationMs?: number;
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const res = await fetch("/api/process-latest-email", {
        method: "POST"
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Unknown error");
      }
      setData(json);
    } catch (e: any) {
      setError(e.message || "Failed to run pipeline");
    } finally {
      setLoading(false);
    }
  };

  const hasDetails =
    !!data?.summary ||
    !!data?.classification ||
    !!data?.response ||
    !!data?.critic ||
    !!data?.timings;

  return (
    <main className="min-h-screen bg-[#0f172a] text-[#f1f5f9] flex flex-col">
      <header className="border-b border-[#334155] bg-[#020617]/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#38bdf8] flex items-center justify-center shadow-lg shadow-sky-700/50">
              <span className="text-xs font-semibold tracking-tight">ZP</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                MailCraft AI: Email Agent Dashboard by zeyneppinarsoy
              </h1>
              <p className="text-xs text-slate-300">
                Agents: Reader · Classifier · Responder · Critic · Revise
              </p>
            </div>
          </div>
          <button
            onClick={handleRun}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#38bdf8] hover:bg-[#0ea5e9] disabled:opacity-60 text-xs md:text-sm font-medium shadow-md shadow-sky-700/40 transition-colors"
          >
            {loading ? (
              <>
                <span className="h-3 w-3 rounded-full border-2 border-slate-100 border-t-transparent animate-spin" />
                Running pipeline...
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Process latest unread email
              </>
            )}
          </button>
        </div>
      </header>

      <section className="flex-1 max-w-6xl mx-auto px-6 py-6 md:py-8 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        <div className="space-y-4">
          <div
            className={`rounded-2xl backdrop-blur-md p-5 shadow-xl shadow-black/40 border ${
              data?.message === "Reply sent successfully"
                ? "border-emerald-500/70 bg-emerald-900/40"
                : "border-[#334155] bg-[#1e293b]/90"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-dash-purple animate-pulse" />
                Run status
              </h2>
              <span className="text-[11px] uppercase tracking-wide text-slate-400">
                {data?.totalDurationMs
                  ? `${Math.round(data.totalDurationMs)} ms`
                  : "Idle"}
              </span>
            </div>
            <p className="text-sm text-slate-200">
              {loading
                ? "Pipeline is executing on the latest unread email..."
                : data?.message ||
                  "Trigger the multi-agent pipeline to fetch, analyze and respond to your latest unread support email."}
            </p>
            {error && (
              <p className="mt-3 text-xs text-red-300 bg-red-950/40 border border-red-500/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[#334155] bg-[#1e293b]/90 backdrop-blur-md p-4 flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-slate-200">
              Agent Status
            </h3>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#020617]/60 px-3 py-1.5 border border-[#334155]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    loading ? "bg-[#38bdf8] animate-pulse" : "bg-emerald-400"
                  }`}
                />
                <span className="font-medium text-slate-100">Reader</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#020617]/60 px-3 py-1.5 border border-[#334155]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    loading ? "bg-[#38bdf8] animate-pulse" : "bg-emerald-400"
                  }`}
                />
                <span className="font-medium text-slate-100">Classifier</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#020617]/60 px-3 py-1.5 border border-[#334155]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    loading ? "bg-[#38bdf8] animate-pulse" : "bg-emerald-400"
                  }`}
                />
                <span className="font-medium text-slate-100">Responder</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#334155] bg-[#1e293b]/90 backdrop-blur-md p-4">
              <h3 className="text-xs font-semibold text-slate-200 mb-2">
                Summary
              </h3>
              <p className="text-sm text-slate-200 whitespace-pre-wrap min-h-[60px]">
                {data?.summary || "No summary yet. Run the pipeline to see it."}
              </p>
            </div>

            <div className="rounded-2xl border border-[#334155] bg-[#1e293b]/90 backdrop-blur-md p-4 flex flex-col gap-3">
              <div>
                <h3 className="text-xs font-semibold text-slate-200 mb-1">
                  Classification
                </h3>
                <span className="inline-flex items-center rounded-full border border-[#38bdf8]/70 bg-[#38bdf8]/15 px-3 py-1 text-xs font-medium text-[#e0f2fe]">
                  {data?.classification || "—"}
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <p>
                  <span className="font-semibold text-slate-300">User:</span>{" "}
                  {data?.response?.username || "Unknown"}
                </p>
                <p>
                  <span className="font-semibold text-slate-300">Order:</span>{" "}
                  {data?.response?.orderNumber || "Not detected"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#334155] bg-[#1e293b]/90 backdrop-blur-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-200">
                Generated reply
              </h3>
              {data?.critic && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    data.critic.approved
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40"
                      : "bg-amber-500/15 text-amber-300 border border-amber-400/40"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {data.critic.approved ? "Approved by critic agent" : "Needs work"}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-100 whitespace-pre-wrap min-h-[100px]">
              {data?.response?.reply ||
                "No reply generated yet. Run the pipeline to see the responder output."}
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#334155] bg-[#1e293b]/90 backdrop-blur-md p-4">
            <h3 className="text-xs font-semibold text-slate-200 mb-2">
              Critic & revisions
            </h3>
            {data?.critic ? (
              <div className="space-y-3 text-xs text-slate-200">
                <div>
                  <p className="font-semibold text-slate-100 mb-1">
                    Latest critic verdict
                  </p>
                  <p className="whitespace-pre-wrap text-slate-200">
                    {data.critic.critique}
                  </p>
                </div>
                {data.revisions && data.revisions.length > 0 && (
                  <div className="border-t border-slate-700/60 pt-2">
                    <p className="font-semibold text-slate-200 mb-1">
                      Revision history ({data.revisions.length})
                    </p>
                    <ul className="space-y-1.5">
                      {data.revisions.map((rev, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-[11px]"
                        >
                          <span
                            className={`mt-1 h-1.5 w-1.5 rounded-full ${
                              rev.approved ? "bg-emerald-400" : "bg-amber-400"
                            }`}
                          />
                          <span className="text-slate-300">
                            <span className="font-semibold">
                              Revision {idx + 1}:
                            </span>{" "}
                            {rev.critique}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Critic output will appear here once the pipeline has run at
                least once.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[#334155] bg-[#1e293b]/90 backdrop-blur-md p-4">
            <h3 className="text-xs font-semibold text-slate-200 mb-2">
              Timings (ms)
            </h3>
            {data?.timings ? (
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-200">
                {Object.entries(data.timings).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-lg border border-[#334155] bg-[#020617]/70 backdrop-blur px-2 py-1.5 flex flex-col"
                  >
                    <span className="uppercase tracking-wide text-slate-400 text-[10px] mb-0.5">
                      {key}
                    </span>
                    <span className="font-semibold text-slate-100">
                      {Math.round(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Once the pipeline runs, per-agent timings and send duration will
                be visualized here.
              </p>
            )}
          </div>

          {hasDetails && (
            <div className="rounded-2xl border border-dash-purple/40 bg-dash-purple-soft/20 p-3 text-[11px] text-slate-200">
              <p className="font-semibold mb-1">Run metadata</p>
              <p>
                Total duration:{" "}
                <span className="font-mono">
                  {data?.totalDurationMs
                    ? `${Math.round(data.totalDurationMs)} ms`
                    : "—"}
                </span>
              </p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
