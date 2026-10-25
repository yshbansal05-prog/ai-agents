import { Company, Agent, Task, Memory, Decision, ActivityLog, Message } from '@/types';

// Helper to normalize the API base URL with the company route prefix
function normalizeApiUrl(url?: string): string {
  if (url) {
    const base = url.replace(/\/$/, '');
    return base.includes('/api/company') ? base : `${base}/api/company`;
  }
  // Server-side in Vercel: use the bound service variable BACKEND_URL
  if (typeof window === 'undefined' && process.env.BACKEND_URL) {
    const base = process.env.BACKEND_URL.replace(/\/$/, '');
    return base.includes('/api/company') ? base : `${base}/api/company`;
  }
  // Client-side in browser: if NEXT_PUBLIC_API_URL is set, use it; otherwise use relative path /api/company
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const base = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
      return base.includes('/api/company') ? base : `${base}/api/company`;
    }
    // If running on localhost:3000 without a proxy, fall back to localhost:8000
    if (window.location.port === '3000' && window.location.hostname === 'localhost') {
      return 'http://localhost:8000/api/company';
    }
    // Default to relative path for same-origin deployments (like Vercel multi-service)
    return '/api/company';
  }
  return 'http://localhost:8000/api/company';
}

// Default API base URL from environment or local fallback
export const DEFAULT_API_BASE = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);

export class ApiService {
  private customBaseUrl?: string;

  constructor(baseUrl?: string) {
    if (baseUrl && baseUrl !== 'http://localhost:8000/api/company') {
      this.customBaseUrl = baseUrl;
    }
  }

  setBaseUrl(url: string) {
    this.customBaseUrl = url;
  }

  getBaseUrl(): string {
    if (this.customBaseUrl) {
      return normalizeApiUrl(this.customBaseUrl);
    }
    // Server-side in Vercel: use the bound service variable BACKEND_URL at runtime
    if (typeof window === 'undefined' && process.env.BACKEND_URL) {
      const base = process.env.BACKEND_URL.replace(/\/$/, '');
      return base.includes('/api/company') ? base : `${base}/api/company`;
    }
    // Client-side in browser: if NEXT_PUBLIC_API_URL is set, use it; otherwise use relative path /api/company
    if (typeof window !== 'undefined') {
      if (process.env.NEXT_PUBLIC_API_URL) {
        const base = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
        return base.includes('/api/company') ? base : `${base}/api/company`;
      }
      // If running on localhost:3000 without a proxy, fall back to localhost:8000
      if (window.location.port === '3000' && window.location.hostname === 'localhost') {
        return 'http://localhost:8000/api/company';
      }
      // Default to relative path for same-origin deployments (like Vercel multi-service)
      return '/api/company';
    }
    return DEFAULT_API_BASE;
  }

  // 1. Create a new organization with goal
  async createCompany(goal: string, name: string = 'AI Organization'): Promise<{ company_id: string; name: string; goal: string; status: string }> {
    const res = await fetch(`${this.getBaseUrl()}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, name })
    });
    if (!res.ok) {
      throw new Error(`Failed to create company: ${res.statusText}`);
    }
    return await res.json();
  }

  // 2. Trigger multi-agent pipeline execution
  async runCompany(companyId: string): Promise<{ message: string; company_id: string }> {
    const res = await fetch(`${this.getBaseUrl()}/${companyId}/run`, {
      method: 'POST'
    });
    if (!res.ok) {
      throw new Error(`Failed to run company pipeline: ${res.statusText}`);
    }
    return await res.json();
  }

  // 3. Fetch company metadata & final report
  async getCompany(companyId: string): Promise<Company> {
    const res = await fetch(`${this.getBaseUrl()}/${companyId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch company: ${res.statusText}`);
    }
    return await res.json();
  }

  // 3b. Fetch executive board report & synthesis
  async getCompanyReport(companyId: string): Promise<any> {
    const res = await fetch(`${this.getBaseUrl()}/${companyId}/report`);
    if (!res.ok) {
      throw new Error(`Failed to fetch report: ${res.statusText}`);
    }
    return await res.json();
  }

  // 4. Fetch all agents
  async getAgents(companyId: string): Promise<Agent[]> {
    const res = await fetch(`${this.getBaseUrl()}/${companyId}/agents`);
    if (!res.ok) {
      throw new Error(`Failed to fetch agents: ${res.statusText}`);
    }
    return await res.json();
  }

  // 5. Fetch all tasks
  async getTasks(companyId: string): Promise<Task[]> {
    const res = await fetch(`${this.getBaseUrl()}/${companyId}/tasks`);
    if (!res.ok) {
      throw new Error(`Failed to fetch tasks: ${res.statusText}`);
    }
    return await res.json();
  }

  // 6. Fetch company memory
  async getMemories(companyId: string, category?: string): Promise<Memory[]> {
    const url = category ? `${this.getBaseUrl()}/${companyId}/memory?category=${category}` : `${this.getBaseUrl()}/${companyId}/memory`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch memories: ${res.statusText}`);
    }
    return await res.json();
  }

  // 7. Search company memory by query
  async searchMemories(companyId: string, query: string, limit: number = 5): Promise<Memory[]> {
    const res = await fetch(`${this.getBaseUrl()}/${companyId}/search-memory?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) {
      throw new Error(`Failed to search memories: ${res.statusText}`);
    }
    return await res.json();
  }

  // 8. Fetch decisions
  async getDecisions(companyId: string): Promise<Decision[]> {
    const res = await fetch(`${this.getBaseUrl()}/${companyId}/decisions`);
    if (!res.ok) {
      throw new Error(`Failed to fetch decisions: ${res.statusText}`);
    }
    return await res.json();
  }

  // 9. Fetch activity logs
  async getActivityLogs(companyId: string): Promise<ActivityLog[]> {
    const res = await fetch(`${this.getBaseUrl()}/${companyId}/activity`);
    if (!res.ok) {
      throw new Error(`Failed to fetch activity logs: ${res.statusText}`);
    }
    return await res.json();
  }

  // 10. Fetch inter-agent messages
  async getMessages(companyId: string): Promise<Message[]> {
    const res = await fetch(`${this.getBaseUrl()}/${companyId}/messages`);
    if (!res.ok) {
      throw new Error(`Failed to fetch messages: ${res.statusText}`);
    }
    return await res.json();
  }

  // 11. Send user message to company comms
  async sendMessage(companyId: string, content: string, recipient: string = '@All'): Promise<Message> {
    const res = await fetch(`${this.getBaseUrl()}/${companyId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_agent: 'Human Executive (Board)',
        recipient_agent: recipient,
        content,
        type: 'DIRECTIVE'
      })
    });
    if (!res.ok) {
      throw new Error(`Failed to send message: ${res.statusText}`);
    }
    return await res.json();
  }

  // 12. Decide on pending treasury transaction
  async decideTreasury(companyId: string, txId: string, action: 'APPROVE' | 'VETO'): Promise<any> {
    const res = await fetch(`${this.getBaseUrl()}/${companyId}/treasury/${txId}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    if (!res.ok) {
      throw new Error(`Failed to decide on treasury transaction: ${res.statusText}`);
    }
    return await res.json();
  }

  // 13. Arbitrate conflict as Board
  async arbitrateConflict(companyId: string, decision: string, rationale: string, title?: string): Promise<any> {
    const res = await fetch(`${this.getBaseUrl()}/${companyId}/governance/arbitrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, rationale, title })
    });
    if (!res.ok) {
      throw new Error(`Failed to arbitrate conflict: ${res.statusText}`);
    }
    return await res.json();
  }

  // 14. Fetch treasury posture & transactions
  async getTreasury(companyId?: string): Promise<any> {
    const url = companyId ? `${this.getBaseUrl()}/${companyId}/treasury` : `${this.getBaseUrl()}/treasury`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch treasury: ${res.statusText}`);
    }
    return await res.json();
  }

  // 15. SSE events endpoint URL
  getEventsUrl(companyId: string): string {
    return `${this.getBaseUrl()}/${companyId}/events`;
  }
}

export const api = new ApiService();
