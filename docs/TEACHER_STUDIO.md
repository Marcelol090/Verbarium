# Verbarium Studio · Professor

Protótipo funcional do ambiente de autoria, separado da experiência do aluno.

## Abrir

- Abra `index.html` com navegador moderno (os arquivos de assets usam caminhos relativos).
- Também é possível servir esta pasta em um servidor HTTP estático: `python -m http.server 8080`.
- Para uma versão autocontida, veja `Verbarium_Studio_Standalone.html` entregue separadamente.

## O que funciona

- Editor de lições com dez componentes reutilizáveis: abertura, imagens, associação de pares, lacunas, ordenar palavras, escuta, diálogo, prática oral guiada, explicação, revisão.
- Ordenação por arrastar no desktop e botões acessíveis para subir/descer.
- Propriedades de conteúdo e narração por bloco.
- Gestão de múltiplas aulas, nível CEFR como metadado, objetivos, vocabulário e nota mínima.
- Prévia interativa mobile independente; respostas, feedback, contagem e conclusão funcionam.
- Seis personagens e expressões, com prévia de voz de navegador em inglês americano/britânico/australiano conforme a disponibilidade local.
- Exportação e importação `verbarium.lesson-pack` em JSON; persistência `localStorage` do navegador.
- Assets reais do Verbarium: V4 (alimentos), V5, V6 e 96 poses (16×6) dos personagens, em arquivos separados.

## Limitações e segurança

**Este é um protótipo de autoria, não um LMS multiusuário pronto para produção.** Não há login de professor, banco de dados, turmas reais, publicação para alunos, grading confiável de fala, controle de versões no servidor ou gestão de dados de crianças. Dados ficam neste navegador. O nível CEFR é uma classificação editorial da aula, não uma certificação do aluno.

Voz premium exige backend autenticado, chaves de API e limites de uso, não disponíveis neste protótipo. Veja `server/elevenlabs-tts.example.mjs`, **desabilitado por padrão**, para o contrato esperado no Studio. Chaves nunca ficam no HTML ou JavaScript do navegador.

## Contrato dos blocos

JSON exportado:

```json
{
  "format": "verbarium.lesson-pack",
  "schemaVersion": 1,
  "lessons": [{
    "id": "uuid",
    "title": "No mercado",
    "level": "A1",
    "unit": "Unidade 1",
    "objectives": ["Reconhecer alimentos"],
    "newWords": ["apple", "milk"],
    "passingScore": 75,
    "voiceAccent": "en-US",
    "voiceMode": "browser",
    "blocks": [{"id":"uuid","type":"visual","prompt":"Which is an apple?","choices":["banana","apple"],"answer":"apple","character":"explorer"}]
  }]
}
```

## Evolução para produção

1. Estabelecer autenticação, roles de professor/aluno, RBAC por turma e ambientes de rascunho/publicado.
2. Criar persistência de lições e versões com schema validado no servidor e trilhas de competências.
3. Amarrar atividades a objetivos CEFR, pré-requisitos e avaliação diagnóstica, não apenas pontos.
4. Persistir tentativas e agenda de revisão por aluno; reexpor pontos fracos em sessões espaçadas.
5. Gerar/cachar áudio neural por texto, voz, região e versão do conteúdo; auditar pronúncia antes de publicar.
6. Para lip-sync melhor: eventos de visemas do Azure Speech SDK ou alinhamento de áudio-texto de ElevenLabs, com sprites fonéticos adicionais e timestamps por frase.
7. Introduzir convite de turma, atribuição, análise por habilidade, acessibilidade, retenção de dados e conformidade com LGPD.

## Referências de ensino e áudio

- https://blog.duolingo.com/pt/o-metodo-duolingo/
- https://blog.duolingo.com/pt/nivel-certo-de-dificuldade/
- https://blog.duolingo.com/pt/como-o-duolingo-ensina-a-melhorar-a-escuta/
- https://schools.duolingo.com/
- https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
- https://learn.microsoft.com/javascript/api/microsoft-cognitiveservices-speech-sdk/speechsynthesizer