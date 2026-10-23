"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  fit_score: number;
  skills_required: string;
  experience_required: string;
  posted_date: string;
  source: string;
  status: string;
  url: string;
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("Preferred"); // Default to high-match jobs
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/jobs?limit=100`);
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (err) {
        console.error("Failed to load jobs from API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [API_BASE]);

  // Filter by Category tab (Preferred vs Suggested vs All) + Status (Discovered/Queued/Applied)
  const filteredJobs = jobs.filter((j) => {
    const matchesCategory =
      activeTab === "ALL" ? true : j.category.toLowerCase() === activeTab.toLowerCase();
    const matchesStatus =
      statusFilter === "ALL" ? true : j.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Title & Stats Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Job Applications Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {filteredJobs.length} openings fetched from Greenhouse, Lever, Ashby, Instahyre, Naukri & Indeed.
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {["Preferred", "Suggested", "ALL"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab === "ALL" ? "All Jobs" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Filters: Status */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] mr-2">
          Status:
        </span>
        {["ALL", "DISCOVERED", "QUEUED", "APPLIED", "IGNORED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
              statusFilter === st
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Feed Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium">
          Fetching latest matches from Supabase database...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="py-20 text-center bg-white border border-dashed rounded-2xl border-slate-300">
          <p className="text-slate-600 font-bold">No jobs found in this view.</p>
          <p className="text-xs text-slate-400 mt-1">
            Try switching tabs or triggering a harvest run.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition rounded-2xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    {job.source}
                  </span>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-md ${
                      job.fit_score >= 70
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {job.fit_score}% FIT
                  </span>
                </div>

                <div>
                  <h2 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                    {job.title}
                  </h2>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {job.company} — {job.location}
                  </p>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1">
                  <div>
                    <span className="text-slate-400 font-medium">Exp: </span>
                    <span className="font-semibold text-slate-700">
                      {job.experience_required}
                    </span>
                  </div>
                  <div className="line-clamp-1">
                    <span className="text-slate-400 font-medium">Skills: </span>
                    <span className="font-semibold text-slate-700">
                      {job.skills_required || "General SDE"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {job.status}
                </span>
                <Link
                  href={`/jobs/${job.id}`}
                  className="bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  View & Autofill →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}