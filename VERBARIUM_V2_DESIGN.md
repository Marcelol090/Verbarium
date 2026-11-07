# Verbarium v2 · Product & Experience Design

**Objetivo:** evoluir o estúdio de inglês para uma jornada visual que ajuda estudantes brasileiros a produzir frases e participar de conversas, sem perder gramática explícita, exercícios com correção ou acessibilidade.

## Princípios

1. **Aprender antes de pontuar.** O produto oferece explicação → exercício → feedback → revisão → contexto de fala.
2. **A jornada informa uma decisão.** O capítulo atual e a próxima aula ficam claros. Aulas futuras podem ser abertas livremente.
3. **Progresso verificável.** Nada de ranking público, XP hipotético, membros fictícios ou “minutos estudados” inventados.
4. **Gamificação sem pressão.** Três missões diárias, conquistas pessoais e sequência de estudo. Não penalizar pausas.
5. **Identidade própria.** Verde, lavanda, azul e amarelo como papéis semânticos; trilhas vetoriais desenhadas para o Verbarium. Não reproduzir mascotes ou telas de concorrentes.
6. **3D com propósito.** Assets Fluent Emoji 3D somente nos grids de atividades e cenários de diálogo. Sistema de navegação e mapa usam UI 2D.

## Arquitetura de experiência

| Tela | Entrada | Ação primária | Conteúdo |
|---|---|---|---|
| Journey Home | Início | Continuar próxima aula | Hero, 3 missões reais, prévia do mundo atual, grids de atividades |
| Journey / Chapters | Aulas | Abrir uma etapa | Três mundos, 12 nós de lição, filtro A1–B1 e lista de acessibilidade |
| Unit Detail | Explorar um mundo | Continuar capítulo | Contexto, lições, estados, mapa do capítulo |
| Speaking Practice | Conversar | Responder ao diálogo | Quatro cenários, áudio e opção de microfone |
| Progress & Achievements | Progresso | Revisar ou continuar | Indicadores reais, desafio semanal, pódio pessoal |
| Profile | Perfil | Ver conquistas | Nome de exibição local, 6 medalhas, histórico, links |
| Review Challenge | Revisar erros | Responder | Recuperação espaçada do conteúdo estudado |

### Capítulos / mundos

- **01 Primeiras palavras (A1):** to be, present simple, perguntas, artigos.
- **02 Tempo em movimento (A1–A2):** present continuous, past simple, preposições, futuro.
- **03 Conversas que fluem (A2–B1):** modais, present perfect, conectores, primeiro condicional.

Os capítulos **não são avaliações certificadas CEFR**. Níveis são rótulos pedagógicos dos temas já estudados.

## Progresso, eventos e modelo local

Preservar a chave de armazenamento `verbarium:progress:v1` e migrar de forma não destrutiva por valores padrão adicionais.

| Campo | Origem | Uso |
|---|---|---|
| `completed: string[]` | aula com todas as questões respondidas | estados concluídos no mapa |
| `completedAt: Record<id, localDay>` | primeira conclusão de aula | missão “1 aula hoje” |
| `activity: {date,id,ok}[]` | respostas a questões | missão “3 respostas hoje”, dias ativos |
| `sessions: {date,scenario}[]` | concluir um diálogo guiado | missão de conversação, medalha |
| `reviews` | correção e revisão espaçada existentes | medalha de revisão |
| `nickname` | escolha do aluno | perfil local, sem conta |

**Nota:** aulas concluídas antes da v2 permanecem concluídas; não atribuímos uma data retroativa de conclusão. Retomar a mesma aula não cria uma segunda conclusão. Diálogos concluídos podem ser repetidos e contam como sessões de prática, sem criar pontuação fictícia.

## Motion tokens

- Entrada de tela: Motion com baixa distância e duração curta já existente.
- Nó do mapa: lift de até 5 px, escala local mínima.
- Barra de progresso: preenchimento interpolado, sem animação contínua desnecessária.
- Badge: estado conquistado ou não conquistado, sem efeitos que escondam o texto.
- `prefers-reduced-motion`: movimentos e transições não essenciais desligados.
- Não usar motion infinito do mapa como pré-requisito para avançar.

## Acessibilidade e responsividade

- Desktop: sidebar + conteúdo + rail educativo.
- Mobile: barra fixa com 5 entradas (Início, Aulas, Praticar, Conversar, Perfil).
- Ações usam `button` com `data-action`, labels de acesso, foco visível e sem dependência de hover.
- Mapas são decorativos em SVG; lições possuem botões e uma lista secundária textual.
- Layout em 360, 390 e 1440 px; evitar rolagem horizontal.
- Aplicação responde sem microfone. Reconhecimento de fala é opcional e não equivale a avaliação de pronúncia.

## Critérios para considerar a v2 pronta

- [x] Três capítulos com 12 aulas e status derivado de progresso real.
- [x] Hero e missões com atualização por evento do aluno.
- [x] Detalhes dos capítulos navegáveis.
- [x] Perfil com nome de exibição local e medalhas condicionais.
- [x] Conversa registra sessão concluída sem afetar nota de questões.
- [x] Módulos de estudo e revisão anteriores preservados.
- [x] Testes automatizados para capítulos, missões, perfil e conquistas.
- [ ] Auditoria visual completa do deploy em navegador autenticado.
- [ ] Testes E2E em navegador no pipeline (Playwright).
- [ ] Aperfeiçoar ilustração de personagens/mascote autoral e animação entre checkpoints.
- [ ] Exportação/sincronização opt-in de progresso, com avaliação de privacidade.
- [ ] Feedback de produção oral além de comparação textual.

## Ferramentas

Vite (bundler), Motion (entrada e feedback), Lucide (ícones de interface), SVG/CSS autorais (mundo e caminho), Fluent Emoji MIT (somente grids 3D). Nenhum framework de UI novo foi incluído por desnecessidade. Evita bundles pesados para uma experiência educativa simples.
