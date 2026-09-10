'use client';

import React from 'react';
import { TreasurySummary, TreasuryTransaction } from '@/types';
import { ShieldCheck, ExternalLink, Coins, ArrowUpRight, Zap, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface TreasuryPanelProps {
  treasury?: TreasurySummary | null;
  onRefresh?: () => void;
}

export default function TreasuryPanel({ treasury }: TreasuryPanelProps) {
  const totalSpent = treasury?.total_spent ?? 0;
  const txCount = treasury?.transaction_count ?? 0;
  const transactions: TreasuryTransaction[] = treasury?.transactions ?? [];
  const walletAddress = treasury?.wallet_address || 'BJSAKUOZAQJGH2Y3LEPVVJY5HLKEPP6EI4XFNOZPBVE4VBVVCNZUB434CQ';

  const shortenAddress = (addr: string) => {
    if (!addr || addr.length < 12) return addr || '—';
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const shortenTx = (tx: string) => {
    if (!tx || tx.length < 14) return tx || '—';
    return `${tx.slice(0, 8)}...${tx.slice(-6)}`;
  };

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4 shadow-xl backdrop-blur-md text-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide uppercase text-slate-100 flex items-center gap-1.5">
              Organization Treasury
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                x402 Live
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Algorand Testnet &bull; Settlement: GoPlausible
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase text-slate-400 tracking-wider">Total Spent</div>
          <div className="text-base font-extrabold font-mono text-emerald-400">
            ${totalSpent.toFixed(2)} <span className="text-xs text-slate-300">USDC</span>
          </div>
        </div>
      </div>

      {/* Network & Policy Ribbon */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950/60 rounded-lg p-2.5 mb-3 border border-slate-800/80 text-[11px]">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Network</span>
          <span className="font-semibold text-slate-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Algorand Testnet
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Asset</span>
          <span className="font-mono text-slate-200">USDC (10458941)</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Governance</span>
          <span className="text-emerald-400 font-medium">Cap: $0.05 / tx</span>
        </div>
      </div>

      {/* Wallet Details */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-800/30 px-2.5 py-1.5 rounded mb-3 border border-slate-800">
        <span>Org Treasury Wallet:</span>
        <a
          href={`https://lora.algokit.io/testnet/account/${walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          title="View account on LoRA Algorand Explorer"
        >
          {shortenAddress(walletAddress)}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>x402 Expenditures ({txCount})</span>
          <span className="text-[10px] text-slate-500">Autonomous Protocol</span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-4 bg-slate-950/40 rounded-lg border border-dashed border-slate-800 text-slate-500 text-xs">
            No treasury transactions recorded yet.
          </div>
        ) : (
          transactions.map((tx) => {
            const isSettled = tx.status === 'SETTLED';
            const isPending = tx.status === 'PAYMENT_PENDING' || tx.status === 'REQUESTED' || tx.status === 'APPROVED';
            const explorerUrl = tx.explorer_url || (tx.tx_hash ? `https://lora.algokit.io/testnet/transaction/${tx.tx_hash}` : '');

            return (
              <div
                key={tx.id}
                className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-2.5 hover:border-emerald-500/40 transition-all text-xs"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <span className="font-semibold text-slate-200 block text-[13px]">
                      {tx.service}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Disbursed to: <strong className="text-slate-300">{tx.agent_name}</strong>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-100 text-xs block">
                      ${tx.amount.toFixed(2)} {tx.currency}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        isSettled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isPending
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {isSettled && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {isPending && <Clock className="w-2.5 h-2.5 animate-spin" />}
                      {!isSettled && !isPending && <AlertCircle className="w-2.5 h-2.5" />}
                      {tx.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                  <div className="text-slate-400 font-mono text-[10px]">
                    TX: <span className="text-slate-300">{shortenTx(tx.tx_hash)}</span>
                  </div>

                  {explorerUrl ? (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                      id={`lora-explorer-link-${tx.id}`}
                    >
                      View on Algorand Explorer
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">Facilitator verified</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
