"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  fit_score: number;
  skills_required: string;
  experience_required: string;
  posted_date: string;
  last_date_to_apply: string;
  contacts: string;
  url: string;
  source: string;
  status: string;
}

declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (
          extensionId: string,
          message: unknown,
          callback?: (response: unknown) => void
        ) => void;
        lastError?: { message: string };
      };
    };
  }
}

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchMessage, setLaunchMessage] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const EXTENSION_ID = process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID || "";

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data);
        }
      } catch (err) {
        console.error("Failed to load job profile:", err);
      } finally {
        setLoading(false);
      }
    }
    if (jobId) loadJob();
  }, [jobId, API_BASE]);

  const updateStatus = async (newStatus: string) => {
    try {
      await fetch(`${API_BASE}/api/jobs/${jobId}/status?new_status=${newStatus}`, {
        method: "PATCH",
      });
      if (job) setJob({ ...job, status: newStatus });
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  const handleLaunchAutofill = () => {
    if (!job?.url) return;
    setIsLaunching(true);
    setLaunchMessage("");

    // Check if the Chrome Extension runtime exists
    if (!window.chrome || !window.chrome.runtime) {
      setLaunchMessage("Chrome extension runtime not detected. Opening standard tab.");
      window.open(job.url, "_blank");
      setIsLaunching(false);
      return;
    }

    window.chrome.runtime.sendMessage(
      EXTENSION_ID,
      { action: "OPEN_AND_AUTOFILL", url: job.url, jobId: job.id },
      (response: unknown) => {
        setIsLaunching(false);
        if (window.chrome?.runtime?.lastError) {
          setLaunchMessage("Extension not responding. Opening fallback tab.");
          window.open(job.url, "_blank");
        } else {
          setLaunchMessage("Target application opened! Extension is autofilling fields.");
          updateStatus("QUEUED");
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 font-medium">
        Loading candidate posting...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-24 text-center">
        <p className="text-red-500 font-semibold">Job not found or deleted.</p>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              {job.source}
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">{job.title}</h1>
            <p className="text-slate-600 font-medium text-sm">
              {job.company} — {job.location}
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-center sm:text-right">
            <div className="text-3xl font-black text-emerald-600">{job.fit_score}%</div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-700">
              Match Fit
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block font-medium">Experience</span>
            <span className="font-bold text-slate-800 text-sm">
              {job.experience_required}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block font-medium">Posted</span>
            <span className="font-bold text-slate-800 text-sm">{job.posted_date}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-slate-400 block font-medium">Apply Deadline</span>
            <span className="font-bold text-slate-800 text-sm">
              {job.last_date_to_apply || "Not specified"}
            </span>
          </div>
        </div>

        {/* Skills Tag Cloud */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Required Technical Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {job.skills_required.split(",").map((skill) => (
              <span
                key={skill.trim()}
                className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md text-xs"
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Recruiter Contacts */}
        {job.contacts && job.contacts !== "Not specified" && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-900">
            <span className="font-bold">Contact / Recruiter Mentioned: </span>
            {job.contacts}
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLaunchAutofill}
              disabled={isLaunching}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {isLaunching ? "Connecting to Extension..." : "⚡ Launch 1-Click Autofill"}
            </button>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-center text-sm transition"
            >
              Raw Board Link
            </a>
          </div>

          {launchMessage && (
            <p className="text-xs text-center font-medium text-slate-600">
              {launchMessage}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-medium">Mark status:</span>
            {["QUEUED", "APPLIED", "IGNORED"].map((st) => (
              <button
                key={st}
                onClick={() => updateStatus(st)}
                className={`text-[11px] font-bold px-2 py-1 rounded ${
                  job.status === st
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}