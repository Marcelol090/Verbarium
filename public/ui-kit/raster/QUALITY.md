# Integração dos 235 assets
O catálogo e os componentes semânticos para 235 sprites estão implementados. O arquivo com 235 PNG + 235 WebP foi preparado separadamente para instalação na árvore `public/ui-kit/raster`; **não está presente automaticamente no GitHub**.

- `catalog.js`: todos os IDs.
- `widgets.js` + `widgets.css`: controles, banners, cards, barras dinâmicas, segmentos e carrosséis que podem consumir esses IDs. Títulos e textos são HTML nativo.
- `manifest-validation.js`: validação exata de IDs, quantidade e unicidade; o runtime só ativa quando um conjunto mínimo de binários também responde corretamente.
- `/ui-kit/raster/`: catálogo de inspeção, acessível pelo Studio.
- PNGs e WebPs preservam a resolução original; não se deve ampliar PNG além da resolução nativa nem esticar glifos quadrados. Barras com porcentagens fixas são decorativas; valores de progresso precisam ser renderizados por CSS/HTML.

**QA pendente**: 17 recortes com bordas problemáticas detectadas por pixels alpha. Os demais precisam de inspeção visual, pois as pranchas geradas originalmente têm halos e bordas muito próximos entre itens. A publicação dos sprites deve depender de aprovação de cada recorte, sobretudo cards e carrosséis.
