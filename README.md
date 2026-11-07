# Verbarium · English Learning Studio

Aplicação responsiva para estudar inglês em português, praticar gramática e participar de diálogos guiados. Interface baseada na referência fornecida: pastel lavanda, CTA azul, módulos coloridos, tipografia Fredoka/Nunito, ilustração editorial e pódio de conquistas pessoais.

## Como executar

```bash
npm install
npm run dev
npm run check
npm run build
```

O build é estático, em `dist/`, e pronto para publicação na Vercel.

## O que já funciona

- 12 aulas de A1 a B1 com regra, exemplo, exercícios e correção;
- comparação entre 7 tempos verbais e busca de 30 verbos;
- exercícios escritos e de múltipla escolha;
- quatro conversas guiadas, áudio TTS e voz quando o navegador suporta;
- revisão espaçada de erros e progresso real salvo em `localStorage`;
- navegação responsiva, animações via Motion e ícones Lucide.

## Estrutura

- `index.html` — shell semântico;
- `src/app.js` — estado, conteúdo e exercícios;
- `src/styles.css` — layout, colorimetria e responsividade;
- `src/icons.js` — Lucide com imports específicos;
- `src/motion.js` — animações com preferência de movimento reduzido;
- `public/favicon.svg` — marca.

**Limites:** não há conta, sincronização, IA conversacional ou ranking entre usuários. O pódio mostra conquistas pessoais. Reconhecimento de voz apenas compara transcrição aproximada; não avalia sotaque. Os dados ficam neste navegador.

Referências didáticas: [British Council grammar](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2), [British Council speaking](https://learnenglish.britishcouncil.org/free-resources/speaking) e [Cambridge Speak & Improve](https://www.speakandimprove.com/).


## Grids com ícones 3D

Os quatro módulos da tela inicial e os quatro cenários de conversação usam ilustrações 3D de [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) armazenadas localmente em `public/icons/3d/`. A licença MIT está preservada em `public/icons/3d/LICENSE`, com a relação de assets em [ASSET_LICENSES.md](ASSET_LICENSES.md). Fora desses grids, ícones de navegação e interface permanecem em 2D. O movimento respeita a preferência do sistema por animações reduzidas.
