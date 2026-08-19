'use client';

import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Copy, Check } from 'lucide-react';
import { sound } from '@/utils/sound';

interface FinalReportViewProps {
  reportContent: string | null;
  companyGoal: string;
}

export default function FinalReportView({ reportContent, companyGoal }: FinalReportViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (reportContent) {
      sound.playClick();
      navigator.clipboard.writeText(reportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!reportContent) return;
    sound.playClick();
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
      <div className="bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl p-10 text-center space-y-3 shadow-2xl font-mono text-[#2c2621]">
        <FileText className="w-8 h-8 mx-auto text-[#8c7b70] animate-pulse" />
        <h3 className="text-sm font-black uppercase">Executive Report Not Generated Yet</h3>
        <p className="text-xs text-[#6b5b52] max-w-md mx-auto">
          The CEO Orchestrator will synthesize findings from Research, CTO Architecture, Marketing Strategy, and Development deliverables into a final executive company report upon pipeline completion.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl p-4 shadow-2xl space-y-4 font-mono text-[#2c2621]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#2c2621] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-[#f4ece1] border-2 border-[#2c2621] rounded text-emerald-800">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#2c2621]">
              FINAL EXECUTIVE COMPANY REPORT
            </h2>
            <p className="text-[9px] text-[#6b5b52]">Target Objective: {companyGoal}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1 bg-[#f4ece1] hover:bg-[#e4d3c3] border-2 border-[#2c2621] rounded text-xs font-bold text-[#2c2621] transition shadow cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-[#2c2621]" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3.5 py-1 bg-[#2c2621] hover:bg-[#3d3630] text-[#f4ece1] rounded text-xs font-black transition shadow cursor-pointer uppercase"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .md</span>
          </button>
        </div>
      </div>

      <div className="bg-[#f9f3eb] border-2 border-[#2c2621] rounded-xl p-4 overflow-x-auto shadow-sm">
        <pre className="text-xs font-mono text-[#2c2621] leading-relaxed whitespace-pre-wrap">
          {reportContent}
        </pre>
      </div>
    </div>
  );
}
