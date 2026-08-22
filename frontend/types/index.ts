export interface Agent {
  id: string;
  name: string;
  role: string;
  objective: string;
  status: 'WORKING' | 'COMPLETED' | 'WAITING' | 'FAILED';
  current_task?: string;
  capabilities: string[];
  dependencies: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_agent: string;
  status: 'PENDING' | 'RUNNING' | 'WAITING' | 'COMPLETED' | 'FAILED';
  priority: string;
  dependencies: string[];
  result?: string;
  created_at?: string;
}

export interface Memory {
  id: string;
  agent_name: string;
  key: string;
  value: any;
  category: 'RESEARCH' | 'ARCHITECTURE' | 'MARKETING' | 'CODE' | 'DECISION' | 'TASK' | 'GENERAL';
  created_at?: string;
}

export interface Decision {
  id: string;
  title: string;
  decision: string;
  rationale: string;
  made_by: string;
  context?: Record<string, any>;
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  agent_name: string;
  message: string;
  level: 'INFO' | 'WARNING' | 'SUCCESS' | 'CONFLICT' | 'ERROR';
  timestamp?: string;
}

export interface Message {
  id: string;
  sender_agent: string;
  recipient_agent: string;
  content: string;
  type?: string;
  timestamp?: string;
}

export interface Company {
  id: string;
  name: string;
  goal: string;
  status: 'INITIALIZING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  final_report?: string;
  created_at?: string;
}
