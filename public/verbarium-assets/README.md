# Verbarium | Assets para integração

**112 arquivos individuais** (97 PNGs + 15 SVGs), transparentes, sem uma prancha única como entrega.

## Estrutura

- `mascot`: personagens em poses isoladas
- `icons`: ícones individuais de cada seção
- `mission`, `lesson`, `streak`, `achievement`, `score`, `reward`: assets e estados visuais por funcionalidade
- `controls`: botões, barras, checks e microelementos
- `panels`, `flow`: componentes de referência para layout
- `decoration`, `brand`: ornamentos e ilustrações
- `svg_components`: componentes base vetoriais sem texto embutido

## Como compor no aplicativo

1. Use **PNG ilustrados** para mascote/ícones/medalhas/presentes e detalhes visuais.
2. Prefira os **SVG sem texto** para fundos dos cards, trilho/preenchimento de barras e anéis, com números, rótulos e porcentagem como texto nativo.
3. Para o ring, o círculo tem raio 72 e comprimento 452.389. Ajuste `stroke-dasharray`/`stroke-dashoffset` conforme progresso, 0 a 100%.
4. Para barras, use o trilho e o preenchimento em camadas separadas, com `clip` ou escala horizontal para o progresso atual.
5. Não achate textos ou números da UI em sprites. Os PNGs de cards com 25%, 72%, etc. são somente **estados visuais de referência**.

## Transparência

Cada arquivo PNG possui canal alpha. Não incluímos o tabuleiro usado na geração. Como a referência tem sombras e glows, alguns assets têm transparência parcial perto das bordas, o que é intencional.

## Inventário

Leia o `manifest.json` para os IDs dos assets, arquivo e tamanho em pixels.
