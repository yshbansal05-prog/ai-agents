'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Scale,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  Vote,
  Sparkles,
  Layers,
  Clock,
  ArrowRight,
  TrendingUp,
  Cpu,
  Flame
} from 'lucide-react';
import { TreasuryTransaction, Decision } from '@/types';
import { sound } from '@/utils/sound';

interface GovernanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string;
  companyGoal: string;
  transactions?: TreasuryTransaction[];
  decisions?: Decision[];
  onDecideTreasury?: (txId: string, action: 'APPROVE' | 'VETO') => Promise<void>;
  onArbitrateConflict?: (decision: string, rationale: string, title?: string) => Promise<void>;
}

export default function GovernanceModal({
  isOpen,
  onClose,
  companyId,
  companyGoal,
  transactions = [],
  decisions = [],
  onDecideTreasury,
  onArbitrateConflict
}: GovernanceModalProps) {
  const [activeTab, setActiveTab] = useState<'TREASURY_GATE' | 'CONFLICT_OVERRIDE' | 'POLICY'>('TREASURY_GATE');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [governanceSuccessMsg, setGovernanceSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const pendingTxs = transactions.filter(
    (t) => t.status === 'REQUESTED' || t.status === 'PAYMENT_PENDING' || t.status === 'APPROVED'
  );

  const handleApproveTx = async (txId: string) => {
    if (!onDecideTreasury) return;
    try {
      sound.playSuccess();
      setIsSubmitting(true);
      await onDecideTreasury(txId, 'APPROVE');
      setGovernanceSuccessMsg(`Transaction ${txId.slice(0, 8)} successfully APPROVED by Board.`);
      setTimeout(() => setGovernanceSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVetoTx = async (txId: string) => {
    if (!onDecideTreasury) return;
    try {
      sound.playClick();
      setIsSubmitting(true);
      await onDecideTreasury(txId, 'VETO');
      setGovernanceSuccessMsg(`Transaction ${txId.slice(0, 8)} VETOED by Board.`);
      setTimeout(() => setGovernanceSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArbitrate = async (choice: 'CTO' | 'MARKETING' | 'COMPROMISE') => {
    if (!onArbitrateConflict) return;
    try {
      sound.playSuccess();
      setIsSubmitting(true);

      let decisionText = '';
      let rationaleText = '';
      let title = 'Board Executive Strategic Ruling';

      if (choice === 'CTO') {
        title = 'Board Ruling: Prioritize Engineering Depth & Modular Architecture';
        decisionText = 'Adopt decoupled microservices with full relational normalization, ACID compliance, and pgvector semantic indexing.';
        rationaleText = 'Long-term scalability, data integrity, and enterprise auditability outweigh short-term speed.';
      } else if (choice === 'MARKETING') {
        title = 'Board Ruling: Prioritize Time-to-Market & Rapid MVP';
        decisionText = 'Deploy streamlined monolithic architecture focusing immediately on customer acquisition and instant activation.';
        rationaleText = 'Speed to market and validating user demand is top strategic priority for initial market traction.';
      } else {
        title = 'Board Ruling: Adopt Modular Monolith Compromise';
        decisionText = 'Build modular monolith architecture with isolated domain boundaries, allowing rapid delivery without compromising data hygiene.';
        rationaleText = 'Optimal balance between delivery velocity and architectural extensibility.';
      }

      await onArbitrateConflict(decisionText, rationaleText, title);
      setGovernanceSuccessMsg(`Board Ruling Binding: "${title}" recorded in company memory.`);
      setTimeout(() => setGovernanceSuccessMsg(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 select-none font-mono">
      <div className="bg-[#ebdcd0] border-4 border-[#2c2621] rounded-lg shadow-2xl w-full max-w-4xl h-[86vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#e4d3c3] border-b-4 border-[#2c2621]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#2c2621] text-amber-400 rounded-lg flex items-center justify-center shadow">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-[#2c2621] uppercase tracking-wider">
                  BOARD OF DIRECTORS GOVERNANCE & STEERING
                </h2>
                <span className="px-1.5 py-0.2 bg-purple-900 text-white rounded text-[8px] font-black uppercase">
                  HUMAN-IN-THE-LOOP (HITL)
                </span>
              </div>
              <p className="text-[10px] text-[#6b5b52] font-bold line-clamp-1 max-w-lg">
                Supervise autonomous treasury spending, override departmental disputes, and set enterprise policy.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 bg-[#f4ece1] hover:bg-[#d8c3b1] border-2 border-[#2c2621] rounded text-[#2c2621] shadow cursor-pointer transition"
            title="Close Governance"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        {governanceSuccessMsg && (
          <div className="bg-emerald-800 text-white px-4 py-1.5 text-xs font-bold flex items-center gap-2 border-b-2 border-[#2c2621] animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{governanceSuccessMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 bg-[#e4d3c3] border-b-2 border-[#2c2621] text-xs font-bold">
          {[
            { id: 'TREASURY_GATE', label: 'Treasury Spending Gates', icon: Coins },
            { id: 'CONFLICT_OVERRIDE', label: 'Dispute Arbitration Override', icon: Gavel },
            { id: 'POLICY', label: 'Company Enterprise Policies', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`py-2 px-3 flex items-center justify-center space-x-1.5 border-r last:border-r-0 border-[#2c2621] uppercase text-[10px] font-black transition cursor-pointer ${
                  isActive
                    ? 'bg-[#2c2621] text-[#f4ece1]'
                    : 'text-[#4a3e37] hover:bg-[#ebdcd0]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-amber-500" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#f9f3eb] space-y-4">
          {/* Tab 1: TREASURY GATES */}
          {activeTab === 'TREASURY_GATE' && (
            <div className="space-y-3">
              <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-3 space-y-1">
                <div className="text-[10px] font-black uppercase text-[#6b5b52] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-700" /> EXPENDITURE APPROVAL POLICY
                </div>
                <p className="text-xs text-[#2c2621] leading-relaxed">
                  Autonomous agents are authorized up to <strong className="text-emerald-900">$0.05 USDC</strong> per micropayment. Any expenditure exceeding policy requires explicit Board ratification.
                </p>
              </div>

              {/* Transactions list */}
              <div className="space-y-2">
                <div className="text-xs font-black uppercase text-[#2c2621] flex items-center justify-between">
                  <span>Recent & Pending Treasury Transactions ({transactions.length})</span>
                  <span className="text-[9px] text-[#8c7b70]">Network: Algorand Testnet (USDC)</span>
                </div>

                {transactions.length === 0 ? (
                  <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-6 text-center text-[#8c7b70] text-xs">
                    No transactions recorded yet. When agents execute x402 payments, they will appear here for audit.
                  </div>
                ) : (
                  transactions.map((tx) => {
                    const isSettled = tx.status === 'SETTLED';
                    return (
                      <div
                        key={tx.id}
                        className="bg-[#faf6f0] border-2 border-[#2c2621] rounded-lg p-3 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-[#2c2621]">
                              {tx.agent_name || tx.agent || 'Agent'}
                            </span>
                            <span className="px-1.5 py-0.2 bg-[#2c2621] text-amber-400 rounded text-[9px] font-black">
                              {tx.amount} {tx.currency || 'USDC'}
                            </span>
                            <span
                              className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                                isSettled ? 'bg-emerald-800 text-white' : 'bg-amber-500 text-[#2c2621]'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#4a3e37] line-clamp-1">{tx.purpose}</p>
                          {tx.tx_hash && (
                            <div className="text-[8px] text-[#8c7b70] font-mono">
                              Tx Hash: {tx.tx_hash.slice(0, 24)}... (Facilitator: {tx.facilitator || 'GoPlausible'})
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          {isSettled ? (
                            <span className="text-[9px] font-black text-emerald-800 flex items-center gap-1 bg-emerald-100 border border-emerald-300 px-2 py-1 rounded">
                              <CheckCircle2 className="w-3 h-3" /> SETTLED
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApproveTx(tx.id)}
                                disabled={isSubmitting}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white border border-[#2c2621] rounded text-[9px] font-black uppercase transition cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleVetoTx(tx.id)}
                                disabled={isSubmitting}
                                className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white border border-[#2c2621] rounded text-[9px] font-black uppercase transition cursor-pointer"
                              >
                                Veto
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Tab 2: CONFLICT ARBITRATION OVERRIDE */}
          {activeTab === 'CONFLICT_OVERRIDE' && (
            <div className="space-y-4">
              <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-3 space-y-1">
                <div className="text-[10px] font-black uppercase text-[#6b5b52] flex items-center gap-1.5">
                  <Gavel className="w-4 h-4 text-purple-800" /> EXECUTIVE DISPUTE ARBITRATION OVERRIDE
                </div>
                <p className="text-xs text-[#2c2621] leading-relaxed">
                  The CEO Agent automatically arbitrates trade-offs between departmental heads. As the Board of Directors, you can exercise supreme executive authority and direct the organization.
                </p>
              </div>

              {/* Three Strategic Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Option 1: Engineering Depth */}
                <div className="bg-[#faf6f0] border-2 border-[#2c2621] rounded-lg p-3 flex flex-col justify-between space-y-3 shadow-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#2c2621] uppercase">CTO STRATEGY</span>
                      <span className="text-lg">👨‍💻</span>
                    </div>
                    <div className="text-[11px] font-bold text-blue-900">
                      Engineering Rigor & Decoupled Architecture
                    </div>
                    <p className="text-[9.5px] text-[#4a3e37] leading-relaxed">
                      Build fully isolated microservices with comprehensive schema normalization, strict ACID contracts, and security audits.
                    </p>
                  </div>
                  <button
                    onClick={() => handleArbitrate('CTO')}
                    disabled={isSubmitting}
                    className="w-full py-1.5 bg-blue-800 hover:bg-blue-700 text-white border border-[#2c2621] rounded text-[9px] font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    VOTE CTO BLUEPRINT
                  </button>
                </div>

                {/* Option 2: Marketing Velocity */}
                <div className="bg-[#faf6f0] border-2 border-[#2c2621] rounded-lg p-3 flex flex-col justify-between space-y-3 shadow-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#2c2621] uppercase">MARKETING STRATEGY</span>
                      <span className="text-lg">👩‍💼</span>
                    </div>
                    <div className="text-[11px] font-bold text-amber-900">
                      Rapid MVP & Speed-to-Market
                    </div>
                    <p className="text-[9.5px] text-[#4a3e37] leading-relaxed">
                      Deploy a streamlined monolithic MVP immediately to validate product-market fit, acquire initial users, and test conversion channels.
                    </p>
                  </div>
                  <button
                    onClick={() => handleArbitrate('MARKETING')}
                    disabled={isSubmitting}
                    className="w-full py-1.5 bg-amber-700 hover:bg-amber-600 text-white border border-[#2c2621] rounded text-[9px] font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    VOTE MARKETING MVP
                  </button>
                </div>

                {/* Option 3: CEO Balanced Compromise */}
                <div className="bg-[#faf6f0] border-2 border-emerald-800 rounded-lg p-3 flex flex-col justify-between space-y-3 shadow-xs ring-1 ring-emerald-600">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-950 uppercase">CEO COMPROMISE</span>
                      <span className="text-lg">👨‍💼</span>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-900">
                      Modular Monolith Compromise
                    </div>
                    <p className="text-[9.5px] text-[#4a3e37] leading-relaxed">
                      Enforce modular boundaries inside a unified service. Guarantees fast initial delivery without creating technical debt.
                    </p>
                  </div>
                  <button
                    onClick={() => handleArbitrate('COMPROMISE')}
                    disabled={isSubmitting}
                    className="w-full py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white border border-[#2c2621] rounded text-[9px] font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    RATIFY CEO COMPROMISE
                  </button>
                </div>
              </div>

              {/* Past Recorded Decisions */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-black uppercase text-[#2c2621]">
                  Executive Decisions Ledger ({decisions.length})
                </div>
                {decisions.map((d) => (
                  <div key={d.id} className="bg-[#f4ece1] border border-[#2c2621] rounded p-2 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#2c2621]">{d.title}</span>
                      <span className="text-[8px] bg-[#2c2621] text-[#f4ece1] px-1 rounded uppercase font-bold">
                        {d.made_by}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#4a3e37]">{d.decision}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: ENTERPRISE POLICIES */}
          {activeTab === 'POLICY' && (
            <div className="space-y-3 text-xs">
              <div className="bg-[#f4ece1] border-2 border-[#2c2621] rounded-lg p-3 space-y-2">
                <div className="text-xs font-black uppercase text-[#2c2621]">Enterprise Governance Manifest</div>
                <div className="space-y-1.5 text-[10px] text-[#4a3e37]">
                  <div className="flex items-center justify-between border-b border-[#d8c3b1] pb-1">
                    <span>Autonomous Spending Limit Per Transaction:</span>
                    <strong className="text-[#2c2621]">$0.05 USDC</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#d8c3b1] pb-1">
                    <span>Daily Organizational Treasury Cap:</span>
                    <strong className="text-[#2c2621]">$0.50 USDC</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#d8c3b1] pb-1">
                    <span>Target Blockchain Settlement Network:</span>
                    <strong className="text-[#2c2621]">Algorand Testnet (CAIP-2)</strong>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#d8c3b1] pb-1">
                    <span>x402 Facilitator:</span>
                    <strong className="text-emerald-800">GoPlausible Protocol</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Arbitration Quorum:</span>
                    <strong className="text-[#2c2621]">Human Board Chair + CEO Agent</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
