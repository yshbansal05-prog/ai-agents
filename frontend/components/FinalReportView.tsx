'use client';

import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Copy, Check } from 'lucide-react';

interface FinalReportViewProps {
  reportContent: string | null;
  companyGoal: string;
}

export default function FinalReportView({ reportContent, companyGoal }: FinalReportViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (reportContent) {
      navigator.clipboard.writeText(reportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!reportContent) return;
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Organization_Final_Report_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!reportContent) {
    return (
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-2xl">
        <FileText className="w-10 h-10 mx-auto text-indigo-500/50 animate-pulse" />
        <h3 className="text-lg font-bold text-slate-200">Executive Report Not Generated Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          The CEO Orchestrator will synthesize findings from Research, CTO Architecture, Marketing Strategy, and Development code deliverables into a final executive company report upon pipeline completion.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Final Executive Company Report</h2>
            <p className="text-xs text-slate-400">Target Objective: {companyGoal}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report (.md)</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 overflow-x-auto">
        <pre className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
          {reportContent}
        </pre>
      </div>
    </div>
  );
}
