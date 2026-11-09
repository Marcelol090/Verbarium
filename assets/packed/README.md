# Verbarium · Pacotes reais de assets e motion

Os 19 arquivos \`bridge_XX.json\` armazenam **297 arquivos independentes originais**, codificados para transporte. O script \`npm run assets:sync\` materializa os assets com os nomes e as extensões originais dentro de \`public/\`.

Incluídos:
- 80 PNG + 80 SVG novos (jornada, botões, mascote, navegação, feedback)
- 18 WebP animados da jornada + seus estados/sprites de suporte
- 21 WebP animados de CTA/chips + estados finais
- 14 WebP animados de troféus, cards, perfil e recompensas + PNG estáticos
- 112 PNG/SVG anteriores já mantidos em \`public/verbarium-assets\`

**Runtime**: números e progresso são HTML/SVG dinâmicos, não textos embutidos em GIF. WebP é efeito visual disparado por estado, nunca regra de negócio. Suporta \`prefers-reduced-motion\`.

Arquivos separados são extraídos durante \`npm run dev\` e \`npm run build\`. Não execute manualmente um script de upload para atualizar cada arquivo.
