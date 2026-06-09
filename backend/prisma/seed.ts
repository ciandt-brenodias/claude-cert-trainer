import { PrismaClient, Domain, Difficulty, Language, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const questionsPtBr: Array<{
  domain: Domain;
  difficulty: Difficulty;
  language: Language;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: string;
}> = [
  {
    domain: Domain.AGENTIC_ARCHITECTURE,
    difficulty: Difficulty.MEDIUM,
    language: Language.PT_BR,
    text: 'Qual é o papel principal de um orchestrator agent em um sistema multi-agent?',
    options: [
      'Executa diretamente todas as ferramentas disponíveis',
      'Coordena subagentes e delega tarefas especializadas',
      'Armazena o estado de longo prazo do sistema',
      'Gerencia autenticação e autorização entre agentes',
    ],
    correctIndex: 1,
    explanation:
      'Um orchestrator coordena o fluxo entre subagentes especializados. Ele não executa ferramentas diretamente — essa responsabilidade fica nos subagentes.',
    source: 'anthropic',
  },
  {
    domain: Domain.AGENTIC_ARCHITECTURE,
    difficulty: Difficulty.HARD,
    language: Language.PT_BR,
    text: 'Em um pipeline agentic, qual mecanismo previne loops infinitos entre agentes?',
    options: [
      'Timeout global na chamada de API',
      'Limite de profundidade de recursão no orchestrator',
      'Budget de tokens por agente individualmente',
      'Flag de terminação injetada pelo ambiente',
    ],
    correctIndex: 1,
    explanation:
      'O orchestrator deve impor um limite máximo de profundidade ou iterações. Timeouts e budgets de tokens são complementares, mas não impedem loops por si só.',
    source: 'anthropic',
  },
  {
    domain: Domain.TOOL_MCP_INTEGRATION,
    difficulty: Difficulty.MEDIUM,
    language: Language.PT_BR,
    text: 'Qual é a diferença fundamental entre prompt caching e context window management?',
    options: [
      'São conceitos equivalentes — ambos reduzem consumo de tokens',
      'Caching reduz custo de processamento; context management controla o que entra no contexto',
      'Caching é apenas para inputs; context management afeta outputs também',
      'Prompt caching é beta; context management é estável',
    ],
    correctIndex: 1,
    explanation:
      'Prompt caching armazena segmentos processados para reutilização. Context window management é a estratégia de quais informações incluir sem exceder o limite de tokens.',
    source: 'anthropic',
  },
  {
    domain: Domain.TOOL_MCP_INTEGRATION,
    difficulty: Difficulty.HARD,
    language: Language.PT_BR,
    text: 'Ao expor uma ferramenta via MCP, qual propriedade do schema JSON é mais crítica para invocação correta?',
    options: [
      'O campo "title" do schema',
      'A descrição detalhada de cada parâmetro no campo "description"',
      'O campo "version" do servidor MCP',
      'O tipo primitivo de retorno da ferramenta',
    ],
    correctIndex: 1,
    explanation:
      'O modelo usa "description" dos parâmetros para inferir quando e como invocar a ferramenta. Descrições vagas levam a invocações incorretas.',
    source: 'anthropic',
  },
  {
    domain: Domain.CLAUDE_CODE_WORKFLOWS,
    difficulty: Difficulty.EASY,
    language: Language.PT_BR,
    text: 'Qual flag do Claude Code executa um prompt sem abrir o REPL interativo?',
    options: ['--run', '--execute', '--print (-p)', '--batch'],
    correctIndex: 2,
    explanation:
      'A flag --print (ou -p) executa o prompt e imprime o resultado no stdout. Útil para scripting e pipelines CI/CD.',
    source: 'anthropic',
  },
  {
    domain: Domain.CLAUDE_CODE_WORKFLOWS,
    difficulty: Difficulty.MEDIUM,
    language: Language.PT_BR,
    text: 'O que são hooks no Claude Code e quando devem ser usados?',
    options: [
      'Atalhos de teclado para comandos frequentes',
      'Scripts shell que executam em resposta a eventos do ciclo de vida do agente',
      'Funções JavaScript para estender a API do Claude',
      'Regras de lint integradas ao pipeline do editor',
    ],
    correctIndex: 1,
    explanation:
      'Hooks são comandos shell configurados em settings.json que disparam em eventos como PreToolUse, PostToolUse e Stop. Automatizam comportamentos sem intervenção manual.',
    source: 'anthropic',
  },
  {
    domain: Domain.PROMPT_ENGINEERING,
    difficulty: Difficulty.MEDIUM,
    language: Language.PT_BR,
    text: 'Qual técnica é mais eficaz para raciocínio matemático complexo?',
    options: [
      'Zero-shot com instrução direta',
      'Chain-of-thought com exemplos de raciocínio passo a passo',
      'Role prompting como especialista em matemática',
      'Few-shot com respostas corretas apenas (sem raciocínio)',
    ],
    correctIndex: 1,
    explanation:
      'Chain-of-thought instrui o modelo a raciocinar passo a passo. Para problemas matemáticos complexos, isso melhora precisão ao tornar o processo explícito.',
    source: 'anthropic',
  },
  {
    domain: Domain.PROMPT_ENGINEERING,
    difficulty: Difficulty.HARD,
    language: Language.PT_BR,
    text: 'Ao usar XML tags para estruturar um prompt longo, qual é o benefício principal?',
    options: [
      'Reduz o número de tokens consumidos',
      'Permite ao modelo distinguir seções e seguir instruções por seção',
      'Habilita cache automático de seções delimitadas',
      'É obrigatório para usar ferramentas via tool_use',
    ],
    correctIndex: 1,
    explanation:
      'Tags XML criam separações semânticas claras, permitindo ao modelo tratar cada seção independentemente e seguir instruções específicas por bloco.',
    source: 'anthropic',
  },
  {
    domain: Domain.CONTEXT_MANAGEMENT,
    difficulty: Difficulty.HARD,
    language: Language.PT_BR,
    text: 'Em uma conversa multi-turno longa, qual estratégia mantém contexto sem exceder o limite de tokens?',
    options: [
      'Incluir todo o histórico em cada request',
      'Usar banco vetorial para recuperar trechos relevantes',
      'Sumarizar periodicamente e substituir o histórico pelo resumo',
      'Limitar ao número máximo de turnos suportados',
    ],
    correctIndex: 2,
    explanation:
      'Sumarização periódica preserva o contexto semântico sem custo crescente por turno. Recuperação vetorial funciona mas adiciona latência e infraestrutura.',
    source: 'anthropic',
  },
  {
    domain: Domain.CONTEXT_MANAGEMENT,
    difficulty: Difficulty.MEDIUM,
    language: Language.PT_BR,
    text: 'O que descreve o fenômeno "lost in the middle" em modelos de grande contexto?',
    options: [
      'O modelo alucina informações que estão no meio do documento',
      'Informações no centro do contexto são recuperadas com menor precisão que no início ou fim',
      'O model ignora o system prompt quando o contexto ultrapassa 50k tokens',
      'Tokens no meio são truncados silenciosamente pelo servidor',
    ],
    correctIndex: 1,
    explanation:
      'Modelos tendem a recuperar melhor informações no início e no fim do contexto. Informações críticas devem ser posicionadas nessas regiões.',
    source: 'anthropic',
  },
];

const questionsEn: typeof questionsPtBr = [
  {
    domain: Domain.AGENTIC_ARCHITECTURE,
    difficulty: Difficulty.MEDIUM,
    language: Language.EN,
    text: 'What is the primary role of an orchestrator agent in a multi-agent system?',
    options: [
      'Directly executes all available tools',
      'Coordinates subagents and delegates specialized tasks',
      'Stores the long-term state of the system',
      'Manages authentication and authorization between agents',
    ],
    correctIndex: 1,
    explanation:
      'An orchestrator coordinates the flow between specialized subagents. It does not execute tools directly — that responsibility belongs to the subagents.',
    source: 'anthropic',
  },
  {
    domain: Domain.AGENTIC_ARCHITECTURE,
    difficulty: Difficulty.HARD,
    language: Language.EN,
    text: 'In an agentic pipeline, which mechanism prevents infinite loops between agents?',
    options: [
      'Global timeout on the API call',
      'Recursion depth limit in the orchestrator',
      'Per-agent token budget',
      'Termination flag injected by the environment',
    ],
    correctIndex: 1,
    explanation:
      'The orchestrator must enforce a maximum depth or iteration limit. Timeouts and token budgets are complementary but do not prevent loops on their own.',
    source: 'anthropic',
  },
  {
    domain: Domain.TOOL_MCP_INTEGRATION,
    difficulty: Difficulty.MEDIUM,
    language: Language.EN,
    text: 'What is the fundamental difference between prompt caching and context window management?',
    options: [
      'They are equivalent — both reduce token consumption',
      'Caching reduces processing cost; context management controls what enters the context',
      'Caching only applies to inputs; context management also affects outputs',
      'Prompt caching is in beta; context management is stable',
    ],
    correctIndex: 1,
    explanation:
      'Prompt caching stores processed segments for reuse. Context window management is the strategy of deciding which information to include without exceeding the token limit.',
    source: 'anthropic',
  },
  {
    domain: Domain.TOOL_MCP_INTEGRATION,
    difficulty: Difficulty.HARD,
    language: Language.EN,
    text: 'When exposing a tool via MCP, which JSON schema property is most critical for correct invocation?',
    options: [
      'The "title" field of the schema',
      'The detailed description of each parameter in the "description" field',
      'The "version" field of the MCP server',
      'The primitive return type of the tool',
    ],
    correctIndex: 1,
    explanation:
      'The model uses parameter "description" fields to infer when and how to invoke the tool. Vague descriptions lead to incorrect invocations.',
    source: 'anthropic',
  },
  {
    domain: Domain.CLAUDE_CODE_WORKFLOWS,
    difficulty: Difficulty.EASY,
    language: Language.EN,
    text: 'Which Claude Code flag executes a prompt without opening the interactive REPL?',
    options: ['--run', '--execute', '--print (-p)', '--batch'],
    correctIndex: 2,
    explanation:
      'The --print (or -p) flag executes the prompt and prints the result to stdout. Useful for scripting and CI/CD pipelines.',
    source: 'anthropic',
  },
  {
    domain: Domain.CLAUDE_CODE_WORKFLOWS,
    difficulty: Difficulty.MEDIUM,
    language: Language.EN,
    text: 'What are hooks in Claude Code and when should they be used?',
    options: [
      'Keyboard shortcuts for frequent commands',
      'Shell scripts that execute in response to agent lifecycle events',
      'JavaScript functions to extend the Claude API',
      'Lint rules integrated into the editor pipeline',
    ],
    correctIndex: 1,
    explanation:
      'Hooks are shell commands configured in settings.json that fire on events like PreToolUse, PostToolUse, and Stop. They automate behaviors without manual intervention.',
    source: 'anthropic',
  },
  {
    domain: Domain.PROMPT_ENGINEERING,
    difficulty: Difficulty.MEDIUM,
    language: Language.EN,
    text: 'Which technique is most effective for complex mathematical reasoning?',
    options: [
      'Zero-shot with a direct instruction',
      'Chain-of-thought with step-by-step reasoning examples',
      'Role prompting as a math expert',
      'Few-shot with correct answers only (no reasoning)',
    ],
    correctIndex: 1,
    explanation:
      'Chain-of-thought instructs the model to reason step by step. For complex math problems, this improves accuracy by making the reasoning process explicit.',
    source: 'anthropic',
  },
  {
    domain: Domain.PROMPT_ENGINEERING,
    difficulty: Difficulty.HARD,
    language: Language.EN,
    text: 'When using XML tags to structure a long prompt, what is the primary benefit?',
    options: [
      'Reduces the number of tokens consumed',
      'Allows the model to distinguish sections and follow per-section instructions',
      'Enables automatic caching of delimited sections',
      'Required to use tools via tool_use',
    ],
    correctIndex: 1,
    explanation:
      'XML tags create clear semantic boundaries, allowing the model to treat each section independently and follow section-specific instructions.',
    source: 'anthropic',
  },
  {
    domain: Domain.CONTEXT_MANAGEMENT,
    difficulty: Difficulty.HARD,
    language: Language.EN,
    text: 'In a long multi-turn conversation, which strategy maintains context without exceeding the token limit?',
    options: [
      'Include the full history in every request',
      'Use a vector database to retrieve relevant excerpts',
      'Periodically summarize and replace the history with the summary',
      'Limit to the maximum supported number of turns',
    ],
    correctIndex: 2,
    explanation:
      'Periodic summarization preserves semantic context without growing cost per turn. Vector retrieval works but adds latency and infrastructure.',
    source: 'anthropic',
  },
  {
    domain: Domain.CONTEXT_MANAGEMENT,
    difficulty: Difficulty.MEDIUM,
    language: Language.EN,
    text: 'What describes the "lost in the middle" phenomenon in large context models?',
    options: [
      'The model hallucinates information that is in the middle of the document',
      'Information in the center of the context is retrieved with lower accuracy than at the start or end',
      'The model ignores the system prompt when context exceeds 50k tokens',
      'Tokens in the middle are silently truncated by the server',
    ],
    correctIndex: 1,
    explanation:
      'Models tend to retrieve information better from the beginning and end of the context. Critical information should be positioned in those regions.',
    source: 'anthropic',
  },
];

const badgesPtBr: Array<Prisma.BadgeCreateInput> = [
  { slug: 'first-correct', name: 'Primeira resposta', description: 'Acertou a primeira questão', language: Language.PT_BR, condition: { type: 'count', value: 1 } },
  { slug: 'streak-3', name: 'Streak 3 dias', description: '3 dias consecutivos de estudo', language: Language.PT_BR, condition: { type: 'streak', value: 3 } },
  { slug: 'domain-agentic-bronze', name: 'Arquiteto Iniciante', description: '10 acertos em Agentic Architecture', domain: Domain.AGENTIC_ARCHITECTURE, language: Language.PT_BR, condition: { type: 'accuracy', value: 10 } },
  { slug: 'domain-tool-bronze', name: 'Integrador Iniciante', description: '10 acertos em Tool & MCP Integration', domain: Domain.TOOL_MCP_INTEGRATION, language: Language.PT_BR, condition: { type: 'accuracy', value: 10 } },
  { slug: 'domain-claude-code-bronze', name: 'Dev Workflows Iniciante', description: '10 acertos em Claude Code Workflows', domain: Domain.CLAUDE_CODE_WORKFLOWS, language: Language.PT_BR, condition: { type: 'accuracy', value: 10 } },
  { slug: 'domain-prompt-bronze', name: 'Prompt Engineer Iniciante', description: '10 acertos em Prompt Engineering', domain: Domain.PROMPT_ENGINEERING, language: Language.PT_BR, condition: { type: 'accuracy', value: 10 } },
  { slug: 'domain-context-bronze', name: 'Gestor de Contexto Iniciante', description: '10 acertos em Context Management', domain: Domain.CONTEXT_MANAGEMENT, language: Language.PT_BR, condition: { type: 'accuracy', value: 10 } },
];

const badgesEn: Array<Prisma.BadgeCreateInput> = [
  { slug: 'first-correct-en', name: 'First Correct', description: 'Got the first question right', language: Language.EN, condition: { type: 'count', value: 1 } },
  { slug: 'streak-3-en', name: '3-Day Streak', description: '3 consecutive days of study', language: Language.EN, condition: { type: 'streak', value: 3 } },
  { slug: 'domain-agentic-bronze-en', name: 'Agentic Beginner', description: '10 correct answers in Agentic Architecture', domain: Domain.AGENTIC_ARCHITECTURE, language: Language.EN, condition: { type: 'accuracy', value: 10 } },
  { slug: 'domain-tool-bronze-en', name: 'Integration Beginner', description: '10 correct answers in Tool & MCP Integration', domain: Domain.TOOL_MCP_INTEGRATION, language: Language.EN, condition: { type: 'accuracy', value: 10 } },
  { slug: 'domain-claude-code-bronze-en', name: 'Workflows Beginner', description: '10 correct answers in Claude Code Workflows', domain: Domain.CLAUDE_CODE_WORKFLOWS, language: Language.EN, condition: { type: 'accuracy', value: 10 } },
  { slug: 'domain-prompt-bronze-en', name: 'Prompt Engineer Beginner', description: '10 correct answers in Prompt Engineering', domain: Domain.PROMPT_ENGINEERING, language: Language.EN, condition: { type: 'accuracy', value: 10 } },
  { slug: 'domain-context-bronze-en', name: 'Context Management Beginner', description: '10 correct answers in Context Management', domain: Domain.CONTEXT_MANAGEMENT, language: Language.EN, condition: { type: 'accuracy', value: 10 } },
];

async function main() {
  console.log('Seeding PT_BR questions...');
  await prisma.question.createMany({ data: questionsPtBr, skipDuplicates: false });

  console.log('Seeding EN questions...');
  await prisma.question.createMany({ data: questionsEn, skipDuplicates: false });

  console.log('Seeding badges...');
  for (const badge of [...badgesPtBr, ...badgesEn]) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: {},
      create: badge,
    });
  }

  const count = await prisma.question.count();
  console.log(`Seed complete. ${count} questions in DB.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
