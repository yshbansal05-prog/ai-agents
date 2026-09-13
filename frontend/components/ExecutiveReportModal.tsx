'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  Coins,
  ExternalLink,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { sound } from '@/utils/sound';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportContent: string | null;
  companyGoal: string;
}

export default function ExecutiveReportModal({
  isOpen,
  onClose,
  reportContent,
  companyGoal
}: ExecutiveReportModalProps) {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

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
    a.download = `AI_Organization_Executive_Report_${Date.now()}.md`;
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
    if (!reportRef.current) return;
    try {
      sound.playClick();
      setIsExporting(true);

      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = await import('jspdf');

      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
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
      alert('Unable to generate PDF directly; opening print preview instead.');
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // Safe parsing helper to extract key markdown sections for executive cards
  const sections = (reportContent || '').split(/\n##\s+/);
  const headerSection = sections[0] || '';
  const bodySections = sections.slice(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm font-mono overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#ebdcd0] border-4 border-[#2c2621] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] my-auto">
        {/* Modal Action Header */}
        <div className="flex items-center justify-between border-b-4 border-[#2c2621] bg-[#e4d3c3] p-3 text-[#2c2621] no-print">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-600 text-white rounded-lg border-2 border-[#2c2621]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                EXECUTIVE DELIVERABLE REPORT
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-900 border border-emerald-600/40 font-bold">
                  PDF Ready
                </span>
              </div>
              <div className="text-[9px] text-[#6b5b52] font-semibold truncate max-w-md">
                Objective: {companyGoal}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-400 text-white rounded border-2 border-[#2c2621] text-xs font-black uppercase tracking-wider transition shadow cursor-pointer"
              title="Download clean executive PDF document"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating...' : 'Export PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#f4ece1] hover:bg-[#e4d3c3] text-[#2c2621] rounded border-2 border-[#2c2621] text-xs font-bold transition shadow cursor-pointer"
              title="Open browser print dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#f4ece1] hover:bg-[#e4d3c3] text-[#2c2621] rounded border-2 border-[#2c2621] text-xs font-bold transition shadow cursor-pointer"
              title="Copy markdown text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadMd}
              className="p-1.5 bg-[#f4ece1] hover:bg-[#e4d3c3] text-[#2c2621] rounded border-2 border-[#2c2621] shadow cursor-pointer transition"
              title="Download raw markdown"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-[#f4ece1] hover:bg-[#d8c3b1] border-2 border-[#2c2621] rounded text-[#2c2621] shadow cursor-pointer ml-1"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document View */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-[#e8dacb] space-y-4">
          <div
            ref={reportRef}
            id="printable-report"
            className="bg-white text-slate-900 border-2 border-slate-300 rounded-xl p-8 sm:p-12 shadow-xl font-sans max-w-4xl mx-auto space-y-8"
          >
            {/* Top Institutional Letterhead */}
            <div className="border-b-2 border-slate-900 pb-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-mono font-black text-xl shadow">
                    AI
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                      AI ORGANIZATION OS
                    </h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Autonomous Executive Strategy & Deliverable Report
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono text-xs text-slate-600 space-y-0.5">
                  <div>
                    <strong>Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div>
                    <strong>Status:</strong>{' '}
                    <span className="inline-flex items-center text-emerald-700 font-bold">
                      ● COMPLETED & VERIFIED
                    </span>
                  </div>
                  <div>
                    <strong>Facilitator:</strong> GoPlausible (Algorand Testnet)
                  </div>
                </div>
              </div>

              {/* Target Objective Banner */}
              <div className="bg-slate-50 border-l-4 border-slate-900 p-4 rounded-r-lg space-y-1">
                <span className="text-[10px] uppercase font-mono font-black text-slate-500 tracking-wider">
                  Mandated Company Objective:
                </span>
                <p className="text-base font-black text-slate-900 leading-snug">
                  "{companyGoal}"
                </p>
              </div>

              {/* 4 Executive Meta Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Agents Executed</div>
                  <div className="font-black text-slate-800 text-sm">5 Department Heads</div>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-emerald-900">
                  <div className="text-[10px] text-emerald-700 font-mono uppercase font-bold">x402 Payment</div>
                  <div className="font-black text-sm flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    $0.01 Settled
                  </div>
                </div>
                <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 text-blue-900">
                  <div className="text-[10px] text-blue-700 font-mono uppercase font-bold">Settlement Layer</div>
                  <div className="font-black text-sm">Algorand Testnet</div>
                </div>
                <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200 text-purple-900">
                  <div className="text-[10px] text-purple-700 font-mono uppercase font-bold">Decision Governance</div>
                  <div className="font-black text-sm">CEO Arbitration</div>
                </div>
              </div>
            </div>

            {/* Document Body Sections */}
            <div className="space-y-8 text-sm leading-relaxed text-slate-800">
              {bodySections.length > 0 ? (
                bodySections.map((sec, idx) => {
                  const lines = sec.trim().split('\n');
                  const title = lines[0].replace(/^[#\d.\s]+/, '').trim();
                  const contentLines = lines.slice(1);
                  const isResearch = title.toLowerCase().includes('research') || title.toLowerCase().includes('market');
                  const isArch = title.toLowerCase().includes('architecture') || title.toLowerCase().includes('product');
                  const isConflict = title.toLowerCase().includes('conflict') || title.toLowerCase().includes('resolution');

                  return (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
                        <span className="text-xs font-mono font-black text-slate-400">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <h2 className="text-base font-black uppercase tracking-tight text-slate-900">
                          {title}
                        </h2>
                      </div>

                      {/* Content rendering */}
                      <div className="space-y-2 text-slate-700">
                        {contentLines.map((line, lIdx) => {
                          const trimmed = line.trim();
                          if (!trimmed) return <div key={lIdx} className="h-1.5" />;

                          if (trimmed.startsWith('* **') || trimmed.startsWith('- **')) {
                            const match = trimmed.match(/^[\*\-]\s+\*\*(.*?)\*\*(.*)$/);
                            if (match) {
                              const label = match[1];
                              const rest = match[2].replace(/^:\s*/, '');
                              return (
                                <div key={lIdx} className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 pl-2">
                                  <span className="font-bold text-slate-900 text-xs sm:w-44 shrink-0 uppercase tracking-wide font-mono">
                                    • {label}:
                                  </span>
                                  <span className="text-sm text-slate-700 flex-1">{rest}</span>
                                </div>
                              );
                            }
                          }

                          if (trimmed.startsWith('```')) {
                            return null;
                          }

                          if (trimmed.startsWith('SELECT') || trimmed.startsWith('CREATE TABLE') || trimmed.startsWith('--')) {
                            return (
                              <pre key={lIdx} className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-xs overflow-x-auto my-1">
                                {line}
                              </pre>
                            );
                          }

                          return (
                            <p key={lIdx} className="text-sm text-slate-700 leading-normal pl-2">
                              {trimmed}
                            </p>
                          );
                        })}
                      </div>

                      {/* Highlight card for x402 Verified Intelligence */}
                      {isResearch && (
                        <div className="bg-emerald-50/80 border border-emerald-300 rounded-lg p-3.5 text-xs text-emerald-950 space-y-1.5 mt-2">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-900 uppercase font-mono text-[11px]">
                            <ShieldCheck className="w-4 h-4 text-emerald-700" />
                            <span>Verified x402 Paid Intelligence (Algorand Testnet Settlement)</span>
                          </div>
                          <p className="text-emerald-900 text-xs leading-relaxed">
                            Data purchased autonomously through the organization treasury using Algorand atomic transaction verification via GoPlausible Facilitator.
                          </p>
                        </div>
                      )}

                      {/* Highlight card for Conflict Resolution */}
                      {isConflict && (
                        <div className="bg-amber-50/80 border border-amber-300 rounded-lg p-3.5 text-xs text-amber-950 space-y-1 mt-2">
                          <div className="font-bold text-amber-900 uppercase font-mono text-[11px]">
                            ⚖️ Executive CEO Binding Resolution
                          </div>
                          <p className="text-amber-900 text-xs leading-relaxed">
                            Authoritative trade-off arbitration enacted across executive squad to maximize development velocity while maintaining relational data integrity.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="whitespace-pre-wrap font-mono text-xs text-slate-800 leading-relaxed">
                  {reportContent}
                </div>
              )}
            </div>

            {/* Official Executive Sign-Off Block */}
            <div className="border-t-2 border-slate-900 pt-6 space-y-4">
              <div className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                Executive Squad Signatures & Approvals:
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                {[
                  { name: 'Arnav Sharma', role: 'CEO / Orchestrator', icon: '👑' },
                  { name: 'Meera Iyer', role: 'Research / Intel', icon: '🔍' },
                  { name: 'Rohan Verma', role: 'Strategy / CTO', icon: '⚡' },
                  { name: 'Isha Patel', role: 'Growth / Marketing', icon: '🚀' },
                  { name: 'Kabir Das', role: 'Dev / Architecture', icon: '💻' }
                ].map((member) => (
                  <div key={member.name} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
                    <span className="text-base">{member.icon}</span>
                    <div className="font-bold text-xs text-slate-900">{member.name}</div>
                    <div className="text-[9px] text-slate-500 font-mono">{member.role}</div>
                    <div className="pt-1 text-[8px] font-mono text-emerald-700 font-bold">✓ Signed</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-4 border-t border-slate-200">
                <span>AI Organization OS V1.0.0 &bull; Algorand Testnet Verified</span>
                <span>CONFIDENTIAL &bull; FOR INTERNAL & BOARD USE ONLY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
