import { Company, Agent, Task, Memory, Decision, ActivityLog, Message } from '@/types';

// Default API base URL from environment or local fallback
export const DEFAULT_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/company';

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = DEFAULT_API_BASE) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  // 1. Create a new organization with goal
  async createCompany(goal: string, name: string = 'AI Organization'): Promise<{ company_id: string; name: string; goal: string; status: string }> {
    const res = await fetch(`${this.baseUrl}/create`, {
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
    const res = await fetch(`${this.baseUrl}/${companyId}/run`, {
      method: 'POST'
    });
    if (!res.ok) {
      throw new Error(`Failed to run company pipeline: ${res.statusText}`);
    }
    return await res.json();
  }

  // 3. Fetch company metadata & final report
  async getCompany(companyId: string): Promise<Company> {
    const res = await fetch(`${this.baseUrl}/${companyId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch company: ${res.statusText}`);
    }
    return await res.json();
  }

  // 4. Fetch all agents
  async getAgents(companyId: string): Promise<Agent[]> {
    const res = await fetch(`${this.baseUrl}/${companyId}/agents`);
    if (!res.ok) {
      throw new Error(`Failed to fetch agents: ${res.statusText}`);
    }
    return await res.json();
  }

  // 5. Fetch all tasks
  async getTasks(companyId: string): Promise<Task[]> {
    const res = await fetch(`${this.baseUrl}/${companyId}/tasks`);
    if (!res.ok) {
      throw new Error(`Failed to fetch tasks: ${res.statusText}`);
    }
    return await res.json();
  }

  // 6. Fetch company memory
  async getMemories(companyId: string, category?: string): Promise<Memory[]> {
    const url = category ? `${this.baseUrl}/${companyId}/memory?category=${category}` : `${this.baseUrl}/${companyId}/memory`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch memories: ${res.statusText}`);
    }
    return await res.json();
  }

  // 7. Search company memory by query
  async searchMemories(companyId: string, query: string, limit: number = 5): Promise<Memory[]> {
    const res = await fetch(`${this.baseUrl}/${companyId}/search-memory?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) {
      throw new Error(`Failed to search memories: ${res.statusText}`);
    }
    return await res.json();
  }

  // 8. Fetch decisions
  async getDecisions(companyId: string): Promise<Decision[]> {
    const res = await fetch(`${this.baseUrl}/${companyId}/decisions`);
    if (!res.ok) {
      throw new Error(`Failed to fetch decisions: ${res.statusText}`);
    }
    return await res.json();
  }

  // 9. Fetch activity logs
  async getActivityLogs(companyId: string): Promise<ActivityLog[]> {
    const res = await fetch(`${this.baseUrl}/${companyId}/activity`);
    if (!res.ok) {
      throw new Error(`Failed to fetch activity logs: ${res.statusText}`);
    }
    return await res.json();
  }

  // 10. Fetch inter-agent messages
  async getMessages(companyId: string): Promise<Message[]> {
    const res = await fetch(`${this.baseUrl}/${companyId}/messages`);
    if (!res.ok) {
      throw new Error(`Failed to fetch messages: ${res.statusText}`);
    }
    return await res.json();
  }

  // 11. SSE events endpoint URL
  getEventsUrl(companyId: string): string {
    return `${this.baseUrl}/${companyId}/events`;
  }
}

export const api = new ApiService();
