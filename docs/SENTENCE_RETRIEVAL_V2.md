# Verbarium · recuperação ativa de frases (V2)

## Objetivo pedagógico

Ensinar a pessoa a **gerar** frases em inglês, em vez de somente reconhecer respostas.
O Laboratório de Frases ensina um modelo inicial (sujeito + verbo + complemento); a prática V2 verifica transferência do modelo para frases novas.

### Percurso implementado

1. **Exemplo guiado**: demonstra a relação entre sujeito, verbo e complemento.
2. **Construção com pistas**: banco de palavras e comparação de verbos.
3. **Associação e escuta**: recupera significado em modalidades diferentes.
4. **Produção livre**: o aluno escreve a frase sozinho, sem alternativas.
5. **Dicas graduais**: primeiro o esquema, depois o sujeito, por fim a regra gramatical.
6. **Feedback específico**: explica discordância de sujeito, conjugação e complemento.
7. **Revisão espaçada**: erros voltam mais cedo; sequências de acertos aumentam o intervalo.

### Rotas

- `/academy/`: jornada do aluno, com entrada para o laboratório.
- `/academy/sentence-lab/`: aula guiada anterior, preservada.
- `/academy/sentence-lab/practice.html`: treino diário, prioriza itens pendentes e frases ainda não vistas.
- `/academy/sentence-lab/practice.html?mode=free`: treino adicional, dando preferência a frases não praticadas.
- `/academy/sentence-lab/practice.html?mode=review`: somente frases cuja revisão já venceu.
- `/studio/`: ambiente independente do professor, sem mudança de navegação.

### Contrato dos dados

Cada frase utiliza `{id, subject, verb, object, pt, image, speaker, rule}`.
As imagens e os GIFs não contêm as respostas como pixels; conteúdo é HTML acessível e pode mudar em cada aula.
A avaliação usa o módulo `lesson-core.js`, inclusive normalização, revisão e armazenamento local.

### Vozes e personagens

O áudio atual utiliza as vozes em inglês disponíveis no sistema do aluno, por meio do Web Speech API.
O professor e o estudante podem escolher a variante americana ou britânica.
O destaque palavra-a-palavra depende do evento `onboundary`, que não é emitido em todos os navegadores.

As animações dos seis personagens são **reações contextuais** e não equivalem a sincronização labial por fonemas. A API neural, o alinhamento por visemas e a avaliação de pronúncia permanecem fora desta entrega.

### Medição do resultado

- Percentual exibido: acertos na **primeira tentativa** de cada nova frase.
- Acertos após novas tentativas dão feedback e XP, mas não reescrevem a precisão inicial.
- Visualizar o modelo sem resolver registra uma dificuldade; não atribui acerto.
- Resultados persistem em `verbarium.sentence-lab.v1` do navegador.

### Limites ainda existentes

- O treinamento cobre exemplos iniciais do Present Simple, não constitui avaliação CEFR.
- Dados e progresso ainda não sincronizam entre dispositivos.
- O Studio ainda não publica diretamente esses desafios de produção livre para turmas.
- A sincronização da boca com fonemas individuais requer um mecanismo de TTS com marcas temporais e assets devidamente alinhados.
- É necessária auditoria visual manual em dispositivos reais.

### Verificação

`node --test tests/sentence-lab.test.mjs tests/sentence-production.test.mjs`

Também existe o workflow `.github/workflows/learning-validation.yml`, que executa checagens de sintaxe e testes da lógica educacional em alterações relevantes.
