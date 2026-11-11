# Verbarium V6: expressões, progressão e pares

## Conteúdo

197 assets WebP independentes, com transparência:

- 82 expressões e ações dos personagens
- 39 nós de fases, anéis, marcos, trilhas e indicadores de avanço
- 28 componentes para ligar pares e montar frases
- 27 botões e estados interativos
- 21 painéis, cartões e superfícies de lições

As imagens foram recortadas das cinco pranchas geradas pelo usuário. Arte e lógica de negócio são independentes. Algumas ilustrações incluem brilhos e sombras periféricas; a revisão visual final deve confirmar contorno e espaçamento em telas pequenas.

## Telas

- **Trilha de aulas**: panorama A1/A2/B1 com indicadores reais por nível e acesso aos conteúdos existentes.
- **Alimentos**: personagens reagem de forma contextual a identificação, escuta, verbos, montagem, acerto ou erro.
- **Combinar pares**: quatro etapas reais, com seleção, validação, estados visualizados, possibilidade de corrigir e progressão persistente.
- **Biblioteca V6**: filtro e visualização dos 197 assets.
- **Início e Perfil**: links para os desafios e a biblioteca.

## Regra de progresso

Aulas existentes: continuam usando os registros de conclusão já armazenados pelo Verbarium; o novo painel mostra os valores derivados, nunca porcentagens fictícias. A missão de pares usa uma chave distinta `verbarium-pair-quest-v6` no armazenamento local e só conclui uma etapa após todas as combinações corretas (ou frase correta). O áudio é delegado ao leitor de voz já presente no aplicativo. Não há atribuição fictícia de moedas, XP ou nível CEFR.

## Arquivos

`src/verbarium-kit/v6-kit.js`, `v6-kit.css`, `v6-pairs.js`, `v6-pairs.css`; `scripts/sync-v6-kit.mjs`; `assets/packed/verbarium-v6-NN.txt` e `tests/v6-kit.test.mjs`.

## QA

```bash
npm install
npm run check
npm test
npm run build
```

Revisar manualmente os recortes mais estreitos e validar em 320, 390 e 1440 pixels. As animações respeitam `prefers-reduced-motion`; controles são botões reais com `aria-pressed`, `aria-label` e foco visível.
