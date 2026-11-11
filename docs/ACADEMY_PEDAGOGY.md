# Verbarium Academy · jornada de aprendizagem

## Objetivo
Experiência de aluno independente em `/academy/`, acessível pela tela inicial e trilha do Verbarium, sem substituir as telas legadas. O Studio do Professor permanece independente em `/studio/`.

## Implementado
- **Cinco unidades originais**, em mundos de fundamentos A1, rotina A1, situações A2 e comunicação B1.
- **Nove formatos de atividades**: contexto, imagem, escuta, associação de pares, lacuna, ordenar palavras, diálogo, história e fala guiada.
- **Trilha progressiva**: desbloqueio pela conclusão da unidade anterior com ao menos 70% na primeira tentativa (configurável nas aulas de professores).
- **Feedback por item e correção de erros**: ao fim da sequência, os conceitos errados reaparecem para revisão; erros continuam agendados.
- **Repetição espaçada**: intervalos de 1, 3, 7, 14 e 30 dias, antecipados quando há erro; os exercícios são recuperados por identificador.
- **Gamificação transparente**: XP por resposta correta, meta diária ajustável, sequência de estudo, 0–3 estrelas com base no desempenho, sem bloquear estudantes por vidas.
- **Áudio e interação**: síntese de voz do navegador com sotaques en-US/en-GB/en-AU quando disponíveis; destaque de palavra com eventos de fronteira quando suportados e reação visual dos personagens. A atividade oral permite transcrição experimental, mas não atribui nota automática de pronúncia.
- **Integração Studio → Academy**: importar pacote `verbarium.lesson-pack` (`schemaVersion:1`) com atividades autorizadas, ou carregar explicitamente os rascunhos locais, sem os divulgar automaticamente.

## Reutilização dos assets
A Academy consome os arquivos já existentes:
- `/verbarium-v6/assets/characters/`, `/progress/`, `/panels/`;
- `/verbarium-v5/assets/worlds/` e `/rewards/`;
- `/verbarium-2026-kit/items/` para imagens de alimentos.

Controles, estados, texto, acertos e porcentagens são HTML/CSS/JavaScript. As imagens permanecem ilustrativas e reutilizáveis.

## Limites desta versão
É uma implementação **client-side**: os dados são mantidos em `localStorage` por navegador e não sincronizam entre dispositivos. Sem autenticação, aulas atribuídas a turmas, histórico por estudante no servidor, métricas oficiais CEFR, assistente de conversação com IA, pagamento, rankings competitivos ou voz neural em produção. Nenhum desses recursos é alegado como pronto.

O modelo de repetição é uma versão simples de intervalos espaçados; não reproduz o algoritmo proprietário do Duolingo. A síntese do navegador varia conforme o dispositivo e não sincroniza visemas fonéticos reais.

## Próximas etapas de produção
1. Autenticação de professor/aluno, papéis por instituição, turmas e consentimento LGPD.
2. Publicação e versionamento de cursos com validação de conteúdo no backend; importação local não equivale a publicação.
3. Relatórios de domínio por habilidade, diagnósticos e avaliação por rubricas auditáveis.
4. Pipeline de voz neural server-side, armazenamento e cache por frase/voz/sotaque/versão, sem chaves no navegador; visemas com timecodes para sprites fonéticos.
5. Testes com professores e estudantes, acessibilidade e auditoria de pedagogia/CEFR.

## Referências públicas
- https://blog.duolingo.com/new-duolingo-home-screen-design/
- https://blog.duolingo.com/spaced-repetition-for-learning/
- https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo/
- https://duolingoschools.zendesk.com/hc/en-us/articles/44824545841805-Important-information-regarding-Duolingo-for-Schools
