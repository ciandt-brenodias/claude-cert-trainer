import { Domain, Difficulty } from '../types';
import type { User, DomainProgress, Question, Badge, HistoryEntry } from '../types';

export const mockUser: User = {
  uuid: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Breno',
  xp: 480,
  level: 3,
  currentStreak: 7,
  longestStreak: 12,
};

const XP_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000];

export function xpForLevel(level: number): { floor: number; ceiling: number; pct: number; xp: number } {
  const floor = XP_THRESHOLDS[level - 1] ?? 0;
  const ceiling = XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1] * 2;
  const pct = Math.min(100, ((mockUser.xp - floor) / (ceiling - floor)) * 100);
  return { floor, ceiling, pct, xp: mockUser.xp };
}

export const DOMAIN_LABELS: Record<Domain, string> = {
  [Domain.AGENTIC_ARCHITECTURE]: 'Agentic Architecture',
  [Domain.TOOL_MCP_INTEGRATION]: 'Tool & MCP Integration',
  [Domain.CLAUDE_CODE_WORKFLOWS]: 'Claude Code Workflows',
  [Domain.PROMPT_ENGINEERING]: 'Prompt Engineering',
  [Domain.CONTEXT_MANAGEMENT]: 'Context Management',
};

export const DOMAIN_CODES: Record<Domain, string> = {
  [Domain.AGENTIC_ARCHITECTURE]: 'AGENTIC',
  [Domain.TOOL_MCP_INTEGRATION]: 'MCP',
  [Domain.CLAUDE_CODE_WORKFLOWS]: 'CODE',
  [Domain.PROMPT_ENGINEERING]: 'PROMPT',
  [Domain.CONTEXT_MANAGEMENT]: 'CONTEXT',
};

export const mockDomainProgress: DomainProgress[] = [
  { domain: Domain.AGENTIC_ARCHITECTURE,  totalAnswered: 156, totalCorrect: 112, xpEarned: 320 },
  { domain: Domain.TOOL_MCP_INTEGRATION,  totalAnswered: 98,  totalCorrect: 44,  xpEarned: 180 },
  { domain: Domain.CLAUDE_CODE_WORKFLOWS, totalAnswered: 112, totalCorrect: 90,  xpEarned: 270 },
  { domain: Domain.PROMPT_ENGINEERING,    totalAnswered: 88,  totalCorrect: 51,  xpEarned: 210 },
  { domain: Domain.CONTEXT_MANAGEMENT,    totalAnswered: 75,  totalCorrect: 30,  xpEarned: 150 },
];

export const mockQuestions: Question[] = [
  {
    id: '1',
    domain: Domain.AGENTIC_ARCHITECTURE,
    difficulty: Difficulty.MEDIUM,
    text: 'O que descreve melhor o papel de um orchestrator agent em um sistema multi-agent?',
    options: [
      'Executa diretamente todas as ferramentas disponíveis',
      'Coordena subagentes e delega tarefas especializadas',
      'Armazena o estado de longo prazo do sistema',
      'Gerencia autenticação e autorização entre agentes',
    ],
    correctIndex: 1,
    explanation:
      'Um orchestrator agent coordena o fluxo de trabalho entre subagentes especializados, delegando tarefas com base nas capacidades de cada agente. Ele não executa ferramentas diretamente — essa responsabilidade fica nos subagentes.',
  },
  {
    id: '2',
    domain: Domain.TOOL_MCP_INTEGRATION,
    difficulty: Difficulty.HARD,
    text: 'Qual é a diferença fundamental entre prompt caching e context window management na Claude API?',
    options: [
      'São conceitos equivalentes, ambos reduzem consumo de tokens',
      'Caching reduz custo de processamento; context management controla o que entra no contexto',
      'Caching é apenas para inputs; context management afeta outputs também',
      'Prompt caching é uma feature beta; context management é estável',
    ],
    correctIndex: 1,
    explanation:
      'Prompt caching armazena segmentos de prompt processados para reutilização, reduzindo custo em chamadas subsequentes com prefixo idêntico. Context window management é a estratégia de quais informações incluir ou excluir do contexto para não exceder o limite de tokens.',
  },
  {
    id: '3',
    domain: Domain.CLAUDE_CODE_WORKFLOWS,
    difficulty: Difficulty.EASY,
    text: 'Qual flag do Claude Code permite executar um comando diretamente no terminal sem abrir o REPL interativo?',
    options: [
      '--run',
      '--execute',
      '--print (-p)',
      '--batch',
    ],
    correctIndex: 2,
    explanation:
      'A flag --print (ou -p) executa o prompt fornecido e imprime o resultado diretamente no stdout, sem abrir o REPL interativo. Útil para scripting e pipelines CI/CD.',
  },
  {
    id: '4',
    domain: Domain.PROMPT_ENGINEERING,
    difficulty: Difficulty.MEDIUM,
    text: 'Qual técnica de prompting é mais eficaz para tarefas de raciocínio matemático complexo?',
    options: [
      'Zero-shot prompting com instrução direta',
      'Chain-of-thought com exemplos de raciocínio passo a passo',
      'Role prompting como especialista em matemática',
      'Few-shot prompting com respostas corretas apenas',
    ],
    correctIndex: 1,
    explanation:
      'Chain-of-thought (CoT) prompting instrui o modelo a raciocinar passo a passo antes de dar a resposta final. Para tarefas matemáticas complexas, isso melhora significativamente a precisão ao tornar o processo de resolução explícito.',
  },
  {
    id: '5',
    domain: Domain.CONTEXT_MANAGEMENT,
    difficulty: Difficulty.HARD,
    text: 'Em uma conversa multi-turno de longa duração, qual é a estratégia mais eficiente para manter contexto relevante sem exceder o limite de tokens?',
    options: [
      'Incluir todo o histórico da conversa em cada request',
      'Usar um banco vetorial para recuperar apenas trechos relevantes',
      'Sumarizar periodicamente a conversa e substituir o histórico pelo resumo',
      'Limitar a conversa ao número máximo de turnos suportados',
    ],
    correctIndex: 2,
    explanation:
      'A sumarização periódica é a estratégia mais balanceada: preserva o contexto semântico da conversa sem custo crescente de tokens a cada turno. Recuperação por banco vetorial funciona bem mas adiciona latência e infraestrutura; incluir todo o histórico torna o custo linear com o número de turnos.',
  },
];

export const mockBadges: Badge[] = [
  { id: '1', slug: 'first-correct',       name: 'Primeira resposta',   description: 'Acertou a primeira questão',              icon: '★',  earned: true,  earnedAt: '2026-05-20' },
  { id: '2', slug: 'exam-passed',         name: 'Aprovado',            description: 'Score ≥ 720 no simulado',                 icon: '✓',  earned: true,  earnedAt: '2026-05-27' },
  { id: '3', slug: 'streak-7',            name: 'Streak 7 dias',       description: '7 dias consecutivos de estudo',           icon: '7',  earned: true,  earnedAt: '2026-05-27' },
  { id: '4', slug: 'domain-agentic-gold', name: 'Agentic Gold',        description: '100 acertos em Agentic Architecture',     icon: '◆',  earned: false },
  { id: '5', slug: 'perfect-domain',      name: 'Domínio perfeito',    description: '100% em um domínio (min 20 questões)',    icon: '◉',  earned: false },
  { id: '6', slug: 'streak-30',           name: 'Streak 30 dias',      description: '30 dias consecutivos de estudo',          icon: '30', earned: false },
];

export const mockHistory: HistoryEntry[] = [
  { date: '27/05', label: 'Prática Agentic Architecture',      xp: 20  },
  { date: '27/05', label: 'Simulado completo (742 pts)',       xp: 350 },
  { date: '26/05', label: 'Prática Tool & MCP Integration',   xp: 15  },
  { date: '25/05', label: 'Prática Prompt Engineering',        xp: 25  },
  { date: '24/05', label: 'Simulado completo (698 pts)',       xp: 280 },
];

export const EXAM_DOMAIN_RESULTS: Array<{ domain: Domain; pct: number; weak: boolean }> = [
  { domain: Domain.AGENTIC_ARCHITECTURE,  pct: 82, weak: false },
  { domain: Domain.TOOL_MCP_INTEGRATION,  pct: 60, weak: true  },
  { domain: Domain.CLAUDE_CODE_WORKFLOWS, pct: 75, weak: false },
  { domain: Domain.PROMPT_ENGINEERING,    pct: 70, weak: false },
  { domain: Domain.CONTEXT_MANAGEMENT,    pct: 55, weak: true  },
];
