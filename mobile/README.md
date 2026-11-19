# Verbarium Mobile (React Native · Expo SDK 58 + TypeScript)

Aplicativo mobile nativo Android & iOS do **Verbarium**, construído em **React Native (Expo + TypeScript)**, compartilhando diretamente o motor pedagógico em JavaScript (`course-data.js`, `academy-model.js`, `lesson-core.js`) e os **25 assets do Kit Visual Verbarium V12/V13**.

## Telas incluídas

1. **Onboarding (`OnboardingScreen`)** — Boas-vindas com Pip, nome, meta diária de XP (`15/25/50 XP`), sotaque (`en-US` / `en-GB`) e nível inicial (`A1/A2/B1`).
2. **Início (`HomeScreen`)** — Hero V12/V13 com Pip acenando, meta diária, métricas (sequência, XP, precisão/unidades), alerta de revisão espaçada, Sentence Lab e atalhos por habilidade.
3. **Trilha / Academy (`AcademyPathScreen`)** — Mapa sinuoso V13 pelos mundos CEFR (`A1` → `A2` → `B1`), faixa semanal de 7 dias, estrelas e desbloqueio progressivo real (`isUnlocked`).
4. **Lição Interativa (`LessonScreen`)** — Motor completo com todos os 9 tipos de exercício (`intro`, `visual`, `listening`, `pairs`, `cloze`, `arrange`, `dialogue`, `story`, `speaking`), áudio nativo via `expo-speech` (1.0x e 0.7x), vibração nativa via `expo-haptics`, fila de reparo de erros e tela de celebração.
5. **Central de Prática (`PracticeScreen`)** — 6 treinos direcionados por habilidade (ícones distintos do kit de 48 assets), baralho de Repetição Espaçada (SRS) e **Sentence Lab** interativo com correção gramatical instantânea.
6. **Progresso & Conquistas (`ProgressScreen`)** — Gráfico de barras de XP dos últimos 7 dias, domínio por habilidade, 6 medalhas desbloqueáveis e resumo por nível CEFR.
7. **Perfil & Configurações (`ProfileScreen`)** — Edição de nome, meta diária, sotaque, áudio automático, feedback háptico, diagnóstico nativo de áudio/vibração e guia rápido Android Studio / USB.

## Comandos (a partir da raiz do repositório)

```bash
# 1. Sincronizar assets do kit visual e módulos JS compartilhados
npm run mobile:sync

# 2. Testar no celular físico via Expo Go (Android & iOS)
npm run mobile:start

# 3. Compilar e rodar via cabo USB no celular Android ou Emulador AVD
npm run mobile:android

# 4. Gerar projeto Gradle nativo (mobile/android/) para abrir no Android Studio
npm run mobile:prebuild

# 5. Pré-visualizar a build React Native Web no navegador
npm run mobile:web

# 6. Validar tipagem TypeScript
npm run mobile:check
```
