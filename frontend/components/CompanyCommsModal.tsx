'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Send,
  Hash,
  MessageSquare,
  Users,
  Bot,
  Sparkles,
  ShieldCheck,
  Cpu,
  CornerDownRight,
  User,
  Radio,
  Clock
} from 'lucide-react';
import { Message, Agent } from '@/types';
import { sound } from '@/utils/sound';

interface CompanyCommsModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  agents: Agent[];
  onSendMessage: (content: string, recipient: string) => Promise<void>;
  companyGoal: string;
}

export default function CompanyCommsModal({
  isOpen,
  onClose,
  messages = [],
  agents = [],
  onSendMessage,
  companyGoal
}: CompanyCommsModalProps) {
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeChannel, isOpen]);

  // Channel classification
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const sender = (m.sender_agent || '').toLowerCase();
      const recipient = (m.recipient_agent || '').toLowerCase();
      const content = (m.content || '').toLowerCase();

      if (activeChannel === 'general') return true;
      if (activeChannel === 'executive') {
        return sender.includes('ceo') || recipient.includes('ceo') || m.type === 'DECISION' || sender.includes('board');
      }
      if (activeChannel === 'engineering') {
        return (
          sender.includes('cto') ||
          recipient.includes('cto') ||
          sender.includes('dev') ||
          recipient.includes('dev') ||
          content.includes('sql') ||
          content.includes('api')
        );
      }
      if (activeChannel === 'product') {
        return sender.includes('product') || sender.includes('ananya') || content.includes('ui') || content.includes('ux') || content.includes('design');
      }
      if (activeChannel === 'qa') {
        return sender.includes('qa') || sender.includes('vikram') || content.includes('security') || content.includes('audit') || content.includes('test');
      }
      if (activeChannel === 'devops') {
        return sender.includes('devops') || sender.includes('aditya') || content.includes('cloud') || content.includes('deploy') || content.includes('k8s');
      }
      if (activeChannel === 'sales') {
        return sender.includes('sales') || sender.includes('priya') || content.includes('contract') || content.includes('deal') || content.includes('revenue');
      }
      if (activeChannel === 'legal') {
        return sender.includes('legal') || sender.includes('siddharth') || content.includes('privacy') || content.includes('compliance') || content.includes('gdpr');
      }
      if (activeChannel === 'research') {
        return (
          sender.includes('research') ||
          recipient.includes('research') ||
          sender.includes('marketing') ||
          recipient.includes('marketing') ||
          content.includes('market') ||
          content.includes('gtm')
        );
      }
      // Direct message with specific agent name
      return sender.includes(activeChannel.toLowerCase()) || recipient.includes(activeChannel.toLowerCase());
    });
  }, [messages, activeChannel]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    try {
      sound.playClick();
      setIsSending(true);
      const recipient = activeChannel.startsWith('@') ? activeChannel : '@All';
      await onSendMessage(inputText.trim(), recipient);
      setInputText('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getAgentAvatar = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('board') || n.includes('human') || n.includes('you')) return '👑';
    if (n.includes('ceo') || n.includes('arnav') || n.includes('aarav')) return '👨‍💼';
    if (n.includes('research') || n.includes('meera')) return '👩‍🔬';
    if (n.includes('cto') || n.includes('rohan')) return '👨‍💻';
    if (n.includes('marketing') || n.includes('isha')) return '👩‍💼';
    if (n.includes('finance') || n.includes('kabir') || n.includes('dev')) return '👨‍🔧';
    if (n.includes('product') || n.includes('ananya')) return '🎨';
    if (n.includes('qa') || n.includes('vikram') || n.includes('security')) return '🛡️';
    if (n.includes('devops') || n.includes('aditya') || n.includes('sre')) return '🚀';
    if (n.includes('sales') || n.includes('priya')) return '🤝';
    if (n.includes('legal') || n.includes('siddharth')) return '⚖️';
    return '🤖';
  };

  const getBadgeColor = (type?: string) => {
    switch (type) {
      case 'DECISION':
        return 'bg-purple-800 text-white';
      case 'DIRECTIVE':
        return 'bg-amber-700 text-white';
      case 'HANDOFF':
        return 'bg-blue-700 text-white';
      default:
        return 'bg-[#2c2621] text-[#f4ece1]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 select-none font-mono">
      <div className="bg-[#ebdcd0] border-4 border-[#2c2621] rounded-lg shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#e4d3c3] border-b-4 border-[#2c2621]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#2c2621] text-amber-400 rounded-lg flex items-center justify-center shadow">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-[#2c2621] uppercase tracking-wider">
                  AI ORG COMMS & DEPARTMENTAL WIRE
                </h2>
                <span className="flex items-center gap-1 px-1.5 py-0.2 bg-emerald-800 text-white rounded text-[8px] font-black uppercase">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE STREAM
                </span>
              </div>
              <p className="text-[10px] text-[#6b5b52] font-bold line-clamp-1 max-w-md">
                Inter-agent dialogue, handoffs, and executive board directives
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 bg-[#f4ece1] hover:bg-[#d8c3b1] border-2 border-[#2c2621] rounded text-[#2c2621] shadow cursor-pointer transition"
            title="Close Comms"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slack-like 2 Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Channels & Direct Messages Sidebar */}
          <div className="w-56 bg-[#f4ece1] border-r-4 border-[#2c2621] flex flex-col p-2 space-y-3">
            {/* Channels */}
            <div>
              <div className="text-[8px] font-black uppercase text-[#8c7b70] tracking-wider px-1 mb-1 flex items-center justify-between">
                <span>CHANNELS</span>
                <span className="text-[7px] bg-[#e4d3c3] px-1 rounded font-bold">9</span>
              </div>
              <div className="space-y-0.5">
                {[
                  { id: 'general', label: 'general', desc: 'All agent communications' },
                  { id: 'executive', label: 'executive', desc: 'CEO arbitrations & Board directives' },
                  { id: 'engineering', label: 'engineering', desc: 'CTO & Dev technical handoffs' },
                  { id: 'product', label: 'product-design', desc: 'UI/UX wireframes & user journeys' },
                  { id: 'qa', label: 'qa-security', desc: 'OWASP auditing & test coverage' },
                  { id: 'devops', label: 'devops-infra', desc: 'Kubernetes & cloud uptime' },
                  { id: 'sales', label: 'sales-revenue', desc: 'University contracts & enterprise deals' },
                  { id: 'legal', label: 'legal-ethics', desc: 'FERPA/GDPR student privacy' },
                  { id: 'research', label: 'research-gtm', desc: 'Market intel & GTM strategy' }
                ].map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveChannel(ch.id);
                    }}
                    className={`w-full flex items-center space-x-1.5 px-2 py-1.5 rounded text-left text-[10px] font-bold transition cursor-pointer ${
                      activeChannel === ch.id
                        ? 'bg-[#2c2621] text-[#f4ece1] shadow-xs'
                        : 'text-[#4a3e37] hover:bg-[#ebdcd0]'
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5 text-amber-600" />
                    <span className="truncate">{ch.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Message Filters */}
            <div className="flex-1 overflow-y-auto">
              <div className="text-[8px] font-black uppercase text-[#8c7b70] tracking-wider px-1 mb-1">
                DIRECT AGENTS
              </div>
              <div className="space-y-0.5">
                {agents.map((ag) => (
                  <button
                    key={ag.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveChannel(`@${ag.name.split(' ')[0]}`);
                    }}
                    className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-left text-[10px] transition cursor-pointer ${
                      activeChannel === `@${ag.name.split(' ')[0]}`
                        ? 'bg-[#2c2621] text-[#f4ece1] font-bold shadow-xs'
                        : 'text-[#4a3e37] hover:bg-[#ebdcd0]'
                    }`}
                  >
                    <span className="text-xs">{getAgentAvatar(ag.name)}</span>
                    <span className="truncate flex-1 font-bold">{ag.name.split(' ')[0]}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* User Presence */}
            <div className="p-2 bg-[#e4d3c3] border-2 border-[#2c2621] rounded text-[9px] flex items-center space-x-2">
              <span className="text-base">👑</span>
              <div className="truncate">
                <div className="font-black text-[#2c2621]">You (Board Chair)</div>
                <div className="text-[7.5px] text-emerald-800 font-bold">Executive Authority</div>
              </div>
            </div>
          </div>

          {/* Right Message Feed & Composer */}
          <div className="flex-1 flex flex-col bg-[#f9f3eb] overflow-hidden">
            {/* Channel Top Subheader */}
            <div className="px-4 py-2 border-b-2 border-[#2c2621] bg-[#faf6f0] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-[#2c2621]" />
                <span className="text-xs font-black text-[#2c2621] uppercase">
                  {activeChannel}
                </span>
                <span className="text-[9px] text-[#6b5b52]">
                  ({filteredMessages.length} messages)
                </span>
              </div>
              <div className="text-[8px] text-[#8c7b70] font-bold">
                Goal: {companyGoal.slice(0, 40)}...
              </div>
            </div>

            {/* Scrollable Chat Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 font-mono"
            >
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8c7b70]">
                  <Bot className="w-10 h-10 mb-2 opacity-40 text-[#2c2621]" />
                  <p className="text-xs font-bold text-[#2c2621]">No messages in this channel yet.</p>
                  <p className="text-[10px] max-w-xs mt-1">
                    Agents automatically converse during pipeline execution, or you can send an executive directive below!
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg, idx) => {
                  const isUser =
                    msg.sender_agent.toLowerCase().includes('board') ||
                    msg.sender_agent.toLowerCase().includes('human') ||
                    msg.sender_agent.toLowerCase().includes('you');

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex items-start space-x-2.5 p-2.5 rounded-lg border-2 border-[#2c2621] shadow-xs ${
                        isUser
                          ? 'bg-[#fff5eb] border-amber-900 ml-6'
                          : 'bg-[#faf6f0] mr-6'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#ebdcd0] border border-[#2c2621] flex items-center justify-center text-lg shrink-0 shadow-xs">
                        {getAgentAvatar(msg.sender_agent)}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-black text-[#2c2621]">
                              {msg.sender_agent}
                            </span>
                            {msg.recipient_agent && (
                              <span className="text-[9px] text-[#8c7b70] flex items-center gap-1 font-bold">
                                ➔ <span className="text-[#8c3b00]">{msg.recipient_agent}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[7.5px] font-black uppercase ${getBadgeColor(
                                msg.type
                              )}`}
                            >
                              {msg.type || 'INFO'}
                            </span>
                            {msg.timestamp && (
                              <span className="text-[8px] text-[#8c7b70] flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-[10.5px] text-[#2c2621] leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Message Input Box */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-[#e4d3c3] border-t-4 border-[#2c2621] flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Broadcast executive directive to ${activeChannel} as Board Chairman...`}
                className="flex-1 bg-[#f4ece1] border-2 border-[#2c2621] rounded px-3 py-2 text-xs font-mono text-[#2c2621] placeholder-[#8c7b70] focus:outline-none focus:ring-1 focus:ring-[#8c3b00]"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white border-2 border-[#2c2621] rounded text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow cursor-pointer transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'SENDING...' : 'SEND'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
