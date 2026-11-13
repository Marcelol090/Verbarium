# Verbarium · Voz neural, visemas e templates do professor (V1)

## O que está implementado

A arquitetura usa os mesmos itens independentes em **Studio** e **Academy**:

- `api/studio-tts.js`: endpoint Node/Vercel exclusivo para autorização do professor. Usa Azure Speech SDK e produz áudio MP3 mais **22 IDs de visema com tempo em milissegundos** e limites de palavras.
- `public/voice/speech-sync.js`: reprodutor que usa **o relógio do áudio** (`audio.currentTime`) para posicionar a boca e destacar palavras. A boca é uma camada SVG independente sobre o rosto, não uma segunda imagem lateral.
- `public/voice/approved-speech.js`: carregador de clipes aprovados para estudantes, endereçados pelo hash do texto, personagem e sotaque. Não usa credenciais no navegador.
- `public/studio/index.html`: seleção de personagens, narração por bloco e três estruturas fixas (**Padrão, Foco na frase e História**). O professor adiciona/reordena blocos existentes; não modifica a malha central do produto.
- `public/academy/sentence-lab/lesson.js` e `practice.js`: procuram o clipe neural aprovado. Se não existir, usam a voz em inglês do navegador.

## Configurar o servidor (Vercel)

Defina em **Environment Variables** do projeto (somente ambiente de servidor):

```dotenv
AZURE_SPEECH_KEY=<chave do seu recurso Azure Speech>
AZURE_SPEECH_REGION=<região do recurso Azure>
VERBARIUM_TTS_ACCESS_TOKEN=<segredo longo e aleatório somente para professores autorizados>
```

Nunca use prefixo `VITE_` para esses segredos, nem copie as chaves para HTML, JSON de aula ou assets públicos. O token deve ser digitado pelo docente autorizado na prévia do Studio e fica somente em memória durante a sessão da página.

**Este controle por token não substitui o futuro login de professores, RBAC, limites de créditos e auditoria de uso.** O endpoint retorna 503 quando não está configurado. O aluno não tem permissão para gerar áudio pago diretamente.

## Fluxo de produção e publicação das falas

1. O professor abre `/studio/`, seleciona uma atividade, abre **Voz** e define o personagem, frase e variação (en-US / en-GB).
2. Escolhe o sistema **Azure Neural**, informa o token e usa **Escutar exemplo**.
3. Seleciona **Gerar e exportar voz + visemas**. O Studio baixa `<hash>.json` com o áudio MP3 em base64, IDs de visema, tempo e limites de palavras.
4. Um mantenedor revisa a pronúncia, verifica custos/permissões, altera `approved:false` para `approved:true` e coloca o arquivo na pasta `public/voice/approved/`, sob controle de versão ou em storage autenticado de publicação.
5. Ao encontrar o mesmo texto, personagem e sotaque, a Academy carrega o clipe aprovado. Sem arquivo publicado, ela usa a síntese do navegador.
6. Alterar a frase, o personagem ou a variante cria outro hash. O conteúdo antigo não é reutilizado por engano.

**Não armazene fala gerada em `localStorage`**. A versão atual exporta o áudio para revisão manual; publicação automática, banco de dados, versionamento de áudio e filas de produção são etapas futuras.

## Contrato do clipe

```json
{
  "version": 1,
  "format": "audio/mpeg",
  "provider": "azure-speech",
  "audioBase64": "<arquivo em base64>",
  "visemes": [{ "timeMs": 0, "id": 0 }, { "timeMs": 125, "id": 21 }],
  "words": [{ "timeMs": 0, "text": "She", "textOffset": 0 }],
  "text": "She eats an apple.",
  "character": "explorer",
  "accent": "en-US",
  "approved": true
}
```

Os tempos vêm da geração da fala, não de heurísticas do navegador. A primeira palavra não precisa começar em 0 ms, e visemas podem chegar em intervalos irregulares. O reprodutor procura o evento mais recente no relógio do áudio.

## Limitações de sincronização

- **Um visema não é um fonema.** O Azure fornece 22 formas visuais associadas a grupos de fonemas. Não fornece necessariamente o início exato de cada fonema isolado.
- Os assets antigos foram desenhados como imagens raster completas. O componente SVG cria uma boca independente com posições iniciais calibradas em `FACE_ANCHORS`. É necessário refinar o encaixe por personagem (especialmente cabeça, escala e expressão) para uso definitivo.
- A camada de rosto não representa modelagem facial 3D; as poses de corpo, escuta e reação continuam usando os GIFs já existentes.
- `onboundary` no navegador é uma alternativa imperfeita. Só clipes aprovados com `visemes[]` são tratados como sincronização neural.
- A síntese neural não foi exercitada com uma conta Azure nesta entrega porque as credenciais de serviço não foram fornecidas.
- **Treino de pronúncia não recebe nota automática** nesta versão. O aluno ouve e pratica; avaliação oral real depende de serviço de reconhecimento, consentimento e política de dados.

## Design system e montagem por professores

A prévia mantém cabeçalho, progresso, personagem, legenda/áudio, área de atividade, CTA e feedback como slots padrão. Os componentes podem mudar a composição interna (vertical, ao lado, compacto), mas não precisam redesenhar toda a experiência.

O template `layoutPreset` é persistido dentro de cada aula no formato existente `verbarium.lesson-pack`. Os blocos já disponíveis são: **abertura, seleção visual, pares, completar, frase, escuta, diálogo, fala, explicação e revisão**. O professor edita conteúdo e ordem, enquanto as regras de acessibilidade, tipografia e navegação continuam com o produto.

## Testes

- `node --test tests/neural-voice.test.mjs`
- `node --test tests/teacher-studio.test.mjs`
- `node --test tests/sentence-lab.test.mjs tests/sentence-production.test.mjs`

A compilação Vercel valida a publicação, mas **não prova uma síntese real**, o posicionamento pixel-perfect do rosto nem teste de acessibilidade em dispositivo físico.
