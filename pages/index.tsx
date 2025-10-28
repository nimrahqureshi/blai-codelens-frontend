"use client";
import { useState } from "react";

export default function Home() {
  const [repo, setRepo] = useState("");
  const [status, setStatus] = useState("Idle");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Correct environment variables
  const BACKEND =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  const API_KEY = process.env.NEXT_PUBLIC_BLAI_API_KEY || "";

  // ✅ Submit repo to backend
  const submit = async () => {
    if (!repo.trim()) {
      alert("⚠️ Paste a GitHub repo or PR URL first!");
      return;
    }

    setStatus("⏳ Queueing job...");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${BACKEND}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ repo_url: repo }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Backend error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      setStatus("🔍 Analyzing repository...");
      poll(data.review_id);
    } catch (e: any) {
      console.error("❌ Submit failed:", e);
      setStatus(`Error: ${e.message}`);
      setLoading(false);
    }
  };

  // ✅ Poll backend for results
  const poll = async (id: string) => {
    setStatus("⌛ Waiting for results...");
    for (let i = 0; i < 40; i++) {
      try {
        const r = await fetch(`${BACKEND}/artifacts/${id}`);
        if (r.ok) {
          const json = await r.json();
          setResult(json);
          setStatus("✅ Completed");
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.warn("Polling warning:", err.message);
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    setStatus("⏱️ Timeout: no response after waiting");
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-sky-950 to-black text-white p-8">
      <div className="max-w-3xl w-full bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-10">

        {/* 🔹 Header with Logo and Tagline */}
       <div className="flex items-center gap-4 mb-6">
  {/* ✅ Elegant circular logo frame */}
<div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500/20 to-cyan-400/10 p-[2px] shadow-lg">
  <div className="w-full h-full rounded-full bg-gradient-to-br from-white to-gray-50 flex items-center justify-center overflow-hidden">
    <img
      src="/logo.png"
      alt="BLAI Logo"
      className="w-10 h-10 object-contain opacity-90 hover:opacity-100 transition-all duration-300"
    />
  </div>
</div>
  {/* ✅ Title */}
  <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-200 tracking-tight drop-shadow-[0_2px_8px_rgba(56,189,248,0.3)]">
    BLAI CodeLens
  </h1>
</div>


        <p className="text-gray-300 mb-6">
          AI-powered code reviewer for modern developers. Built by{" "}
          <span className="font-semibold text-sky-400">BrainLink AI</span>.
        </p>

        {/* 🔹 Input + Analyze Button */}
        <div className="flex gap-3 mb-4">
          <input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="https://github.com/owner/repo"
            className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            onClick={submit}
            disabled={loading}
            className="bg-gradient-to-r from-sky-600 to-cyan-400 hover:from-sky-500 hover:to-cyan-300 transition-all duration-300 px-6 py-3 rounded-xl font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* 🔹 Status */}
        {status !== "Idle" && (
          <p className="mt-2 text-sky-400 font-medium animate-pulse">{status}</p>
        )}

        {/* 🔹 Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center my-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
            <p className="text-gray-400 mt-3 text-sm animate-pulse">
              Reviewing your repository with AI magic...
            </p>
          </div>
        )}

        {/* 🔹 Results */}
        <div className="mt-6 bg-black/40 border border-white/20 rounded-xl p-6 shadow-inner">
          <h2 className="text-sky-300 font-semibold text-lg mb-3">
            Code Review Results
          </h2>
          {result ? (
            <pre className="text-sky-100 text-sm whitespace-pre-wrap overflow-auto max-h-[400px]">
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-400">
              No results yet — paste a repo and hit Analyze!
            </p>
          )}
        </div>

        {/* 🔹 Footer */}
        <footer className="mt-10 text-center text-sm text-gray-500">
          ⚡ Powered by{" "}
          <span className="font-semibold text-sky-400">BrainLink AI</span> — Code
          Intelligence Engine
        </footer>
      </div>
    </main>
  );
}
