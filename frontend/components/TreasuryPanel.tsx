'use client';

import React from 'react';
import { TreasurySummary, TreasuryTransaction } from '@/types';
import {
  ShieldCheck,
  ExternalLink,
  Coins,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Wallet,
  TrendingDown,
  Lock,
  Layers,
  RefreshCw
} from 'lucide-react';

interface TreasuryPanelProps {
  treasury?: TreasurySummary | null;
  onRefresh?: () => void;
}

export default function TreasuryPanel({ treasury, onRefresh }: TreasuryPanelProps) {
  const totalSpent = treasury?.total_spent ?? 0;
  const todaySpent = treasury?.today_spent ?? totalSpent;
  const txCount = treasury?.transaction_count ?? (treasury?.transactions?.length ?? 0);
  const transactions: TreasuryTransaction[] = treasury?.transactions ?? [];
  const walletAddress = treasury?.wallet_address || 'BJSAKUOZAQJGH2Y3LEPVVJY5HLKEPP6EI4XFNOZPBVE4VBVVCNZUB434CQ';
  const algoBalance = treasury?.algo_balance ?? 9.999;
  const usdcBalance = treasury?.usdc_balance ?? 19.96;
  const dailyLimit = treasury?.daily_limit ?? 0.50;
  const perTxLimit = treasury?.per_tx_limit ?? 0.05;

  const shortenAddress = (addr: string) => {
    if (!addr || addr.length < 12) return addr || '—';
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const shortenTx = (tx: string) => {
    if (!tx || tx.length < 14) return tx || '—';
    return `${tx.slice(0, 8)}...${tx.slice(-6)}`;
  };

  const formatTimestamp = (ts?: string) => {
    if (!ts) return 'Just now';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return ts;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SETTLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" />
            SETTLED
          </span>
        );
      case 'PAYMENT_PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Clock className="w-3 h-3 animate-spin" />
            PAYMENT_PENDING
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <ShieldCheck className="w-3 h-3" />
            APPROVED
          </span>
        );
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3" />
            REQUESTED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40">
            <XCircle className="w-3 h-3" />
            REJECTED
          </span>
        );
      case 'FAILED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <AlertCircle className="w-3 h-3" />
            {status || 'FAILED'}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/95 border border-emerald-500/30 rounded-xl p-3.5 shadow-xl backdrop-blur-md text-white font-sans space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-wide uppercase text-slate-100 flex items-center gap-1.5">
              Organization Treasury
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                x402 Live
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Algorand Testnet &bull; Settlement: GoPlausible
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition"
            title="Refresh Treasury Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Six Key Organization Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* Metric 1: ALGO Balance */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
            <span className="flex items-center gap-1"><Wallet className="w-3 h-3 text-emerald-400" /> Org Balance</span>
          </div>
          <div className="text-sm font-black font-mono text-emerald-400">
            {algoBalance.toFixed(3)} <span className="text-[10px] font-normal text-slate-400">ALGO</span>
          </div>
        </div>

        {/* Metric 2: USDC Balance */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
            <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-blue-400" /> USDC Balance</span>
          </div>
          <div className="text-sm font-black font-mono text-blue-400">
            ${usdcBalance.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">USDC</span>
          </div>
        </div>

        {/* Metric 3: Today's Spending */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
            <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3 text-amber-400" /> Today's Spending</span>
          </div>
          <div className="text-sm font-black font-mono text-amber-400">
            ${todaySpent.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">USDC</span>
          </div>
        </div>

        {/* Metric 4: Daily Limit */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-purple-400" /> Daily Limit</span>
          </div>
          <div className="text-sm font-black font-mono text-purple-300">
            ${dailyLimit.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">USDC</span>
          </div>
        </div>

        {/* Metric 5: Per-Tx Limit */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-indigo-400" /> Per-Tx Limit</span>
          </div>
          <div className="text-sm font-black font-mono text-indigo-300">
            ${perTxLimit.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">USDC</span>
          </div>
        </div>

        {/* Metric 6: Transaction Count */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
            <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-cyan-400" /> Tx Count</span>
          </div>
          <div className="text-sm font-black font-mono text-cyan-300">
            {txCount} <span className="text-[10px] font-normal text-slate-400">Total</span>
          </div>
        </div>
      </div>

      {/* Wallet Details Ribbon */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/50 px-2.5 py-1.5 rounded border border-slate-800">
        <span className="font-medium">Organization Wallet:</span>
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

      {/* Transactions List Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">
          <span>x402 Expenditures ({transactions.length})</span>
          <span className="text-[9px] text-slate-500 font-mono">Autonomous Algorand Settlement</span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-4 bg-slate-950/40 rounded-lg border border-dashed border-slate-800 text-slate-500 text-xs">
            No treasury transactions recorded yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {transactions.map((tx) => {
              const txHash = tx.tx_hash || tx.transaction_hash || '';
              const explorerUrl =
                tx.explorer_url ||
                (txHash ? `https://lora.algokit.io/testnet/transaction/${txHash}` : '');
              const timestamp = tx.settled_at || tx.completed_at || tx.created_at;
              const agentName = tx.agent_name || tx.agent || 'Agent';
              const assetName = tx.currency || tx.token || 'USDC';

              return (
                <div
                  key={tx.id}
                  className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5 hover:border-emerald-500/40 transition-all text-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-100 text-[12px] flex items-center gap-1.5">
                        <span>{tx.service}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Agent: <strong className="text-slate-200">{agentName}</strong>
                        {timestamp && (
                          <span className="text-slate-500 ml-2 font-mono">
                            • {formatTimestamp(timestamp)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="font-mono font-bold text-slate-100 text-xs">
                        ${tx.amount.toFixed(2)} {assetName}
                      </span>
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>

                  {/* Purpose */}
                  {tx.purpose && (
                    <div className="text-[10px] text-slate-400 bg-slate-900/60 p-1.5 rounded border border-slate-800/60 leading-tight">
                      <span className="text-slate-500 font-bold uppercase text-[9px] block mb-0.5">Purpose:</span>
                      {tx.purpose}
                    </div>
                  )}

                  {/* Transaction Hash & Explorer Button */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                    <div className="text-slate-400 font-mono">
                      Tx Hash:{' '}
                      <span className="text-slate-200 font-semibold">
                        {txHash ? shortenTx(txHash) : 'Pending on-chain'}
                      </span>
                    </div>

                    {txHash ? (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-mono text-[10px] border border-emerald-500/30 transition-colors"
                        id={`explorer-btn-${tx.id}`}
                      >
                        <span>Explorer</span>
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-mono">GoPlausible Facilitator</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

