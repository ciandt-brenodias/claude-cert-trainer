import { PrismaClient, Domain, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

const questions: Array<{
  domain: Domain;
  difficulty: Difficulty;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: string;
}> = [
  {
    domain: Domain.AGENTIC_ARCHITECTURE,
    difficulty: Difficulty.MEDIUM,
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

const badges = [
  {
    slug: 'first-correct',
    name: 'Primeira resposta',
    description: 'Acertou a primeira questão',
    condition: { type: 'count', value: 1 },
  },
  {
    slug: 'streak-7',
    name: 'Streak 7 dias',
    description: '7 dias consecutivos de estudo',
    condition: { type: 'streak', value: 7 },
  },
  {
    slug: 'exam-passed',
    name: 'Aprovado',
    description: 'Score >= 70% em uma sessão',
    condition: { type: 'accuracy', value: 70 },
  },
];

async function main() {
  console.log('Seeding questions...');
  await prisma.question.createMany({ data: questions, skipDuplicates: false });

  console.log('Seeding badges...');
  for (const badge of badges) {
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
