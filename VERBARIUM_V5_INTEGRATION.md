# Verbarium V5 · Kit de exploração e componentes

## Entrega
Foram integrados **102 assets WebP originais, independentes e com transparência**:
- 14 personagens e reações
- 18 cenários e objetos de exploração
- 18 ícones, caminhos e nós de progressão
- 18 componentes e estados dos exercícios
- 18 recompensas, estrelas e contadores
- 16 superfícies vazias para cards, barras e títulos

A biblioteca está disponível na rota **v5kit** (acessível pelo Perfil). O mapa visual aparece na tela inicial e na trilha. A missão de alimentos exibe os personagens e locais de acordo com o exercício, e a conclusão usa o baú e as estrelas do novo kit.

## Estrutura
- `src/verbarium-kit/v5-kit.js`: catálogo, composição, seleção e hidratação de imagens
- `src/verbarium-kit/v5-kit.css`: layout, estados e motion responsivo
- `scripts/sync-v5-kit.mjs`: reconstrói as imagens a partir de pacotes de transporte incluídos no Git
- `assets/packed/verbarium-v5-01.txt` a `verbarium-v5-16.txt`: assets originais codificados para transporte
- `assets/packed/verbarium-v5-override-01.txt` a `verbarium-v5-override-03.txt`: 15 recortes refinados
- `public/verbarium-v5/assets/<categoria>/<id>.webp`: resultado da reconstrução no prebuild/predev/pretest
- `public/verbarium-v5/manifest.json`: manifest gerado com contagem e caminhos
- `tests/v5-kit.test.mjs`: integridade dos arquivos e renderização sem progresso fictício

## Regras
- Valores, respostas, conquistas, acertos e progresso continuam sendo calculados no aplicativo.
- As imagens de fundo, contorno, personagens e medalhas são exclusivamente visuais.
- Botões permanecem HTML interativo, com foco por teclado e leitores de tela.
- Imagens têm fallback por emoji em caso de falha, sem expor imagens quebradas.
- Movimento reduzido desliga animações decorativas.
- A implementação preserva componentes e registros de aprendizado anteriores.

## Como verificar
```bash
npm install --no-audit --no-fund
npm run check
npm test
npm run build
```

Não use os contadores visuais vazios como prova de existência de moedas ou vidas: um sistema de economia/recompensas precisará ser projetado separadamente caso seja desejado.

## Observações de QA
O catálogo de 102 assets foi validado localmente, com decoder idêntico ao de produção. O mapa/feedback foram renderizados em 390px e 1440px, sem transbordamento horizontal. O teste local não equivale a uma auditoria visual completa do domínio publicado nem a testes em dispositivos físicos.
