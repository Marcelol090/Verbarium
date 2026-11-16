# Verbarium Precision Design System · V7

## Objetivo

Uma biblioteca mobile fiel ao universo do Pip, com rigor de espaçamento,
espessura, contraste e encaixe. **Imagens são ilustrações**. Botões, cards,
labels, grades, texto, estado e interação são componentes reais.

A biblioteca depende dos arquivos independentes gerados no
**Verbarium Mobile Visual Kit v1.0** (48 imagens, em PNG e WebP). Para
instalá-las, execute:

\`\`\`bash
python scripts/install-visual-kit-v7.py /caminho/verbarium-visual-kit-v1.zip
npm test
npm run build
\`\`\`

Os arquivos serão copiados para \`public/verbarium-visual-kit/\`. O
script \`/ui-kit/precision-v7.js\` verifica o manifesto e, caso ele esteja
ausente, preserva os assets V6. Não existe exigência de imagens para o
aplicativo abrir.

## Tokens tipográficos e geométricos

| Propriedade | Valor | Razão |
| --- | --- | --- |
| Grid | múltiplos de 4 px | Facilita o alinhamento e a documentação |
| Espaços principais | 4, 8, 12, 16, 24, 32 | Hierarquia repetível |
| Ícone navegacional | caixa 24 × 24 px CSS | Alinha glifos diferentes |
| Stroke padrão | 2 unidades no viewBox 24 | Peso consistente, sem traços arbitrários |
| Borda de card | 1 px | Separação delicada, sem competir com conteúdo |
| Seleção | 2 px | Estado perceptível em borda e cor |
| Foco teclado | 3 px, offset 3 px | Não desloca o layout |
| Alvo de toque | mínimo 48 × 48 px | Uso confortável no celular |
| Raio: controle | 12–16 px | Superfície subordinada à área maior |
| Raio: card | 20–24 px | Esquinas de família consistente |
| Raio: destaque | 24–28 px | Aplicado apenas a superfícies amplas |
| Texto principal | 13–16 px | Hierarquia funcional |
| Títulos | Fredoka 500–700 | Personalidade Verbarium |
| Corpo | Nunito / DM Sans 600–800 | Legibilidade sem excesso de pesos |
| Transição | 160–240 ms, cubic-bezier(.2,.8,.2,1) | Feedback responsivo |
| Movimento reduzido | desativar animações não essenciais | Acessibilidade |

## Paleta e contraste

| Uso | Valor | Contraste pretendido |
| --- | --- | --- |
| Primária | \`#7451D5\` | Texto branco ≈ 5,41:1 |
| Primária pressionada | \`#5934B3\` | Estado de ação |
| Laranja claro | \`#F3A063\` | Com texto \`#302547\`, ≈ 6,76:1 |
| Tinta | \`#2D2642\` | Texto em branco, ≈ 13:1 |
| Texto secundário | \`#645D79\` | Em branco, ≈ 6,2:1 |
| Canvas | \`#F8F6FC\` | Leve contraste tonal com branco |
| Borda | \`#DDD5ED\` | Separação de superfícies, **não** de texto |

Cor nunca é o único indicador de acerto/erro: a lógica da Academy mantém
a mensagem textual e as classes semânticas. Não colocar textos brancos
sobre laranja claro.

## Anatomia e encaixe

1. **Card:** fundo CSS, contorno de 1 px, padding de 16 ou 24 px,
   conteúdo em layout. Ilustração em área com dimensões próprias.
2. **Botão:** plano CSS, foco/press/disabled de CSS. Nunca esticar o
   PNG de botão para transformar em uma moldura.
3. **Iconografia:** desenhar em 24×24, usar traço óptico de 2,
   arredondamento consistente. Ajustes de 1 px são aceitáveis apenas
   quando corrigem desequilíbrio comprovado.
4. **Mascote:** usar \`object-fit:contain\`; sem coordenadas negativas,
   \`object-position:center\`; tamanho máximo relativo ao contêiner.
5. **Fundo:** usar gradiente CSS para preencher a tela; artwork de
   cenário permanece em painel próprio com proporção preservada.
   Nunca aplicar \`background-size:cover\` a uma ilustração que possui
   partes importantes perto das bordas.
6. **Grid:** \`minmax(0,1fr)\` com \`min-width:0\`, para textos longos
   e imagens não causarem rolagem horizontal.
7. **Raio concêntrico:** quando o padding é 16 px e o raio interno é
   8 px, usar raio externo de 24 px. Isso é um ponto de partida, não
   substitui inspeção óptica.

## Inventário, uso e restrições

| Categoria | Quantidade | Regra no produto |
| --- | ---: | --- |
| Mascote Pip | 4 | Intro, aula, apoio contextual, celebração |
| Recompensas e apoios | 6 | Ícones ilustrativos, não botões clicáveis |
| Cards ilustrativos | 6 | Referência de direção, **não** fundo de card dinâmico |
| Tiles / grids | 8 | Ilustrações de estado, sem substituir entradas |
| Botões ilustrativos | 8 | Referência de material e cor, **não** componente de controle |
| Labels / badges | 10 | Elemento de apoio com texto HTML independente |
| Cenários | 6 | Painéis fixos, não background responsivo com crop |

O kit foi extraído de spritesheets com transparência. Pode haver
franjas de pixels semitransparentes em algumas bordas e brilhos.
Revisão manual sobre fundo claro e fundo escuro continua obrigatória
antes de aumentar a escala de qualquer peça.

## QA e critérios para publicação

- Viewports: 320, 360, 390, 430, 768 e 1280 px.
- Sem overflow horizontal; sem recortes do Pip ou controles sobrepostos.
- Estados: default, selected, correct, wrong, disabled, loading.
- Verificação em 1× e 2× DPR; contraste no tamanho real de leitura.
- Controle tocável com mínimo 48 px e foco visível via teclado.
- Progresso real preservado; sem números ou mensagens embutidos na arte.
- Auditoria de \`prefers-reduced-motion\` e dispositivo Android com TalkBack.
- Visualizar \`/ui-kit/precision-v7/\` após instalar os 48 assets.
- Caso a imagem falhe, o componente preserva a ilustração anterior.

## Implementação

- \`public/ui-kit/precision-v7.css\`: tokens e componentes móveis.
- \`public/ui-kit/precision-v7.js\`: troca segura de imagens por chave do manifesto.
- \`public/ui-kit/precision-v7/index.html\`: galeria auditável do sistema.
- \`scripts/install-visual-kit-v7.py\`: instalador idempotente do ZIP.
- \`tests/precision-v7.test.mjs\`: contrato de responsividade e estados.

**Regra inegociável:** não sobrepor uma imagem rasterizada com texto
dinâmico embutido, nem forçar \`width:100%;height:100%\` sem
\`object-fit:contain\` ou sem uma caixa proporcional.
