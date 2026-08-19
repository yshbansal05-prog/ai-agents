import { Agent, Task, Memory, Decision, ActivityLog, Company } from '@/types';

export const INITIAL_COMPANY: Company = {
  id: 'comp-01',
  name: 'AI ORG OS V1.0.0 - DEBUGGERS INC.',
  goal: 'Build an AI-powered internship platform for college students.',
  status: 'IN_PROGRESS',
  created_at: new Date().toISOString()
};

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-ceo',
    name: 'Arnav Sharma',
    role: 'CEO / Orchestrator',
    objective: 'Break down overarching company goals, orchestrate executive strategy, resolve inter-departmental conflicts, and compile final deliverables.',
    status: 'WAITING',
    current_task: 'Review budget conflict between CTO and Finance.',
    capabilities: ['Goal Decomposition', 'Task Delegation', 'Conflict Arbitration', 'Executive Reporting', 'Final Signoff'],
    dependencies: []
  },
  {
    id: 'agent-research',
    name: 'Meera Iyer',
    role: 'Market & Intel Lead',
    objective: 'Perform comprehensive competitor intelligence, user interviews, TAM/SAM sizing, and student skill gap validation.',
    status: 'COMPLETED',
    current_task: 'Market research & competitive landscape completed.',
    capabilities: ['Competitor Analysis', 'TAM/SAM Sizing', 'User Persona Modeling', 'Academic Survey Analysis', 'Web Search'],
    dependencies: ['agent-ceo']
  },
  {
    id: 'agent-cto',
    name: 'Rohan Verma',
    role: 'CTO / Systems Architect',
    objective: 'Design scalable, low-latency multi-agent software architecture, cloud infrastructure, and database schemas.',
    status: 'WAITING',
    current_task: 'Drafted Next.js 15 + FastAPI microservices spec.',
    capabilities: ['Cloud Architecture', 'Vector DB Design', 'API Specification', 'System Scalability', 'DevOps & CI/CD'],
    dependencies: ['agent-ceo', 'agent-research']
  },
  {
    id: 'agent-marketing',
    name: 'Isha Malhotra',
    role: 'Marketing & Growth Lead',
    objective: 'Develop high-converting go-to-market strategies, university partnership frameworks, campus ambassador loops, and branding.',
    status: 'WORKING',
    current_task: 'Drafting campus ambassador playbook & viral referral loop.',
    capabilities: ['Go-To-Market (GTM)', 'Campus Outreach', 'Viral Referral Loops', 'Content Strategy', 'Brand Positioning'],
    dependencies: ['agent-ceo', 'agent-research']
  },
  {
    id: 'agent-finance',
    name: 'Kabir Singh',
    role: 'Finance & Dev Lead',
    objective: 'Build unit economics financial model, compute infra pricing projections, calculate burn rate, and prototype backend modules.',
    status: 'COMPLETED',
    current_task: 'Unit economics model finalized ($14.20 CAC / $180 LTV).',
    capabilities: ['Unit Economics', 'Cost-to-Serve Modeling', 'Runway Planning', 'Fullstack Prototyping', 'Database Optimization'],
    dependencies: ['agent-ceo', 'agent-cto']
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Market Analysis & Competitor Landscape',
    description: 'Investigate Handshake, LinkedIn Early Careers, and Y Combinator student programs to identify unmet matching and feedback needs.',
    assigned_agent: 'Meera Iyer (Research)',
    status: 'COMPLETED',
    priority: 'P1 High',
    dependencies: [],
    result: 'Analyzed 42 competitive platforms. Identified core student pain point: 74% lack resume-to-role feedback before applying.',
    created_at: '2026-08-19T11:34:02Z'
  },
  {
    id: 'task-2',
    title: 'Multi-Agent Technical Architecture Spec',
    description: 'Design distributed backend pipeline using Next.js 15, FastAPI, ChromaDB, and PostgreSQL for real-time resume-job semantic scoring.',
    assigned_agent: 'Rohan Verma (CTO)',
    status: 'COMPLETED',
    priority: 'P0 Critical',
    dependencies: ['task-1'],
    result: 'Architecture blueprint finalized: Sub-100ms vector search latency via hybrid indexing and Edge caching.',
    created_at: '2026-08-19T11:34:05Z'
  },
  {
    id: 'task-3',
    title: 'University Campus Go-To-Market Playbook',
    description: 'Formulate partnership agreement templates for career services departments and design a 50-college student ambassador network.',
    assigned_agent: 'Isha Malhotra (Marketing)',
    status: 'RUNNING',
    priority: 'P1 High',
    dependencies: ['task-1'],
    result: undefined,
    created_at: '2026-08-19T11:34:10Z'
  },
  {
    id: 'task-4',
    title: 'Financial Projections & Cloud Cost Breakdown',
    description: 'Model serverless and dedicated GPU hosting costs for 100k active student resumes against subscription revenue.',
    assigned_agent: 'Kabir Singh (Finance)',
    status: 'COMPLETED',
    priority: 'P0 Critical',
    dependencies: ['task-2'],
    result: 'Estimated monthly hosting: $2,200. Projected month-6 ARR: $340,000 at 82% gross margins.',
    created_at: '2026-08-19T11:34:15Z'
  },
  {
    id: 'task-5',
    title: 'Review budget conflict between CTO and Finance',
    description: 'Arbitrate compute resource allocation between high-end cluster reservation requested by CTO and lean runway advised by Finance.',
    assigned_agent: 'Arnav Sharma (CEO)',
    status: 'RUNNING',
    priority: '↑↑ Urgent',
    dependencies: ['task-2', 'task-4'],
    result: undefined,
    created_at: '2026-08-19T11:34:20Z'
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    agent_name: 'CEO',
    message: 'CEO initialized the organization.',
    level: 'INFO',
    timestamp: '2026-08-19T11:34:01Z'
  },
  {
    id: 'log-2',
    agent_name: 'System',
    message: 'New goal received: Build an AI-powered internship platform for college students.',
    level: 'INFO',
    timestamp: '2026-08-19T11:34:03Z'
  },
  {
    id: 'log-3',
    agent_name: 'CEO',
    message: 'CEO is breaking down the objective...',
    level: 'INFO',
    timestamp: '2026-08-19T11:34:07Z'
  },
  {
    id: 'log-4',
    agent_name: 'CEO',
    message: 'Created 5 tasks and assigned to agents.',
    level: 'SUCCESS',
    timestamp: '2026-08-19T11:34:12Z'
  },
  {
    id: 'log-5',
    agent_name: 'Research',
    message: 'Meera (Research) gathered 42 competitor datasets & student survey responses.',
    level: 'SUCCESS',
    timestamp: '2026-08-19T11:34:18Z'
  },
  {
    id: 'log-6',
    agent_name: 'CTO',
    message: 'Rohan (CTO) proposed Next.js + FastAPI + LangChain microservices stack.',
    level: 'INFO',
    timestamp: '2026-08-19T11:34:25Z'
  },
  {
    id: 'log-7',
    agent_name: 'Marketing',
    message: 'Isha (Marketing) started B2B campus outreach roadmap.',
    level: 'INFO',
    timestamp: '2026-08-19T11:34:32Z'
  },
  {
    id: 'log-8',
    agent_name: 'Finance',
    message: 'Kabir (Finance) flagged $4,500/mo cloud budget vs $2,500 runway target.',
    level: 'CONFLICT',
    timestamp: '2026-08-19T11:34:39Z'
  },
  {
    id: 'log-9',
    agent_name: 'CEO',
    message: 'CEO convened conflict review on infrastructure allocation.',
    level: 'WARNING',
    timestamp: '2026-08-19T11:34:45Z'
  }
];

export const INITIAL_MEMORIES: Memory[] = [
  {
    id: 'mem-1',
    agent_name: 'Meera Iyer (Research)',
    key: 'MARKET_ANALYSIS',
    category: 'RESEARCH',
    value: {
      market_size: '$1.8 Billion TAM in student recruitment & internships',
      primary_competitors: ['Handshake', 'LinkedIn Students', 'RippleMatch', 'WayUp'],
      key_differentiator: 'Instant AI resume analysis + bidirectional skill matching with auto-generated interview prep questions.',
      user_sentiment: '74% of undergrads felt rejected without actionable feedback.'
    },
    created_at: '2026-08-19T11:34:18Z'
  },
  {
    id: 'mem-2',
    agent_name: 'Rohan Verma (CTO)',
    key: 'TECH_ARCHITECTURE_SPEC',
    category: 'ARCHITECTURE',
    value: {
      frontend: 'Next.js 15, Tailwind CSS, Retro tactile theme',
      backend: 'FastAPI Python 3.11 with async worker pools',
      vector_store: 'ChromaDB with OpenAI text-embedding-3-small',
      database: 'PostgreSQL on Supabase with Prisma/SQLAlchemy',
      latency_sla: '< 120ms p95 query response'
    },
    created_at: '2026-08-19T11:34:25Z'
  },
  {
    id: 'mem-3',
    agent_name: 'Isha Malhotra (Marketing)',
    key: 'GTM_STRATEGY',
    category: 'MARKETING',
    value: {
      launch_channels: ['Campus Ambassador Program (50 tier-1 colleges)', 'Hackathon Sponsorships', 'TikTok & IG Career Tips Reels'],
      target_cac: '$14.20 per verified active student profile',
      kpi_month_1: '25,000 registered student users and 120 hiring partner companies'
    },
    created_at: '2026-08-19T11:34:32Z'
  },
  {
    id: 'mem-4',
    agent_name: 'Kabir Singh (Finance)',
    key: 'UNIT_ECONOMICS',
    category: 'CODE',
    value: {
      pricing_tier_employers: '$299/mo standard or $999/mo premium pipeline',
      pricing_students: 'Free tier + $9/mo optional AI resume & interview coach',
      gross_margin: '82%',
      runway_extension: '18 months on seed funding'
    },
    created_at: '2026-08-19T11:34:39Z'
  }
];

export const INITIAL_DECISIONS: Decision[] = [
  {
    id: 'dec-1',
    title: 'Cloud Budget & Infrastructure Optimization',
    decision: 'Approved hybrid serverless architecture with local Redis caching, capping monthly burn at $2,200 while preserving sub-100ms latency.',
    rationale: 'CTO requested dedicated H100 instances ($5k/mo), Finance insisted on $2k limit. CEO brokered serverless batch embeddings at 55% cost reduction.',
    made_by: 'Arnav Sharma (CEO)',
    context: {
      compromise: 'Serverless embeddings + Edge caching',
      savings_monthly: '$2,800',
      performance_impact: 'None on user-facing paths'
    },
    created_at: '2026-08-19T11:34:46Z'
  },
  {
    id: 'dec-2',
    title: 'Target University Launch Cohort',
    decision: 'Phase 1 launch limited to 15 tier-1 engineering and design colleges before nationwide scaling.',
    rationale: 'Concentrates liquidity and recruiter response rates during the Fall internship hiring cycle.',
    made_by: 'Arnav Sharma (CEO)',
    created_at: '2026-08-19T11:34:48Z'
  }
];
