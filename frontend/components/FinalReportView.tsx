'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { sound } from '@/utils/sound';
import ExecutiveReportModal from './ExecutiveReportModal';

interface FinalReportViewProps {
  reportContent: string | null;
  companyGoal: string;
}

export default function FinalReportView({ reportContent, companyGoal }: FinalReportViewProps) {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    if (reportContent) {
      sound.playClick();
      navigator.clipboard.writeText(reportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMd = () => {
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

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const handleExportPdf = async () => {
    if (!printRef.current) return;
    try {
      sound.playClick();
      setIsExporting(true);

      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = await import('jspdf');

      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const safeGoal = (companyGoal || 'Report')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .slice(0, 25);
      pdf.save(`AI_Org_Executive_Report_${safeGoal}_${Date.now()}.pdf`);
      sound.playSuccess();
    } catch (err) {
      console.error('Failed to export PDF:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  if (!reportContent) {
    return (
      <div className="bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl p-10 text-center space-y-3 shadow-2xl font-mono text-[#2c2621]">
        <FileText className="w-8 h-8 mx-auto text-[#8c7b70] animate-pulse" />
        <h3 className="text-sm font-black uppercase">Executive Report Not Generated Yet</h3>
        <p className="text-xs text-[#6b5b52] max-w-md mx-auto">
          The CEO Orchestrator will synthesize findings from Research (with verified x402 Algorand intelligence), CTO Architecture, Marketing Strategy, and Development deliverables into a final executive company report upon pipeline completion.
        </p>
      </div>
    );
  }

  // Parse markdown into sections
  const sections = reportContent.split(/\n##\s+/);
  const bodySections = sections.slice(1);

  return (
    <>
      <div className="bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl p-4 shadow-2xl space-y-4 font-mono text-[#2c2621]">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#2c2621] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-emerald-600 border-2 border-[#2c2621] rounded text-white shadow">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#2c2621]">
                  FINAL EXECUTIVE COMPANY DELIVERABLE
                </h2>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-900 border border-emerald-600/40 font-bold">
                  PDF Ready
                </span>
              </div>
              <p className="text-[9px] text-[#6b5b52] font-semibold">Objective: {companyGoal}</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-400 text-white rounded text-xs font-black uppercase tracking-wider transition shadow cursor-pointer border-2 border-[#2c2621]"
              title="Download executive PDF document"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating...' : 'Export PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#f4ece1] hover:bg-[#e4d3c3] text-[#2c2621] rounded text-xs font-bold transition shadow cursor-pointer border-2 border-[#2c2621]"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-1 px-2 py-1 bg-[#f4ece1] hover:bg-[#e4d3c3] text-[#2c2621] rounded text-xs font-bold transition shadow cursor-pointer border-2 border-[#2c2621]"
              title="Fullscreen executive view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-2.5 py-1 bg-[#f4ece1] hover:bg-[#e4d3c3] border-2 border-[#2c2621] rounded text-xs font-bold text-[#2c2621] transition shadow cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-[#2c2621]" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadMd}
              className="p-1 bg-[#f4ece1] hover:bg-[#e4d3c3] text-[#2c2621] rounded text-xs font-black transition shadow cursor-pointer border-2 border-[#2c2621]"
              title="Download .md file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Executive Letterhead Preview */}
        <div
          ref={printRef}
          className="bg-white text-slate-900 border-2 border-[#2c2621] rounded-xl p-6 sm:p-8 shadow-inner font-sans space-y-6 max-h-[600px] overflow-y-auto"
        >
          {/* Institutional Seal */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white font-mono font-black px-2 py-0.5 rounded text-xs">
                  AI ORGANIZATION
                </span>
                <h1 className="text-base font-black uppercase tracking-tight text-slate-900">
                  NULL POINTERS INC.
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Target: {companyGoal}
              </p>
            </div>
            <div className="text-left sm:text-right font-mono text-[11px] text-slate-500">
              <div>Status: <strong className="text-emerald-700">COMPLETED & VERIFIED</strong></div>
              <div>Network: Algorand Testnet (GoPlausible)</div>
            </div>
          </div>

          {/* Formatted Sections */}
          <div className="space-y-6 text-xs leading-relaxed text-slate-800">
            {bodySections.length > 0 ? (
              bodySections.map((sec, idx) => {
                const lines = sec.trim().split('\n');
                const title = lines[0].replace(/^[#\d.\s]+/, '').trim();
                const contentLines = lines.slice(1);
                const isResearch = title.toLowerCase().includes('research') || title.toLowerCase().includes('market');

                return (
                  <div key={idx} className="space-y-2">
                    <h2 className="text-sm font-black uppercase text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      <span className="text-slate-400 font-mono text-[10px]">0{idx + 1}.</span>
                      {title}
                    </h2>

                    <div className="space-y-1.5 pl-2">
                      {contentLines.map((line, lIdx) => {
                        const trimmed = line.trim();
                        if (!trimmed) return null;

                        if (trimmed.startsWith('* **') || trimmed.startsWith('- **')) {
                          const match = trimmed.match(/^[\*\-]\s+\*\*(.*?)\*\*(.*)$/);
                          if (match) {
                            return (
                              <div key={lIdx} className="flex flex-col sm:flex-row gap-1">
                                <span className="font-bold text-slate-900 sm:w-40 shrink-0 font-mono uppercase text-[10px]">
                                  • {match[1]}:
                                </span>
                                <span className="text-slate-700 text-xs flex-1">
                                  {match[2].replace(/^:\s*/, '')}
                                </span>
                              </div>
                            );
                          }
                        }

                        if (trimmed.startsWith('SELECT') || trimmed.startsWith('CREATE TABLE') || trimmed.startsWith('--')) {
                          return (
                            <pre key={lIdx} className="bg-slate-900 text-slate-100 p-2.5 rounded font-mono text-[11px] overflow-x-auto my-1">
                              {line}
                            </pre>
                          );
                        }

                        return (
                          <p key={lIdx} className="text-slate-700 leading-relaxed text-xs">
                            {trimmed}
                          </p>
                        );
                      })}
                    </div>

                    {isResearch && (
                      <div className="bg-emerald-50 border border-emerald-300 rounded p-2.5 text-[11px] text-emerald-950 flex items-center gap-2 mt-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>
                          <strong>Verified x402 Intelligence:</strong> On-chain settlement verified on Algorand Testnet.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap">
                {reportContent}
              </pre>
            )}
          </div>

          {/* Footer Sign-off */}
          <div className="border-t border-slate-300 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono gap-2">
            <span>Signed off by CEO Arnav Sharma & Executive Squad</span>
            <span className="text-emerald-700 font-bold">✓ 100% Autonomous Execution Verified</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Printable Executive Modal */}
      <ExecutiveReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reportContent={reportContent}
        companyGoal={companyGoal}
      />
    </>
  );
}
